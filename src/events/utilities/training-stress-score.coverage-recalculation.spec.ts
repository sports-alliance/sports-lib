import { FitBaseType, FitEncoder } from 'fit-file-parser/encoder';
import { Activity } from '../../activities/activity';
import { ActivityTypes } from '../../activities/activity.types';
import { ActivityParsingOptions } from '../../activities/activity-parsing-options';
import { Creator } from '../../creators/creator';
import { DataHeartRate } from '../../data/data.heart-rate';
import { DataPower } from '../../data/data.power';
import { DataPowerNormalized } from '../../data/data.power-normalized';
import { DataPowerIntensityFactor } from '../../data/data.power-intensity-factor';
import { DataFTP } from '../../data/data.ftp';
import { DataTimerTime } from '../../data/data.timer-time';
import { DataDuration } from '../../data/data.duration';
import { DataPause } from '../../data/data.pause';
import { DataStartEvent } from '../../data/data.start-event';
import { DataStopEvent } from '../../data/data.stop-event';
import { EventImporterFIT } from '../adapters/importers/fit/importer.fit';
import { ActivityUtilities } from './activity.utilities';

const field = (number: number, value: number, baseType = FitBaseType.Uint8) => ({ number, value, baseType,
  size: baseType === FitBaseType.Uint32 ? 4 : baseType === FitBaseType.Uint16 ? 2 : 1 });
const start = FitEncoder.toFitTimestamp(new Date('2026-01-01T10:00:00Z'));
const evaluate = ActivityUtilities.evaluateTrainingStressScore.bind(ActivityUtilities);
async function file(hr: (second: number) => number | undefined, options: { power?: boolean; np?: number; imported?: number } = {}) {
  const encoder = new FitEncoder();
  encoder.writeMessage(0, [field(0, 4, FitBaseType.Enum), field(1, 1, FitBaseType.Uint16), field(4, start, FitBaseType.Uint32)]);
  encoder.writeMessage(3, [field(4, 700, FitBaseType.Uint16)], 5);
  for (let second = 0; second <= 3600; second++) encoder.writeMessage(20, [
    field(253, start + second, FitBaseType.Uint32), field(6, 3000, FitBaseType.Uint16), ...(hr(second) === undefined ? [] : [field(3, hr(second)!)]),
    ...(options.power ? [field(7, second < 1800 ? 500 : 125, FitBaseType.Uint16)] : [])], 1);
  encoder.writeMessage(18, [field(253, start + 3600, FitBaseType.Uint32), field(2, start, FitBaseType.Uint32),
    field(5, options.power ? 2 : 11, FitBaseType.Enum), field(7, 3600000, FitBaseType.Uint32),
    field(8, 3600000, FitBaseType.Uint32), field(11, 210, FitBaseType.Uint16),
    ...(options.power ? [field(45, 250, FitBaseType.Uint16)] : []),
    ...(options.np === undefined ? [] : [field(34, options.np, FitBaseType.Uint16)]),
    ...(options.imported === undefined ? [] : [field(35, options.imported * 10, FitBaseType.Uint16)])], 2);
  encoder.writeMessage(216, [field(0, 18, FitBaseType.Uint16), field(1, 0, FitBaseType.Uint16),
    field(11, 190), field(12, 55), field(13, 165)], 3);
  const bytes = encoder.close();
  return (await EventImporterFIT.getFromArrayBuffer(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
    new ActivityParsingOptions({ generateUnitStreams: false }))).getFirstActivity();
}

describe('HR observation coverage', () => {
  it.each([0, 1800, 3600])('does not infer HR load from one reading at %s amid explicit invalid HR', async second => {
    const activity = await file(time => time === second ? 165 : 0);
    expect(evaluate(activity).automatic).toMatchObject({ method: 'MET', score: 9 });
    expect(evaluate(activity).hr.reasons).toContain('calculation-unavailable');
  });
  it('does not bridge two isolated positive readings across explicitly invalid HR', async () => {
    const activity = await file(time => time === 0 || time === 3600 ? 165 : 0);
    expect(evaluate(activity).automatic).toMatchObject({ method: 'MET', score: 9 });
  });
  it.each([0, 1800, 3600])('retains compatibility display backfill without letting one source reading at %s establish coverage', async second => {
    const activity = await file(time => time === second ? 165 : undefined);
    const displayed = activity.getStreamData(DataHeartRate.type).slice();
    expect(displayed.filter(value => value === 165).length).toBeGreaterThan(1);
    for (let repeat = 0; repeat < 2; repeat++) {
      expect(evaluate(activity).automatic).toMatchObject({ method: 'MET', score: 9 });
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
      expect(activity.getStreamData(DataHeartRate.type)).toEqual(displayed);
    }
  });
  it.each([[55, 0], [165, 100]])('preserves fully observed HR %s and legitimate zero TSS', async (hr, score) => {
    expect(evaluate(await file(() => hr)).automatic).toMatchObject({ method: 'HR', score });
  });
  it('integrates valid interior recording gaps without extrapolating outside the observed bounds', async () => {
    const activity = await file(time => time >= 600 && time <= 3000 && time % 60 === 0 ? 165 : undefined);
    expect(evaluate(activity).automatic).toMatchObject({ method: 'HR', score: 66.7 });
  });
});

