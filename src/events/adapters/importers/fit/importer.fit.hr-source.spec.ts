import { FitBaseType, FitEncoder } from 'fit-file-parser/encoder';
import { EventImporterFIT } from './importer.fit';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { DataHeartRate } from '../../../../data/data.heart-rate';
import { DataDistance } from '../../../../data/data.distance';
import { DataSpeed } from '../../../../data/data.speed';
import { DataPowerNormalized } from '../../../../data/data.power-normalized';
import { DataStopEvent } from '../../../../data/data.stop-event';
import { DataStopAllEvent } from '../../../../data/data.stop-all-event';

const field = (number: number, value: number, baseType = FitBaseType.Uint8) => ({ number, value, baseType,
  size: baseType === FitBaseType.Uint32 ? 4 : baseType === FitBaseType.Uint16 ? 2 : 1 });
const start = FitEncoder.toFitTimestamp(new Date('2026-01-01T10:00:00Z'));
const header = (encoder: FitEncoder) => encoder.writeMessage(0, [field(0, 4, FitBaseType.Enum),
  field(1, 1, FitBaseType.Uint16), field(4, start, FitBaseType.Uint32)]);
const calibration = (encoder: FitEncoder, index: number) => encoder.writeMessage(216, [
  field(0, 18, FitBaseType.Uint16), field(1, index, FitBaseType.Uint16), field(11, 190), field(12, 55), field(13, 165)], 5);
const parse = async (encoder: FitEncoder) => {
  const bytes = encoder.close();
  return EventImporterFIT.getFromArrayBuffer(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
    new ActivityParsingOptions({ generateUnitStreams: false }));
};
const evaluate = ActivityUtilities.getTrainingStressScoreEvaluations;

async function pool(records: 'complete' | 'partial' | 'absent' | 'invalid', imported?: number, lapAverage: number | null = 100,
  lengthDuration = 1800) {
  const encoder = new FitEncoder(); header(encoder);
  for (let second = 0; second <= 3600; second++) {
    if (records === 'absent' || (records === 'partial' && ![600, 1800, 3000].includes(second))) continue;
    encoder.writeMessage(20, [field(253, start + second, FitBaseType.Uint32),
      field(3, records === 'invalid' ? 0 : 165), field(5, 100, FitBaseType.Uint32)], 1);
  }
  for (let lap = 0; lap < 2; lap++) {
    const time = start + lap * 1800;
    encoder.writeMessage(101, [field(254, lap, FitBaseType.Uint16), field(253, time + lengthDuration - 1, FitBaseType.Uint32),
      field(2, time, FitBaseType.Uint32), field(3, lengthDuration * 1000, FitBaseType.Uint32), field(4, lengthDuration * 1000, FitBaseType.Uint32),
      field(6, 1000, FitBaseType.Uint16), field(12, 1, FitBaseType.Enum)], 2);
    encoder.writeMessage(19, [field(254, lap, FitBaseType.Uint16), field(253, time + 1800, FitBaseType.Uint32),
      field(2, time, FitBaseType.Uint32), field(7, 1800000, FitBaseType.Uint32), field(8, 1800000, FitBaseType.Uint32),
      field(9, 180000, FitBaseType.Uint32), field(32, 1, FitBaseType.Uint16), field(35, lap, FitBaseType.Uint16),
      ...(lapAverage === null ? [] : [field(15, lapAverage)])], 3);
  }
  encoder.writeMessage(18, [field(254, 0, FitBaseType.Uint16), field(253, start + 3600, FitBaseType.Uint32),
    field(2, start, FitBaseType.Uint32), field(5, 5, FitBaseType.Enum), field(6, 17, FitBaseType.Enum),
    field(7, 3600000, FitBaseType.Uint32), field(8, 3600000, FitBaseType.Uint32), field(26, 2, FitBaseType.Uint16),
    ...(imported === undefined ? [] : [field(35, imported * 10, FitBaseType.Uint16)])], 4);
  calibration(encoder, 0);
  return (await parse(encoder)).getFirstActivity();
}

