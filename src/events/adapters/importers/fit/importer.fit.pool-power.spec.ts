import { FitBaseType as B, FitEncoder } from 'fit-file-parser/encoder';
import { EventImporterFIT } from './importer.fit';
import { EventImporterJSON } from '../json/importer.json';
import { ActivityParsingOptions, ActivityParsingOptionsInput } from '../../../../activities/activity-parsing-options';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { DataPower } from '../../../../data/data.power';
import { DataPowerNormalized } from '../../../../data/data.power-normalized';
import { DataDistance } from '../../../../data/data.distance';
import { DataSpeed } from '../../../../data/data.speed';
import { DataHeartRate } from '../../../../data/data.heart-rate';

const field = (number: number, value: number, baseType = B.Uint8) => ({
  number,
  value,
  baseType,
  size: baseType === B.Uint32 ? 4 : baseType === B.Uint16 ? 2 : 1
});
const start = FitEncoder.toFitTimestamp(new Date('2026-01-01T10:00:00Z'));
type Observation = { second: number; power?: number; hr?: number };

async function pool(
  records: Observation[],
  options: {
    laps?: number;
    sessions?: number;
    overlap?: boolean;
    truncateLengths?: boolean;
    ftp?: number;
    imported?: number;
    paused?: boolean;
    normalizedPower?: number;
    parse?: ActivityParsingOptionsInput;
  } = {}
) {
  const encoder = new FitEncoder(),
    laps = options.laps ?? 2;
  encoder.writeMessage(0, [field(0, 4, B.Enum), field(1, 1, B.Uint16), field(4, start, B.Uint32)]);
  for (const record of records)
    encoder.writeMessage(
      20,
      [
        field(253, start + record.second, B.Uint32),
        ...(record.power === undefined ? [] : [field(7, record.power, B.Uint16)]),
        ...(record.hr === undefined ? [] : [field(3, record.hr)])
      ],
      1
    );
  if (options.paused)
    for (const [second, type] of [
      [0, 0],
      [40, 1],
      [60, 0],
      [120, 4]
    ]) {
      encoder.writeMessage(21, [field(253, start + second, B.Uint32), field(0, 0, B.Enum), field(1, type, B.Enum)], 5);
    }
  for (let session = 0; session < (options.sessions ?? 1); session++) {
    const from = start + (options.overlap ? 0 : session * 120);
    for (let lap = 0; lap < laps; lap++) {
      const seconds = 120 / laps,
        duration = options.truncateLengths ? seconds - 20 : seconds;
      encoder.writeMessage(
        101,
        [
          field(254, session * laps + lap, B.Uint16),
          field(253, from + lap * seconds + duration, B.Uint32),
          field(2, from + lap * seconds, B.Uint32),
          field(3, duration * 1000, B.Uint32),
          field(4, duration * 1000, B.Uint32),
          field(6, 1000, B.Uint16),
          field(12, 1, B.Enum)
        ],
        2
      );
      encoder.writeMessage(
        19,
        [
          field(254, session * laps + lap, B.Uint16),
          field(253, from + (lap + 1) * seconds, B.Uint32),
          field(2, from + lap * seconds, B.Uint32),
          field(7, seconds * 1000, B.Uint32),
          field(8, seconds * 1000, B.Uint32),
          field(9, 2500, B.Uint32),
          field(32, 1, B.Uint16),
          field(35, session * laps + lap, B.Uint16)
        ],
        3
      );
    }
    encoder.writeMessage(
      18,
      [
        field(254, session, B.Uint16),
        field(253, from + 120, B.Uint32),
        field(2, from, B.Uint32),
        field(5, 5, B.Enum),
        field(6, 17, B.Enum),
        field(7, 120000, B.Uint32),
        field(8, options.paused ? 100000 : 120000, B.Uint32),
        field(9, laps * 2500, B.Uint32),
        field(25, session * laps, B.Uint16),
        field(26, laps, B.Uint16),
        field(44, 2500, B.Uint16),
        ...(options.ftp === undefined ? [] : [field(45, options.ftp, B.Uint16)]),
        ...(options.normalizedPower === undefined ? [] : [field(34, options.normalizedPower, B.Uint16)]),
        ...(options.imported === undefined ? [] : [field(35, options.imported * 10, B.Uint16)])
      ],
      4
    );
  }
  const bytes = encoder.close();
  return EventImporterFIT.getFromArrayBuffer(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
    new ActivityParsingOptions({ generateUnitStreams: false, ...options.parse })
  );
}

