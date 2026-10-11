import { FitBaseType, FitEncoder } from 'fit-file-parser/encoder';
import { EventImporterFIT } from './importer.fit';
import { EventImporterJSON } from '../json/importer.json';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { DataHeartRate } from '../../../../data/data.heart-rate';
import { DataDistance } from '../../../../data/data.distance';
import { DataDuration } from '../../../../data/data.duration';
import { DataTimerTime } from '../../../../data/data.timer-time';
import { DataPause } from '../../../../data/data.pause';
import { DataHeartRateZoneOneDuration } from '../../../../data/data.heart-rate-zone-one-duration';
import { DataPowerZoneOneDuration } from '../../../../data/data.power-zone-one-duration';
import { fileActiveDuration } from '../../../utilities/tss/tss-evaluation';

const field = (number: number, value: number, baseType = FitBaseType.Uint8) => ({ number, value, baseType,
  size: baseType === FitBaseType.Uint32 ? 4 : baseType === FitBaseType.Uint16 ? 2 : 1 });
const array = (number: number, values: number[]) => {
  const value = new Uint8Array(values.length * 4), view = new DataView(value.buffer);
  values.forEach((entry, index) => view.setUint32(index * 4, entry, true));
  return { number, value, baseType: FitBaseType.Uint32, size: value.length };
};
const start = FitEncoder.toFitTimestamp(new Date('2026-01-01T10:00:00Z'));
const header = () => {
  const encoder = new FitEncoder();
  encoder.writeMessage(0, [field(0, 4, FitBaseType.Enum), field(1, 23, FitBaseType.Uint16), field(4, start, FitBaseType.Uint32)]);
  return encoder;
};
interface Session {
  index?: number; from?: number; duration?: number; timer?: number | null; elapsed?: number; power?: boolean; imported?: number;
}
const session = (encoder: FitEncoder, options: Session = {}) => {
  const from = options.from ?? 0, duration = options.duration ?? 3600;
  encoder.writeMessage(18, [
    ...(options.index === undefined ? [] : [field(254, options.index, FitBaseType.Uint16)]),
    field(253, start + from + duration, FitBaseType.Uint32), field(2, start + from, FitBaseType.Uint32),
    field(5, options.power ? 2 : 11, FitBaseType.Enum), field(7, (options.elapsed ?? duration) * 1000, FitBaseType.Uint32),
    ...(options.timer === null ? [] : [field(8, (options.timer ?? duration) * 1000, FitBaseType.Uint32)]),
    ...(options.power ? [field(34, 250, FitBaseType.Uint16), field(45, 250, FitBaseType.Uint16)] : []),
    ...(options.imported === undefined ? [] : [field(35, options.imported * 10, FitBaseType.Uint16)])], 2);
};
const zones = (encoder: FitEncoder, index: number | undefined, duration = 600) => encoder.writeMessage(216, [
  field(0, 18, FitBaseType.Uint16), ...(index === undefined ? [] : [field(1, index, FitBaseType.Uint16)]),
  array(2, [duration * 1000, 0, 0, 0, 0]), array(5, [duration * 2000, 0, 0, 0, 0]),
  { number: 6, value: new Uint8Array([110, 130, 150, 170, 190]), baseType: FitBaseType.Uint8, size: 5 },
  field(11, 190), field(12, 55), field(13, 165)], 3);
const record = (encoder: FitEncoder, second: number, hr?: number, distance?: number) => encoder.writeMessage(20, [
  field(253, start + second, FitBaseType.Uint32), ...(hr === undefined ? [] : [field(3, hr)]),
  ...(distance === undefined ? [] : [field(5, distance * 100, FitBaseType.Uint32)])], 1);
const parse = async (encoder: FitEncoder) => {
  const bytes = encoder.close();
  return EventImporterFIT.getFromArrayBuffer(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
    new ActivityParsingOptions({ generateUnitStreams: false }));
};
const evaluate = ActivityUtilities.getTrainingStressScoreEvaluations;

async function boundary(gap = 0, reversed = false, imported?: number) {
  const encoder = header();
  for (let second = 0; second < 3600; second += 60) record(encoder, second, undefined, second);
  for (let second = 0; second <= 3600; second += 60) record(encoder, 3600 + gap + second, 165, second);
  for (const index of reversed ? [1, 0] : [0, 1]) {
    session(encoder, { index, from: index ? 3600 + gap : 0, imported }); zones(encoder, index);
  }
  return (await parse(encoder)).getActivities().sort((a, b) => +a.startDate - +b.startDate);
}

