import { FitBaseType as B, FitEncoder } from 'fit-file-parser/encoder';
import { EventImporterFIT } from './importer.fit';
import { EventImporterJSON } from '../json/importer.json';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { DataHeartRate } from '../../../../data/data.heart-rate';
import { DataDistance } from '../../../../data/data.distance';
import { DataElapsedTime } from '../../../../data/data.elapsed-time';
import { DataDuration } from '../../../../data/data.duration';
import { DataTimerTime } from '../../../../data/data.timer-time';
import { DataPause } from '../../../../data/data.pause';

const epoch = new Date('2026-01-01T00:00:00Z');
const start = FitEncoder.toFitTimestamp(epoch);
const field = (number: number, value: number, baseType = B.Uint8) => ({
  number,
  value,
  baseType,
  size: baseType === B.Uint32 ? 4 : baseType === B.Uint16 ? 2 : 1
});
const f = field;
const parse = (encoder: FitEncoder, cap = 14) => {
  const b = encoder.close();
  return EventImporterFIT.getFromArrayBuffer(
    b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer,
    new ActivityParsingOptions({ generateUnitStreams: false, maxActivityDurationDays: cap })
  );
};
const init = () => {
  const e = new FitEncoder();
  e.writeMessage(0, [f(0, 4, B.Enum), f(1, 1, B.Uint16), f(4, start, B.Uint32)]);
  e.writeMessage(3, [f(4, 700, B.Uint16)], 4);
  return e;
};
async function envelope(
  mode: 'saved' | 'premature' | 'correct',
  settings: { imported?: number; cap?: number; redundantStops?: boolean; conflictingGroup?: boolean } = {}
) {
  const e = init(),
    short = mode === 'premature';
  const records = short
    ? [
        [2, 0],
        [50, 1000],
        [95, 2000]
      ]
    : [
        [0, 0],
        [500, 500],
        [1000, 1000],
        [4000, 1000],
        [9000, 1000],
        [9500, 1500],
        [10000, 2000]
      ];
  for (const [second, distance] of records)
    e.writeMessage(
      20,
      [f(253, start + second, B.Uint32), f(5, distance * 100, B.Uint32), f(3, 165), f(7, 250, B.Uint16)],
      1
    );
  const events = short
    ? [
        [0, 0],
        [100, 4]
      ]
    : settings.redundantStops
      ? [
          [0, 0],
          [1000, 4],
          [5000, 4],
          [9000, 0],
          [10000, 4],
          [12000, 4]
        ]
      : [
          [0, 0],
          [1000, 4],
          [9000, 0],
          [10000, 4]
        ];
  for (const [second, type] of events)
    e.writeMessage(
      21,
      [
        f(253, start + second, B.Uint32),
        f(0, 0, B.Enum),
        f(1, type, B.Enum),
        f(4, settings.conflictingGroup && second === 9000 ? 1 : 0)
      ],
      2
    );
  e.writeMessage(
    18,
    [
      f(254, 0, B.Uint16),
      f(2, start, B.Uint32),
      f(253, start + (short ? 90 : mode === 'saved' ? 15000 : 10000), B.Uint32),
      f(5, 2, B.Enum),
      f(7, short ? 100500 : mode === 'saved' ? 2200000 : 10000000, B.Uint32),
      f(8, short ? 90800 : 2000200, B.Uint32),
      f(9, 200000, B.Uint32),
      f(11, 500, B.Uint16),
      f(34, 250, B.Uint16),
      f(45, 250, B.Uint16),
      ...(settings.imported === undefined ? [] : [f(35, settings.imported * 10, B.Uint16)])
    ],
    3
  );
  return parse(e, settings.cap);
}

function assertRoundTrip(event: Awaited<ReturnType<typeof parse>>) {
  const restored = EventImporterJSON.getEventFromJSON(event.toJSON());
  for (const [i, activity] of event.getActivities().entries()) {
    const copy = restored.getActivities()[i];
    expect([copy.startDate, copy.endDate]).toEqual([activity.startDate, activity.endDate]);
    for (const type of [
      DataElapsedTime.type,
      DataDuration.type,
      DataTimerTime.type,
      DataPause.type,
      DataDistance.type
    ]) {
      expect(copy.getStat(type)?.getValue()).toEqual(activity.getStat(type)?.getValue());
    }
    expect(copy.getStreamData(DataHeartRate.type)).toEqual(activity.getStreamData(DataHeartRate.type));
  }
}

