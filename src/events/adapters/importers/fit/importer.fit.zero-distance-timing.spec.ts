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
  elapsed?: number;
  declaredSessions?: number;
  omitDeclaration?: boolean;
  omitCounter?: boolean;
  imported?: number;
};
async function parse(settings: Settings = {}) {
  const encoder = new FitEncoder();
  encoder.writeMessage(0, [field(0, 4, B.Enum), field(1, 1, B.Uint16), field(4, start, B.Uint32)]);
  encoder.writeMessage(3, [field(4, 700, B.Uint16)], 4);
  for (const second of [0, 100, 200, 300, 400, 500, 600]) {
    encoder.writeMessage(
      20,
      [
        field(253, start + second, B.Uint32),
        field(3, second === 600 ? 140 : 100),
        ...(settings.omitCounter ? [] : [field(5, 0, B.Uint32)])
      ],
      1
    );
  }
  for (const [i, second] of [0, 200, 400, 600, 900].entries()) {
    encoder.writeMessage(
      21,
      [
        field(253, start + second, B.Uint32),
        field(0, 0, B.Enum),
        field(1, i === 0 || i === 2 ? 0 : 4, B.Enum),
        field(4, 0)
      ],
      2
    );
  }
  encoder.writeMessage(
    18,
    [
      field(254, 0, B.Uint16),
      field(253, start + 1000, B.Uint32),
      field(2, start, B.Uint32),
      field(5, settings.sport ?? 2, B.Enum),
      field(7, (settings.elapsed ?? 500) * 1000, B.Uint32),
      field(8, 400000, B.Uint32),
      field(9, 0, B.Uint32),
      field(11, 70, B.Uint16),
      ...(settings.imported === undefined ? [] : [field(35, settings.imported * 10, B.Uint16)])
    ],
    3
  );
  encoder.writeMessage(
    216,
    [field(0, 18, B.Uint16), field(1, 0, B.Uint16), field(11, 190), field(12, 55), field(13, 165)],
    5
  );
  if (!settings.omitDeclaration) {
    encoder.writeMessage(
      34,
      [field(253, start + 1000, B.Uint32), field(1, settings.declaredSessions ?? 1, B.Uint16)],
      6
    );
  }
  const bytes = encoder.close();
  return EventImporterFIT.getFromArrayBuffer(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
    new ActivityParsingOptions({ generateUnitStreams: false })
  );
}

describe('FIT explicit zero-distance chronology', () => {
  it.each([2, 11, 10, 17])(
    'restores recorded samples for sport %s while keeping active time and load inputs',
    async sport => {
      const event = await parse({ sport }),
        activity = event.getFirstActivity();
      const control = (await parse({ sport, elapsed: 600 })).getFirstActivity();
      expect((+activity.endDate - +activity.startDate) / 1000).toBe(600);
      expect(activity.getStat(DataElapsedTime.type)?.getValue()).toBe(600);
      expect(activity.getStat(DataDuration.type)?.getValue()).toBe(400);
      expect(activity.getStat(DataTimerTime.type)?.getValue()).toBe(400);
      expect(activity.getStat(DataPause.type)?.getValue()).toBe(200);
      expect(activity.getStat(DataDistance.type)?.getValue()).toBe(0);
      expect(activity.getStream(DataHeartRate.type).getData()[600]).toBe(140);
      expect(activity.getStream(DataDistance.type).getData()[600]).toBe(0);
      const evaluations = ActivityUtilities.getTrainingStressScoreEvaluations(activity);
      expect(evaluations).toEqual(ActivityUtilities.getTrainingStressScoreEvaluations(control));
      expect(evaluations.hr.method).toBe('HR');
      expect(evaluations.met.method).toBe('MET');
      const restored = EventImporterJSON.getEventFromJSON(event.toJSON()).getFirstActivity();
      expect(restored.startDate).toEqual(activity.startDate);
      expect(restored.endDate).toEqual(activity.endDate);
      for (const type of [
        DataElapsedTime.type,
        DataDuration.type,
        DataTimerTime.type,
        DataPause.type,
        DataDistance.type,
        DataTrainingStressScore.type
      ]) {
        expect(restored.getStat(type)?.getValue()).toEqual(activity.getStat(type)?.getValue());
      }
      for (const type of [DataHeartRate.type, DataDistance.type]) {
        expect(restored.getStream(type).getData()).toEqual(activity.getStream(type).getData());
      }
    }
  );

  it.each([0, 42.5])('preserves the imported TSS %s', async imported => {
    const activity = (await parse({ imported })).getFirstActivity();
    expect(activity.getStream(DataHeartRate.type).getData()[600]).toBe(140);
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic).toMatchObject({
      method: 'IMPORTED',
      score: imported
    });
  });

  it.each([{ omitDeclaration: true }, { declaredSessions: 2 }, { omitCounter: true }])(
    'keeps the legacy safeguard without complete zero-distance ownership evidence: %j',
    async settings => {
      const activity = (await parse(settings)).getFirstActivity();
      expect((+activity.endDate - +activity.startDate) / 1000).toBe(500);
      expect(activity.getStream(DataHeartRate.type).getData()[600] ?? null).toBeNull();
      expect(activity.getStat(DataDuration.type)?.getValue()).toBe(400);
    }
  );
});
