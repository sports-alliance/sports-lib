import { Activity } from '../../../activities/activity';
import { ActivityTypes } from '../../../activities/activity.types';
import { ActivityParsingOptions } from '../../../activities/activity-parsing-options';
import { Creator } from '../../../creators/creator';
import { DataTimerTime } from '../../../data/data.timer-time';
import { DataSpeed } from '../../../data/data.speed';
import { DataPower } from '../../../data/data.power';
import { DataHeartRate } from '../../../data/data.heart-rate';
import { DataTrainingStressScore } from '../../../data/data.training-stress-score';
import { DataStartEvent } from '../../../data/data.start-event';
import { DataStopEvent } from '../../../data/data.stop-event';
import { ActivityUtilities } from '../activity.utilities';
import { type TrainingStressScoreCalibration } from './tss-evaluation';

function workout(type = ActivityTypes.Running, seconds = 3600): Activity {
  const activity = new Activity(new Date(0), new Date(seconds * 1000), type, new Creator('Test'));
  activity.addStat(new DataTimerTime(seconds));
  const speed = activity.createStream(DataSpeed.type);
  speed.setData(Array(seconds + 1).fill(3));
  activity.addStream(speed);
  return activity;
}
function evaluate(activity: Activity, calibration: TrainingStressScoreCalibration = { thresholdRunningSpeed: 3 }) {
  const cached = ActivityUtilities.getTrainingStressScoreEvaluations(activity);
  const before = JSON.stringify(activity.toJSON());
  const result = ActivityUtilities.evaluateTrainingStressScoreWithCalibration(activity, calibration);
  expect(JSON.stringify(activity.toJSON())).toBe(before);
  expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity)).toBe(cached);
  return result;
}

describe('independent running pace preference', () => {
  it('provides a pace candidate without changing Automatic power priority or input data', () => {
    const activity = workout();
    const power = activity.createStream(DataPower.type); power.setData(Array(3601).fill(200)); activity.addStream(power);
    const result = evaluate(activity, { thresholdRunningSpeed: 3, functionalThresholdPower: 200 });
    expect(result.automatic).toMatchObject({ score: 100, method: 'POWER' });
    expect(result.runningPace).toMatchObject({ preference: 'RUNNING_PACE', score: 100, method: 'PACE' });
  });

  it.each([ActivityTypes.Running, ActivityTypes.TrailRunning, ActivityTypes.TrackAndField])('uses the existing pace eligibility: %s', type => {
    expect(evaluate(workout(type)).runningPace).toMatchObject({ score: 100, method: 'PACE' });
  });

  it.each([ActivityTypes.Walking, ActivityTypes.NordicWalking, ActivityTypes.Hiking, ActivityTypes.Trekking,
    ActivityTypes.Cycling, ActivityTypes.Swimming])('does not enable running pace for %s', type => {
    expect(evaluate(workout(type)).runningPace).toMatchObject({ score: null, reasons: expect.arrayContaining(['unsupported-sport']) });
  });

  it('prefers an independent file/parse threshold over the consumer fallback', () => {
    const activity = workout();
    activity.parseOptions = new ActivityParsingOptions({ tss: { overrides: { functionalThresholdPace: 3 } } });
    expect(evaluate(activity, { thresholdRunningSpeed: 4 }).runningPace?.score).toBe(100);
  });

  it.each([0, 42.3])('preserves imported TSS %s for the new preference', score => {
    const activity = workout(); activity.addStat(new DataTrainingStressScore(score));
    expect(evaluate(activity).runningPace).toMatchObject({ score, method: 'IMPORTED', provenance: 'imported' });
  });

  it('falls back to HR when running pace inputs are unavailable', () => {
    const activity = workout();
    const hr = activity.createStream(DataHeartRate.type); hr.setData(Array(3601).fill(100)); activity.addStream(hr);
    const result = evaluate(activity, { lactateThresholdHR: 165 });
    expect(result.runningPace).toMatchObject({ score: 40, method: 'HR', reasons: expect.arrayContaining(['missing-pace-inputs']) });
  });

  it('retains rejection of speed coverage without a complete rolling window', () => {
    const activity = workout(ActivityTypes.Running, 40);
    activity.getStream(DataSpeed.type).setData(Array.from({length: 41}, (_, i) => i === 20 ? null : 3));
    expect(evaluate(activity).runningPace).toMatchObject({ score: null, reasons: expect.arrayContaining(['calculation-unavailable']) });
  });

  it('retains timer pauses and recorded stationary zero', () => {
    const activity = workout();
    activity.addStat(new DataTimerTime(2400));
    activity.addEvent(new DataStartEvent(0)); activity.addEvent(new DataStopEvent(1200));
    activity.addEvent(new DataStartEvent(2400)); activity.addEvent(new DataStopEvent(3600));
    activity.getStream(DataSpeed.type).setData(Array.from({length: 3601}, (_, i) => i >= 1200 && i < 2400 ? 30 : 3));
    expect(evaluate(activity).runningPace?.score).toBe(66.7);
    const stopped = workout(); stopped.getStream(DataSpeed.type).setData(Array(3601).fill(0));
    expect(evaluate(stopped).runningPace).toMatchObject({ score: 0, method: 'PACE' });
  });

  it('keeps strict grade requirements when heuristic fallbacks are disabled', () => {
    const activity = workout();
    activity.parseOptions = new ActivityParsingOptions({ tss: { enableHeuristicFallbacks: false } });
    expect(evaluate(activity).runningPace).toMatchObject({ score: null, reasons: expect.arrayContaining(['missing-pace-inputs']) });
  });

  it.each([0, -1, NaN, Infinity])('rejects invalid threshold speed %s', thresholdRunningSpeed => {
    const activity = workout(); ActivityUtilities.getTrainingStressScoreEvaluations(activity);
    expect(() => evaluate(activity, { thresholdRunningSpeed })).toThrow('positive finite');
  });
});
