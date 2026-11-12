import { Activity } from '../../../activities/activity';
import { ActivityTypes } from '../../../activities/activity.types';
import { ActivityParsingOptions } from '../../../activities/activity-parsing-options';
import { Creator } from '../../../creators/creator';
import { DataEnergy } from '../../../data/data.energy';
import { DataWeight } from '../../../data/data.weight';
import { DataTimerTime } from '../../../data/data.timer-time';
import { DataHeartRate } from '../../../data/data.heart-rate';
import { DataPower } from '../../../data/data.power';
import { DataPowerNormalized } from '../../../data/data.power-normalized';
import { DataSpeedAvg } from '../../../data/data.speed-avg';
import { DataTrainingStressScore } from '../../../data/data.training-stress-score';
import { ActivityUtilities } from '../activity.utilities';
import { fileActiveDuration, fileFunctionalThresholdPower, fileHeartRateCalibration, type TrainingStressScoreCalibration } from './tss-evaluation';

function workout(type = ActivityTypes.Cycling): Activity {
  const activity = new Activity(new Date(0), new Date(3600000), type, new Creator('Test'));
  activity.addStat(new DataTimerTime(3600));
  return activity;
}
function samples(activity: Activity, type: string, value: number): void {
  const stream = activity.createStream(type);
  stream.setData(Array(3601).fill(value));
  activity.addStream(stream);
}
function evaluate(activity: Activity, calibration: TrainingStressScoreCalibration) {
  const cached = ActivityUtilities.getTrainingStressScoreEvaluations(activity);
  const before = JSON.stringify(activity.toJSON());
  const options = JSON.stringify(activity.parseOptions);
  const result = ActivityUtilities.evaluateTrainingStressScoreWithCalibration(activity, calibration);
  expect(JSON.stringify(activity.toJSON())).toBe(before);
  expect(JSON.stringify(activity.parseOptions)).toBe(options);
  expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity)).toBe(cached);
  return result;
}

