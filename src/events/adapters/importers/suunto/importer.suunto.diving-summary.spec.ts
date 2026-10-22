import { EventImporterSuuntoJSON } from './importer.suunto.json';
import { EventImporterJSON } from '../json/importer.json';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { DataAltitude } from '../../../../data/data.altitude';
import { DataAltitudeAvg } from '../../../../data/data.altitude-avg';
import { DataAltitudeMax } from '../../../../data/data.altitude-max';
import { DataAltitudeMin } from '../../../../data/data.altitude-min';
import { DataAscent } from '../../../../data/data.ascent';
import { DataDescent } from '../../../../data/data.descent';
import { DataDepth } from '../../../../data/data.depth';
import { DataDepthMax } from '../../../../data/data.depth-max';
import { DataDistance } from '../../../../data/data.distance';
import { DataDuration } from '../../../../data/data.duration';
import { ActivityUtilities } from '../../../utilities/activity.utilities';

const origin = Date.parse('2026-01-01T00:00:00Z');
const time = (seconds: number) => new Date(origin + seconds * 1000).toISOString();
const terrain = [DataAscent, DataDescent, DataAltitudeAvg, DataAltitudeMin, DataAltitudeMax];

function fixture(sports: number[], zeroTerrain = false) {
  const summary = {
    Ascent: zeroTerrain ? 0 : 5,
    Descent: zeroTerrain ? 0 : 7,
    Altitude: [{ Avg: zeroTerrain ? 0 : 12, Min: zeroTerrain ? 0 : 10, Max: zeroTerrain ? 0 : 14 }],
    Depth: [{ Max: 8 }]
  };
  return {
    DeviceLog: {
      Device: { Name: 'Synthetic', Info: { HW: '1', SW: '1' } },
      Header: { DateTime: time(0), Duration: sports.length * 2, Distance: sports.length * 10, ...summary },
      Windows: sports.map((sport, index) => ({
        TimeISO8601: time((index + 1) * 2),
        Window: { Type: 'Activity', ActivityId: sport, Duration: 2, Distance: 10, ...summary }
      })),
      Samples: [
        ...sports.flatMap((sport, index) => [
          { TimeISO8601: time(index * 2), Events: [{ Activity: { ActivityType: sport } }], Altitude: 10, Depth: 4 },
          { TimeISO8601: time(index * 2 + 1), Altitude: 14, Depth: 8 }
        ]),
        { TimeISO8601: time(sports.length * 2), Events: [{ Lap: { Type: 'Stop' } }] }
      ]
    }
  };
}

const parse = (sports: number[], zeroTerrain = false) =>
  EventImporterSuuntoJSON.getFromJSONString(
    JSON.stringify(fixture(sports, zeroTerrain)),
    new ActivityParsingOptions({ generateUnitStreams: false })
  );

describe('Suunto diving event summaries', () => {
  it.each([[51], [52], [53], [51, 53]].map(sports => ({ sports })))(
    'excludes final header terrain summaries for $sports',
    async ({ sports }) => {
      const event = await parse(sports);
      for (const type of terrain) expect(event.getStat(type.type)).toBeUndefined();
      expect(event.getStat(DataDepthMax.type)?.getValue()).toBe(8);
      expect(event.getStat(DataDistance.type)?.getValue()).toBe(sports.length * 10);
      expect(event.getStat(DataDuration.type)?.getValue()).toBe(sports.length * 2);
      for (const [index, activity] of event.getActivities().entries()) {
        for (const type of terrain) expect(activity.getStat(type.type)).toBeUndefined();
        // Adjacent legs retain their shared boundary sample under the existing importer policy.
        expect(activity.getStreamData(DataAltitude.type).filter(Number.isFinite)).toEqual(
          index < sports.length - 1 ? [10, 14, 10] : [10, 14]
        );
        expect(activity.getStreamData(DataDepth.type).filter(Number.isFinite)).toEqual(
          index < sports.length - 1 ? [4, 8, 4] : [4, 8]
        );
      }
      const snapshot = JSON.parse(JSON.stringify(event.toJSON()));
      const restored = EventImporterJSON.getEventFromJSON(snapshot);
      expect(restored.toJSON().stats).toEqual(event.toJSON().stats);
      for (let i = 0; i < event.getActivities().length; i++) {
        const activity = restored.getActivities()[i];
        expect(activity.getStreamData(DataAltitude.type)).toEqual(
          event.getActivities()[i].getStreamData(DataAltitude.type)
        );
        expect(activity.getStreamData(DataDepth.type)).toEqual(event.getActivities()[i].getStreamData(DataDepth.type));
        ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
        ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
        for (const type of terrain) expect(activity.getStat(type.type)).toBeUndefined();
      }
      expect(event.toJSON()).toEqual(snapshot);
    }
  );

  it.each([[3], [99999], [51, 3], [51, 99999]].map(sports => ({ sports })))(
    'preserves explicit header terrain for $sports',
    async ({ sports }) => {
      const event = await parse(sports);
      expect(terrain.map(type => event.getStat(type.type)?.getValue())).toEqual([5, 7, 12, 10, 14]);
      const restored = EventImporterJSON.getEventFromJSON(JSON.parse(JSON.stringify(event.toJSON())));
      expect(restored.toJSON().stats).toEqual(event.toJSON().stats);
    }
  );

  it.each([51, 3])('applies the same sport rules to zero-valued header terrain for sport %s', async sport => {
    const event = await parse([sport], true);
    expect(terrain.map(type => event.getStat(type.type)?.getValue())).toEqual(
      sport === 51 ? Array(5).fill(undefined) : Array(5).fill(0)
    );
  });
});
