import { Activity } from '../../activities/activity';
import { ActivityTypes } from '../../activities/activity.types';
import { Creator } from '../../creators/creator';
import { Stream } from '../../streams/stream';
import { DataPower } from '../../data/data.power';
import { DataPowerMin } from '../../data/data.power-min';
import { DataPowerMax } from '../../data/data.power-max';
import { Lap } from '../../laps/lap';
import { LapTypes } from '../../laps/lap.types';
import { DataPowerAvg } from '../../data/data.power-avg';
import { DataPowerWork } from '../../data/data.power-work';
import { DataPowerNormalized } from '../../data/data.power-normalized';
import { DataStopEvent } from '../../data/data.stop-event';
import { DataStopAllEvent } from '../../data/data.stop-all-event';
import { DataStartEvent } from '../../data/data.start-event';
import { DataTimerTime } from '../../data/data.timer-time';
import { DataFTP } from '../../data/data.ftp';
import { ActivityUtilities } from './activity.utilities';
import { EventImporterJSON } from '../adapters/importers/json/importer.json';
import { powerIntervals, meanMaxPower } from './power-intervals';
import { fileFunctionalThresholdPower } from './tss/tss-evaluation';

const create = (watts: (number | null)[], duration = watts.length) => {
  const activity = new Activity(
    new Date(0),
    new Date(duration * 1000),
    ActivityTypes.Cycling,
    new Creator('Synthetic')
  );
  activity.addStream(new Stream(DataPower.type, watts));
  activity.addStat(new DataTimerTime(duration));
  fileFunctionalThresholdPower.set(activity, 250);
  return activity;
};
const generate = ActivityUtilities.generateMissingStreamsAndStatsForActivity.bind(ActivityUtilities);
const evaluate = ActivityUtilities.getTrainingStressScoreEvaluations.bind(ActivityUtilities);
const coverage = ActivityUtilities.getPowerCoverage.bind(ActivityUtilities);

describe('observed power support', () => {
  it('keeps missing power distinct from coasting, without fabricating whole-workout work or FTP', () => {
    const values = [...Array(800).fill(200), ...Array(400).fill(null)];
    const a = create(values);
    generate(a);
    expect(a.getStreamData(DataPower.type)).toEqual(values);
    expect(coverage(a)).toMatchObject({
      coveredDurationSeconds: 800,
      observedWorkKilojoules: 160,
      observedAveragePowerWatts: 200,
      coverageRatio: 2 / 3
    });
    expect(a.getStat(DataPowerAvg.type)?.getValue()).toBe(200);
    expect(a.getStat(DataPowerWork.type)).toBeUndefined();
    expect(evaluate(a).automatic.method).not.toBe('POWER');
    expect(ActivityUtilities.calculateMeanMaxPower(a, [1200]).getValue()).toEqual([]);
    const coasting = create(values.map(v => v ?? 0));
    generate(coasting);
    expect(coverage(coasting).coverageRatio).toBe(1);
    expect(coasting.getStat(DataPowerAvg.type)?.getValue()).toBeCloseTo(400 / 3);
    expect(coasting.getStat(DataPowerWork.type)?.getValue()).toBe(160);
    expect(evaluate(coasting).automatic).toMatchObject({ method: 'POWER', estimated: false });
  });

  it('clips endpoint and fractional timer intervals without bridging pauses', () => {
    const a = create(Array(61).fill(200), 60);
    a.addEvent(new DataStopEvent(20.5));
    a.addEvent(new DataStartEvent(40.5));
    a.addStat(new DataTimerTime(40));
    const result = powerIntervals(a);
    expect(result.coverage).toMatchObject({
      durationSeconds: 40,
      coveredDurationSeconds: 40,
      observedWorkKilojoules: 8,
      coverageRatio: 1
    });
    expect(meanMaxPower(result.watts, 21)).toBeNull();
    expect(meanMaxPower(result.watts, 20)).toBe(200);
    expect(a.getStreamData(DataPower.type)).toEqual(Array(61).fill(200));
  });

  it('marks partial computed power TSS estimated, but does not reinterpret supplied NP', () => {
    const a = create([...Array(960).fill(200), ...Array(240).fill(null)]);
    generate(a);
    expect(evaluate(a).automatic).toMatchObject({ method: 'POWER', estimated: true, score: 21.3 });
    a.addStat(new DataPowerNormalized(210));
    expect(ActivityUtilities.evaluateTrainingStressScore(a).automatic).toMatchObject({
      method: 'POWER',
      estimated: false
    });
    const sparse = create([...Array(30).fill(200), ...Array(1170).fill(null)]);
    generate(sparse);
    expect(sparse.getStat(DataPowerNormalized.type)?.getValue()).toBe(200);
    expect(evaluate(sparse).automatic.method).not.toBe('POWER');
  });

  it('preserves supplied average, work, NP and FTP through generation and JSON', () => {
    const a = create([...Array(30).fill(200), ...Array(1170).fill(null)]);
    a.addStat(new DataPowerAvg(123));
    a.addStat(new DataPowerWork(456));
    a.addStat(new DataPowerNormalized(234));
    a.addStat(new DataFTP(250));
    generate(a);
    const restored = EventImporterJSON.getActivityFromJSON(JSON.parse(JSON.stringify(a.toJSON()))) as Activity;
    generate(restored);
    expect(restored.getStat(DataPowerAvg.type)?.getValue()).toBe(123);
    expect(restored.getStat(DataPowerWork.type)?.getValue()).toBe(456);
    expect(restored.getStat(DataPowerNormalized.type)?.getValue()).toBe(234);
    expect(restored.getStat(DataFTP.type)?.getValue()).toBe(250);
  });

  it('invalidates no supplied summary when callers replace a calculated stat', () => {
    const a = create(Array(1200).fill(200));
    generate(a);
    a.addStat(new DataPowerAvg(200));
    a.addStat(new DataPowerWork(240));
    a.getStream(DataPower.type).setData(Array(1200).fill(null));
    generate(a);
    expect(a.getStat(DataPowerAvg.type)?.getValue()).toBe(200);
    expect(a.getStat(DataPowerWork.type)?.getValue()).toBe(240);
  });
});

