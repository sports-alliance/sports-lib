import { FitBaseType as B, FitEncoder } from 'fit-file-parser/encoder';
import { EventImporterFIT } from './importer.fit';
import { EventImporterJSON } from '../json/importer.json';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { DataPoolLength } from '../../../../data/data.pool-length';
import { DataDistance } from '../../../../data/data.distance';
import { DataHeartRate } from '../../../../data/data.heart-rate';
import { DataPower } from '../../../../data/data.power';

const f = (number: number, value: number, baseType = B.Uint8) => ({ number, value, baseType,
  size: baseType === B.Uint32 ? 4 : baseType === B.Uint16 ? 2 : 1 });
const start = FitEncoder.toFitTimestamp(new Date('2026-01-01T10:00:00Z'));
const header = (manufacturer = 1) => {
  const encoder = new FitEncoder();
  encoder.writeMessage(0, [f(0, 4, B.Enum), f(1, manufacturer, B.Uint16), f(4, start, B.Uint32)]);
  return encoder;
};
const parse = async (encoder: FitEncoder) => {
  const bytes = encoder.close();
  return EventImporterFIT.getFromArrayBuffer(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
    new ActivityParsingOptions({ generateUnitStreams: false }));
};
const evaluate = ActivityUtilities.getTrainingStressScoreEvaluations;

async function pool(options: { manufacturer?: number; unit?: number; pool?: number; summary?: boolean; speed?: number;
  imported?: number; contradictorySpeed?: boolean; recordedHR?: boolean } = {}) {
  const encoder = header(options.manufacturer);
  for (let index = 0; index < 10; index++) encoder.writeMessage(101, [f(254, index, B.Uint16),
    f(253, start + (index + 1) * 30, B.Uint32), f(2, start + index * 30, B.Uint32),
    f(3, 30000, B.Uint32), f(4, 30000, B.Uint32), f(12, 1, B.Enum),
    ...(options.speed === undefined ? [] : [f(6, options.contradictorySpeed && index === 9 ? 835 : options.speed, B.Uint16)])], 1);
  const distance = options.summary === false ? [] : [f(9, 22860, B.Uint32)];
  encoder.writeMessage(19, [f(254, 0, B.Uint16), f(253, start + 300, B.Uint32), f(2, start, B.Uint32),
    f(7, 300000, B.Uint32), f(8, 300000, B.Uint32), f(32, 10, B.Uint16), f(35, 0, B.Uint16), f(15, 100), ...distance], 2);
  if (options.recordedHR) for (const second of [30, 90]) encoder.writeMessage(20,
    [f(253, start + second, B.Uint32), f(3, 165), f(7, 180, B.Uint16)], 5);
  encoder.writeMessage(18, [f(254, 0, B.Uint16), f(253, start + 300, B.Uint32), f(2, start, B.Uint32),
    f(5, 5, B.Enum), f(6, 17, B.Enum), f(7, 300000, B.Uint32), f(8, 300000, B.Uint32),
    f(25, 0, B.Uint16), f(26, 1, B.Uint16), f(44, options.pool ?? 2286, B.Uint16), f(46, options.unit ?? 1, B.Enum),
    ...(options.imported === undefined ? [] : [f(35, options.imported * 10, B.Uint16)]), ...distance], 3);
  return parse(encoder);
}

describe('FIT canonical pool length units', () => {
  it.each([0, 1])('keeps native meters with display unit %s and round-trips normalized pool/length stats', async unit => {
    const event = await pool({ unit });
    for (const activity of [event.getFirstActivity(), EventImporterJSON.getEventFromJSON(event.toJSON()).getFirstActivity()]) {
      expect(activity.getStat(DataPoolLength.type)?.getValue()).toBe(22.86);
      expect(activity.getSwimLengths()).toHaveLength(10);
      expect(activity.getSwimLengths().every(length => length.distance?.getValue() === 22.86)).toBe(true);
      expect(activity.getStat(DataDistance.type)?.getValue()).toBe(228.6);
    }
  });
  it('generates the full meter distance when summaries are absent', async () => {
    const activity = (await pool({ summary: false })).getFirstActivity();
    expect(activity.getStat(DataDistance.type)?.getValue()).toBeCloseTo(228.6, 6);
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    expect(activity.getStat(DataDistance.type)?.getValue()).toBeCloseTo(228.6, 6);
  });
  it.each([{ summary: true }, { summary: false, speed: 762 }])('preserves corroborated Suunto yards convention %#', async evidence => {
    const activity = (await pool({ manufacturer: 23, pool: 2504, ...evidence })).getFirstActivity();
    expect(activity.getStat(DataPoolLength.type)?.getValue()).toBeCloseTo(22.896576, 6);
    expect(activity.getSwimLengths()[0].distance?.getValue()).toBeCloseTo(22.896576, 6);
  });
  it.each([
    { manufacturer: 23, pool: 2286, speed: 762 },
    { manufacturer: 23, pool: 2504, summary: false },
    { manufacturer: 1, pool: 2504, speed: 762 },
    { manufacturer: 23, pool: 2504, unit: 0, speed: 762 },
    { manufacturer: 23, pool: 2504, speed: 762, contradictorySpeed: true }
  ])('does not convert conforming, unsupported, or conflicting evidence %#', async options => {
    const activity = (await pool(options)).getFirstActivity();
    expect(activity.getStat(DataPoolLength.type)?.getValue()).toBe(options.pool / 100);
  });
  it('preserves imported zero and source HR gaps/power through regeneration', async () => {
    const activity = (await pool({ imported: 0, recordedHR: true })).getFirstActivity();
    for (let index = 0; index < 2; index++) {
      expect(evaluate(activity).automatic).toMatchObject({ method: 'IMPORTED', score: 0 });
      expect(activity.getStreamData(DataHeartRate.type)[30]).toBe(165);
      expect(activity.getStreamData(DataHeartRate.type)[31]).toBeNull();
      expect(activity.getStreamData(DataPower.type)[30]).toBe(180);
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    }
  });
});

