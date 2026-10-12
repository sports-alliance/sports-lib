import { FitBaseType as B, FitEncoder } from 'fit-file-parser/encoder';
import { EventImporterFIT } from './importer.fit';
import { EventImporterJSON } from '../json/importer.json';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { DataElapsedTime } from '../../../../data/data.elapsed-time';
import { DataDuration } from '../../../../data/data.duration';
import { DataTimerTime } from '../../../../data/data.timer-time';
import { DataPause } from '../../../../data/data.pause';
import { DataHeartRate } from '../../../../data/data.heart-rate';
import { DataFTP } from '../../../../data/data.ftp';
import { DataPowerNormalized } from '../../../../data/data.power-normalized';
import { ActivityTypes } from '../../../../activities/activity.types';

const base = new Date('2026-01-01T10:00:00Z');
const timestamp = FitEncoder.toFitTimestamp(base);
const end = 3 * 86400 + 3600;
const field = (number: number, value: number, baseType = B.Uint8) => ({
  number,
  value,
  baseType,
  size: baseType === B.Uint32 ? 4 : baseType === B.Uint16 ? 2 : 1
});

async function parse(
  settings: { completeElapsed?: boolean; malformed?: boolean; imported?: number; cap?: number; cycling?: boolean } = {}
) {
  const encoder = new FitEncoder();
  encoder.writeMessage(0, [field(0, 4, B.Enum), field(1, 23, B.Uint16), field(4, timestamp, B.Uint32)]);
  encoder.writeMessage(3, [field(4, 700, B.Uint16)], 4);
  for (const from of [0, end - 3600])
    for (let second = 0; second <= 3600; second += settings.cycling ? 1 : 60) {
      encoder.writeMessage(
        20,
        [
          field(253, timestamp + from + second, B.Uint32),
          field(3, 165),
          ...(settings.cycling ? [field(7, 250, B.Uint16)] : [])
        ],
        1
      );
    }
  for (const [index, second] of [0, 3600, end - 3600, end].entries()) {
    encoder.writeMessage(
      21,
      [
        field(253, timestamp + second, B.Uint32),
        field(0, 0, B.Enum),
        field(1, settings.malformed && index === 1 ? 0 : index % 2 ? 1 : 0, B.Enum)
      ],
      2
    );
  }
  encoder.writeMessage(
    18,
    [
      field(254, 0, B.Uint16),
      field(253, timestamp + end, B.Uint32),
      field(2, timestamp, B.Uint32),
      field(5, settings.cycling ? 2 : 17, B.Enum),
      field(7, settings.completeElapsed ? end * 1000 : 7200650, B.Uint32),
      field(8, 7200350, B.Uint32),
      field(11, 1400, B.Uint16),
      ...(settings.cycling ? [field(45, 250, B.Uint16)] : []),
      ...(settings.imported === undefined ? [] : [field(35, settings.imported * 10, B.Uint16)])
    ],
    3
  );
  encoder.writeMessage(
    216,
    [field(0, 18, B.Uint16), field(1, 0, B.Uint16), field(11, 190), field(12, 55), field(13, 165)],
    5
  );
  const bytes = encoder.close();
  return EventImporterFIT.getFromArrayBuffer(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
    new ActivityParsingOptions({
      generateUnitStreams: false,
      ...(settings.cap ? { maxActivityDurationDays: settings.cap } : {})
    })
  );
}

describe('FIT multiday session chronology', () => {
  it('retains later records and elapsed time while keeping pauses out of active duration and load', async () => {
    const event = await parse(),
      activity = event.getFirstActivity();
    const control = (await parse({ completeElapsed: true })).getFirstActivity();
    expect((+activity.endDate - +activity.startDate) / 1000).toBe(end);
    expect(activity.getDuration().getValue()).toBe(7200.35);
    expect(activity.getTimer().getValue()).toBe(7200.35);
    expect(activity.getStat(DataElapsedTime.type)?.getValue()).toBe(end);
    expect(activity.getPause().getValue()).toBe(end - 7200.35);
    expect(activity.getStream(DataHeartRate.type).getData(true, true)).toEqual(Array(122).fill(165));
    const evaluations = ActivityUtilities.getTrainingStressScoreEvaluations(activity);
    expect(evaluations).toEqual(ActivityUtilities.getTrainingStressScoreEvaluations(control));
    expect(evaluations.automatic).toMatchObject({ method: 'HR' });
    expect(evaluations.automatic.score).toBeGreaterThan(190);
    expect(evaluations.automatic.score).toBeLessThanOrEqual(200);
    expect(evaluations.met).toMatchObject({ method: 'MET', score: 200, estimated: true });
    const restored = EventImporterJSON.getEventFromJSON(event.toJSON()).getFirstActivity();
    expect(restored.startDate).toEqual(activity.startDate);
    expect(restored.endDate).toEqual(activity.endDate);
    for (const type of [DataDuration.type, DataTimerTime.type, DataElapsedTime.type, DataPause.type]) {
      expect(activity.getStat(type)).toBeDefined();
      expect(restored.getStat(type)?.getValue()).toBe(activity.getStat(type)?.getValue());
    }
    expect(restored.getStream(DataHeartRate.type).getData(true, true)).toEqual(Array(122).fill(165));
  });

  it('keeps two hours of calibrated cycling power at 200 TSS across the long pause', async () => {
    const activity = (await parse({ cycling: true })).getFirstActivity();
    const control = (await parse({ cycling: true, completeElapsed: true })).getFirstActivity();
    expect(activity.type).toBe(ActivityTypes.Cycling);
    expect(activity.getStat(DataElapsedTime.type)?.getValue()).toBe(end);
    expect(activity.getStat(DataDuration.type)?.getValue()).toBe(7200.35);
    expect(activity.getStat(DataTimerTime.type)?.getValue()).toBe(7200.35);
    expect(activity.getStat(DataPause.type)?.getValue()).toBe(end - 7200.35);
    expect(activity.getStat(DataFTP.type)?.getValue()).toBe(250);
    expect(activity.getStat(DataPowerNormalized.type)?.getValue()).toBe(250);
    const evaluations = ActivityUtilities.getTrainingStressScoreEvaluations(activity);
    expect(evaluations).toEqual(ActivityUtilities.getTrainingStressScoreEvaluations(control));
    expect(evaluations.automatic).toMatchObject({ method: 'POWER', score: 200 });
    expect(evaluations.hr).toMatchObject({ method: 'HR', score: 200 });
    expect(evaluations.met).toMatchObject({ method: 'MET', score: 200, estimated: true });
  });

  it.each([0, 42.5])('keeps imported score %s authoritative', async imported => {
    const activity = (await parse({ imported })).getFirstActivity();
    expect((+activity.endDate - +activity.startDate) / 1000).toBe(end);
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic).toMatchObject({
      score: imported,
      method: 'IMPORTED'
    });
  });

  it.each([{ malformed: true }, { cap: 1 }])(
    'retains existing clipping when proof or duration cap fails: %j',
    async settings => {
      const activity = (await parse(settings)).getFirstActivity();
      expect((+activity.endDate - +activity.startDate) / 1000).toBe(7200.65);
      expect(activity.getStream(DataHeartRate.type).getData(true, true)).toEqual(Array(61).fill(165));
    }
  );
});