describe('explicit calculated NP reevaluation', () => {
  const pauseFirstHalf = (activity: Awaited<ReturnType<typeof file>>) => {
    activity.setAllEvents([new DataStopEvent(0), new DataStartEvent(1800), new DataStopEvent(3600)]);
    activity.addStat(new DataTimerTime(1800)); activity.addStat(new DataDuration(1800)); activity.addStat(new DataPause(1800));
  };
  it.each([
    { type: ActivityTypes.Cycling, bareFTP: false, calibrated: false },
    { type: ActivityTypes.Cycling, bareFTP: true, calibrated: false },
    { type: ActivityTypes.Walking, bareFTP: false, calibrated: true },
    { type: ActivityTypes.Motorsports, bareFTP: false, calibrated: true }
  ])('refreshes existing calculated power summaries independently of TSS eligibility %#', ({ type, bareFTP, calibrated }) => {
    const activity = new Activity(new Date(0), new Date(60000), type, new Creator('Synthetic'),
      new ActivityParsingOptions({ tss: { overrides: calibrated ? { functionalThresholdPower: 250 } : {} } }));
    if (bareFTP) activity.addStat(new DataFTP(250));
    const power = activity.createStream(DataPower.type); power.setData(Array(61).fill(200)); activity.addStream(power);
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    expect(activity.getStat(DataPowerNormalized.type)?.getValue()).toBe(200);
    expect(evaluate(activity).automatic.method === 'POWER').toBe(type === ActivityTypes.Walking);
    expect(activity.getStat(DataPowerNormalized.type)?.getValue()).toBe(200);
    power.getData().fill(100);
    expect(evaluate(activity).automatic.method === 'POWER').toBe(type === ActivityTypes.Walking);
    expect(activity.getStat(DataPowerNormalized.type)?.getValue()).toBe(100);
    expect(activity.getStat(DataPowerIntensityFactor.type)?.getValue()).toBe(calibrated ? 0.4 : undefined);
    activity.removeStream(DataPower.type);
    evaluate(activity);
    expect(activity.getStat(DataPowerNormalized.type)).toBeUndefined();
    expect(activity.getStat(DataPowerIntensityFactor.type)).toBeUndefined();
  });
  it('recomputes calculated NP on explicit evaluation while the cached getter retains its previous result', async () => {
    const activity = await file(() => undefined, { power: true });
    const before = ActivityUtilities.getTrainingStressScoreEvaluations(activity);
    expect(before.automatic.score).toBe(282.8);
    pauseFirstHalf(activity);
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity)).toBe(before);
    expect(evaluate(activity).automatic).toMatchObject({ method: 'POWER', score: 12.5 });
    expect(activity.getStat(DataPowerNormalized.type)?.getValue()).toBe(125);
    expect(activity.getStat(DataPowerIntensityFactor.type)?.getValue()).toBe(0.5);
    expect(evaluate(activity).automatic.score).toBe(12.5);
  });
  it('retains genuine device NP even when recorded power/timer inputs change', async () => {
    const activity = await file(() => undefined, { power: true, np: 200 });
    pauseFirstHalf(activity);
    expect(evaluate(activity).automatic).toMatchObject({ method: 'POWER', score: 32 });
    expect(activity.getStat(DataPowerNormalized.type)?.getValue()).toBe(200);
  });
  it('accepts an explicitly replaced NP stat and does not serialize private provenance', async () => {
    const activity = await file(() => undefined, { power: true });
    activity.addStat(new DataPowerNormalized(200));
    expect(evaluate(activity).automatic.score).toBe(64);
    expect(Object.keys(activity.toJSON())).not.toContain('calculatedNormalizedPower');
  });
  it('drops stale calculated NP and IF when no complete power window remains', async () => {
    const activity = await file(() => 165, { power: true });
    activity.removeStream(DataPower.type);
    expect(evaluate(activity).automatic).toMatchObject({ method: 'HR', score: 100 });
    expect(activity.getStat(DataPowerNormalized.type)).toBeUndefined();
    expect(activity.getStat(DataPowerIntensityFactor.type)).toBeUndefined();
  });
  it.each([0, 42.5])('preserves imported score %s and its existing power summaries during explicit evaluation', async imported => {
    const activity = await file(() => undefined, { power: true, imported });
    const np = activity.getStat(DataPowerNormalized.type);
    pauseFirstHalf(activity);
    expect(evaluate(activity).automatic).toMatchObject({ method: 'IMPORTED', score: imported });
    expect(activity.getStat(DataPowerNormalized.type)).toBe(np);
  });
  it('recomputes caller-owned power streams after direct edits, preserving a new zero result', () => {
    const activity = new Activity(new Date(0), new Date(3600000), ActivityTypes.Cycling, new Creator('Synthetic'),
      new ActivityParsingOptions({ tss: { overrides: { functionalThresholdPower: 250 } } }));
    const power = activity.createStream(DataPower.type); power.setData(Array(3601).fill(250)); activity.addStream(power);
    expect(evaluate(activity).automatic.score).toBe(100);
    power.getData().fill(0);
    expect(evaluate(activity).automatic).toMatchObject({ method: 'POWER', score: 0 });
  });
});
