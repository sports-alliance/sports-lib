import { FitBaseType, FitEncoder } from 'fit-file-parser/encoder';
import { Activity } from '../../../../activities/activity';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { ActivityTypes } from '../../../../activities/activity.types';
import { Creator } from '../../../../creators/creator';
import { DataActivityTypes } from '../../../../data/data.activity-types';
import { DataAltitudeMin } from '../../../../data/data.altitude-min';
import { DataAvgVAM } from '../../../../data/data.avg-vam';
import { DataDistance } from '../../../../data/data.distance';
import { DataPaceAvg } from '../../../../data/data.pace-avg';
import { DataPaceMax } from '../../../../data/data.pace-max';
import { DataPaceMin } from '../../../../data/data.pace-min';
import { DataSpeedMin } from '../../../../data/data.speed-min';
import { DataStartPosition } from '../../../../data/data.start-position';
import { DataTrainingStressScore } from '../../../../data/data.training-stress-score';
import {
  DataTrainingStressScoreMethod,
  TrainingStressScoreMethod
} from '../../../../data/data.training-stress-score-method';
import { Lap } from '../../../../laps/lap';
import { LapTypes } from '../../../../laps/lap.types';
import { Stream } from '../../../../streams/stream';
import { RouteFile } from '../../../../routes/route-file';
import { RouteImporterJSON } from '../../../../routes/adapters/importers/json/importer.route.json';
import { Event } from '../../../event';
import { EventExporterJSON } from '../../exporters/exporter.json';
import { FileType } from '../../file-type.enum';
import { EventImporterFIT } from '../fit/importer.fit';
import { EventImporterJSON } from './importer.json';

