import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { cpus, tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import { build } from 'esbuild';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const valueFor = flag => {
  const index = args.indexOf(flag);
  if (index < 0) return undefined;
  assert.ok(args[index + 1] && !args[index + 1].startsWith('--'), `${flag} requires a value`);
  return args[index + 1];
};
for (let index = 0; index < args.length; index += 2) {
  assert.ok(
    ['--events', '--stats', '--rounds', '--baseline', '--json'].includes(args[index]),
    `Unknown flag: ${args[index]}`
  );
  valueFor(args[index]);
}
const positiveInteger = (flag, fallback) => {
  const value = Number(valueFor(flag) ?? fallback);
  assert.ok(Number.isSafeInteger(value) && value > 0, `${flag} must be a positive integer`);
  return value;
};
const eventCount = positiveInteger('--events', 438);
const statCount = positiveInteger('--stats', 80);
const rounds = positiveInteger('--rounds', 9);
const require = createRequire(import.meta.url);
const directory = await mkdtemp(path.join(tmpdir(), 'sportslib-json-bench-'));

try {
  const modulePath = path.join(directory, 'current.cjs');
  await build({
    stdin: {
      contents: `export { DataStore, DynamicDataLoader } from './src/data/data.store';
        export { EventImporterJSON } from './src/events/adapters/importers/json/importer.json';
        export { EventSummary } from './src/events/event-summary';`,
      resolveDir: root,
      loader: 'ts'
    },
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile: modulePath
  });
  const current = require(modulePath);
  const baselinePath = valueFor('--baseline');
  const baseline = baselinePath ? require(path.resolve(baselinePath)) : undefined;
  const selectedTypes = [
    'DataDistance',
    'DataDuration',
    'DataSpeedAvg',
    'DataHeartRateAvg',
    'DataAscent',
    'DataPaceAvg'
  ].map(key => {
    assert.ok(current.DataStore[key], `Missing benchmark metric ${key}`);
    return current.DataStore[key].type;
  });
  const derivedPaceType = current.DataStore.DataPaceAvg.type;
  const numericTypes = [
    ...new Set(
      Object.values(current.DataStore)
        .filter(constructor => {
          if (
            !constructor?.type ||
            constructor.type === derivedPaceType ||
            current.DynamicDataLoader.isUnitDerivedDataType(constructor.type)
          )
            return false;
          try {
            const value = new constructor(10).getValue();
            return typeof value === 'number' && Number.isFinite(value);
          } catch {
            return false;
          }
        })
        .map(constructor => constructor.type)
    )
  ];
  const requiredTypes = selectedTypes.filter(type => type !== derivedPaceType);
  const metricTypes = [...new Set([...requiredTypes, ...numericTypes])].slice(0, statCount);
  assert.ok(statCount >= requiredTypes.length && metricTypes.length === statCount, 'Unsupported --stats count');
  const events = Array.from({ length: eventCount }, (_, index) => ({
    id: `synthetic-${index}`,
    name: 'Synthetic summary',
    srcFileType: 'fit',
    privacy: 0,
    description: null,
    isMerge: false,
    startDate: Date.UTC(2025, 0, 1) + index * 86400000,
    endDate: Date.UTC(2025, 0, 1) + index * 86400000 + 3600000,
    stats: {
      ...Object.fromEntries(
        metricTypes.map((type, metricIndex) => [
          type,
          type === current.DataStore.DataSpeedAvg.type ? 4 : 10 + metricIndex + (index % 7)
        ])
      ),
      'Activity Types': [index % 2 ? 'Running' : 'Cycling'],
      'Start Position': { latitudeDegrees: 0, longitudeDegrees: 0 }
    },
    activities: []
  }));
  const checksum = records =>
    records.reduce(
      (sum, record) => sum + selectedTypes.reduce((total, type) => total + record.getStat(type).getValue(), 0),
      0
    );
  const importEvents = library => events.map(json => library.EventImporterJSON.getEventFromJSON(json));
  const summarize = () => events.map(json => current.EventSummary.fromJSON(json));
  const values = record => Object.fromEntries(Array.from(record.getStats(), ([type, stat]) => [type, stat.toJSON()]));
  const eager = importEvents(current);
  const expectedChecksum = checksum(eager);
  const summaries = summarize();
  assert.equal(checksum(summaries), expectedChecksum);
  for (let index = 0; index < events.length; index++) assert.deepEqual(values(summaries[index]), values(eager[index]));
  if (baseline) {
    const old = importEvents(baseline);
    assert.equal(checksum(old), expectedChecksum);
    for (let index = 0; index < events.length; index++) assert.deepEqual(values(eager[index]), values(old[index]));
  }
  const cases = [];
  const addLibraryCases = (name, library) => {
    cases.push({
      name: `${name}: class lookup`,
      run: () => {
        let result = 0;
        for (const json of events)
          for (const type of Object.keys(json.stats)) {
            result += library.DynamicDataLoader.getDataClassFromDataType(type).type.length;
          }
        return result;
      }
    });
    cases.push({ name: `${name}: eager + 6 metrics`, run: () => checksum(importEvents(library)) });
  };
  if (baseline) addLibraryCases('baseline', baseline);
  addLibraryCases('indexed', current);
  cases.push({
    name: 'summary: metadata only',
    run: () =>
      summarize().reduce((total, record) => total + record.name.length + record.getActivityTypesAsArray().length, 0)
  });
  cases.push({ name: 'summary: 6 metrics', run: () => checksum(summarize()) });
  cases.push({
    name: 'summary: all metrics',
    run: () => summarize().reduce((total, record) => total + record.getStats().size, 0)
  });
  for (const test of cases) {
    test.samples = [];
    for (let index = 0; index < 2; index++) test.run();
  }
  // Rotate case order to reduce systematic warmup/thermal bias. GC is outside the timed region.
  let sink = 0;
  for (let round = 0; round < rounds; round++) {
    for (let index = 0; index < cases.length; index++) {
      const test = cases[(index + round) % cases.length];
      globalThis.gc?.();
      const start = performance.now();
      sink += test.run();
      test.samples.push(performance.now() - start);
    }
  }
  assert.ok(Number.isFinite(sink));
  const results = cases.map(test => {
    const samples = test.samples.slice().sort((left, right) => left - right);
    return {
      name: test.name,
      medianMs: samples[Math.floor(samples.length / 2)],
      p95Ms: samples[Math.ceil(samples.length * 0.95) - 1],
      samplesMs: test.samples
    };
  });
  const report = {
    runtime: process.version,
    platform: process.platform,
    architecture: process.arch,
    cpu: cpus()[0]?.model,
    eventCount,
    numericStatsPerEvent: statCount,
    otherStatsPerEvent: 2,
    rounds,
    warmupsPerCase: 2,
    baseline: baselinePath || null,
    gcBetweenSamples: typeof globalThis.gc === 'function',
    validation: 'All eager and lazy metric JSON values agree for every synthetic event.',
    note: 'Synthetic summary documents; no activities/streams. Warm registry; excludes module loading, JSON parsing, sanitization, Firestore and UI rendering.',
    results
  };
  console.table(
    results.map(({ name, medianMs, p95Ms }) => ({ name, medianMs: medianMs.toFixed(3), p95Ms: p95Ms.toFixed(3) }))
  );
  console.log(report.note);
  console.log(report.validation);
  if (valueFor('--json')) await writeFile(path.resolve(valueFor('--json')), `${JSON.stringify(report, null, 2)}\n`);
} finally {
  await rm(directory, { recursive: true, force: true });
}
