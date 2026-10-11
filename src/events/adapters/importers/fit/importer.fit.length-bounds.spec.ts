import { FitBaseType, FitEncoder } from 'fit-file-parser/encoder';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { DataDistance } from '../../../../data/data.distance';
import { DataHeartRate } from '../../../../data/data.heart-rate';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { EventImporterFIT } from './importer.fit';

const field = (number: number, value: number, baseType = FitBaseType.Uint8) => ({
  number,
  value,
  baseType,
  size: baseType === FitBaseType.Uint32 ? 4 : baseType === FitBaseType.Uint16 ? 2 : 1
});
const base = new Date('2026-01-01T10:00:00Z');

async function parse(
  options: {
    timer?: number;
    elapsed?: number;
    end?: number;
    records?: boolean;
    imported?: number;
    secondLeg?: boolean;
    firstEnd?: number;
    conflictingIndex?: boolean;
    missingStart?: boolean;
  } = {}
) {
  const e = new FitEncoder(),
    start = FitEncoder.toFitTimestamp(base);
  e.writeMessage(0, [
    field(0, 4, FitBaseType.Enum),
    field(1, 1, FitBaseType.Uint16),
    field(4, start, FitBaseType.Uint32)
  ]);
  if (options.records)
    for (const second of [0, 15, 30, 45, 60])
      e.writeMessage(20, [field(253, start + second, FitBaseType.Uint32), field(3, 165)], 1);
  for (let index = 0; index < 2; index++) {
    e.writeMessage(
      101,
      [
        field(254, options.conflictingIndex && index === 0 ? 1 : index, FitBaseType.Uint16),
        field(253, start + (index ? (options.end ?? 60) : (options.firstEnd ?? 30)), FitBaseType.Uint32),
        ...(options.missingStart && index === 1 ? [] : [field(2, start + index * 30, FitBaseType.Uint32)]),
        field(3, (index ? (options.elapsed ?? 30) : 30) * 1000, FitBaseType.Uint32),
        field(4, (index ? (options.timer ?? 30) : 30) * 1000, FitBaseType.Uint32),
        field(6, 833, FitBaseType.Uint16),
        field(9, 30),
        field(12, 1, FitBaseType.Enum)
      ],
      2
    );
    e.writeMessage(
      19,
      [
        field(254, index, FitBaseType.Uint16),
        field(253, start + (index + 1) * 30, FitBaseType.Uint32),
        field(2, start + index * 30, FitBaseType.Uint32),
        field(7, 30000, FitBaseType.Uint32),
        field(8, 30000, FitBaseType.Uint32),
        field(9, 2500, FitBaseType.Uint32),
        field(15, 165),
        field(32, 1, FitBaseType.Uint16),
        field(35, index, FitBaseType.Uint16)
      ],
      3
    );
  }
  e.writeMessage(
    18,
    [
      field(254, 0, FitBaseType.Uint16),
      field(253, start + 60, FitBaseType.Uint32),
      field(2, start, FitBaseType.Uint32),
      field(5, 5, FitBaseType.Enum),
      field(6, 17, FitBaseType.Enum),
      field(7, 60000, FitBaseType.Uint32),
      field(8, 60000, FitBaseType.Uint32),
      field(9, 5000, FitBaseType.Uint32),
      field(25, 0, FitBaseType.Uint16),
      field(26, 2, FitBaseType.Uint16),
      field(44, 2500, FitBaseType.Uint16),
      ...(options.imported === undefined ? [] : [field(35, options.imported * 10, FitBaseType.Uint16)])
    ],
    4
  );
  e.writeMessage(
    216,
    [field(0, 18, FitBaseType.Uint16), field(1, 0, FitBaseType.Uint16), field(11, 190), field(12, 55), field(13, 165)],
    5
  );
  if (options.secondLeg) {
    e.writeMessage(
      19,
      [
        field(254, 2, FitBaseType.Uint16),
        field(253, start + 120, FitBaseType.Uint32),
        field(2, start + 60, FitBaseType.Uint32),
        field(7, 60000, FitBaseType.Uint32),
        field(8, 60000, FitBaseType.Uint32)
      ],
      3
    );
    e.writeMessage(
      18,
      [
        field(254, 1, FitBaseType.Uint16),
        field(253, start + 120, FitBaseType.Uint32),
        field(2, start + 60, FitBaseType.Uint32),
        field(5, 2, FitBaseType.Enum),
        field(7, 60000, FitBaseType.Uint32),
        field(8, 60000, FitBaseType.Uint32),
        field(25, 2, FitBaseType.Uint16),
        field(26, 1, FitBaseType.Uint16)
      ],
      4
    );
  }
  const bytes = e.close();
  return EventImporterFIT.getFromArrayBuffer(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
    new ActivityParsingOptions({ generateUnitStreams: false })
  );
}

