import { Activity } from '../../../activities/activity';
import { ActivityTypes } from '../../../activities/activity.types';
import { Creator } from '../../../creators/creator';
import { DataEnergy } from '../../../data/data.energy';
import { DataWeight } from '../../../data/data.weight';
import { DataHeartRate } from '../../../data/data.heart-rate';
import { DataHeartRateMax } from '../../../data/data.heart-rate-max';
import { DataFTP } from '../../../data/data.ftp';
import { DataPowerNormalized } from '../../../data/data.power-normalized';
import { DataTrainingStressScore } from '../../../data/data.training-stress-score';
import { DataTrainingStressScoreMethod } from '../../../data/data.training-stress-score-method';
import { ActivityUtilities } from '../activity.utilities';
import { fileHeartRateCalibration } from './tss-evaluation';
import { resolveFitHeartRateCalibration } from '../../adapters/importers/fit/fit-hr-calibration';
import { TssCalculator } from './tss-calculator';

const walk = (type = ActivityTypes.Walking) => new Activity(new Date(0), new Date(3600000), type, new Creator('Test'));
const evaluate = ActivityUtilities.evaluateTrainingStressScore.bind(ActivityUtilities);

describe('file-only training stress evaluations', () => {
  it('does not calculate unused candidates for an imported score', () => {
    const activity = walk(ActivityTypes.Running);
    activity.addStat(new DataTrainingStressScore(42));
    const power = jest.spyOn(TssCalculator, 'calculatePowerTss');
    const met = jest.spyOn(TssCalculator, 'calculateMetTss');
    activity.addStat(new DataFTP(200)); activity.addStat(new DataPowerNormalized(200));
    activity.addStat(new DataEnergy(210)); activity.addStat(new DataWeight(70));
    expect(evaluate(activity).automatic.score).toBe(42);
    expect(power).not.toHaveBeenCalled(); expect(met).not.toHaveBeenCalled();
    power.mockRestore(); met.mockRestore();
  });
  it.each([ActivityTypes.Walking, ActivityTypes.NordicWalking, ActivityTypes.Hiking, ActivityTypes.Trekking])(
    '%s rejects power and observed peak HR, falling back to the calorie MET estimate', type => {
      const activity = walk(type);
      activity.addStat(new DataFTP(200));
      activity.addStat(new DataPowerNormalized(200));
      activity.addStat(new DataHeartRateMax(100));
      activity.addStat(new DataEnergy(210));
      activity.addStat(new DataWeight(70));
      const result = evaluate(activity);
      expect(result.automatic).toMatchObject({ score: 9, method: 'MET', estimated: true, provenance: 'calculated' });
      expect(result.hr).toMatchObject({ score: 9, method: 'MET', reasons: ['missing-hr-calibration'] });
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
    expect(results.met).toMatchObject({ score: 7.6, method: 'HR', reasons: ['missing-met-inputs'] });
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