describe('FIT session record ownership', () => {
  it.each([false, true])('does not borrow the next leg HR or reset distance at a shared endpoint (reversed=%s)', async reversed => {
    const [first, last] = await boundary(0, reversed);
    expect(first.hasStreamData(DataHeartRate.type)).toBe(false);
    expect(evaluate(first).automatic.score).toBeNull();
    expect(first.getStat(DataDistance.type)?.getValue()).toBe(3540);
    expect(evaluate(last).automatic).toMatchObject({ method: 'HR', score: 100 });
    expect(last.getStreamData(DataHeartRate.type)[3600]).toBe(165);
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(first);
    expect(evaluate(first).automatic.score).toBeNull();
  });
  it('keeps the endpoint of a sole session', async () => {
    const encoder = header(); record(encoder, 0, 100, 0); record(encoder, 3600, 165, 1234);
    session(encoder, { index: 10 }); zones(encoder, 10);
    const activity = (await parse(encoder)).getFirstActivity();
    expect(activity.getStreamData(DataHeartRate.type)[3600]).toBe(165);
    expect(activity.getStat(DataDistance.type)?.getValue()).toBe(1234);
  });
  it('keeps a closing endpoint when the next leg starts later', async () => {
    const encoder = header(); record(encoder, 0, 100, 0); record(encoder, 3600, 110, 1234); record(encoder, 3601, 165, 0);
    session(encoder, { index: 0 }); session(encoder, { index: 1, from: 3601 });
    const [first] = (await parse(encoder)).getActivities();
    expect(first.getStreamData(DataHeartRate.type)[3600]).toBe(110);
    expect(first.getStat(DataDistance.type)?.getValue()).toBe(1234);
  });
  it.each([0, 1800])('does not assign ambiguous records from duplicate/overlapping session interiors (offset=%s)', async from => {
    const encoder = header(); record(encoder, 2000, 165);
    session(encoder, { index: 0 }); session(encoder, { index: 1, from });
    zones(encoder, 0); zones(encoder, 1);
    for (const activity of (await parse(encoder)).getActivities()) {
      expect(activity.hasStreamData(DataHeartRate.type)).toBe(false);
      expect(evaluate(activity).automatic.score).toBeNull();
    }
  });
  it.each([0, 42.5])('preserves imported TSS %s after removing leaked records', async imported => {
    expect(evaluate((await boundary(0, false, imported))[0]).automatic).toMatchObject({ method: 'IMPORTED', score: imported });
  });
});

describe('FIT time_in_zone session references', () => {
  async function file(ids: Array<number | undefined>, references = ids, duplicate = false) {
    const encoder = header();
    ids.forEach((index, leg) => { record(encoder, leg * 3601, 110); record(encoder, leg * 3601 + 3600, 110);
      session(encoder, { index, from: leg * 3601 }); });
    references.forEach((index, leg) => zones(encoder, index, (leg + 1) * 600));
    if (duplicate) zones(encoder, references[0], 1700);
    return parse(encoder);
  }
  it.each([[0, 1], [1, 0], [10, 20]])('matches actual session IDs %j', async (...ids) => {
    const event = await file(ids);
    event.getActivities().forEach((activity, leg) => {
      expect(activity.getStat(DataHeartRateZoneOneDuration.type)?.getValue()).toBe((leg + 1) * 600);
      expect(activity.getStat(DataPowerZoneOneDuration.type)?.getValue()).toBe((leg + 1) * 1200);
      expect(activity.intensityZones.find(zone => zone.type === DataHeartRate.type)?.zone1Duration).toBe((leg + 1) * 600);
    });
    const restored = EventImporterJSON.getEventFromJSON(event.toJSON());
    expect(restored.getActivities()[0].getStat(DataHeartRateZoneOneDuration.type)?.getValue()).toBe(600);
  });
  it('uses the ordinal only when the session has no supplied message index', async () => {
    const event = await file([undefined, undefined], [0, 1]);
    expect(event.getActivities().map(activity => activity.getStat(DataHeartRateZoneOneDuration.type)?.getValue())).toEqual([600, 1200]);
  });
  it.each([[[10], [undefined]], [[undefined], [undefined]]])('accepts an omitted reference for exactly one session %j', async (ids, refs) => {
    expect((await file(ids, refs)).getFirstActivity().getStat(DataHeartRateZoneOneDuration.type)?.getValue()).toBe(600);
  });
  it.each([
    [[0, 0], [0, 0], false], [[10, 20], [undefined], false], [[10], [10], true], [[10], [0], false]
  ] as [number[], Array<number | undefined>, boolean][])('rejects ambiguous/unmatched references %#', async (ids, refs, duplicate) => {
    for (const activity of (await file(ids, refs, duplicate)).getActivities()) {
      expect(activity.getStat(DataHeartRateZoneOneDuration.type)).toBeUndefined();
      expect(activity.getStat(DataPowerZoneOneDuration.type)).toBeUndefined();
    }
  });
});