describe('FIT corroborated session ending repairs', () => {
  it.each([false, true])(
    'retains the recorded exercise before a delayed save (redundant stops: %s)',
    async redundantStops => {
      const event = await envelope('saved', { redundantStops }),
        activity = event.getFirstActivity();
      const control = (await envelope('correct')).getFirstActivity();
      expect((+activity.endDate - +activity.startDate) / 1000).toBe(10000);
      expect(activity.getStat(DataElapsedTime.type)?.getValue()).toBe(10000);
      expect(activity.getDuration()!.getValue()).toBe(2000.2);
      expect(activity.getTimer()!.getValue()).toBe(2000.2);
      expect(activity.getPause()!.getValue()).toBe(7999.8);
      expect(activity.getStream(DataHeartRate.type).getData(true, true)).toEqual(Array(7).fill(165));
      expect(activity.getDistance().getValue()).toBe(2000);
      expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity)).toEqual(
        ActivityUtilities.getTrainingStressScoreEvaluations(control)
      );
      expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic).toMatchObject({
        method: 'POWER',
        score: 55.6
      });
      assertRoundTrip(event);
    }
  );

  it('retains fractional elapsed time and later records without increasing the supplied active time', async () => {
    const event = await envelope('premature'),
      activity = event.getFirstActivity();
    expect((+activity.endDate - +activity.startDate) / 1000).toBe(100.5);
    expect(activity.getStat(DataElapsedTime.type)?.getValue()).toBe(100.5);
    expect(activity.getDuration()!.getValue()).toBe(90.8);
    expect(activity.getTimer()!.getValue()).toBe(90.8);
    expect(activity.getPause()!.getValue()).toBe(9.7);
    expect(activity.getStream(DataHeartRate.type).getData(true, true)).toEqual(Array(3).fill(165));
    expect(activity.getStreamData(DataDistance.type)[95]).toBe(2000);
    assertRoundTrip(event);
  });

  it.each([0, 42.5])('preserves imported TSS %s through repaired endpoints', async imported => {
    for (const mode of ['saved', 'premature'] as const) {
      const activity = (await envelope(mode, { imported })).getFirstActivity();
      expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic).toMatchObject({
        method: 'IMPORTED',
        score: imported
      });
    }
  });

  it('retains old clipping for contradictory timer groups', async () => {
    const activity = (await envelope('saved', { conflictingGroup: true })).getFirstActivity();
    expect((+activity.endDate - +activity.startDate) / 1000).toBe(2200);
    expect(activity.getStream(DataHeartRate.type).getData(true, true)).toHaveLength(3);
  });

  it('does not bypass a caller duration cap', async () => {
    const activity = (await envelope('saved', { cap: 0.1 })).getFirstActivity();
    expect((+activity.endDate - +activity.startDate) / 1000).toBe(2200);
  });
});

async function malformedMultisport(reverse = false, imported?: number) {
  const e = init();
  for (const [second, hr] of [
    [0, 100],
    [1, 101],
    [6, 106],
    [20, 120],
    [100, 130],
    [419, 116],
    [420, 128]
  ]) {
    e.writeMessage(20, [f(253, start + second, B.Uint32), f(3, hr)], 1);
  }
  // Only the second leg's indexed lap is present. Its corrupt end causes the
  // decoder's cascade to collect all file records under that lap.
  e.writeMessage(
    19,
    [
      f(254, 10, B.Uint16),
      f(2, start + 419, B.Uint32),
      f(253, start, B.Uint32),
      f(7, 6663, B.Uint32),
      f(8, 646, B.Uint32),
      f(25, 1, B.Enum)
    ],
    2
  );
  for (const leg of reverse ? [1, 0] : [0, 1]) {
    e.writeMessage(
      18,
      [
        f(254, leg, B.Uint16),
        f(2, start + (leg ? 419 : 0), B.Uint32),
        f(253, start, B.Uint32),
        f(5, leg ? 1 : 62, B.Enum),
        f(6, leg ? 1 : 0, B.Enum),
        f(7, leg ? 6663 : 413680, B.Uint32),
        f(8, leg ? 646 : 307941, B.Uint32),
        f(25, leg ? 10 : 0, B.Uint16),
        f(26, leg ? 1 : 10, B.Uint16),
        ...(imported === undefined ? [] : [f(35, imported * 10, B.Uint16)])
      ],
      3
    );
  }
  return parse(e);
}

describe('FIT invalid multisport end with a valid explicit start', () => {
  it.each([false, true])("does not borrow another leg's start or samples (reversed sessions: %s)", async reverse => {
    const event = await malformedMultisport(reverse);
    const activities = event.getActivities().sort((a, b) => +a.startDate - +b.startDate);
    expect(activities.map(a => [(+a.startDate - +epoch) / 1000, (+a.endDate - +epoch) / 1000])).toEqual([
      [0, 413.68],
      [419, 425.663]
    ]);
    expect(activities.map(a => a.getDuration()!.getValue())).toEqual([307.94, 0.65]);
    expect(activities.map(a => a.getStream(DataHeartRate.type).getData(true, true))).toEqual([
      [100, 101, 106, 120, 130],
      [116, 128]
    ]);
    for (const activity of activities)
      for (const lap of activity.getLaps()) {
        expect(+lap.startDate).toBeGreaterThanOrEqual(+activity.startDate);
        expect(+lap.endDate).toBeLessThanOrEqual(+activity.endDate);
      }
    assertRoundTrip(event);
  });

  it.each([0, 42.5])("keeps each leg's imported TSS %s", async imported => {
    const event = await malformedMultisport(false, imported);
    for (const a of event.getActivities())
      expect(ActivityUtilities.getTrainingStressScoreEvaluations(a).automatic).toMatchObject({
        method: 'IMPORTED',
        score: imported
      });
  });
});