describe('FIT recorded pool power', () => {
  it.each([1, 2])(
    'preserves observations and gaps with %s lap(s), including after JSON and regeneration',
    async laps => {
      const activity = (
        await pool(
          [
            { second: 5, power: 120 },
            { second: 8, power: 0 },
            { second: 10, hr: 100 },
            { second: 65, power: 180 },
            { second: 70, power: 65535 },
            { second: 120, power: 90 }
          ],
          { laps }
        )
      ).getFirstActivity();
      for (const candidate of [
        activity,
        EventImporterJSON.getActivityFromJSON(JSON.parse(JSON.stringify(activity.toJSON())))
      ]) {
        for (let repeat = 0; repeat < 2; repeat++) {
          const power = candidate.getStreamData(DataPower.type);
          expect(power[5]).toBe(120);
          expect(power[8]).toBe(0);
          expect(power[10]).toBeNull();
          expect(power[65]).toBe(180);
          expect(power[70]).toBeNull();
          expect(power[120]).toBe(90);
          expect(power.filter(value => typeof value === 'number')).toHaveLength(4);
          expect(candidate.getStat(DataPowerNormalized.type)).toBeUndefined();
          ActivityUtilities.generateMissingStreamsAndStatsForActivity(candidate);
        }
      }
    }
  );

  it('does not extend length-derived streams to independent power timestamps', async () => {
    const activity = (
      await pool(
        [
          { second: 50, power: 120 },
          { second: 119, power: 180 }
        ],
        { truncateLengths: true }
      )
    ).getFirstActivity();
    const control = (await pool([], { truncateLengths: true })).getFirstActivity();
    for (const candidate of [
      activity,
      EventImporterJSON.getActivityFromJSON(JSON.parse(JSON.stringify(activity.toJSON())))
    ]) {
      for (let repeat = 0; repeat < 2; repeat++) {
        for (const type of [DataDistance.type, DataSpeed.type]) {
          expect(candidate.getStreamData(type)).toEqual(control.getStreamData(type));
        }
        ActivityUtilities.generateMissingStreamsAndStatsForActivity(candidate);
      }
    }
  });

  it('assigns a shared session boundary only to the starting leg and keeps the terminal sample', async () => {
    const activities = (
      await pool(
        [
          { second: -1, power: 999 },
          { second: 20, power: 100 },
          { second: 120, power: 200 },
          { second: 220, power: 300 },
          { second: 240, power: 400 },
          { second: 241, power: 999 }
        ],
        { sessions: 2 }
      )
    ).getActivities();
    expect(activities[0].getStream(DataPower.type).getData(true, true)).toEqual([100]);
    expect(activities[1].getStream(DataPower.type).getData(true, true)).toEqual([200, 300, 400]);
  });

  it('does not assign power across overlapping session interiors', async () => {
    const activities = (await pool([{ second: 20, power: 100 }], { sessions: 2, overlap: true })).getActivities();
    expect(activities.every(activity => !activity.hasStreamData(DataPower.type))).toBe(true);
  });

  it('coalesces complementary records and retains the last explicit power value', async () => {
    const activity = (
      await pool([
        { second: 5, power: 120 },
        { second: 5, hr: 100 },
        { second: 5, power: 0 }
      ])
    ).getFirstActivity();
    expect(activity.getStream(DataPower.type).getData(true, true)).toEqual([0]);
    expect(activity.getStreamData(DataHeartRate.type)[5]).toBe(100);
  });

  it.each([undefined, 0, 42.5])('keeps existing threshold/imported-score eligibility, imported=%s', async imported => {
    const records = Array.from({ length: 121 }, (_, second) => ({ second, power: 200 }));
    const uncalibrated = (await pool(records, { imported })).getFirstActivity();
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(uncalibrated).automatic).toMatchObject(
      imported === undefined ? { method: null, score: null } : { method: 'IMPORTED', score: imported }
    );
    const calibrated = (await pool(records, { imported, ftp: 200 })).getFirstActivity();
    for (let repeat = 0; repeat < 2; repeat++) {
      expect(ActivityUtilities.getTrainingStressScoreEvaluations(calibrated).automatic).toMatchObject(
        imported === undefined ? { method: 'POWER', score: 3.3 } : { method: 'IMPORTED', score: imported }
      );
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(calibrated);
    }
  });

  it('honors the selected stream allowlist', async () => {
    const records = [{ second: 5, power: 120, hr: 100 }];
    const activity = (
      await pool(records, { parse: { streams: { includeTypes: [DataHeartRate.type] } } })
    ).getFirstActivity();
    expect(activity.hasStreamData(DataPower.type)).toBe(false);
    const powerOnly = (
      await pool(records, { parse: { streams: { includeTypes: [DataPower.type] } } })
    ).getFirstActivity();
    expect(powerOnly.getAllStreams().map(stream => stream.type)).toEqual([DataPower.type]);
    expect(powerOnly.getStreamData(DataPower.type)[5]).toBe(120);
  });

  it('retains paused power as recorded while excluding it from calculated NP and TSS', async () => {
    const records = Array.from({ length: 121 }, (_, second) => ({
      second,
      power: second >= 40 && second < 60 ? 900 : 200
    }));
    const activity = (await pool(records, { paused: true, ftp: 200 })).getFirstActivity();
    for (let repeat = 0; repeat < 2; repeat++) {
      expect(activity.getStreamData(DataPower.type)[50]).toBe(900);
      expect(activity.getStat(DataPowerNormalized.type)?.getValue()).toBe(200);
      expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic).toMatchObject({
        method: 'POWER',
        score: 2.8
      });
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    }
  });

  it('keeps device NP authoritative when recorded power is sparse', async () => {
    const activity = (await pool([{ second: 10, power: 200 }], { normalizedPower: 220, ftp: 200 })).getFirstActivity();
    expect(activity.getStat(DataPowerNormalized.type)?.getValue()).toBe(220);
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic).toMatchObject({
      method: 'POWER',
      score: 4
    });
  });

  it.each([0, undefined, 65535])(
    'does not invent positive power from zero/absent/invalid readings: %s',
    async power => {
      const activity = (
        await pool(
          Array.from({ length: 121 }, (_, second) => ({ second, power, hr: 100 })),
          { ftp: 200 }
        )
      ).getFirstActivity();
      if (power === 0) {
        expect(activity.getStream(DataPower.type).getData(true, true)).toEqual(Array(121).fill(0));
        expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic).toMatchObject({
          method: 'POWER',
          score: 0
        });
      } else {
        expect(activity.hasStreamData(DataPower.type)).toBe(false);
        expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic.score).toBeNull();
      }
    }
  );
});