describe('FIT swim chronological bounds', () => {
  it.each([45, 6000])('does not extend generated HR with contradictory timer %s', async timer => {
    const activity = (await parse({ timer })).getFirstActivity();
    expect(activity.getSwimLengths()[1].endDate).toEqual(new Date(+base + 60000));
    expect(activity.getSwimLengths()[1].timerTime?.getValue()).toBe(timer);
    expect(activity.getAllStreams().every(stream => stream.getData().length <= 61)).toBe(true);
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic).toMatchObject({
      method: 'HR',
      score: 1.7
    });
  });

  it('caps a length whose timestamp and durations run into the following session', async () => {
    const [swim, cycling] = (await parse({ timer: 6000, elapsed: 6000, end: 6030, secondLeg: true })).getActivities();
    expect(swim.getSwimLengths()[1].endDate).toEqual(swim.endDate);
    expect(swim.getAllStreams().every(stream => stream.getData().length <= 61)).toBe(true);
    expect(cycling.getSwimLengths()).toHaveLength(0);
    expect(cycling.hasStreamData(DataHeartRate.type)).toBe(false);
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(swim).automatic.score).toBe(1.7);
  });

  it('caps a crossing length at its indexed lap end while retaining its source duration', async () => {
    const activity = (await parse({ firstEnd: 45 })).getFirstActivity();
    expect(activity.getSwimLengths()[0].endDate).toEqual(activity.getLaps()[0].endDate);
    expect(activity.getSwimLengths()[0].timerTime?.getValue()).toBe(30);
  });

  it('does not use a corrupt distant timestamp to assign a length to a lap after its active interval', async () => {
    const activity = (
      await parse({ firstEnd: 86400, conflictingIndex: true, records: true, imported: 42.5 })
    ).getFirstActivity();
    expect(activity.getSwimLengths()[0].lapIndex).toBeNull();
    expect(activity.hasStreamData(DataDistance.type)).toBe(false);
    expect(activity.getStreamData(DataHeartRate.type).filter(value => value !== null)).toEqual([
      165, 165, 165, 165, 165
    ]);
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic).toMatchObject({
      method: 'IMPORTED',
      score: 42.5
    });
  });

  it('keeps paused active sampling separate from the later chronological endpoint', async () => {
    const activity = (await parse({ timer: 15 })).getFirstActivity();
    expect(activity.getSwimLengths()[1].endDate).toEqual(activity.endDate);
    expect(activity.getSwimLengths()[1].timerTime?.getValue()).toBe(15);
    expect(
      activity
        .getStreamData(DataHeartRate.type)
        .slice(46)
        .every(value => value === null)
    ).toBe(true);
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic.score).toBe(1.3);
  });

  it.each([
    { end: 30, elapsed: 30, timer: 45 },
    { end: 30, elapsed: 0, timer: 30 }
  ])('recovers an invalid ending timestamp using positive elapsed then timer: %j', async options => {
    const activity = (await parse(options)).getFirstActivity();
    expect(activity.getSwimLengths()[1].endDate).toEqual(activity.endDate);
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic.score).toBe(1.7);
  });

  it('retains a precise subsecond endpoint and finite final distance on the 1 Hz grid', async () => {
    const activity = (await parse({ end: 31, elapsed: 0.5, timer: 0.5 })).getFirstActivity();
    expect(+activity.getSwimLengths()[1].endDate - +base).toBe(30500);
    expect(activity.getStreamData(DataDistance.type)[31]).toBe(50);
    expect(
      activity
        .getStreamData(DataDistance.type)
        .filter(value => value !== null)
        .every(Number.isFinite)
    ).toBe(true);
  });

  it('recovers a missing start using a positive timer when elapsed is zero', async () => {
    const activity = (await parse({ missingStart: true, elapsed: 0 })).getFirstActivity();
    expect(activity.getSwimLengths()).toHaveLength(2);
    expect(+activity.getSwimLengths()[1].startDate - +base).toBe(30000);
    expect(activity.getSwimLengths()[1].endDate).toEqual(activity.endDate);
  });

  it('interpolates fractional lengths by elapsed time, including the final partial second', async () => {
    const activity = (await parse({ end: 33, elapsed: 2.5, timer: 2.5 })).getFirstActivity();
    expect(activity.getStreamData(DataDistance.type).slice(30, 34)).toEqual([25, 35, 45, 50]);
  });

  it.each([undefined, 0, 42.5])('preserves recorded HR and imported score %s across regeneration', async imported => {
    const activity = (await parse({ records: true, timer: 6000, imported })).getFirstActivity();
    const control = (await parse({ records: true, imported })).getFirstActivity();
    for (let repeat = 0; repeat < 2; repeat++) {
      expect(activity.getStreamData(DataHeartRate.type)).toEqual(control.getStreamData(DataHeartRate.type));
      expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic).toEqual(
        ActivityUtilities.getTrainingStressScoreEvaluations(control).automatic
      );
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    }
  });
});
