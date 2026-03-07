import { EventImporterJSON } from './importer.json';
import { ActivityTypes } from '../../../../activities/activity.types';
import { DataActivityTypes } from '../../../../data/data.activity-types';
import { DataDeviceNames } from '../../../../data/data.device-names';
import { DataDistance } from '../../../../data/data.distance';
import { DataIBI } from '../../../../data/data.ibi';
import { DataPowerCurve } from '../../../../data/data.power-curve';
import { DataTime } from '../../../../data/data.time';
import { FileType } from '../../file-type.enum';
import { Privacy } from '../../../../privacy/privacy.class.interface';
import { DataDuration } from '../../../../data/data.duration';
import { DataPower } from '../../../../data/data.power';
import { IBIStream } from '../../../../streams/ibi-stream';

describe('EventImporterJSON', () => {
  it('should hydrate full event JSON including activities and power curves', () => {
    const eventCurve = new DataPowerCurve([{ duration: new DataDuration(1), power: new DataPower(320) }]).toJSON();
    const activityCurve = new DataPowerCurve([{ duration: new DataDuration(5), power: new DataPower(280) }]).toJSON();
    const event = EventImporterJSON.getEventFromJSON({
      name: 'json-event',
      startDate: 0,
      endDate: 4000,
      srcFileType: FileType.FIT,
      description: 'round-trip',
      isMerge: false,
      privacy: Privacy.Public,
      powerCurve: eventCurve,
      stats: {
        [DataActivityTypes.type]: [ActivityTypes.Running, ActivityTypes.Cycling],
        [DataDeviceNames.type]: ['Edge', 'HRM', 'HRM']
      },
      activities: [
        {
          name: null,
          startDate: 2000,
          endDate: 3000,
          type: ActivityTypes.Cycling,
          powerMeter: false,
          trainer: false,
          powerCurve: activityCurve,
          stats: {},
          streams: [
            { type: DataTime.type, data: [0, 1] },
            { type: DataDistance.type, data: [0, 10] },
            { type: DataIBI.type, data: [823, 823] }
          ],
          laps: [],
          creator: { name: 'test', devices: [] },
          intensityZones: [],
          events: []
        },
        {
          name: null,
          startDate: 0,
          endDate: 1000,
          type: ActivityTypes.Running,
          powerMeter: false,
          trainer: false,
          powerCurve: null,
          stats: {},
          streams: [{ type: DataDistance.type, data: [0, 5] }],
          laps: [],
          creator: { name: 'test', devices: [] },
          intensityZones: [],
          events: []
        }
      ]
    });

    expect(event.getActivities()).toHaveLength(2);
    expect(event.getFirstActivity().startDate.getTime()).toBe(0);
    expect(event.getLastActivity().startDate.getTime()).toBe(2000);
    expect(event.isMultiSport()).toBe(true);
    expect(event.getActivityTypesAsString()).toBe('Running, Cycling');
    expect(event.getDeviceNamesAsString()).toBe('Edge, 2x HRM');
    expect(event.powerCurve?.toJSON()).toEqual(eventCurve);
    expect(event.getStat(DataPowerCurve.type)?.toJSON()).toEqual(eventCurve);

    const importedCyclingActivity = event.getLastActivity();
    expect(importedCyclingActivity.hasStreamData(DataTime.type)).toBe(false);
    expect(importedCyclingActivity.getStream(DataIBI.type)).toBeInstanceOf(IBIStream);
    expect(importedCyclingActivity.generateTimeStream([DataIBI.type]).getData(true)).toEqual([1, 2]);
    expect(importedCyclingActivity.powerCurve?.toJSON()).toEqual(activityCurve);
    expect(importedCyclingActivity.getStat(DataPowerCurve.type)?.toJSON()).toEqual(activityCurve);
  });

  it('should keep merged events out of the multi-sport classification after import', () => {
    const event = EventImporterJSON.getEventFromJSON({
      name: 'merged-event',
      startDate: 0,
      endDate: 2000,
      srcFileType: FileType.FIT,
      description: null,
      isMerge: true,
      privacy: Privacy.Private,
      powerCurve: null,
      stats: {},
      activities: [
        {
          name: null,
          startDate: 0,
          endDate: 1000,
          type: ActivityTypes.Running,
          powerMeter: false,
          trainer: false,
          powerCurve: null,
          stats: {},
          streams: [{ type: DataDistance.type, data: [0, 1] }],
          laps: [],
          creator: { name: 'test', devices: [] },
          intensityZones: [],
          events: []
        },
        {
          name: null,
          startDate: 1000,
          endDate: 2000,
          type: ActivityTypes.Cycling,
          powerMeter: false,
          trainer: false,
          powerCurve: null,
          stats: {},
          streams: [{ type: DataDistance.type, data: [0, 2] }],
          laps: [],
          creator: { name: 'test', devices: [] },
          intensityZones: [],
          events: []
        }
      ]
    });

    expect(event.isMerge).toBe(true);
    expect(event.isMultiSport()).toBe(false);
  });
});