async function reorderedPool(options: { reversed?: boolean; sparse?: boolean; sharedReference?: boolean;
  duplicateLapID?: boolean; wrongReference?: boolean; omitReferences?: boolean; imported?: number; omitLapIDs?: boolean;
  countOnly?: boolean; misleadingUnindexedCounts?: boolean } = {}) {
  const encoder = header();
  for (let leg = 0; leg < 2; leg++) {
    const from = start + leg * 3600;
    for (let index = 0; index < 60; index++) encoder.writeMessage(101, [f(254, leg * 60 + index, B.Uint16),
      f(253, from + (index + 1) * 60, B.Uint32), f(2, from + index * 60, B.Uint32), f(3, 60000, B.Uint32),
      f(4, 60000, B.Uint32), f(6, 500, B.Uint16), f(12, 1, B.Enum)], 1);
    encoder.writeMessage(19, [...(options.omitLapIDs ? [] : [f(254, options.duplicateLapID ? 0 : options.sparse ? leg * 10 + 10 : leg, B.Uint16)]),
      f(253, from + 3600, B.Uint32), f(2, from, B.Uint32), f(7, 3600000, B.Uint32), f(8, 3600000, B.Uint32),
      f(9, 180000, B.Uint32), f(15, leg ? 100 : 165), f(32, 60, B.Uint16), f(35, leg * 60, B.Uint16)], 2);
  }
  for (const [index, leg] of (options.reversed ? [1, 0] : [0, 1]).entries()) {
    const from = start + leg * 3600;
    encoder.writeMessage(18, [f(254, index, B.Uint16), f(253, from + 3600, B.Uint32), f(2, from, B.Uint32),
      f(5, 5, B.Enum), f(6, 17, B.Enum), f(7, 3600000, B.Uint32), f(8, 3600000, B.Uint32), f(9, 180000, B.Uint32),
      ...(options.omitReferences ? [] : [...(options.countOnly ? [] : [f(25, options.sharedReference ? 0 : options.wrongReference ? 1 - leg : options.sparse ? leg * 10 + 10 : leg, B.Uint16)]), f(26, options.misleadingUnindexedCounts ? leg * 2 : 1, B.Uint16)]),
      ...(options.imported === undefined ? [] : [f(35, options.imported * 10, B.Uint16)]), f(44, 3000, B.Uint16)], 3);
    encoder.writeMessage(216, [f(0, 18, B.Uint16), f(1, index, B.Uint16), f(11, 190), f(12, 55), f(13, 165)], 4);
  }
  return (await parse(encoder)).getActivities().sort((left, right) => +left.startDate - +right.startDate);
}

describe('FIT session summary lap references', () => {
  it.each([{ reversed: false }, { reversed: true }, { reversed: true, sparse: true }, { omitReferences: true },
    { countOnly: true }, { reversed: true, countOnly: true }, { reversed: true, omitLapIDs: true },
    { omitLapIDs: true, misleadingUnindexedCounts: true }])(
    'keeps lap-derived HR scoped independently of summary order %#', async options => {
      const activities = await reorderedPool(options);
      expect(activities.map(activity => activity.getLaps().length)).toEqual([1, 1]);
      expect(activities.map(activity => evaluate(activity).automatic.score)).toEqual([100, 16.2]);
      expect(activities.map(activity => activity.getSwimLengths().filter(length => length.lapIndex === 1).length)).toEqual([60, 60]);
    });
  it.each([{ duplicateLapID: true }, { wrongReference: true }])('does not use duplicate or temporally contradictory lap IDs %#', async options => {
    for (const activity of await reorderedPool(options)) {
      expect(activity.getLaps()).toHaveLength(0);
      expect(evaluate(activity).automatic.score).toBeNull();
    }
  });
  it('does not lend the first leg lap to a different session', async () => {
    const activities = await reorderedPool({ sharedReference: true });
    expect(activities[1].getLaps()).toHaveLength(0);
    expect(evaluate(activities[1]).automatic.score).toBeNull();
  });
  it('keeps imported scores even when referenced laps are unusable', async () => {
    for (const activity of await reorderedPool({ wrongReference: true, imported: 42.5 }))
      expect(evaluate(activity).automatic).toMatchObject({ method: 'IMPORTED', score: 42.5 });
  });
});

