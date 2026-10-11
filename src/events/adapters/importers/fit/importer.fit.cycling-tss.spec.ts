import { FitBaseType, FitEncoder } from 'fit-file-parser/encoder';
import { EventImporterFIT } from './importer.fit';
import { EventImporterJSON } from '../json/importer.json';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { DataFTP } from '../../../../data/data.ftp';
import { DataPowerIntensityFactor } from '../../../../data/data.power-intensity-factor';
import { DataPowerNormalized } from '../../../../data/data.power-normalized';
import { DataTrainingStressScore } from '../../../../data/data.training-stress-score';
import { DataTrainingStressScoreMethod } from '../../../../data/data.training-stress-score-method';

const field = (number: number, value: number, baseType = FitBaseType.Uint8) => ({ number, value, baseType,
  size: baseType === FitBaseType.Uint32 ? 4 : baseType === FitBaseType.Uint16 ? 2 : 1 });
async function ride(options: { ftp?: 'session' | 'zones' | 'time_in_zone'; override?: number; imported?: number;
  met?: boolean; badHr?: boolean; np?: number; watts?: number; pauseType?: number } = {}) {
  const encoder = new FitEncoder(), start = FitEncoder.toFitTimestamp(new Date('2026-01-01T10:00:00Z'));
  encoder.writeMessage(0, [field(0, 4, FitBaseType.Enum), field(1, 1, FitBaseType.Uint16), field(4, start, FitBaseType.Uint32)]);
  if (options.met) encoder.writeMessage(3, [field(4, 700, FitBaseType.Uint16)], 4);
  if (options.ftp === 'zones' || options.badHr) encoder.writeMessage(7, [
    ...(options.ftp === 'zones' ? [field(3, 250, FitBaseType.Uint16)] : []), ...(options.badHr ? [field(2, 0)] : [])], 5);
  for (let second = 0; second < 3600; second++) encoder.writeMessage(20, [field(253, start + second, FitBaseType.Uint32),
    field(7, options.pauseType !== undefined && second >= 1200 && second < 2400 ? 900 : options.watts ?? 100, FitBaseType.Uint16), ...(options.badHr ? [field(3, 154)] : [])], 1);
  if (options.pauseType !== undefined) {
    for (const [second, type] of [[0, 0], [1200, options.pauseType], [2400, 0], [3600, 4]]) {
      encoder.writeMessage(21, [field(253, start + second, FitBaseType.Uint32),
        field(0, 0, FitBaseType.Enum), field(1, type, FitBaseType.Enum)], 6);
    }
  }
  encoder.writeMessage(18, [field(254, 0, FitBaseType.Uint16), field(253, start + 3600, FitBaseType.Uint32),
    field(2, start, FitBaseType.Uint32), field(5, 2, FitBaseType.Enum), field(6, 7, FitBaseType.Enum),
    field(7, 3600000, FitBaseType.Uint32), field(8, options.pauseType === undefined ? 3600000 : 2400000, FitBaseType.Uint32),
    ...(options.ftp === 'session' ? [field(45, 250, FitBaseType.Uint16)] : []),
    ...(options.np === undefined ? [] : [field(34, options.np, FitBaseType.Uint16)]),
    ...(options.met ? [field(11, 210, FitBaseType.Uint16)] : []),
    ...(options.imported === undefined ? [] : [field(35, options.imported * 10, FitBaseType.Uint16)])], 2);
  if (options.ftp === 'time_in_zone' || options.badHr) encoder.writeMessage(216, [
    field(0, 18, FitBaseType.Uint16), field(1, 0, FitBaseType.Uint16),
    ...(options.ftp === 'time_in_zone' ? [field(15, 250, FitBaseType.Uint16)] : []),
    ...(options.badHr ? [field(11, 242), field(12, 30), field(13, 46), field(10, 1, FitBaseType.Enum),
      { number: 6, value: new Uint8Array([121, 145, 169, 194, 218, 242]), baseType: FitBaseType.Uint8, size: 6 }] : [])], 3);
  const bytes = encoder.close();
  const event = await EventImporterFIT.getFromArrayBuffer(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
    new ActivityParsingOptions({ generateUnitStreams: false, tss: { overrides: { functionalThresholdPower: options.override } } }));
  return event.getFirstActivity();
}
const evaluate = ActivityUtilities.getTrainingStressScoreEvaluations;