describe('Native JSON non-finite stat compatibility', () => {
  const createEvent = () => {
    const event = new Event('roundtrip', new Date(0), new Date(2000), FileType.FIT);
    const activity = new Activity(new Date(0), new Date(2000), ActivityTypes.Running, new Creator('test'));
    const lap = new Lap(new Date(0), new Date(2000), 1, LapTypes.Manual);
    activity.addLap(lap);
    activity.addStream(new Stream(DataDistance.type, [0, null, 10]));
    event.addActivity(activity);
    return { event, activity, lap };
  };

  it('omits invalid numeric summaries on events, activities and laps without changing runtime pace', async () => {
    const { event, activity, lap } = createEvent();
    for (const target of [event, activity, lap]) {
      target.addStat(new DataPaceMax(Infinity));
      target.addStat(new DataPaceMin(-Infinity));
      target.addStat(new DataPaceAvg(NaN));
      target.addStat(new DataSpeedMin(0));
      target.addStat(new DataDistance(0));
      target.addStat(new DataAltitudeMin(-5));
      target.addStat(new DataTrainingStressScore(0));
      target.addStat(new DataTrainingStressScoreMethod(TrainingStressScoreMethod.IMPORTED));
      target.addStat(new DataStartPosition({ latitudeDegrees: 0, longitudeDegrees: 0 }));
      target.addStat(new DataActivityTypes([ActivityTypes.Running]));
      expect(target.getStat(DataPaceMax.type)?.getValue()).toBe(Infinity);
      expect(target.getStat(DataPaceMax.type)?.getUnit()).toBe(DataPaceMax.unit);
    }
    const json = event.toJSON();
    for (const stats of [json.stats, json.activities[0].stats, json.activities[0].laps[0].stats]) {
      expect(stats).not.toHaveProperty(DataPaceMax.type);
      expect(stats).not.toHaveProperty(DataPaceMin.type);
      expect(stats).not.toHaveProperty(DataPaceAvg.type);
      expect(stats[DataDistance.type]).toBe(0);
      expect(stats[DataAltitudeMin.type]).toBe(-5);
      expect(stats[DataTrainingStressScore.type]).toBe(0);
      expect(stats[DataTrainingStressScoreMethod.type]).toBe(TrainingStressScoreMethod.IMPORTED);
      expect(stats[DataStartPosition.type]).toEqual({ latitudeDegrees: 0, longitudeDegrees: 0 });
      expect(stats[DataActivityTypes.type]).toEqual([ActivityTypes.Running]);
    }
    const restored = EventImporterJSON.getEventFromJSON(JSON.parse(await EventExporterJSON.getAsString(event)));
    expect(restored.toJSON()).toEqual(json);
    expect(restored.getFirstActivity().getStream(DataDistance.type).getData()).toEqual([0, null, 10]);
    for (const target of [restored, restored.getFirstActivity(), restored.getFirstActivity().getLaps()[0]]) {
      expect(target.getStat(DataTrainingStressScore.type)?.getValue()).toBe(0);
      // Zero speed can still hydrate an infinite runtime pace, which is omitted again on export.
      expect(target.getStat(DataPaceMax.type)?.getValue()).toBe(Infinity);
    }
  });

  it('keeps shared route-file summary serialization safe for finite stats', () => {
    const routeFile = new RouteFile('route');
    routeFile.addStat(new DataDistance(0));
    routeFile.addStat(new DataPaceMax(Infinity));
    const json = routeFile.toJSON();
    expect(json.stats).toEqual({ [DataDistance.type]: 0 });
    expect(
      RouteImporterJSON.getRouteFileFromJSON(JSON.parse(JSON.stringify(json)))
        .getStat(DataDistance.type)
        ?.getValue()
    ).toBe(0);
  });

  it.each([null, undefined, NaN, Infinity, -Infinity])(
    'restores legacy invalid scalar stats (%s) without hiding valid aliases',
    invalid => {
      const json = createEvent().event.toJSON();
      for (const stats of [json.stats, json.activities[0].stats, json.activities[0].laps[0].stats]) {
        Object.assign(stats, {
          [DataPaceMax.type]: invalid,
          [DataAvgVAM.type]: invalid,
          'Avg VAM': 123,
          [DataTrainingStressScore.type]: 0,
          [DataTrainingStressScoreMethod.type]: TrainingStressScoreMethod.IMPORTED
        });
      }
      const restored = EventImporterJSON.getEventFromJSON(json);
      for (const target of [restored, restored.getFirstActivity(), restored.getFirstActivity().getLaps()[0]]) {
        expect(target.getStat(DataPaceMax.type)).toBeUndefined();
        expect(target.getStat(DataAvgVAM.type)?.getValue()).toBe(123);
        expect(target.getStat(DataTrainingStressScore.type)?.getValue()).toBe(0);
      }
      expect(restored.getFirstActivity().getStream(DataDistance.type).getData()).toEqual([0, null, 10]);
    }
  );

  it.each([undefined, true, false])(
    'round-trips a zero-speed binary FIT with preserveImportedTss=%s',
    async preserveImportedTss => {
      const encoder = new FitEncoder();
      const start = FitEncoder.toFitTimestamp(new Date('2026-01-01T12:00:00Z'));
      encoder.writeMessage(0, [
        { number: 0, size: 1, baseType: FitBaseType.Enum, value: 4 },
        { number: 1, size: 2, baseType: FitBaseType.Uint16, value: 23 },
        { number: 4, size: 4, baseType: FitBaseType.Uint32, value: start }
      ]);
      for (const message of [19, 18]) {
        encoder.writeMessage(message, [
          { number: 253, size: 4, baseType: FitBaseType.Uint32, value: start + 60 },
          { number: 2, size: 4, baseType: FitBaseType.Uint32, value: start },
          { number: message === 18 ? 5 : 25, size: 1, baseType: FitBaseType.Enum, value: 1 },
          { number: 7, size: 4, baseType: FitBaseType.Uint32, value: 60_000 },
          { number: 8, size: 4, baseType: FitBaseType.Uint32, value: 60_000 },
          { number: 14, size: 2, baseType: FitBaseType.Uint16, value: 0 },
          ...(message === 18 ? [{ number: 35, size: 2, baseType: FitBaseType.Uint16, value: 0 }] : [])
        ]);
      }
      const event = await EventImporterFIT.getFromArrayBuffer(
        Buffer.from(encoder.close()),
        new ActivityParsingOptions({
          generateUnitStreams: false,
          tss: { preserveImportedTss, enableHeuristicFallbacks: false }
        })
      );
      const restored = EventImporterJSON.getEventFromJSON(JSON.parse(JSON.stringify(event.toJSON())));
      expect(restored.getFirstActivity().type).toBe(ActivityTypes.Running);
      expect(restored.toJSON()).toEqual(event.toJSON());
      expect(restored.getFirstActivity().getLaps()).toHaveLength(1);
      for (const target of [event.getFirstActivity(), restored.getFirstActivity()]) {
        expect(target.getStat(DataTrainingStressScore.type)?.getValue()).toBe(
          preserveImportedTss === false ? undefined : 0
        );
        expect(target.getStat(DataTrainingStressScoreMethod.type)?.getValue()).toBe(
          preserveImportedTss === false ? undefined : TrainingStressScoreMethod.IMPORTED
        );
      }
    }
  );
});
