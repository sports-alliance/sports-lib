import { FitBaseType as B, FitEncoder } from 'fit-file-parser/encoder';
import { EventImporterFIT } from './importer.fit';
import { EventImporterJSON } from '../json/importer.json';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { DataDuration } from '../../../../data/data.duration';
import { DataElapsedTime } from '../../../../data/data.elapsed-time';
import { DataTimerTime } from '../../../../data/data.timer-time';
import { DataPause } from '../../../../data/data.pause';
import { DataHeartRate } from '../../../../data/data.heart-rate';
import { DataPower } from '../../../../data/data.power';
import { DataDistance } from '../../../../data/data.distance';
import { DataTrainingStressScore } from '../../../../data/data.training-stress-score';

const start = FitEncoder.toFitTimestamp(new Date('2026-01-01T10:00:00Z'));
const field = (number: number, value: number, baseType = B.Uint8) => ({
  number,
  value,
  baseType,
  size: baseType === B.Uint32 ? 4 : baseType === B.Uint16 ? 2 : 1
});
type Settings = {
  sport?: number;
  saved?: number;
  elapsed?: number;
  completeElapsed?: boolean;
  malformedStop?: boolean;
  postStop?: boolean;
  imported?: number;
};
async function parse(settings: Settings = {}) {
  const encoder = new FitEncoder();
  encoder.writeMessage(0, [field(0, 4, B.Enum), field(1, 1, B.Uint16), field(4, start, B.Uint32)]);
  encoder.writeMessage(3, [field(4, 700, B.Uint16)], 4);
  for (let second = 0; second <= (settings.postStop ? 102 : 101); second++) {
    encoder.writeMessage(
      20,
      [
        field(253, start + second, B.Uint32),
        field(3, second === 101 ? 90 : 82),
        field(7, second === 101 ? 275 : 250, B.Uint16),
        field(5, second * 100, B.Uint32)
      ],
      1
    );
  }
  for (const [index, second] of [0, 40, 60, 101].entries()) {
    encoder.writeMessage(
      21,
      [
        field(253, start + second, B.Uint32),
        field(0, 0, B.Enum),
        field(1, settings.malformedStop && index === 3 ? 0 : index % 2 ? 4 : 0, B.Enum),
        field(4, 0)
      ],
      2
    );
  }
  encoder.writeMessage(
    18,
    [
      field(254, 0, B.Uint16),
      field(253, start + (settings.saved ?? 200), B.Uint32),
      field(2, start, B.Uint32),
      field(5, settings.sport ?? 11, B.Enum),
      field(7, Math.round((settings.elapsed ?? (settings.completeElapsed ? 101 : 100.4)) * 1000), B.Uint32),
      field(8, 80400, B.Uint32),
      field(9, 10100, B.Uint32),
      field(11, 14, B.Uint16),
      field(34, 250, B.Uint16),
      field(45, 250, B.Uint16),
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
    new ActivityParsingOptions({ generateUnitStreams: false })
  );
}

describe('FIT final record timestamp precision', () => {
  it.each([11, 1, 2, 17])(
    'preserves the independently stopped terminal sample for sport %i without adding active time',
    async sport => {
      const event = await parse({ sport }),
        activity = event.getFirstActivity();
      const control = (await parse({ sport, completeElapsed: true })).getFirstActivity();
      expect((+activity.endDate - +activity.startDate) / 1000).toBe(101);
      expect(activity.getStat(DataElapsedTime.type)?.getValue()).toBe(101);
      expect(activity.getStat(DataDuration.type)?.getValue()).toBe(80.4);
      expect(activity.getStat(DataTimerTime.type)?.getValue()).toBe(80.4);
      expect(activity.getStat(DataPause.type)?.getValue()).toBeCloseTo(20.6);
      expect(activity.getStream(DataHeartRate.type).getData()[101]).toBe(90);
      expect(activity.getStream(DataPower.type).getData()[101]).toBe(275);
      expect(activity.getStream(DataDistance.type).getData()[101]).toBe(101);
      const evaluations = ActivityUtilities.getTrainingStressScoreEvaluations(activity);
      expect(evaluations).toEqual(ActivityUtilities.getTrainingStressScoreEvaluations(control));
      expect(evaluations.met).toMatchObject({ method: 'MET', score: 1.8, estimated: true });
      if (sport === 2) expect(evaluations.automatic).toMatchObject({ method: 'POWER', score: 2.2 });
      const restored = EventImporterJSON.getEventFromJSON(event.toJSON()).getFirstActivity();
      expect(restored.startDate).toEqual(activity.startDate);
      expect(restored.endDate).toEqual(activity.endDate);
      for (const type of [
        DataElapsedTime.type,
        DataDuration.type,
        DataTimerTime.type,
        DataPause.type,
        DataTrainingStressScore.type
      ]) {
        expect(activity.getStat(type)).toBeDefined();
        expect(restored.getStat(type)?.getValue()).toEqual(activity.getStat(type)?.getValue());
      }
      for (const type of [DataHeartRate.type, DataPower.type, DataDistance.type]) {
        expect(restored.getStream(type).getData()).toEqual(activity.getStream(type).getData());
      }
    }
  );

  it.each([0, 42.5])('retains the authoritative imported score %s', async imported => {
    const activity = (await parse({ imported })).getFirstActivity();
    expect(activity.getStream(DataHeartRate.type).getData()[101]).toBe(90);
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic).toMatchObject({
      method: 'IMPORTED',
      score: imported
    });
  });

  it('keeps ordinary session bounds when the existing delayed-save clamp does not apply', async () => {
    const activity = (await parse({ saved: 110 })).getFirstActivity();
    expect((+activity.endDate - +activity.startDate) / 1000).toBe(110);
    expect(activity.getStat(DataElapsedTime.type)?.getValue()).toBe(100.4);
    expect(activity.getStat(DataDuration.type)?.getValue()).toBe(80.4);
    expect(activity.getStream(DataHeartRate.type).getData()[101]).toBe(90);
  });

  it.each([{ malformedStop: true }, { postStop: true }, { elapsed: 100 }])(
    'retains the original safeguard when source precision is not proven: %j',
    async settings => {
      const activity = (await parse(settings)).getFirstActivity();
      expect((+activity.endDate - +activity.startDate) / 1000).toBe(settings.elapsed ?? 100.4);
      expect(activity.getStream(DataHeartRate.type).getData()[101] ?? null).toBeNull();
      expect(activity.getStat(DataDuration.type)?.getValue()).toBe(80.4);
    }
  );
});