describe('FIT cycling TSS', () => {
  it.each(['session', 'zones', 'time_in_zone'] as const)('uses independent %s FTP through repeated stat regeneration', async ftp => {
    const activity = await ride({ ftp, met: true });
    expect(evaluate(activity).met).toMatchObject({ method: 'MET', score: 9 });
    for (let repeat = 0; repeat < 2; repeat++) {
      expect(evaluate(activity).automatic).toMatchObject({ method: 'POWER', score: 16 });
      activity.clearStats();
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
      expect(activity.getStat(DataFTP.type)?.getValue()).toBe(250);
      // Source calibration survives clearing stats on the parsed instance.
      expect(evaluate(activity).automatic).toMatchObject({ method: 'POWER', score: 16 });
    }
  });
  it.each([100, 200])('does not use the same-ride FTP estimate at %s W, including after JSON restoration', async watts => {
    const activity = await ride({ watts });
    expect(activity.getStat(DataFTP.type)?.getValue()).toBe(watts * 0.95);
    expect(evaluate(activity).automatic.score).toBeNull();
    const restored = EventImporterJSON.getActivityFromJSON(activity.toJSON());
    for (const target of [activity, restored]) for (const stale of [0, 109.9]) {
      target.addStat(new DataTrainingStressScore(stale)); target.addStat(new DataTrainingStressScoreMethod('POWER'));
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(target);
      expect(evaluate(target).automatic).toMatchObject({ score: null, reasons: expect.arrayContaining(['missing-power-inputs']) });
      expect(target.getStat(DataTrainingStressScore.type)).toBeUndefined();
    }
  });
  it('keeps explicit overrides compatible and preserves file NP until regeneration is requested', async () => {
    const activity = await ride({ override: 250, np: 200 });
    expect(evaluate(activity).automatic.score).toBe(64);
    expect(activity.getStat(DataPowerNormalized.type)?.getValue()).toBe(200);
    activity.removeStat(DataPowerNormalized.type);
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    expect(evaluate(activity).automatic.score).toBe(16);
  });
  it.each([1, 4, 8, 9])('excludes samples while the FIT timer is stopped (event type %s)', async pauseType => {
    const activity = await ride({ ftp: 'session', pauseType });
    expect(activity.getStat(DataPowerNormalized.type)?.getValue()).toBeCloseTo(100, 8);
    expect(evaluate(activity).automatic).toMatchObject({ method: 'POWER', score: 10.7 });
    activity.removeStat(DataPowerNormalized.type);
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    expect(activity.getStat(DataPowerNormalized.type)?.getValue()).toBeCloseTo(100, 8);
    expect(evaluate(activity).automatic).toMatchObject({ method: 'POWER', score: 10.7 });
  });
  it.each([0, 42.5])('keeps generated IF and FTP consistent while preserving imported TSS %s', async imported => {
    const activity = await ride({ ftp: 'session', override: 200, imported });
    expect(activity.getStat(DataFTP.type)?.getValue()).toBe(200);
    expect(activity.getStat(DataPowerIntensityFactor.type)?.getValue()).toBe(0.5);
    expect(evaluate(activity).automatic).toMatchObject({ score: imported, method: 'IMPORTED', provenance: 'imported' });
  });
  it('falls back from inconsistent HR and same-ride FTP to MET without guessed calibration', async () => {
    const activity = await ride({ badHr: true, met: true });
    expect(evaluate(activity).automatic).toMatchObject({ method: 'MET', score: 9, estimated: true,
      reasons: expect.arrayContaining(['invalid-hr-calibration', 'missing-power-inputs']) });
  });
  it.each([0, 42.5])('preserves imported %s despite invalid calibration and repeated generation', async imported => {
    const activity = await ride({ imported, badHr: true, met: true });
    for (let repeat = 0; repeat < 2; repeat++) {
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
      for (const preference of ['automatic', 'hr', 'met'] as const) expect(evaluate(activity)[preference]).toMatchObject({
        score: imported, method: 'IMPORTED', provenance: 'imported' });
    }
  });
});