async function sessionless(options: { timers?: Array<number | null>; events?: Array<[number, number]>; session?: boolean;
  sessionTimer?: number; gap?: boolean; lapless?: boolean; imported?: number } = {}) {
  const encoder = header();
  encoder.writeMessage(7, [f(3, 250, B.Uint16)], 5);
  for (let second = 0; second <= 3600; second++) encoder.writeMessage(20,
    [f(253, start + second, B.Uint32), f(7, 250, B.Uint16)], 1);
  for (const [second, type] of options.events ?? [[0, 0], [1200, 1], [2400, 0], [3600, 4]])
    encoder.writeMessage(21, [f(253, start + second, B.Uint32), f(0, 0, B.Enum), f(1, type, B.Enum)], 2);
  const timers = options.timers ?? [null];
  if (!options.lapless) timers.forEach((timer, index) => {
    const from = index * 3600 / timers.length + (options.gap && index > 0 ? 60 : 0), to = (index + 1) * 3600 / timers.length;
    encoder.writeMessage(19, [f(254, index, B.Uint16), f(253, start + to, B.Uint32), f(2, start + from, B.Uint32),
      f(7, (to - from) * 1000, B.Uint32), ...(timer === null ? [] : [f(8, timer * 1000, B.Uint32)]), f(25, 2, B.Enum)], 3);
  });
  if (options.session) encoder.writeMessage(18, [f(254, 0, B.Uint16), f(253, start + 3600, B.Uint32), f(2, start, B.Uint32),
    f(5, 2, B.Enum), f(7, 3600000, B.Uint32), ...(options.sessionTimer === undefined ? [] : [f(8, options.sessionTimer * 1000, B.Uint32)]),
    ...(options.imported === undefined ? [] : [f(35, options.imported * 10, B.Uint16)])], 4);
  return (await parse(encoder)).getFirstActivity();
}

describe('FIT sessionless active-time recovery', () => {
  it.each([{ session: true }, {}, { timers: [0] }, { timers: [1200, null] }, { timers: [1200, 1200], gap: true }])(
    'recovers explicit pauses without treating elapsed or partial lap timers as supplied %#', async options => {
      const activity = await sessionless(options);
      expect(activity.getTimer().getValue()).toBe(2400);
      expect(activity.getPause().getValue()).toBe(1200);
      expect(evaluate(activity).automatic).toMatchObject({ method: 'POWER', score: 66.7 });
    });
  it.each([{ timers: [1500, 1500] }, { session: true, sessionTimer: 3000 }])('preserves complete supplied timers %#', async options => {
    const activity = await sessionless(options);
    expect(activity.getTimer().getValue()).toBe(3000);
    expect(evaluate(activity).automatic.score).toBe(83.3);
  });
  it('retains complete lap summaries without timer events', async () => {
    expect((await sessionless({ timers: [1200, 1200], events: [] })).getTimer().getValue()).toBe(2400);
  });
  it.each([{ events: [] }, { events: [[1200, 1], [2400, 0]] }, { events: [[0, 0], [0, 1]] }])('does not invent pauses for absent/unanchored/conflicting events %#', async ({ events }) => {
    const activity = await sessionless({ events: events as Array<[number, number]> });
    expect(activity.getTimer().getValue()).toBe(3600);
  });
  it('keeps validated all-paused zero unavailable through recalculation', async () => {
    const activity = await sessionless({ events: [[0, 1]], timers: [0] });
    expect(activity.getTimer().getValue()).toBe(0);
    expect(evaluate(activity).automatic.score).toBeNull();
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    expect(evaluate(activity).automatic.score).toBeNull();
  });
  it('recovers timer events even without laps', async () => {
    expect((await sessionless({ lapless: true })).getTimer().getValue()).toBe(2400);
  });
  it('preserves imported TSS while recovering a session timer', async () => {
    expect(evaluate(await sessionless({ session: true, imported: 0 })).automatic).toMatchObject({ method: 'IMPORTED', score: 0 });
  });
});
