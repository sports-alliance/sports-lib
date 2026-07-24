import * as fs from 'fs';
import * as path from 'path';
import { DataPower } from '../../data/data.power';
import { EventImporterFIT } from '../adapters/importers/fit/importer.fit';
import {
  calculateThreeDimensionalImpulseResponse,
  calculateThreeDimensionalStrain,
  type ThreeDimensionalImpulseResponseParameters
} from './three-dimensional-impulse-response';
import {
  fitThreeDimensionalImpulseResponseParameters,
  type ThreeDimensionalDailyStrainLoad
} from './three-dimensional-impulse-response-calibration';
import * as publishedTrainingFixture from '../../specs/fixtures/analytics/plos-one-three-dimensional-impulse-response-training.json';

const FIXTURE_MODEL = {
  criticalPowerWatts: 200,
  wPrimeJoules: 20_000,
  maximumPowerWatts: 500
};

const RESPONSE_PARAMETERS: ThreeDimensionalImpulseResponseParameters = {
  criticalPower: {
    baseline: 245,
    fitnessGain: 0.9,
    fatigueGain: 0.65,
    fitnessTimeConstantDays: 45,
    fatigueTimeConstantDays: 7
  },
  wPrime: {
    baseline: 17_000,
    fitnessGain: 35,
    fatigueGain: 25,
    fitnessTimeConstantDays: 30,
    fatigueTimeConstantDays: 5
  },
  maximumPower: {
    baseline: 1_000,
    fitnessGain: 4.5,
    fatigueGain: 3.3,
    fitnessTimeConstantDays: 16,
    fatigueTimeConstantDays: 3
  }
};

