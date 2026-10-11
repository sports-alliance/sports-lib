import { FitBaseType, FitEncoder } from 'fit-file-parser/encoder';
import { EventImporterFIT } from './importer.fit';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { DataDistance } from '../../../../data/data.distance';
import { DataHeartRate } from '../../../../data/data.heart-rate';

const field = (number: number, value: number, baseType = FitBaseType.Uint8) => ({
  number,
  value,
  baseType,
  size: baseType === FitBaseType.Uint32 ? 4 : baseType === FitBaseType.Uint16 ? 2 : 1
});
const startDate = new Date('2026-01-01T10:00:00Z');

async function swim(
  options: {
    laps?: number;
    invalidEnds?: boolean;
    idle?: boolean;
    sessions?: number;
    overlappingSessions?: boolean;
    conflictingIndex?: boolean;
    records?: boolean;
    imported?: number;
    missingLengthStarts?: boolean;
    outsideIndex?: boolean;
    noDistance?: boolean;
    noPoolLength?: boolean;
    subsecond?: boolean;
    zeroElapsed?: boolean;
    lastSessionCycling?: boolean;
    crossingBoundary?: boolean;
    recordedDistance?: boolean;
    recordedPower?: boolean;
    extraRecord?: boolean;
    idleOnly?: boolean;
    ambiguousLapIndexes?: boolean;
    laggingLastLap?: boolean;
    recordedDistanceTotal?: number;
  } = {}
) {
  const encoder = new FitEncoder(),
    start = FitEncoder.toFitTimestamp(startDate),
    lapCount = options.laps ?? 2;
  encoder.writeMessage(0, [
    field(0, 4, FitBaseType.Enum),
    field(1, 1, FitBaseType.Uint16),
    field(4, start, FitBaseType.Uint32)
  ]);
  for (let session = 0; session < (options.sessions ?? 1); session++) {
    const sessionStart = start + (options.overlappingSessions ? 0 : session * 3600);
    const cycling = options.lastSessionCycling && session > 0;
    if (cycling)
      for (const second of [500, 600])
        encoder.writeMessage(20, [field(253, sessionStart + second, FitBaseType.Uint32), field(3, 165)], 1);
    if (options.records)
      for (const second of [0, 600, 1800, 3000, 3600, ...(options.extraRecord ? [3610] : [])])
        encoder.writeMessage(
          20,
          [
            field(253, sessionStart + second, FitBaseType.Uint32),
            field(3, 165),
            ...(options.recordedDistance
              ? [
                  field(
                    5,
                    Math.round((second / 3600) * (options.recordedDistanceTotal ?? 1000) * 100),
                    FitBaseType.Uint32
                  )
                ]
              : []),
            ...(options.recordedPower ? [field(7, 180, FitBaseType.Uint16)] : [])
          ],
          1
        );
    for (let length = 0; !cycling && length < 60 + (options.idle ? 1 : 0); length++) {
      const time = sessionStart + length * 60 - (options.crossingBoundary && length === 30 ? 20 : 0),
        duration = length === 60 ? 15 : options.subsecond ? 0.5 : 60;
      encoder.writeMessage(
        101,
        [
          field(
            254,
            options.outsideIndex && length === 30
              ? 9999
              : options.conflictingIndex && length === 30
                ? 0
                : session * 60 + length,
            FitBaseType.Uint16
          ),
          field(253, options.invalidEnds ? sessionStart : Math.ceil(time + duration), FitBaseType.Uint32),
          ...(options.missingLengthStarts ? [] : [field(2, time, FitBaseType.Uint32)]),
          field(3, duration * 1000, FitBaseType.Uint32),
          field(4, duration * 1000, FitBaseType.Uint32),
          field(6, length === 60 ? 0 : 417, FitBaseType.Uint16),
          field(12, length === 60 || options.idleOnly ? 0 : 1, FitBaseType.Enum)
        ],
        2
      );
      if (((length + 1) % (60 / lapCount) === 0 && !(options.idle && length === 59)) || length === 60) {
        const lap = Math.min(lapCount - 1, Math.floor(length / (60 / lapCount)));
        const lapStart =
          sessionStart +
          (lap * 3600) / lapCount +
          (options.laggingLastLap && lap === lapCount - 1 ? 3600 / lapCount : 0);
        const elapsed = options.laggingLastLap
          ? lap === lapCount - 1
            ? 15
            : 3600
          : 3600 / lapCount + (options.idle && lap === lapCount - 1 ? 15 : 0);
        encoder.writeMessage(
          19,
          [
            field(254, session * lapCount + lap, FitBaseType.Uint16),
            field(253, options.invalidEnds ? sessionStart : lapStart + elapsed, FitBaseType.Uint32),
            field(2, lapStart, FitBaseType.Uint32),
            field(7, options.zeroElapsed ? 0 : elapsed * 1000, FitBaseType.Uint32),
            field(8, elapsed * 1000, FitBaseType.Uint32),
            ...(options.noDistance ? [] : [field(9, 150000 / lapCount, FitBaseType.Uint32)]),
            ...(options.laggingLastLap
              ? []
              : [
                  field(
                    32,
                    (options.ambiguousLapIndexes ? 60 : 60 / lapCount) + (options.idle && lap === lapCount - 1 ? 1 : 0),
                    FitBaseType.Uint16
                  ),
                  field(35, options.ambiguousLapIndexes ? 0 : session * 60 + (lap * 60) / lapCount, FitBaseType.Uint16)
                ]),
            field(15, 165)
          ],
          3
        );
      }
    }
    const elapsed = 3600 + (options.idle ? 15 : 0);
    encoder.writeMessage(
      18,
      [
        field(254, session, FitBaseType.Uint16),
        field(253, options.invalidEnds || cycling ? sessionStart : sessionStart + elapsed, FitBaseType.Uint32),
        field(2, sessionStart, FitBaseType.Uint32),
        field(5, cycling ? 2 : 5, FitBaseType.Enum),
        field(6, cycling ? 0 : 17, FitBaseType.Enum),
        field(7, options.zeroElapsed ? 0 : elapsed * 1000, FitBaseType.Uint32),
        field(8, elapsed * 1000, FitBaseType.Uint32),
        field(25, session * lapCount, FitBaseType.Uint16),
        field(26, lapCount, FitBaseType.Uint16),
        ...(options.noDistance || options.noPoolLength || cycling ? [] : [field(44, 2500, FitBaseType.Uint16)]),
        ...(options.imported === undefined ? [] : [field(35, options.imported * 10, FitBaseType.Uint16)])
      ],
      4
    );
    encoder.writeMessage(
      216,
      [
        field(0, 18, FitBaseType.Uint16),
        field(1, session, FitBaseType.Uint16),
        field(11, 190),
        field(12, 55),
        field(13, 165)
      ],
      5
    );
  }
  const bytes = encoder.close();
  return EventImporterFIT.getFromArrayBuffer(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
    new ActivityParsingOptions({ generateUnitStreams: false })
  );
}

