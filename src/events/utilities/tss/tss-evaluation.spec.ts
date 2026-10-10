import { Activity } from '../../../activities/activity';
import { ActivityTypes } from '../../../activities/activity.types';
import { ActivityParsingOptions } from '../../../activities/activity-parsing-options';
import { Creator } from '../../../creators/creator';
import { DataEnergy } from '../../../data/data.energy';
import { DataWeight } from '../../../data/data.weight';
import { DataTimerTime } from '../../../data/data.timer-time';
import { DataHeartRate } from '../../../data/data.heart-rate';
import { DataHeartRateMax } from '../../../data/data.heart-rate-max';
import { DataFTP } from '../../../data/data.ftp';
import { DataPowerNormalized } from '../../../data/data.power-normalized';
import { DataPower } from '../../../data/data.power';
import { DataSpeed } from '../../../data/data.speed';
import { DataSpeedAvg } from '../../../data/data.speed-avg';
import { DataGrade } from '../../../data/data.grade';
import { DataTrainingStressScore } from '../../../data/data.training-stress-score';
import { DataTrainingStressScoreMethod } from '../../../data/data.training-stress-score-method';
import { ActivityUtilities } from '../activity.utilities';
import { fileActiveDuration, fileFunctionalThresholdPower, fileHeartRateCalibration } from './tss-evaluation';
import { resolveFitHeartRateCalibration } from '../../adapters/importers/fit/fit-hr-calibration';
import { TssCalculator } from './tss-calculator';

const walk = (type = ActivityTypes.Walking) => new Activity(new Date(0), new Date(3600000), type, new Creator('Test'));
const evaluate = ActivityUtilities.evaluateTrainingStressScore.bind(ActivityUtilities);
const walkingTypes = [
  ActivityTypes.Walking,
  ActivityTypes.IndoorWalking,
  ActivityTypes.NordicWalking,
  ActivityTypes.SpeedWalking,
  ActivityTypes.Hiking,
  ActivityTypes.Trekking
];

const addCalibratedHeartRate = (activity: Activity) => {
  fileHeartRateCalibration.set(activity, { maxHeartRate: 190, restingHeartRate: 55, lactateThresholdHR: 165 });
  const stream = activity.createStream(DataHeartRate.type);
  stream.setData(Array.from({ length: 3601 }, (_, index) => (index < 1830 ? 78 : index < 3600 ? 86 : 100)));
  activity.addStream(stream);
};

const addConstantStream = (activity: Activity, type: string, value: number) => {
  const stream = activity.createStream(type);
  stream.setData(Array(3601).fill(value));
  activity.addStream(stream);
};
const addHrInputs = (activity: Activity) => {
  fileHeartRateCalibration.set(activity, { maxHeartRate: 190, restingHeartRate: 55, lactateThresholdHR: 165 });
  addConstantStream(activity, DataHeartRate.type, 120);
};
const addMetInputs = (activity: Activity, energy = 210) => {
  activity.addStat(new DataEnergy(energy));
  activity.addStat(new DataWeight(70));
};