describe('three-dimensional impulse-response calibration fixture integration', () => {
  it('fits calendar-day loads constructed from an existing continuous-power FIT fixture', async () => {
    const samplesDirectory = path.resolve(__dirname, '../../../samples/fit');
    const fixture = fs.readFileSync(path.join(samplesDirectory, '2025-12-24_13-50.fit'));
    const event = await EventImporterFIT.getFromArrayBuffer(
      fixture.buffer.slice(fixture.byteOffset, fixture.byteOffset + fixture.byteLength),
      undefined,
      '2025-12-24_13-50.fit'
    );
    const power = event
      .getFirstActivity()
      .getAllStreams()
      .find(stream => stream.type === DataPower.type)
      ?.getData();
    expect(power).toHaveLength(4_078);

    const analysis = calculateThreeDimensionalStrain(power ?? [], FIXTURE_MODEL);
    expect(analysis.status).toBe('ready');
    expect(analysis.scores).not.toBeNull();

    // Each nonzero day is one, two, or three repetitions of the same real FIT activity.
    // This is calendar aggregation, not a fabricated per-second power stream.
    const repetitions = [0, 1, 2, 0, 1, 3, 0, 0, 2, 1, 0, 1, 0, 2];
    const loads: ThreeDimensionalDailyStrainLoad[] = Array.from({ length: 140 }, (_, index) => {
      const repetitionsToday = repetitions[index % repetitions.length];
      return {
        date: dateForIndex(index),
        criticalPower: analysis.scores!.criticalPower * repetitionsToday,
        wPrime: analysis.scores!.wPrime * repetitionsToday,
        maximumPower: analysis.scores!.maximumPower * repetitionsToday
      };
    });
    const simulatedPerformance = calculateThreeDimensionalImpulseResponse(
      loads.map(({ criticalPower, wPrime, maximumPower }) => ({ criticalPower, wPrime, maximumPower })),
      RESPONSE_PARAMETERS
    )!;
    const observations = simulatedPerformance
      .map((point, index) => ({ point, index }))
      .filter(({ index }) => index >= 20 && index % 10 === 0)
      .map(({ point, index }) => ({
        date: dateForIndex(index),
        criticalPowerWatts: point.criticalPower.performance,
        wPrimeJoules: point.wPrime.performance,
        maximumPowerWatts: point.maximumPower.performance
      }));

    const calibration = fitThreeDimensionalImpulseResponseParameters(loads, observations, {
      minimumObservationCount: 12,
      minimumTrainingObservationCount: 9,
      validationObservationCount: 3,
      minimumTrainingSpanDays: 60,
      maximumValidationNormalizedRmse: 0.001
    });

    expect(calibration.status).toBe('ready');
    expect(calibration.dateRange).toEqual({ start: '2025-01-01', end: '2025-05-20' });
    [calibration.criticalPower, calibration.wPrime, calibration.maximumPower].forEach(component => {
      expect(component.status).toBe('ready');
      expect(component.diagnostics!.validationError.normalizedRmse).toBeLessThan(0.00001);
    });
  });

  it('gates the paper authors’ illustrative athlete data by chronological hold-out quality', () => {
    const fixture = publishedTrainingFixture;
    const missingLoadDayIndexes = fixture.dailyLoads
      .map((load, index) => (load.every(value => value === null) ? index : null))
      .filter((index): index is number => index !== null);
    const loads = fixture.dailyLoads.map((load, index) => ({
      date: dateForIndexFrom(fixture.startDate, index),
      // The authors' reference R implementation explicitly converts these eight absent
      // daily strain values to zero before fitting. Preserve that published preprocessing.
      criticalPower: load[0] ?? 0,
      wPrime: load[1] ?? 0,
      maximumPower: load[2] ?? 0
    }));
    const calibration = fitThreeDimensionalImpulseResponseParameters(loads, fixture.performanceObservations, {
      minimumObservationCount: 9,
      minimumTrainingObservationCount: 6,
      validationObservationCount: 3,
      minimumTrainingSpanDays: 60
    });

    expect(fixture.source).toMatchObject({
      doi: '10.1371/journal.pone.0341721',
      dataFileSha256: '89be756f745c7bd4c5f6fa5fae5d92e30da980db957dbfa7e2618c9be5bc2cd7',
      license: 'CC BY 4.0',
      referenceImplementationCommit: 'f8dc4c0158ce8b8ccb0907fb1ec22e7ce3a031dc',
      referenceImplementationFile: 'Fitting 3D with SS.R'
    });
    expect(loads).toHaveLength(365);
    expect(fixture.performanceObservations).toHaveLength(29);
    expect(missingLoadDayIndexes).toEqual([182, 183, 191, 193, 194, 339, 344, 345]);
    expect(missingLoadDayIndexes.map(index => loads[index])).toEqual(
      missingLoadDayIndexes.map(index => ({
        date: dateForIndexFrom(fixture.startDate, index),
        criticalPower: 0,
        wPrime: 0,
        maximumPower: 0
      }))
    );
    // The authors' script uses a different fitting protocol. This fixture asserts sports-lib's
    // independent chronological hold-out gate, not numerical equality with that all-observation fit.
    expect(calibration).toMatchObject({
      status: 'poor-fit',
      dateRange: { start: '2025-09-01', end: '2026-08-31' },
      criticalPower: { status: 'poor-fit', reason: 'time-constant-at-bound', parameters: null },
      wPrime: { status: 'poor-fit', reason: 'time-constant-at-bound', parameters: null },
      maximumPower: { status: 'poor-fit', reason: 'time-constant-at-bound', parameters: null }
    });
    expect(calibration.criticalPower.diagnostics!.validationError.normalizedRmse).toBeLessThan(0.1);
    expect(calibration.wPrime.diagnostics!.validationError.normalizedRmse).toBeGreaterThan(0.1);
    expect(calibration.maximumPower.diagnostics!.validationError.normalizedRmse).toBeLessThan(0.1);
  });
});

function dateForIndex(index: number): string {
  return new Date(Date.UTC(2025, 0, 1 + index)).toISOString().slice(0, 10);
}

function dateForIndexFrom(startDate: string, index: number): string {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  start.setUTCDate(start.getUTCDate() + index);
  return start.toISOString().slice(0, 10);
}