describe('FIT pool recorded HR', () => {
  it('keeps real HR and existing length-derived swim streams through regeneration', async () => {
    const activity = await pool('complete'), fallback = await pool('absent');
    expect(evaluate(activity).automatic).toMatchObject({ method: 'HR', score: 100 });
    expect(evaluate(fallback).automatic.score).toBe(16.2);
    for (const type of [DataDistance.type, DataSpeed.type]) {
      expect(activity.getStreamData(type)).toEqual(fallback.getStreamData(type));
    }
    for (let repeat = 0; repeat < 2; repeat++) {
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
      expect(evaluate(activity).automatic.score).toBe(100);
      expect(activity.getStream(DataHeartRate.type).getData(true, true).every(value => value === 165)).toBe(true);
    }
  });

  it('does not fill partial recorded HR with lap averages or generated swim timestamps', async () => {
    const activity = await pool('partial');
    for (let repeat = 0; repeat < 2; repeat++) {
      expect(activity.getStream(DataHeartRate.type).getData(true, true)).toEqual([165, 165, 165]);
      expect(activity.getStreamData(DataHeartRate.type)[1200]).toBeNull();
      expect(evaluate(activity).automatic).toMatchObject({ method: 'HR', score: 83.3 });
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    }
  });

  it('does not extend generated distance or speed to additional recorded HR timestamps', async () => {
    const activity = await pool('complete', undefined, 100, 1200), fallback = await pool('absent', undefined, 100, 1200);
    for (let repeat = 0; repeat < 2; repeat++) {
      for (const type of [DataDistance.type, DataSpeed.type]) {
        expect(activity.getStreamData(type)).toEqual(fallback.getStreamData(type));
      }
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    }
  });

  it('retains length HR fallback when all recorded HR is invalid', async () => {
    const activity = await pool('invalid');
    expect(evaluate(activity).automatic).toMatchObject({ method: 'HR', score: 16.2 });
  });

  it('keeps real HR when no lap or length average HR exists', async () => {
    expect(evaluate(await pool('complete', undefined, null)).automatic).toMatchObject({ method: 'HR', score: 100 });
    expect(evaluate(await pool('absent', undefined, null)).automatic).toMatchObject({ score: null,
      reasons: expect.arrayContaining(['missing-hr-samples']) });
  });

  it.each([0, 42.5])('preserves imported TSS %s while correcting the HR stream', async imported => {
    const activity = await pool('complete', imported);
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    expect(evaluate(activity).automatic).toMatchObject({ method: 'IMPORTED', score: imported });
    expect(activity.getStream(DataHeartRate.type).getData(true, true).every(value => value === 165)).toBe(true);
  });
});

interface MultisportOptions {
  power?: boolean; stopType?: number; stopAtBoundary?: boolean; restart?: boolean;
  timer?: number | null; elapsed?: number; boundaryStart?: boolean; reverseEvents?: boolean; imported?: number; resumeAt?: number;
}
async function multisport(options: MultisportOptions = {}) {
  const encoder = new FitEncoder(); header(encoder);
  for (let second = 0; second <= 3600; second++) encoder.writeMessage(20, [
    field(253, start + second, FitBaseType.Uint32), field(3, 165), ...(options.power
      ? [field(7, second >= 1200 && second < 2400 ? 900 : 100, FitBaseType.Uint16)] : [])], 1);
  const events = [[0, 0], [options.stopAtBoundary ? 1800 : 1200, options.stopType ?? 1],
    ...(options.boundaryStart ? [[1800, 0]] : []), ...(options.restart === false ? [] : [[options.resumeAt ?? 2400, 0]]), [3600, 4]];
  for (const [second, type] of options.reverseEvents ? [...events].reverse() : events) encoder.writeMessage(21, [
    field(253, start + second, FitBaseType.Uint32), field(0, 0, FitBaseType.Enum), field(1, type, FitBaseType.Enum)], 2);
  for (const [leg, index] of [3, 9].entries()) {
    const timer = leg === 0 ? options.stopAtBoundary ? 1800 : 1200 : options.timer === undefined ? 1200 : options.timer;
    encoder.writeMessage(18, [field(254, index, FitBaseType.Uint16), field(253, start + (leg + 1) * 1800, FitBaseType.Uint32),
      field(2, start + leg * 1800, FitBaseType.Uint32), field(5, options.power ? 2 : 11, FitBaseType.Enum),
      field(7, (leg === 0 ? 1800 : options.elapsed ?? 1800) * 1000, FitBaseType.Uint32),
      ...(timer === null ? [] : [field(8, timer * 1000, FitBaseType.Uint32)]),
      ...(options.power ? [field(45, 250, FitBaseType.Uint16)] : []),
      ...(options.imported === undefined ? [] : [field(35, options.imported * 10, FitBaseType.Uint16)])], 3);
    calibration(encoder, index);
  }
  return (await parse(encoder)).getActivities()[1];
}