it('measures coverage without changing streams, stats or the JSON format', () => {
  const a = create([200, null, 0, 300], 4);
  const before = JSON.stringify(a.toJSON());
  expect(coverage(a)).toMatchObject({ coverageRatio: 0.75, observedWorkKilojoules: 0.5 });
  expect(JSON.stringify(a.toJSON())).toBe(before);
  const restored = EventImporterJSON.getActivityFromJSON(JSON.parse(before)) as Activity;
  expect(restored.getStreamData(DataPower.type)).toEqual([200, null, 0, 300]);
  expect(coverage(restored)).toEqual(coverage(a));
});

describe('power summaries at fractional lap boundaries', () => {
  it.each([
    { start: 0.5, end: 1.5, first: 300, expected: [100, 300, 200] },
    { start: 0.5, end: 1, first: 300, expected: [300, 300, 300] },
    { start: 0.5, end: 0.75, first: 300, expected: [300, 300, 300] },
    { start: 0.5, end: 1.5, first: 0, expected: [0, 100, 50] },
    { start: 0.5, end: 1.5, first: null, expected: [100, 100, 100] },
    { start: 0, end: 1, first: 300, expected: [300, 300, 300] },
    { start: 1, end: 2, first: 300, expected: [100, 100, 100] },
    { start: 0.5, end: 0.5, first: 300, expected: [undefined, undefined, undefined] },
    { start: 0.5, end: 3, first: 300, expected: [0, 300, 120] },
    { start: -0.5, end: 1.5, first: 300, expected: [undefined, undefined, undefined] }
  ])('keeps extrema consistent with supported power: $start–$end s, first=$first', ({ start, end, first, expected }) => {
    const values = [first, 100, 50, 0];
    let a = create(values, 3);
    a.addLap(new Lap(new Date(start * 1000), new Date(end * 1000), 1, LapTypes.Manual));
    a.getStream(DataPower.type).useFilter({ filterData: data => data.map(value => value === null ? 999 : value * 2) });
    for (let cycle = 0; cycle < 3; cycle++) {
      generate(a);
      expect([DataPowerMin.type, DataPowerMax.type, DataPowerAvg.type]
        .map(type => a.getLaps()[0].getStat(type)?.getValue())).toEqual(expected);
      expect(a.getStream(DataPower.type).toJSON().data).toEqual(values);
      a = EventImporterJSON.getActivityFromJSON(JSON.parse(JSON.stringify(a.toJSON()))) as Activity;
    }
  });

  it('preserves supplied lap power statistics at a fractional boundary', () => {
    const a = create([300, 100, 50, 0], 3);
    const lap = new Lap(new Date(500), new Date(1500), 1, LapTypes.Manual);
    lap.addStat(new DataPowerMin(20));
    lap.addStat(new DataPowerMax(400));
    lap.addStat(new DataPowerAvg(250));
    a.addLap(lap);
    generate(a);
    expect([DataPowerMin.type, DataPowerMax.type, DataPowerAvg.type]
      .map(type => lap.getStat(type)?.getValue())).toEqual([20, 400, 250]);
  });

  it.each([
    { resume: 1, expected: [100, 100, 100] },
    { resume: 0.75, expected: [100, 300, 500 / 3] }
  ])('counts the leading reading only when it supports active lap time, resume=$resume', ({ resume, expected }) => {
    const a = create([300, 100, 50, 0], 3);
    a.addEvent(new DataStopEvent(0.25));
    a.addEvent(new DataStartEvent(resume));
    a.addLap(new Lap(new Date(500), new Date(1500), 1, LapTypes.Manual));
    generate(a);
    expect([DataPowerMin.type, DataPowerMax.type, DataPowerAvg.type]
      .map(type => a.getLaps()[0].getStat(type)?.getValue())).toEqual(expected);
  });
});