describe('file-only training stress evaluations', () => {
  it('respects a source-validated zero timer without changing unproven zero-summary fallback', () => {
    const activity = walk();
    activity.addStat(new DataEnergy(210));
    activity.addStat(new DataWeight(70));
    activity.addStat(new DataTimerTime(0));
    expect(evaluate(activity).automatic).toMatchObject({ method: 'MET', score: 9 });
    fileActiveDuration.set(activity, 0);
    expect(evaluate(activity).automatic.score).toBeNull();
    // Later explicit positive values take priority over the original proof.
    activity.addStat(new DataTimerTime(1800));
    expect(evaluate(activity).automatic).toMatchObject({ method: 'MET', score: 18 });
    activity.removeStat(DataTimerTime.type);
    expect(evaluate(activity).automatic).toMatchObject({ method: 'MET', score: 9 });
  });
  it('does not calculate unused candidates for an imported score', () => {
    const activity = walk(ActivityTypes.Running);
    activity.addStat(new DataTrainingStressScore(42));
    const calculators = [jest.spyOn(TssCalculator, 'calculatePowerTss'), jest.spyOn(TssCalculator, 'calculateHrTss'),
      jest.spyOn(TssCalculator, 'calculatePaceTss'), jest.spyOn(TssCalculator, 'calculateSwimTss'),
      jest.spyOn(TssCalculator, 'calculateMetTss')];
    activity.addStat(new DataFTP(200)); activity.addStat(new DataPowerNormalized(200));
    activity.addStat(new DataEnergy(210)); activity.addStat(new DataWeight(70));
    const evaluations = evaluate(activity);
    for (const preference of ['automatic', 'hr', 'met'] as const) {
      expect(evaluations[preference]).toMatchObject({ score: 42, method: 'IMPORTED', reasons: ['imported-score'] });
    }
    for (const calculator of calculators) { expect(calculator).not.toHaveBeenCalled(); calculator.mockRestore(); }
  });

  it('distinguishes rejected power from missing NP while preserving successful and zero power scores', () => {
    const activity = walk(ActivityTypes.Cycling);
    addHrInputs(activity);
    fileFunctionalThresholdPower.set(activity, 200);
    activity.addStat(new DataPowerNormalized(2000)); // 100 * (2000 / 200)^2 = 10000, outside the existing range.
    expect(evaluate(activity).automatic).toMatchObject({ method: 'HR', score: 31.2, reasons: ['calculation-unavailable'] });

    activity.addStat(new DataPowerNormalized(1999.8));
    expect(evaluate(activity).automatic).toMatchObject({ method: 'POWER', score: 9998, reasons: [] });
    activity.addStat(new DataPowerNormalized(0));
    // A summary zero alone is a placeholder; complete recorded zero power proves zero load.
    addConstantStream(activity, DataPower.type, 0);
    expect(evaluate(activity).automatic).toMatchObject({ method: 'POWER', score: 0, reasons: [] });
    activity.removeStat(DataPowerNormalized.type);
    activity.removeStream(DataPower.type);
    expect(evaluate(activity).automatic).toMatchObject({ method: 'HR', score: 31.2, reasons: ['missing-power-inputs'] });
  });

  it('calculates rejected power and MET candidates once while retaining the eligible HR fallback', () => {
    const activity = walk(ActivityTypes.Cycling);
    addHrInputs(activity);
    addMetInputs(activity, 7000);
    fileFunctionalThresholdPower.set(activity, 200);
    activity.addStat(new DataPowerNormalized(2000));
    const power = jest.spyOn(TssCalculator, 'calculatePowerTss');
    const hr = jest.spyOn(TssCalculator, 'calculateHrTss');
    const met = jest.spyOn(TssCalculator, 'calculateMetTss');
    const evaluations = evaluate(activity);
    expect(evaluations.automatic).toMatchObject({ method: 'HR', score: 31.2, reasons: ['calculation-unavailable'] });
    expect(evaluations.hr.reasons).toEqual([]);
    expect(evaluations.met).toMatchObject({ method: 'HR', score: 31.2, reasons: ['calculation-unavailable'] });
    for (const calculator of [power, hr, met]) { expect(calculator).toHaveBeenCalledTimes(1); calculator.mockRestore(); }
  });

  it('distinguishes rejected and overflowing MET calculations from missing file mass', () => {
    const activity = walk();
    addHrInputs(activity);
    addMetInputs(activity, 7000); // 100 MET for one hour gives 10000 TSS before the existing range check.
    expect(evaluate(activity).met).toMatchObject({ method: 'HR', score: 31.2, reasons: ['calculation-unavailable'] });
    activity.addStat(new DataEnergy(6999.3));
    expect(evaluate(activity).met).toMatchObject({ method: 'MET', score: 9998, reasons: [] });
    activity.addStat(new DataEnergy(1e308));
    expect(evaluate(activity).met.reasons).toEqual(['calculation-unavailable']);
    activity.removeStat(DataWeight.type);
    expect(evaluate(activity).met).toMatchObject({ method: 'HR', score: 31.2, reasons: ['missing-met-inputs'] });
  });

  it('retains explicit MET overrides without requiring file energy or mass', () => {
    const activity = walk();
    activity.parseOptions = new ActivityParsingOptions({ tss: { overrides: { metScore: 3 } } });
    expect(evaluate(activity).met).toMatchObject({ method: 'MET', score: 9, reasons: [] });
    activity.parseOptions = new ActivityParsingOptions({ tss: { overrides: { metScore: 100 } } });
    const rejected = evaluate(activity);
    expect(rejected.met.score).toBeNull();
    expect(rejected.met.reasons).toContain('calculation-unavailable');
    expect(rejected.met.reasons).not.toContain('missing-met-inputs');
  });

  it('distinguishes rejected running pace from missing pace inputs and preserves the MET fallback', () => {
    const activity = walk(ActivityTypes.Running);
    activity.parseOptions = new ActivityParsingOptions({ tss: { overrides: { functionalThresholdPace: 4 } } });
    addMetInputs(activity);
    addConstantStream(activity, DataSpeed.type, 40);
    addConstantStream(activity, DataGrade.type, 0);
    const rejected = evaluate(activity).automatic;
    expect(rejected).toMatchObject({ method: 'MET', score: 9 });
    expect(rejected.reasons).toContain('calculation-unavailable');
    expect(rejected.reasons).not.toContain('missing-pace-inputs');

    activity.getStream(DataSpeed.type).setData(Array(3601).fill(39.996));
    expect(evaluate(activity).automatic).toMatchObject({ method: 'PACE', score: 9998 });
    activity.removeStream(DataSpeed.type);
    const missing = evaluate(activity).automatic;
    expect(missing).toMatchObject({ method: 'MET', score: 9 });
    expect(missing.reasons).toContain('missing-pace-inputs');
    expect(missing.reasons).not.toContain('calculation-unavailable');
  });

  it('distinguishes rejected swim pace, missing speed and missing threshold without changing score selection', () => {
    const activity = walk(ActivityTypes.Swimming);
    activity.parseOptions = new ActivityParsingOptions({ tss: { overrides: { thresholdSwimSpeed: 1 } } });
    addMetInputs(activity);
    activity.addStat(new DataSpeedAvg(5)); // 100 * (5 / 1)^3 = 12500 before the range check.
    const rejected = evaluate(activity).automatic;
    expect(rejected).toMatchObject({ method: 'MET', score: 9 });
    expect(rejected.reasons).toContain('calculation-unavailable');
    expect(rejected.reasons).not.toContain('missing-pace-inputs');
    activity.addStat(new DataSpeedAvg(4));
    expect(evaluate(activity).automatic).toMatchObject({ method: 'SWIM_PACE', score: 6400 });
    activity.removeStat(DataSpeedAvg.type);
    expect(evaluate(activity).automatic.reasons).toContain('missing-pace-inputs');
    activity.parseOptions = new ActivityParsingOptions();
    expect(evaluate(activity).automatic.reasons).toContain('missing-swim-threshold');
  });
  it.each(walkingTypes)('%s prefers power in Automatic while retaining explicit HR and MET preferences', type => {
    const activity = walk(type);
    fileFunctionalThresholdPower.set(activity, 200);
    activity.addStat(new DataPowerNormalized(200));
    activity.addStat(new DataEnergy(210));
    activity.addStat(new DataWeight(70));
    addCalibratedHeartRate(activity);
    const result = evaluate(activity);
    expect(result.automatic).toMatchObject({
      method: 'POWER',
      estimated: false,
      provenance: 'calculated',
      reasons: []
    });
    expect(result.automatic.score).toBeGreaterThan(0);
    expect(result.hr).toMatchObject({ score: 7.6, method: 'HR', reasons: [] });
    expect(result.met).toMatchObject({ score: 9, method: 'MET', reasons: [] });

    for (const preserveImportedTss of [undefined, true, false]) {
      activity.parseOptions = new ActivityParsingOptions({ tss: { preserveImportedTss } });
      for (const score of [0, 42.5]) {
        activity.addStat(new DataTrainingStressScore(score));
        const evaluations = evaluate(activity);
        for (const policy of ['automatic', 'hr', 'met'] as const) {
          expect(evaluations[policy]).toMatchObject(
            { score, method: 'IMPORTED', provenance: 'imported' }
          );
        }
      }
    }
  });

  it.each(walkingTypes)('%s falls back to calibrated HR when power lacks a valid threshold', type => {
    const activity = walk(type);
    activity.addStat(new DataPowerNormalized(200));
    activity.addStat(new DataEnergy(210));
    activity.addStat(new DataWeight(70));
    addCalibratedHeartRate(activity);
    expect(evaluate(activity).automatic).toMatchObject({
      score: 7.6,
      method: 'HR',
      reasons: ['missing-power-inputs']
    });
  });

  it.each(walkingTypes)(
    '%s rejects observed peak HR as calibration, falling back to the calorie MET estimate',
    type => {
      const activity = walk(type);
      // Even valid running-pace inputs must not outrank MET for walking or hiking.
      activity.parseOptions = new ActivityParsingOptions({ tss: { overrides: { functionalThresholdPace: 2 } } });
      const speed = activity.createStream(DataSpeed.type);
      speed.setData(new Array(3601).fill(2));
      activity.addStream(speed);
      activity.addStat(new DataHeartRateMax(100));
      activity.addStat(new DataEnergy(210));
      activity.addStat(new DataWeight(70));
      const result = evaluate(activity);
      expect(result.automatic).toMatchObject({ score: 9, method: 'MET', estimated: true, provenance: 'calculated' });
      expect(result.hr).toMatchObject({
        score: 9,
        method: 'MET',
        reasons: ['missing-hr-calibration', 'missing-power-inputs']
      });
      expect(result.met.reasons).toEqual([]);
      activity.removeStat(DataWeight.type);
      expect(evaluate(activity).automatic.score).toBeNull();
    });

  it('preserves imported zero for all policies and removes stale calculated scores', () => {
    const activity = walk();
    activity.addStat(new DataTrainingStressScore(0));
    for (const policy of ['automatic', 'hr', 'met'] as const) {
      expect(evaluate(activity)[policy]).toMatchObject({ score: 0, method: 'IMPORTED', provenance: 'imported' });
    }
    activity.addStat(new DataTrainingStressScore(87.3));
    activity.addStat(new DataTrainingStressScoreMethod('HR'));
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    expect(activity.getStat(DataTrainingStressScore.type)).toBeUndefined();
    expect(activity.getStat(DataTrainingStressScoreMethod.type)).toBeUndefined();
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic.score).toBeNull();
  });

  it('caches file-calibrated candidates independently of later stream disposal', () => {
    const activity = walk();
    fileHeartRateCalibration.set(activity, { maxHeartRate: 190, restingHeartRate: 55, lactateThresholdHR: 165 });
    expect(evaluate(activity).automatic.reasons).toContain('missing-hr-samples');
    const stream = activity.createStream(DataHeartRate.type);
    stream.setData(Array.from({ length: 3601 }, (_, index) => index < 1830 ? 78 : index < 3600 ? 86 : 100));
    activity.addStream(stream);
    const results = evaluate(activity);
    expect(results.hr).toMatchObject({ score: 7.6, method: 'HR', estimated: false });
    expect(results.met).toMatchObject({
      score: 7.6,
      method: 'HR',
      reasons: ['missing-met-inputs', 'missing-power-inputs']
    });
    activity.removeStream(DataHeartRate.type);
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity)).toEqual(results);
    expect(evaluate(activity).hr.score).toBeNull();
  });

  it('uses general profile maximum for walking and explicit session settings first', () => {
    const session = { message_index: { value: 4 } };
    const file = { sessions: [session], user_profile: { default_max_running_heart_rate: 110,
      default_max_heart_rate: 190, resting_heart_rate: 55 }, zones_target: { threshold_heart_rate: 165 } };
    expect(resolveFitHeartRateCalibration(file, session, 0, ActivityTypes.Walking)).toEqual({
      maxHeartRate: 190, restingHeartRate: 55, lactateThresholdHR: 165 });
    const targeted = { ...file, time_in_zone: [{ reference_mesg: 'session', reference_index: { value: 4 },
      max_heart_rate: 195, resting_heart_rate: 50, threshold_heart_rate: 170 }] };
    expect(resolveFitHeartRateCalibration(targeted, session, 0, ActivityTypes.Hiking)).toEqual({
      maxHeartRate: 195, restingHeartRate: 50, lactateThresholdHR: 170 });
  });

  it('rejects duplicate session calibration and conflicting global settings', () => {
    const row = { reference_mesg: 'session', reference_index: 0, max_heart_rate: 190 };
    expect(resolveFitHeartRateCalibration({ sessions: [{}], time_in_zone: [row, row] }, {}, 0, ActivityTypes.Walking))
      .toEqual({ reason: 'ambiguous-hr-calibration' });
    expect(resolveFitHeartRateCalibration({ sessions: [{}], messages: { zones_target: [
      { max_heart_rate: 190 }, { max_heart_rate: 120 }] } }, {}, 0, ActivityTypes.Walking))
      .toEqual({ reason: 'ambiguous-hr-calibration' });
  });

  it('does not assign an unreferenced calibration to a multisport leg or borrow running maximum', () => {
    const file = { sessions: [{}, {}], time_in_zone: [{ reference_mesg: 'session', max_heart_rate: 190 }],
      user_profile: { default_max_running_heart_rate: 190, resting_heart_rate: 55 },
      zones_target: { threshold_heart_rate: 165 } };
    expect(resolveFitHeartRateCalibration(file, {}, 0, ActivityTypes.Walking).maxHeartRate).toBeUndefined();
  });
});