describe('FIT pool length ownership', () => {
  it.each([1, 2])('retains all boundary lengths and generates streams with %s lap(s)', async laps => {
    const activity = (await swim({ laps })).getFirstActivity();
    expect(activity.getSwimLengths()).toHaveLength(60);
    expect(activity.getSwimLengths().filter(length => length.lapIndex === laps)).toHaveLength(60 / laps);
    expect(activity.getStat(DataDistance.type)?.getValue()).toBeCloseTo(1500, 6);
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic).toMatchObject({
      method: 'HR',
      score: 100
    });
  });
  it('repairs invalid session and lap end timestamps consistently from file durations', async () => {
    const activity = (await swim({ invalidEnds: true })).getFirstActivity();
    expect(activity.startDate).toEqual(startDate);
    expect(activity.endDate.getTime() - activity.startDate.getTime()).toBe(3600000);
    expect(activity.getSwimLengths()).toHaveLength(60);
    expect(activity.getLaps().map(lap => lap.endDate.getTime() - lap.startDate.getTime())).toEqual([1800000, 1800000]);
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic.score).toBe(100);
  });
  it('retains final idle lengths at the exact session boundary', async () => {
    const activity = (await swim({ idle: true })).getFirstActivity();
    expect(activity.getSwimLengths()).toHaveLength(61);
    expect(activity.getSwimLengths()[60].type).toBe('idle');
    expect(activity.getSwimLengths()[60].lapIndex).toBe(2);
    expect(activity.getSwimLengths()[60].distance).toBeNull();
    expect(activity.getStream(DataDistance.type).getData()[3600]).toBeCloseTo(1500, 6);
    expect(activity.getStream(DataDistance.type).getData()[3615]).toBeCloseTo(1500, 6);
  });
  it('keeps adjacent sessions separate when a length ends at their shared boundary', async () => {
    const activities = (await swim({ sessions: 2, laps: 1 })).getActivities();
    expect(activities).toHaveLength(2);
    for (const activity of activities) {
      expect(activity.getSwimLengths()).toHaveLength(60);
      expect(
        activity
          .getSwimLengths()
          .every(length => length.startDate >= activity.startDate && length.startDate < activity.endDate)
      ).toBe(true);
      expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic.score).toBe(100);
    }
  });
  it('does not assign a length to a lap when explicit indexes contradict its time window', async () => {
    const activity = (await swim({ conflictingIndex: true })).getFirstActivity();
    expect(activity.getSwimLengths()).toHaveLength(60);
    expect(activity.getSwimLengths()[30].lapIndex).toBeNull();
  });
  it('does not duplicate lengths across overlapping session windows', async () => {
    const activities = (await swim({ sessions: 2, overlappingSessions: true })).getActivities();
    expect(activities.every(activity => activity.getSwimLengths().length === 0)).toBe(true);
  });
  it('reconstructs a missing length start only from its own ending timestamp and duration', async () => {
    const activity = (await swim({ laps: 1, missingLengthStarts: true })).getFirstActivity();
    expect(activity.getSwimLengths()).toHaveLength(60);
    expect(activity.getSwimLengths()[0].startDate).toEqual(startDate);
    expect(activity.getStream(DataDistance.type).getData(true, true).slice(-1)[0]).toBe(1500);
  });
  it('does not synthesize a partial distance total from contradictory length indexes', async () => {
    const activity = (await swim({ outsideIndex: true })).getFirstActivity();
    expect(activity.getSwimLengths()[30].lapIndex).toBeNull();
    expect(activity.hasStreamData(DataDistance.type)).toBe(false);
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic.score).toBeNull();
  });
  it('uses active length count for lap distance when pool length is absent', async () => {
    const activity = (await swim({ idle: true, noPoolLength: true })).getFirstActivity();
    expect(activity.getStream(DataDistance.type).getData(true, true).slice(-1)[0]).toBeCloseTo(1500, 6);
  });
  it('leaves distance unavailable when neither lengths, pool nor laps supply it', async () => {
    const activity = (await swim({ noDistance: true, laps: 1 })).getFirstActivity();
    expect(activity.hasStreamData(DataDistance.type)).toBe(false);
  });
  it('generates finite samples for positive subsecond lengths', async () => {
    const activity = (await swim({ subsecond: true, laps: 1 })).getFirstActivity();
    expect(activity.getStream(DataDistance.type).getData(true, true).every(Number.isFinite)).toBe(true);
  });
  it('repairs invalid pool ends with the positive file timer when elapsed is zero', async () => {
    const activity = (await swim({ zeroElapsed: true, invalidEnds: true })).getFirstActivity();
    expect(activity.getSwimLengths()).toHaveLength(60);
    expect(+activity.endDate - +activity.startDate).toBe(3600000);
  });
  it('repairs a non-swimming end from its own duration instead of borrowing whole-file records', async () => {
    const activities = (await swim({ sessions: 2, lastSessionCycling: true })).getActivities();
    expect(+activities[1].startDate - +startDate).toBe(3600000);
    expect(+activities[1].endDate - +startDate).toBe(7200000);
    expect(activities[1].getSwimLengths()).toHaveLength(0);
  });
  it('uses an unambiguous length index when the length overlaps its indexed lap boundary', async () => {
    const activity = (await swim({ crossingBoundary: true })).getFirstActivity();
    expect(activity.getSwimLengths()[30].lapIndex).toBe(2);
    expect(activity.getStream(DataDistance.type).getData(true, true).slice(-1)[0]).toBe(1500);
  });
  it('preserves real recorded distance when enabling length generation for a single lap', async () => {
    const activity = (
      await swim({ laps: 1, records: true, recordedDistance: true, recordedPower: true })
    ).getFirstActivity();
    expect(activity.getStream(DataDistance.type).getData(true, true).slice(-1)[0]).toBe(1000);
    expect(
      activity
        .getStream('Power')
        .getData(true, true)
        .every(value => value === 180)
    ).toBe(true);
    expect(activity.getSwimLengths()).toHaveLength(60);
    expect(activity.getStream(DataHeartRate.type).getData(true, true)).toHaveLength(5);
  });
  it('keeps real records extending beyond an invalid pool end repaired from elapsed', async () => {
    const activity = (await swim({ invalidEnds: true, records: true, extraRecord: true })).getFirstActivity();
    expect(+activity.endDate - +startDate).toBe(3610000);
    expect(activity.getStream(DataHeartRate.type).getData(true, true)).toHaveLength(6);
  });
  it('does not extend an invalid pool end into the next session records', async () => {
    const activities = (
      await swim({ sessions: 2, invalidEnds: true, records: true, extraRecord: true })
    ).getActivities();
    expect(+activities[0].endDate - +startDate).toBe(3600000);
  });
  it('does not fabricate a zero distance stream from idle-only lengths', async () => {
    const activity = (await swim({ laps: 1, idleOnly: true })).getFirstActivity();
    expect(activity.getSwimLengths()).toHaveLength(60);
    expect(activity.hasStreamData(DataDistance.type)).toBe(false);
  });
  it('preserves sparse recorded HR even when every pool length has ambiguous lap ownership', async () => {
    const activity = (await swim({ ambiguousLapIndexes: true, records: true })).getFirstActivity();
    expect(activity.getSwimLengths().every(length => length.lapIndex === null)).toBe(true);
    for (let repeat = 0; repeat < 2; repeat++) {
      expect(activity.getStream(DataHeartRate.type).getData(true, true)).toHaveLength(5);
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    }
  });
  it('uses the recorded counter when lap timing leaves a positive-distance lap with only rest', async () => {
    const activity = (
      await swim({
        idle: true,
        laggingLastLap: true,
        records: true,
        recordedDistance: true,
        recordedDistanceTotal: 1500
      })
    ).getFirstActivity();
    expect(activity.getSwimLengths()).toHaveLength(61);
    expect(
      activity
        .getSwimLengths()
        .filter(length => length.lapIndex === 2)
        .every(length => length.type === 'idle')
    ).toBe(true);
    expect(activity.getStream(DataDistance.type).getData(true, true).slice(-1)[0]).toBe(1500);
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    expect(activity.getStream(DataDistance.type).getData(true, true).slice(-1)[0]).toBe(1500);
  });
  it('does not generate an incomplete counter for lagging lap timing without recorded distance', async () => {
    const activity = (await swim({ idle: true, laggingLastLap: true })).getFirstActivity();
    expect(activity.getSwimLengths()).toHaveLength(61);
    expect(activity.hasStreamData(DataDistance.type)).toBe(false);
  });
  it.each([0, 42.5])('preserves recorded HR coverage and imported score %s through regeneration', async imported => {
    const activity = (await swim({ laps: 1, records: true, imported })).getFirstActivity();
    for (let repeat = 0; repeat < 2; repeat++) {
      expect(activity.getStream(DataHeartRate.type).getData(true, true)).toEqual([165, 165, 165, 165, 165]);
      expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic).toMatchObject({
        method: 'IMPORTED',
        score: imported
      });
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    }
  });
});