it('rejects coverage below 80% and never counts paused readings or the endpoint as active work', () => {
  const low = create([...Array(959).fill(200), ...Array(241).fill(null)]);
  generate(low);
  expect(evaluate(low).automatic.method).not.toBe('POWER');
  const paused = create([...Array(20).fill(100), ...Array(20).fill(900), ...Array(21).fill(200)], 60);
  paused.addEvent(new DataStopEvent(20));
  paused.addEvent(new DataStartEvent(40));
  paused.addStat(new DataTimerTime(40));
  expect(coverage(paused)).toMatchObject({
    durationSeconds: 40,
    coveredDurationSeconds: 40,
    observedWorkKilojoules: 6,
    observedAveragePowerWatts: 150
  });
});

it('keeps pauses, missing readings and coasting distinct after repeated JSON restoration', () => {
  let a = create([200, null, 0, 900, 900, 300, 300, 300], 7);
  a.addEvent(new DataStopEvent(3));
  a.addEvent(new DataStartEvent(5));
  a.addStat(new DataTimerTime(5));
  const expected = coverage(a);
  expect(expected).toMatchObject({ coveredDurationSeconds: 4, coverageRatio: 0.8, observedWorkKilojoules: 0.8 });
  for (let repeat = 0; repeat < 2; repeat++) {
    a = EventImporterJSON.getActivityFromJSON(JSON.parse(JSON.stringify(a.toJSON()))) as Activity;
    expect(coverage(a)).toEqual(expected);
    expect(meanMaxPower(powerIntervals(a).watts, 3)).toBeNull();
    expect(meanMaxPower(powerIntervals(a).watts, 2)).toBe(300);
  }
  // Coverage always uses current streams, including caller edits after restoration.
  a.getStream(DataPower.type).setData([200, 200, 0, 900, 900, 300, 300, 300]);
  expect(coverage(a)).toMatchObject({ coverageRatio: 1, observedWorkKilojoules: 1 });
});

it('keeps absent data unavailable and honors a larger supplied timer duration', () => {
  const a = create(Array(60).fill(null));
  generate(a);
  expect(coverage(a)).toMatchObject({ coverageRatio: 0, observedAveragePowerWatts: null });
  expect(a.getStat(DataPowerAvg.type)).toBeUndefined();
  expect(a.getStat(DataPowerWork.type)).toBeUndefined();
  const b = create(Array(60).fill(200));
  b.addStat(new DataTimerTime(61));
  generate(b);
  expect(coverage(b).coverageRatio).toBeCloseTo(60 / 61);
  expect(b.getStat(DataPowerWork.type)).toBeUndefined();
});

it.each([
  (data: (number | null)[]) => data.map(value => value ?? 200),
  (data: (number | null)[]) => data.filter(value => value !== null),
  (data: (number | null)[]) => data.map(value => value === null ? null : value * 2)
])('measures original observations independently of a stream filter', filterData => {
  const a = create([200, null, 0, 300], 4);
  const stream = a.getStream(DataPower.type);
  const expected = coverage(a);
  const expectedWindows = powerIntervals(a).watts;
  const before = JSON.stringify(stream.toJSON());
  stream.useFilter({ filterData });
  expect(coverage(a)).toEqual(expected);
  expect(powerIntervals(a).watts).toEqual(expectedWindows);
  expect(JSON.stringify(stream.toJSON())).toBe(before);
  expect(stream.hasFilter()).toBe(true);
  expect(stream.getData()).toEqual(filterData([200, null, 0, 300]));
  const restored = EventImporterJSON.getActivityFromJSON(JSON.parse(JSON.stringify(a.toJSON()))) as Activity;
  expect(coverage(restored)).toEqual(coverage(a));
});