async function timerFile(options: { timer?: number | null; events?: number[][]; elapsed?: number; imported?: number;
  preceding?: boolean; overlappingFrom?: number } = {}) {
  const encoder = header();
  for (let second = 0; second <= 3600; second += 60) record(encoder, second, 165);
  for (const [second, type] of options.events ?? [[0, 0], [1200, 1], [2400, 0], [3600, 4]]) {
    encoder.writeMessage(21, [field(253, start + second, FitBaseType.Uint32), field(0, 0, FitBaseType.Enum),
      field(1, type, FitBaseType.Enum)], 4);
  }
  if (options.preceding) session(encoder, { index: 3, from: -3600 });
  if (options.overlappingFrom !== undefined) session(encoder, { index: 3, from: options.overlappingFrom, timer: null });
  session(encoder, { index: 9, timer: options.timer === undefined ? null : options.timer,
    elapsed: options.elapsed, power: true, imported: options.imported });
  zones(encoder, 9);
  return (await parse(encoder)).getActivities()[options.preceding || options.overlappingFrom !== undefined ? 1 : 0];
}

describe('FIT missing/zero session timer summaries', () => {
  it.each([null, 0])('derives active duration from explicit pauses when timer=%s', async timer => {
    const activity = await timerFile({ timer });
    for (let repeat = 0; repeat < 2; repeat++) {
      expect(activity.getStat(DataTimerTime.type)?.getValue()).toBe(2400);
      expect(activity.getStat(DataDuration.type)?.getValue()).toBe(2400);
      expect(activity.getStat(DataPause.type)?.getValue()).toBe(1200);
      expect(evaluate(activity).automatic).toMatchObject({ method: 'POWER', score: 66.7 });
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    }
  });
  it.each([1, 4, 8, 9])('recognizes stop variant %s regardless of source event order', async stop => {
    const activity = await timerFile({ events: [[3600, 4], [2400, 0], [1200, stop], [0, 0]] });
    expect(activity.getStat(DataTimerTime.type)?.getValue()).toBe(2400);
  });
  it('does not treat simultaneous closing/next-leg events as an ambiguous active interval', async () => {
    const activity = await timerFile({ events: [[0, 0], [1200, 1], [2400, 0], [3600, 4], [3600, 0]] });
    expect(activity.getStat(DataTimerTime.type)?.getValue()).toBe(2400);
  });
  it.each([2400, 3000, 3600])('preserves a supplied positive timer summary %s', async timer => {
    const activity = await timerFile({ timer });
    expect(activity.getStat(DataTimerTime.type)?.getValue()).toBe(timer);
    expect(fileActiveDuration.has(activity)).toBe(false);
  });
  it.each([null, 0])('retains validated all-paused zero duration for timer=%s', async timer => {
    const activity = await timerFile({ timer, events: [[0, 4]] });
    for (let repeat = 0; repeat < 2; repeat++) {
      expect(activity.getStat(DataDuration.type)?.getValue()).toBe(0);
      expect(activity.getStat(DataTimerTime.type)?.getValue()).toBe(0);
      expect(activity.getStat(DataPause.type)?.getValue()).toBe(3600);
      expect(evaluate(activity).automatic.score).toBeNull();
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    }
  });
  it.each(([
    [], [[1200, 1], [2400, 0]], [[0, 0], [1200, 1], [1200, 0]], [[0, 0], [1200, 2]]
  ] as number[][][]).map(events => ({ events })))('does not invent pause positions from incomplete or conflicting timer events %#', async ({ events }) => {
    const activity = await timerFile({ events });
    expect(activity.getStat(DataTimerTime.type)?.getValue()).toBe(3600);
    expect(fileActiveDuration.has(activity)).toBe(false);
  });
  it('does not treat a previous leg stop as proof of a paused following leg without a summary', async () => {
    const activity = await timerFile({ preceding: true, events: [[0, 4], [600, 0]] });
    expect(activity.getStat(DataTimerTime.type)?.getValue()).toBe(3600);
    expect(fileActiveDuration.has(activity)).toBe(false);
  });
  it('does not derive from a timeline whose dates conflict with the supplied elapsed summary', async () => {
    expect(fileActiveDuration.has(await timerFile({ elapsed: 5400 }))).toBe(false);
  });
  it.each([0, 1800])('does not borrow global timer events across overlapping session interiors at %s', async overlappingFrom => {
    const activity = await timerFile({ overlappingFrom });
    expect(activity.getStat(DataTimerTime.type)?.getValue()).toBe(3600);
    expect(fileActiveDuration.has(activity)).toBe(false);
  });
  it.each([0, 42.5])('preserves imported TSS %s when deriving timer duration', async imported => {
    const activity = await timerFile({ imported });
    expect(activity.getStat(DataTimerTime.type)?.getValue()).toBe(2400);
    expect(evaluate(activity).automatic).toMatchObject({ method: 'IMPORTED', score: imported });
  });
});
