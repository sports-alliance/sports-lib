import * as fs from 'fs';
import * as path from 'path';
import { EventImporterFIT } from '../adapters/importers/fit/importer.fit';
import { DataPower } from '../../data/data.power';
import { calculateThreeDimensionalStrain } from './three-dimensional-impulse-response';

const CONTINUOUS_FIXTURE_MODEL = {
  criticalPowerWatts: 200,
  wPrimeJoules: 20_000,
  maximumPowerWatts: 500
};

const GAPPED_FIXTURE_MODEL = {
  criticalPowerWatts: 200,
  wPrimeJoules: 20_000,
  maximumPowerWatts: 1_500
};

describe('three-dimensional impulse-response fixture integration', () => {
  const samplesDirectory = path.resolve(__dirname, '../../../samples/fit');

  async function importFixture(name: string) {
    const fixture = fs.readFileSync(path.join(samplesDirectory, name));
    return EventImporterFIT.getFromArrayBuffer(
      fixture.buffer.slice(fixture.byteOffset, fixture.byteOffset + fixture.byteLength),
      undefined,
      name
    );
  }

  function getPowerData(event: Awaited<ReturnType<typeof EventImporterFIT.getFromArrayBuffer>>) {
    const activity = event.getFirstActivity();
    const powerStream = activity.getAllStreams().find(stream => stream.type === DataPower.type);
    return powerStream?.getData() ?? [];
  }

  it('scores a real, continuous cycling-power FIT fixture deterministically', async () => {
    const event = await importFixture('2025-12-24_13-50.fit');
    const power = getPowerData(event);
    const analysis = calculateThreeDimensionalStrain(power, CONTINUOUS_FIXTURE_MODEL);

    expect(power).toHaveLength(4_078);
    expect(power.every(value => typeof value === 'number' && Number.isFinite(value))).toBe(true);
    expect(analysis.status).toBe('ready');
    expect(analysis.coverageRatio).toBe(1);
    expect(analysis.scores!.total).toBeCloseTo(180.6279565833839, 8);
    expect(analysis.scores!.criticalPower).toBeCloseTo(169.37491000030383, 8);
    expect(analysis.scores!.wPrime).toBeCloseTo(9.576052971676436, 8);
    expect(analysis.scores!.maximumPower).toBeCloseTo(1.6769936114037323, 8);
    expect(analysis.endingWPrimeBalanceJoules).toBeCloseTo(3_238.135255823461, 8);
  });

  it('does not bridge gaps in a real power stream with invented load', async () => {
    const event = await importFixture('road-with-power.fit');
    const power = getPowerData(event);
    const analysis = calculateThreeDimensionalStrain(power, GAPPED_FIXTURE_MODEL);

    expect(power).toHaveLength(5_305);
    expect(power.filter(value => value === null)).toHaveLength(559);
    expect(analysis).toMatchObject({
      status: 'insufficient-evidence',
      reason: 'insufficient-coverage',
      sampleCount: 5_305,
      validSampleCount: 4_746,
      candidateDurationSeconds: 5_305,
      recordedDurationSeconds: 4_746,
      coverageRatio: 4_746 / 5_305,
      scores: null,
      endingWPrimeBalanceJoules: null,
      minimumWPrimeBalanceJoules: null
    });
  });

  it('returns missing-power evidence for a real FIT fixture without a power stream', async () => {
    const event = await importFixture('garmin.fit');
    const analysis = calculateThreeDimensionalStrain(getPowerData(event), GAPPED_FIXTURE_MODEL);

    expect(analysis).toMatchObject({
      status: 'insufficient-evidence',
      reason: 'missing-power',
      sampleCount: 0,
      validSampleCount: 0,
      scores: null
    });
  });
});