describe('independent consumer TSS calibration', () => {
  it.each([0, 42.3])('preserves imported %s for every preference', score => {
    const activity = workout(); activity.addStat(new DataTrainingStressScore(score));
    const result = evaluate(activity, { functionalThresholdPower: 220, lactateThresholdHR: 165, bodyMassKg: 70 });
    for (const candidate of Object.values(result).filter(value => typeof value === 'object')) {
      expect(candidate).toMatchObject({ score, provenance: 'imported', method: 'IMPORTED' });
    }
  });

  it('computes power from independent FTP without persisting NP or FTP', () => {
    const activity = workout(); samples(activity, DataPower.type, 200);
    expect(evaluate(activity, { functionalThresholdPower: 200 }).automatic)
      .toMatchObject({ score: 100, method: 'POWER', estimated: false });
    expect(activity.getStat(DataPowerNormalized.type)).toBeUndefined();
  });

  it('prefers independently recorded FTP over consumer FTP', () => {
    const activity = workout(); samples(activity, DataPower.type, 200);
    fileFunctionalThresholdPower.set(activity, 200);
    expect(evaluate(activity, { functionalThresholdPower: 250 }).automatic).toMatchObject({ score: 100, method: 'POWER' });
  });

  it('keeps power coverage rejection when FTP becomes available', () => {
    const activity = workout(); samples(activity, DataPower.type, 200);
    const stream = activity.getStream(DataPower.type);
    stream.setData(Array.from({ length: 3601 }, (_, i) => i < 1800 ? 200 : null));
    expect(evaluate(activity, { functionalThresholdPower: 200 }).automatic.score).toBeNull();
  });

  it('marks accepted incomplete computed power as estimated', () => {
    const activity = workout(); samples(activity, DataPower.type, 200);
    activity.getStream(DataPower.type).setData(Array.from({ length: 3601 }, (_, i) => i < 3240 ? 200 : null));
    expect(evaluate(activity, { functionalThresholdPower: 200 }).automatic)
      .toMatchObject({ score: 100, method: 'POWER', estimated: true });
  });

  it('retains device normalized power priority without claiming computed coverage', () => {
    const activity = workout(); samples(activity, DataPower.type, 200);
    activity.getStream(DataPower.type).setData(Array.from({ length: 3601 }, (_, i) => i < 900 ? 200 : null));
    activity.addStat(new DataPowerNormalized(200));
    expect(evaluate(activity, { functionalThresholdPower: 200 }).automatic)
      .toMatchObject({ score: 100, method: 'POWER', estimated: false });
  });

  it('uses standalone threshold HR without mixing file resting/max HR', () => {
    const activity = workout(ActivityTypes.Walking); samples(activity, DataHeartRate.type, 100);
    fileHeartRateCalibration.set(activity, { restingHeartRate: 54, maxHeartRate: 187, lactateThresholdHR: 62,
      reason: 'invalid-hr-calibration' });
    expect(evaluate(activity, { lactateThresholdHR: 165 }).hr)
      .toMatchObject({ score: 40, method: 'HR', hrAlgorithm: 'THRESHOLD', estimated: true });
  });

  it('prefers a valid file Banister calibration', () => {
    const activity = workout(); samples(activity, DataHeartRate.type, 100);
    fileHeartRateCalibration.set(activity, { restingHeartRate: 55, maxHeartRate: 190, lactateThresholdHR: 165 });
    const cached = ActivityUtilities.getTrainingStressScoreEvaluations(activity);
    expect(evaluate(activity, { lactateThresholdHR: 150 }).hr).toEqual(cached.hr);
    expect(cached.hr.hrAlgorithm).toBe('BANISTER');
  });

  it('prefers a valid file threshold-only calibration', () => {
    const activity = workout(); samples(activity, DataHeartRate.type, 165);
    fileHeartRateCalibration.set(activity, { lactateThresholdHR: 165 });
    expect(evaluate(activity, { lactateThresholdHR: 180 }).hr).toMatchObject({ score: 100, hrAlgorithm: 'THRESHOLD' });
  });

  it.each(['BANISTER', 'THRESHOLD'] as const)('honors explicit %s using file calibration before consumer calibration', hrAlgorithm => {
    const activity = workout(); samples(activity, DataHeartRate.type, 100);
    fileHeartRateCalibration.set(activity, { restingHeartRate: 55, maxHeartRate: 190, lactateThresholdHR: 165 });
    const chosen = evaluate(activity, { hrAlgorithm, restingHeartRate: 60, maxHeartRate: 180, lactateThresholdHR: 150 }).hr;
    expect(chosen).toMatchObject({ method: 'HR', hrAlgorithm, score: hrAlgorithm === 'BANISTER' ? 16.2 : 40 });
    expect(chosen.reasons).not.toContain('requested-hr-algorithm-unavailable');
  });

  it('requires an explicit formula choice before consumer rest/max can change threshold-only behavior', () => {
    const activity = workout(); samples(activity, DataHeartRate.type, 100);
    const tuple = { restingHeartRate: 55, maxHeartRate: 190, lactateThresholdHR: 165 };
    expect(evaluate(activity, tuple).hr).toMatchObject({ score: 40, hrAlgorithm: 'THRESHOLD' });
    expect(evaluate(activity, { ...tuple, hrAlgorithm: 'BANISTER' }).hr)
      .toMatchObject({ score: 16.2, hrAlgorithm: 'BANISTER', estimated: false });
  });

  it('uses a whole consumer tuple rather than completing file calibration', () => {
    const activity = workout(); samples(activity, DataHeartRate.type, 100);
    fileHeartRateCalibration.set(activity, { lactateThresholdHR: 180, restingHeartRate: 70 });
    const consumer = { hrAlgorithm: 'BANISTER' as const, restingHeartRate: 55, maxHeartRate: 190, lactateThresholdHR: 165 };
    const complete = evaluate(activity, consumer).hr;
    fileHeartRateCalibration.delete(activity);
    expect(evaluate(activity, consumer).hr).toEqual(complete);
  });

  it.each([
    { maxHeartRate: 190 }, { restingHeartRate: 55 }, { restingHeartRate: 55, maxHeartRate: 190 },
    { restingHeartRate: 170, maxHeartRate: 190, lactateThresholdHR: 165 },
    { restingHeartRate: 55, maxHeartRate: 160, lactateThresholdHR: 165 },
  ])('does not fabricate a consumer Banister tuple from %j', partial => {
    const activity = workout(); samples(activity, DataHeartRate.type, 100);
    fileHeartRateCalibration.set(activity, { lactateThresholdHR: 165 });
    const result = evaluate(activity, { ...partial, hrAlgorithm: 'BANISTER' }).hr;
    expect(result).toMatchObject({ score: 40, hrAlgorithm: 'THRESHOLD', estimated: true });
    expect(result.reasons).toContain('requested-hr-algorithm-unavailable');
  });

  it.each(['ambiguous-hr-calibration', 'invalid-hr-calibration'] as const)('never borrows a %s file tuple', reason => {
    const activity = workout(); samples(activity, DataHeartRate.type, 100);
    fileHeartRateCalibration.set(activity, { restingHeartRate: 54, maxHeartRate: 187, lactateThresholdHR: 62, reason });
    const result = evaluate(activity, { restingHeartRate: 55, maxHeartRate: 190, lactateThresholdHR: 165, hrAlgorithm: 'BANISTER' }).hr;
    expect(result).toMatchObject({ score: 16.2, hrAlgorithm: 'BANISTER' });
    expect(result.reasons).not.toContain('requested-hr-algorithm-unavailable');
    expect(evaluate(activity, { hrAlgorithm: 'BANISTER' }).hr.score).toBeNull();
  });

  it.each([0, 42.3])('keeps imported %s authoritative for both explicit formulas', score => {
    const activity = workout(); activity.addStat(new DataTrainingStressScore(score));
    for (const hrAlgorithm of ['BANISTER', 'THRESHOLD'] as const) {
      const result = evaluate(activity, { hrAlgorithm, restingHeartRate: 55, maxHeartRate: 190, lactateThresholdHR: 165 });
      expect(result.hr).toMatchObject({ score, method: 'IMPORTED' });
    }
  });

  it('preserves legacy unsupported-sport calibration diagnostics without enabling its calculations', () => {
    const activity = workout(ActivityTypes.VideoGaming);
    expect(evaluate(activity, { lactateThresholdHR: 165 }).hr.reasons).toEqual(['missing-hr-calibration', 'unsupported-sport']);
    fileHeartRateCalibration.set(activity, { restingHeartRate: 55, maxHeartRate: 190, lactateThresholdHR: 165 });
    const cached = ActivityUtilities.evaluateTrainingStressScore(activity);
    expect(cached.hr).toMatchObject({ score: null, reasons: ['missing-hr-samples', 'unsupported-sport'] });
  });

  it('does not create an HR candidate without recorded HR', () => {
    expect(evaluate(workout(), { lactateThresholdHR: 165 }).hr)
      .toMatchObject({ score: null, reasons: expect.arrayContaining(['missing-hr-samples']) });
  });

  it('fills missing mass for MET and prefers file mass when present', () => {
    const activity = workout(); activity.addStat(new DataEnergy(210));
    expect(evaluate(activity, { bodyMassKg: 70 }).met).toMatchObject({ score: 9, method: 'MET', estimated: true });
    activity.addStat(new DataWeight(70));
    expect(evaluate(activity, { bodyMassKg: 100 }).met.score).toBe(9);
  });

  it('does not manufacture MET without calories or usable duration', () => {
    expect(evaluate(workout(), { bodyMassKg: 70 }).met.score).toBeNull();
    const activity = workout(); activity.addStat(new DataEnergy(210)); fileActiveDuration.set(activity, null);
    expect(evaluate(activity, { bodyMassKg: 70 }).met.score).toBeNull();
  });

  it('prefers file CSS while preserving the legacy CSS API', () => {
    const activity = workout(ActivityTypes.Swimming); activity.addStat(new DataSpeedAvg(1));
    activity.parseOptions = new ActivityParsingOptions({ tss: { overrides: { thresholdSwimSpeed: 1 } } });
    expect(evaluate(activity, { thresholdSwimSpeed: 1.25 }).swimPace?.score).toBe(100);
    expect(ActivityUtilities.evaluateTrainingStressScoreWithSwimThreshold(activity, 1.25).swimPace?.score).toBe(51.2);
    activity.parseOptions = new ActivityParsingOptions();
    expect(evaluate(activity, { thresholdSwimSpeed: 1.25 }).swimPace?.score).toBe(51.2);
  });

  it('leaves unchanged-input evaluations equivalent', () => {
    const activity = workout(); samples(activity, DataHeartRate.type, 100);
    fileHeartRateCalibration.set(activity, { lactateThresholdHR: 165 });
    const cached = ActivityUtilities.getTrainingStressScoreEvaluations(activity);
    expect(evaluate(activity, {})).toBe(cached);
    expect(evaluate(activity, { functionalThresholdPower: undefined })).toBe(cached);
  });

  it('requires initialized inputs and rejects invalid supplied numbers', () => {
    expect(() => ActivityUtilities.evaluateTrainingStressScoreWithCalibration(workout(), {})).toThrow('Initialize');
    const activity = workout(); ActivityUtilities.getTrainingStressScoreEvaluations(activity);
    for (const value of [0, -1, NaN, Infinity]) {
      expect(() => evaluate(activity, { functionalThresholdPower: value })).toThrow('positive finite');
    }
  });
});
