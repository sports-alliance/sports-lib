import { FitBaseType as B, FitEncoder } from 'fit-file-parser/encoder';
import { EventImporterFIT } from './importer.fit';
import { EventImporterJSON } from '../json/importer.json';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { ActivityInterface } from '../../../../activities/activity.interface';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { DataElapsedTime } from '../../../../data/data.elapsed-time';
import { DataHeartRate } from '../../../../data/data.heart-rate';
import { DurationExceededEventLibError } from '../../../../errors/duration-exceeded-event-lib.error';

const base = new Date('2026-01-01T10:00:00Z');
const at = (second: number) => new Date(+base + second * 1000);
const start = FitEncoder.toFitTimestamp(base);
const f = (number: number, value: number, baseType = B.Uint8) => ({ number, value, baseType,
  size: baseType === B.Uint32 ? 4 : baseType === B.Uint16 ? 2 : 1 });

async function importLegs(options: { timing?: 'both' | 'elapsed' | 'timer' | 'zero'; reverse?: boolean;
  pause?: boolean; imported?: number; records?: boolean; outsideRecords?: boolean; omitFirstTiming?: boolean } = {}) {
  const encoder = new FitEncoder();
  encoder.writeMessage(0, [f(0, 4, B.Enum), f(1, 1, B.Uint16), f(4, start, B.Uint32)]);
  if (options.outsideRecords) encoder.writeMessage(20, [f(253, start - 600, B.Uint32), f(3, 200)], 1);
  if (options.records !== false) for (let second = 0; second <= 7200; second += 60) encoder.writeMessage(20,
    [f(253, start + second, B.Uint32), f(3, second < 3600 ? 165 : 100)], 1);
  if (options.outsideRecords) encoder.writeMessage(20, [f(253, start + 7800, B.Uint32), f(3, 200)], 1);
  if (options.pause) for (const [second, type] of [[0, 0], [1200, 1], [2400, 0], [3600, 0]]) encoder.writeMessage(21,
    [f(253, start + second, B.Uint32), f(0, 0, B.Enum), f(1, type, B.Enum)], 2);
  for (const leg of options.reverse ? [1, 0] : [0, 1]) {
    const timer = options.pause && leg === 0 ? 2400 : 3600;
    const timing = options.omitFirstTiming && leg === 0 ? '' : options.timing ?? '';
    encoder.writeMessage(18, [f(254, leg, B.Uint16), f(253, start + (leg + 1) * 3600, B.Uint32),
      f(2, start + leg * 3600, B.Uint32), f(5, 11, B.Enum),
      ...(['both', 'elapsed', 'zero'].includes(timing) ? [f(7, timing === 'zero' ? 0 : 3600000, B.Uint32)] : []),
      ...(['both', 'timer', 'zero'].includes(timing) ? [f(8, timing === 'zero' ? 0 : timer * 1000, B.Uint32)] : []),
      ...(options.imported === undefined ? [] : [f(35, options.imported * 10, B.Uint16)])], 3);
    encoder.writeMessage(216, [f(0, 18, B.Uint16), f(1, leg, B.Uint16), f(11, 190), f(12, 55), f(13, 165)], 4);
  }
  const bytes = encoder.close();
  return EventImporterFIT.getFromArrayBuffer(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
    new ActivityParsingOptions({ generateUnitStreams: false }));
}