it('does not let filtered gap filling create power work, long efforts or eligible power TSS', () => {
  const values = [...Array(30).fill(200), ...Array(1170).fill(null)];
  const a = create(values);
  const stream = a.getStream(DataPower.type);
  stream.useFilter({ filterData: data => data.map(value => value ?? 200) });
  generate(a);
  expect(coverage(a).coverageRatio).toBe(0.025);
  expect(a.getStat(DataPowerWork.type)).toBeUndefined();
  expect(a.getStat(DataFTP.type)?.getValue()).toBe(250); // Independent calibration remains valid.
  expect(ActivityUtilities.calculateMeanMaxPower(a, [1200]).getValue()).toEqual([]);
  expect(evaluate(a).automatic.method).not.toBe('POWER');
  expect(stream.toJSON().data).toEqual(values);
  expect(stream.hasFilter()).toBe(true);
});

it.each([
  (data: (number | null)[]) => data.map(value => value ?? 1000),
  (data: (number | null)[]) => data.filter(value => value !== null),
  (data: (number | null)[]) => data.map(value => value === null ? null : value / 10)
])('uses original power for activity and lap extrema consistently with their averages', filterData => {
  const values = [200, null, 0, 400, 100, 900];
  const a = create(values, 5);
  a.addLap(new Lap(new Date(0), new Date(3000), 1, LapTypes.Manual));
  a.addLap(new Lap(new Date(3000), new Date(5000), 2, LapTypes.Manual));
  const stream = a.getStream(DataPower.type);
  stream.useFilter({ filterData });
  generate(a);
  const summaries = (activity: Activity) => [activity, ...activity.getLaps()].map(target =>
    [DataPowerMin.type, DataPowerMax.type, DataPowerAvg.type].map(type => target.getStat(type)?.getValue()));
  // The shared boundary belongs to the second lap; the endpoint affects extrema, not duration.
  const expected = [[0, 900, 175], [0, 200, 100], [100, 900, 250]];
  expect(summaries(a)).toEqual(expected);
  const restored = EventImporterJSON.getActivityFromJSON(JSON.parse(JSON.stringify(a.toJSON()))) as Activity;
  generate(restored);
  expect(summaries(restored)).toEqual(expected);
  expect(stream.toJSON().data).toEqual(values);
  expect(stream.hasFilter()).toBe(true);
});

it.each([DataStopEvent, DataStopAllEvent])('does not join efforts across a stop/resume at the same timestamp', Stop => {
  let a = create(Array(40).fill(200), 40);
  a.addEvent(new Stop(20));
  a.addEvent(new DataStartEvent(20));
  const before = JSON.stringify(a.toJSON());
  for (let pass = 0; pass < 2; pass++) {
    expect(ActivityUtilities.calculateMeanMaxPower(a, [20, 30, 40]).toJSON()).toEqual({
      PowerCurve: [{ duration: 20, power: 200 }]
    });
    expect(coverage(a)).toMatchObject({ coveredDurationSeconds: 40, observedWorkKilojoules: 8, coverageRatio: 1 });
    expect(JSON.stringify(a.toJSON())).toBe(before);
    a = EventImporterJSON.getActivityFromJSON(JSON.parse(before)) as Activity;
  }
});

it('does not infer FTP by joining two shorter efforts separated by a same-timestamp restart', () => {
  const a = create(Array(1200).fill(200), 1200);
  fileFunctionalThresholdPower.delete(a);
  a.addEvent(new DataStopEvent(600));
  a.addEvent(new DataStartEvent(600));
  generate(a);
  expect(a.getStat(DataFTP.type)).toBeUndefined();
  expect(a.getStat(DataPowerNormalized.type)?.getValue()).toBe(200);
});

it('keeps the existing spike rule within each active segment', () => {
  const a = create([0, 200, 0], 3);
  expect(ActivityUtilities.calculateMeanMaxPower(a, [1]).toJSON()).toEqual({ PowerCurve: [{ duration: 1, power: 0 }] });
  a.addEvent(new DataStopEvent(1));
  a.addEvent(new DataStartEvent(1));
  expect(ActivityUtilities.calculateMeanMaxPower(a, [1]).toJSON()).toEqual({ PowerCurve: [{ duration: 1, power: 200 }] });
  expect(a.getStreamData(DataPower.type)).toEqual([0, 200, 0]);
});

it.each([0, 20, 40])('does not split efforts on a repeated start or an endpoint restart at %s', second => {
  const a = create(Array(40).fill(200), 40);
  if (second !== 20) a.addEvent(new DataStopEvent(second));
  a.addEvent(new DataStartEvent(second));
  expect(ActivityUtilities.calculateMeanMaxPower(a, [40]).toJSON()).toEqual({ PowerCurve: [{ duration: 40, power: 200 }] });
});
