import { FitBaseType, FitEncoder } from 'fit-file-parser/encoder';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { DataHeartRate } from '../../../../data/data.heart-rate';
import { DataTrainingStressScore } from '../../../../data/data.training-stress-score';
import { DataTrainingStressScoreMethod } from '../../../../data/data.training-stress-score-method';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { EventImporterJSON } from '../json/importer.json';
import { EventImporterFIT } from './importer.fit';

const field = (number: number, value: number, baseType = FitBaseType.Uint8) => ({
  number,
  value,
  baseType,
  size: baseType === FitBaseType.Uint32 ? 4 : baseType === FitBaseType.Uint16 ? 2 : 1
});

// Authored fixture only: one hour, explicit calibration and optional independent inputs.
async function workout(
  settings: {
    imported?: number;
    threshold?: number;
    mode?: number;
    mass?: boolean;
    energy?: boolean;
    hr?: boolean;
    sport?: number;
    power?: boolean;
  } = {},
  options = new ActivityParsingOptions({ generateUnitStreams: false })
) {
  const encoder = new FitEncoder(),
    start = FitEncoder.toFitTimestamp(new Date('2026-01-01T10:00:00Z'));
  encoder.writeMessage(0, [field(0, 4, FitBaseType.Enum)], 0);
  if (settings.mass !== false) encoder.writeMessage(3, [field(4, 700, FitBaseType.Uint16)], 4);
  for (const second of [0, 3600]) {
    encoder.writeMessage(
      20,
      [field(253, start + second, FitBaseType.Uint32), ...(settings.hr === false ? [] : [field(3, 130)])],
      1
    );
  }
  encoder.writeMessage(
    18,
    [
      field(254, 0, FitBaseType.Uint16),
      field(253, start + 3600, FitBaseType.Uint32),
      field(2, start, FitBaseType.Uint32),
      field(5, settings.sport ?? 1, FitBaseType.Enum),
      field(7, 3600000, FitBaseType.Uint32),
      field(8, 3600000, FitBaseType.Uint32),
      ...(settings.energy === false ? [] : [field(11, 210, FitBaseType.Uint16)]),
      ...(settings.imported === undefined ? [] : [field(35, settings.imported * 10, FitBaseType.Uint16)]),
      ...(settings.power ? [field(34, 200, FitBaseType.Uint16), field(45, 200, FitBaseType.Uint16)] : [])
    ],
    2
  );
  encoder.writeMessage(
    216,
    [
      field(0, 18, FitBaseType.Uint16),
      field(1, 0, FitBaseType.Uint16),
      field(11, 190),
      field(12, 50),
      field(13, settings.threshold ?? 60),
      field(10, settings.mode ?? 2, FitBaseType.Enum),
      { number: 6, value: new Uint8Array([120, 134, 148, 162, 176, 190]), baseType: FitBaseType.Uint8, size: 6 }
    ],
    3
  );
  const bytes = encoder.close();
  return EventImporterFIT.getFromArrayBuffer(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
    options
  );
}

describe('FIT HRR threshold consistency and TSS fallback', () => {
  it.each([1, 2, 5, 11])('uses the MET estimate for eligible FIT sport %s without changing HR samples', async sport => {
    const activity = (await workout({ sport })).getFirstActivity();
    const evaluations = ActivityUtilities.getTrainingStressScoreEvaluations(activity);
    for (const preference of ['automatic', 'hr', 'met'] as const) {
      expect(evaluations[preference]).toMatchObject({ method: 'MET', score: 9, estimated: true });
    }
    expect(evaluations.hr.reasons).toContain('invalid-hr-calibration');
    expect(evaluations.automatic.reasons).toContain('invalid-hr-calibration');
    expect(activity.getStreamData(DataHeartRate.type).filter(value => value !== null && value !== undefined)).toEqual([
      130, 130
    ]);
  });

  it.each([0, 42.5])('preserves imported TSS %s through calculation and regeneration', async imported => {
    const activity = (await workout({ imported })).getFirstActivity();
    for (let repeat = 0; repeat < 2; repeat++) {
      const evaluations = ActivityUtilities.evaluateTrainingStressScore(activity);
      for (const preference of ['automatic', 'hr', 'met'] as const) {
        expect(evaluations[preference]).toMatchObject({ method: 'IMPORTED', score: imported, provenance: 'imported' });
      }
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
      expect(activity.getStat(DataTrainingStressScore.type)?.getValue()).toBe(imported);
    }
  });

  it.each(['mass', 'energy'])('returns unavailable rather than zero without fallback %s', async missing => {
    const activity = (await workout({ [missing]: false })).getFirstActivity();
    const result = ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic;
    expect(result).toMatchObject({ score: null, method: null });
    expect(result.reasons).toEqual(expect.arrayContaining(['invalid-hr-calibration', 'missing-met-inputs']));
    expect(activity.getStat(DataTrainingStressScore.type)).toBeUndefined();
  });

  it('falls back without HR samples and retains valid threshold calculations', async () => {
    const missing = (await workout({ hr: false })).getFirstActivity();
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(missing).automatic).toMatchObject({
      method: 'MET',
      score: 9
    });
    const calibrated = (await workout({ threshold: 130 })).getFirstActivity();
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(calibrated).automatic).toMatchObject({
      method: 'HR',
      score: 100
    });
  });

  it('retains complete explicit physiological overrides and does not reinterpret custom zones', async () => {
    const options = new ActivityParsingOptions({
      generateUnitStreams: false,
      tss: { overrides: { maxHeartRate: 190, restingHeartRate: 50, lactateThresholdHR: 130 } }
    });
    const override = (await workout({}, options)).getFirstActivity();
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(override).automatic).toMatchObject({
      method: 'HR',
      score: 100
    });
    const custom = (await workout({ mode: 0 })).getFirstActivity();
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(custom).automatic.method).toBe('HR');
  });

  it('prioritizes calibrated power for cycling and walking', async () => {
    const cycling = (await workout({ sport: 2, power: true })).getFirstActivity();
    const evaluations = ActivityUtilities.getTrainingStressScoreEvaluations(cycling);
    expect(evaluations.automatic).toMatchObject({ method: 'POWER', score: 100 });
    expect(evaluations.hr).toMatchObject({ method: 'POWER', score: 100, reasons: ['invalid-hr-calibration'] });
    const walking = (await workout({ sport: 11, power: true })).getFirstActivity();
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(walking).automatic).toMatchObject({
      method: 'POWER',
      score: 100
    });
  });

  it('replaces stale calculated HR scores without changing canonical JSON or leaking calibration', async () => {
    const event = await workout(),
      activity = event.getFirstActivity();
    activity.addStat(new DataTrainingStressScore(2000));
    activity.addStat(new DataTrainingStressScoreMethod('HR'));
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    expect(activity.getStat(DataTrainingStressScore.type)?.getValue()).toBe(9);
    expect(activity.getStat(DataTrainingStressScoreMethod.type)?.getValue()).toBe('MET');
    const json = JSON.parse(JSON.stringify(event.toJSON()));
    const restored = EventImporterJSON.getEventFromJSON(json);
    expect(restored.getFirstActivity().getStat(DataTrainingStressScore.type)?.getValue()).toBe(9);
    expect(restored.getFirstActivity().getStat(DataTrainingStressScoreMethod.type)?.getValue()).toBe('MET');
    expect(JSON.stringify(json)).not.toMatch(/fileHeartRateCalibration|hr_zone_high_boundary|threshold_heart_rate/);
  });
});