describe('FIT multisport initial timer state', () => {
  it.each([1, 4, 8, 9])('carries a corroborated pause into the next leg for stop type %s', async stopType => {
    const activity = await multisport({ stopType });
    expect(activity.getAllEvents().some(event => event.timestamp === 0 && event.getType() === DataStopEvent.type)).toBe(true);
    expect(evaluate(activity).automatic).toMatchObject({ method: 'HR', score: 33.3 });
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    expect(evaluate(activity).automatic.score).toBe(33.3);
  });
  it('excludes inherited paused power without changing independent FTP', async () => {
    const activity = await multisport({ power: true });
    expect(activity.getStat(DataPowerNormalized.type)?.getValue()).toBe(100);
    expect(evaluate(activity).automatic).toMatchObject({ method: 'POWER', score: 5.3 });
  });
  it.each([null, 900, 1900])('does not guess a pause from missing/inconsistent timer %s', async timer => {
    const activity = await multisport({ timer });
    expect(evaluate(activity).automatic).toMatchObject({ method: 'HR', score: 50 });
  });
  it('does not use a normalized elapsed duration as original timing evidence', async () => {
    expect(evaluate(await multisport({ elapsed: 5400 })).automatic.score).toBe(50);
  });
  it('does not infer a pause when both starting states fit timestamp rounding', async () => {
    const activity = await multisport({ resumeAt: 1801, timer: 1799 });
    expect(activity.getAllEvents().some(event => event.timestamp === 0)).toBe(false);
  });
  it('recognizes a short pause without a duration-relative tolerance', async () => {
    const activity = await multisport({ resumeAt: 1803, timer: 1797 });
    expect(activity.getAllEvents().some(event => event.timestamp === 0 && event.getType() === DataStopEvent.type)).toBe(true);
  });
  it.each([false, true])('keeps implicit sport restarts when timer equals elapsed, boundary stop=%s', async stopAtBoundary => {
    const activity = await multisport({ restart: false, timer: 1800, stopAtBoundary });
    expect(evaluate(activity).automatic).toMatchObject({ method: 'HR', score: 50 });
    expect(activity.getAllEvents().some(event => event.timestamp === 0 &&
      [DataStopEvent.type, DataStopAllEvent.type].includes(event.getType()))).toBe(false);
  });
  it('retains an explicit paused boundary when the session timer confirms it', async () => {
    expect(evaluate(await multisport({ stopAtBoundary: true })).automatic.score).toBe(33.3);
  });
  it('honors an explicit boundary restart and sorts nonchronological source events', async () => {
    expect(evaluate(await multisport({ stopAtBoundary: true, boundaryStart: true, timer: 1800 })).automatic.score).toBe(50);
    expect(evaluate(await multisport({ reverseEvents: true })).automatic.score).toBe(33.3);
  });
  it.each([0, 42.5])('preserves imported TSS %s across the corrected timer boundary', async imported => {
    expect(evaluate(await multisport({ imported })).automatic).toMatchObject({ method: 'IMPORTED', score: imported });
  });
});