describe('FIT session bounds without duration summaries', () => {
  it.each([{}, { reverse: true }, { outsideRecords: true }, { timing: 'zero' as const },
    { timing: 'elapsed' as const }, { timing: 'timer' as const }, { timing: 'both' as const, omitFirstTiming: true }])(
    'retains adjacent session boundaries, HR ownership and load %#', async options => {
      const event = await importLegs(options);
      const activities = event.getActivities().sort((left, right) => +left.startDate - +right.startDate);
      const control = (await importLegs({ timing: 'both' })).getActivities();
      expect(activities.map(a => [a.startDate, a.endDate])).toEqual([[at(0), at(3600)], [at(3600), at(7200)]]);
      expect(activities.map(a => a.getStat(DataElapsedTime.type)?.getValue())).toEqual([3600, 3600]);
      expect(activities.map(a => a.getTimer()!.getValue())).toEqual([3600, 3600]);
      expect(activities.map(a => a.getStream(DataHeartRate.type).getData(true, true)))
        .toEqual([Array(60).fill(165), Array(61).fill(100)]);
      expect(activities.map(a => ActivityUtilities.getTrainingStressScoreEvaluations(a)))
        .toEqual(control.map(a => ActivityUtilities.getTrainingStressScoreEvaluations(a)));
      expect(activities.map(a => ActivityUtilities.getTrainingStressScoreEvaluations(a).automatic))
        .toMatchObject([{ method: 'HR', score: 98.3 }, { method: 'HR', score: 16.2 }]);
      const restored = EventImporterJSON.getEventFromJSON(event.toJSON()).getActivities()
        .sort((left, right) => +left.startDate - +right.startDate);
      expect(restored.map(a => [a.startDate, a.endDate])).toEqual([[at(0), at(3600)], [at(3600), at(7200)]]);
    });

  it('recovers explicit pauses within each retained session', async () => {
    const activities = (await importLegs({ pause: true })).getActivities();
    const control = (await importLegs({ timing: 'both', pause: true })).getActivities();
    expect(activities.map(a => a.getTimer()!.getValue())).toEqual([2400, 3600]);
    expect(activities.map(a => a.getPause()!.getValue())).toEqual([1200, 0]);
    expect(activities.map(a => ActivityUtilities.getTrainingStressScoreEvaluations(a)))
      .toEqual(control.map(a => ActivityUtilities.getTrainingStressScoreEvaluations(a)));
  });

  it.each([0, 42.5])('preserves summary-only session bounds and imported TSS %s', async imported => {
    const activities = (await importLegs({ records: false, imported })).getActivities();
    expect(activities.map(a => [a.startDate, a.endDate])).toEqual([[at(0), at(3600)], [at(3600), at(7200)]]);
    for (const activity of activities) {
      expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic)
        .toMatchObject({ method: 'IMPORTED', score: imported });
    }
  });

  it.each([false, true])('requires enough timing evidence to scope cascaded lap records (ambiguous: %s)', async ambiguous => {
    const encoder = new FitEncoder();
    encoder.writeMessage(0, [f(0, 4, B.Enum), f(1, 1, B.Uint16), f(4, start, B.Uint32)]);
    for (let leg = 0; leg < 2; leg++) {
      const from = start + leg * 3600;
      for (let second = 0; second <= 3600; second += 60) encoder.writeMessage(20,
        [f(253, from + second, B.Uint32), f(3, leg ? 100 : 165)], 1);
      // The second session's start lets the parser separate the two lap lists.
      encoder.writeMessage(19, [f(253, from + 3600, B.Uint32), f(2, from, B.Uint32), f(25, 11, B.Enum)], 2);
      encoder.writeMessage(18, [f(254, leg, B.Uint16), f(5, 11, B.Enum),
        ...(ambiguous ? [] : [f(leg === 0 ? 253 : 2, leg === 0 ? from + 3600 : from, B.Uint32)])], 3);
    }
    const bytes = encoder.close();
    const parsed = EventImporterFIT.getFromArrayBuffer(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
      new ActivityParsingOptions({ generateUnitStreams: false }));
    if (ambiguous) {
      await expect(parsed).rejects.toThrow('Cannot parse start and end dates');
      return;
    }
    const event = await parsed;
    expect(event.getActivities().map(a => [a.startDate, a.endDate])).toEqual([[at(0), at(3600)], [at(3600), at(7200)]]);
    expect(event.getActivities().map(a => a.getStat(DataElapsedTime.type)?.getValue())).toEqual([3600, 3600]);
  });
});

describe('FIT session record-bound recovery', () => {
  const internals = EventImporterFIT as unknown as { getActivityFromSessionObject(
    session: any, file: any, options: ActivityParsingOptions, index: number): ActivityInterface };
  const records = (seconds: number[]) => seconds.map(second => ({ timestamp: at(second) }));
  const session = (fields: Record<string, unknown> = {}) => ({ sport: 'walking', laps: [], ...fields });
  const resolve = (leg: any, otherLegs: any[] = [], fileRecords = records([0, 120])) =>
    internals.getActivityFromSessionObject(leg, { sessions: [leg, ...otherLegs], records: fileRecords },
      new ActivityParsingOptions({ generateUnitStreams: false }), 0);

  it('preserves valid quiet time before and after a single session recording', () => {
    const activity = resolve(session({ start_time: at(0), timestamp: at(120) }), [], records([10, 110]));
    expect([activity.startDate, activity.endDate]).toEqual([at(0), at(120)]);
  });

  it.each([
    { start_time: at(200), timestamp: at(100) },
    { start_time: at(86400), timestamp: at(86520) },
    { start_time: new Date(NaN), timestamp: new Date(NaN) },
    { start_time: at(0), timestamp: at(30 * 86400) },
    { start_time: at(0), timestamp: at(30 * 86400), total_elapsed_time: 30 * 86400 },
    {}
  ])('recovers corrupt or absent single-session dates and consistent elapsed stats %#', fields => {
    const activity = resolve(session(fields));
    expect([activity.startDate, activity.endDate]).toEqual([at(0), at(120)]);
    expect(activity.getStat(DataElapsedTime.type)?.getValue()).toBe(120);
    expect(activity.getTimer()!.getValue()).toBe(120);
  });

  it('uses only the current session lap records when recovering a multisport leg', () => {
    const leg = session({ laps: [{ records: [] }, { records: records([120, 60, 0]) }, { records: [] }] });
    const other = session({ start_time: at(3600), timestamp: at(7200) });
    const activity = resolve(leg, [other], records([0, 60, 120, 3600, 7200]));
    expect([activity.startDate, activity.endDate]).toEqual([at(0), at(120)]);
    expect(activity.getTimer()!.getValue()).toBe(120);
  });

  it('does not borrow the whole-file record range for a session with unknown bounds', () => {
    expect(() => resolve(session(), [session({ start_time: at(3600), timestamp: at(7200) })], records([0, 7200])))
      .toThrow('Cannot parse start and end dates');
  });

  it.each([undefined, 30 * 86400])('does not bypass the duration limit when no credible record range exists (%s)', duration => {
    expect(() => resolve(session({ start_time: at(0), timestamp: at(30 * 86400), total_elapsed_time: duration }), [], []))
      .toThrow(DurationExceededEventLibError);
  });

  it('does not shorten an ordinary invalid-end session to a fractional elapsed summary', () => {
    const activity = resolve(
      session({ start_time: at(0), timestamp: at(0), total_elapsed_time: 90.8 }),
      [],
      records([0, 91])
    );
    expect([activity.startDate, activity.endDate]).toEqual([at(0), at(91)]);
  });

  it.each([
    { otherEnd: 500, lastRecord: 420 },
    { otherEnd: 413, lastRecord: 426 },
    { otherEnd: 413, lastRecord: 418 }
  ])('does not infer a later-leg boundary from conflicting ownership or incomplete elapsed evidence: %j', fields => {
    const leg = session({
      start_time: at(419),
      timestamp: at(0),
      total_elapsed_time: 6.663,
      total_timer_time: 0.646,
      records: records([0, fields.lastRecord])
    });
    const other = session({ start_time: at(0), timestamp: at(fields.otherEnd) });
    const activity = resolve(leg, [other]);
    // The new narrow repair is ineligible; retain the existing corrupt-date fallback.
    expect(activity.startDate).toEqual(at(0));
  });

  it('honors a caller-supplied duration limit when validating explicit bounds', () => {
    const leg = session({ start_time: at(0), timestamp: at(30 * 86400) });
    const activity = internals.getActivityFromSessionObject(leg, { sessions: [leg], records: [] },
      new ActivityParsingOptions({ maxActivityDurationDays: 31 }), 0);
    expect([activity.startDate, activity.endDate]).toEqual([at(0), at(30 * 86400)]);
  });
});
