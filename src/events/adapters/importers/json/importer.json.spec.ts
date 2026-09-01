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
import { DataHeartRate } from '../../../../data/data.heart-rate';
import { DataPaceAvg } from '../../../../data/data.pace-avg';
import { DataSpeedAvg } from '../../../../data/data.speed-avg';
import { DataSwimPaceAvg } from '../../../../data/data.swim-pace-avg';
import { LapTypes } from '../../../../laps/lap.types';
import {
  DataContactTimeToFlightTimeRatio,
  DataContactTimeToFlightTimeRatioAvg,
  DataGroundContactTimePercentage,
  DataGroundContactTimePercentageAvg,
  DataRunningFlightTime,
  DataRunningFlightTimeAvg
} from '../../../../data/data.running-dynamics';

describe('EventImporterJSON', () => {
  it('round-trips canonical running-dynamics stats and streams without renaming or dropping them', () => {
    const event = EventImporterJSON.getEventFromJSON({
      name: 'running-dynamics-round-trip',
      startDate: 0,
      endDate: 2000,
      srcFileType: FileType.FIT,
      description: null,
      isMerge: false,
      privacy: Privacy.Private,
      powerCurve: null,
      stats: {
        [DataGroundContactTimePercentageAvg.type]: 37.11,
        [DataRunningFlightTimeAvg.type]: 207.086,
        [DataContactTimeToFlightTimeRatioAvg.type]: 139
      },
      activities: [
        {
          name: null,
          startDate: 0,
          endDate: 2000,
          type: ActivityTypes.Running,
          powerMeter: false,
          trainer: false,
          powerCurve: null,
          stats: {
            [DataGroundContactTimePercentageAvg.type]: 37.11,
            [DataRunningFlightTimeAvg.type]: 207.086,
            [DataContactTimeToFlightTimeRatioAvg.type]: 139
          },
          streams: [
            { type: DataGroundContactTimePercentage.type, data: [37.11, null, 38.2] },
            { type: DataRunningFlightTime.type, data: [207.086, 0, 201.5] },
            { type: DataContactTimeToFlightTimeRatio.type, data: [139, null, 141] }
          ],
          laps: [],
          creator: { name: 'test', devices: [] },
          intensityZones: [],
          events: []
        }
      ]
    });

    const activity = event.getFirstActivity();
    expect(event.getStat(DataGroundContactTimePercentageAvg.type)?.getValue()).toBe(37.11);
    expect(event.getStat(DataRunningFlightTimeAvg.type)?.getValue()).toBe(207.086);
    expect(event.getStat(DataContactTimeToFlightTimeRatioAvg.type)?.getValue()).toBe(139);
    expect(activity.getStreamData(DataGroundContactTimePercentage.type)).toEqual([37.11, null, 38.2]);
    expect(activity.getStreamData(DataRunningFlightTime.type)).toEqual([207.086, 0, 201.5]);
    expect(activity.getStreamData(DataContactTimeToFlightTimeRatio.type)).toEqual([139, null, 141]);

    const serialized = event.toJSON();
    expect(serialized.stats).toEqual(
      expect.objectContaining({
        [DataGroundContactTimePercentageAvg.type]: 37.11,
        [DataRunningFlightTimeAvg.type]: 207.086,
        [DataContactTimeToFlightTimeRatioAvg.type]: 139
      })
    );
    expect(serialized.activities[0].stats).toEqual(
      expect.objectContaining({
        [DataGroundContactTimePercentageAvg.type]: 37.11,
        [DataRunningFlightTimeAvg.type]: 207.086,
        [DataContactTimeToFlightTimeRatioAvg.type]: 139
      })
    );
    expect(EventImporterJSON.getEventFromJSON(serialized).toJSON()).toEqual(serialized);
  });

  it('restores native structured dive records and leaves an absent optional field empty', () => {
    const activity = EventImporterJSON.getActivityFromJSON({
      name: 'native-dive-records',
      startDate: 1_000,
      endDate: 2_000,
      type: ActivityTypes.ScubaDiving,
      powerMeter: false,
      trainer: false,
      stats: {},
      streams: [],
      laps: [],
      creator: { name: 'test', devices: [] },
      intensityZones: [],
      events: [],
      diveSourceRecords: {
        gases: [
          {
            messageIndex: { value: 2, selected: true },
            oxygenContent: 32,
            heliumContent: 15,
            status: 'enabled',
            mode: 'open_circuit'
          }
        ],
        tankSummaries: [
          {
            timestamp: 1_500,
            sensor: 10_001,
            startPressure: 199.46,
            endPressure: 74.67,
            volumeUsed: 1396.01
          }
        ],
        tankUpdates: [{ timestamp: 1_600, sensor: 10_001, pressure: 198.4 }]
      }
    });

    expect(activity.getDiveSourceRecords()).toEqual({
      gases: [
        {
          messageIndex: { value: 2, selected: true },
          oxygenContent: 32,
          heliumContent: 15,
          status: 'enabled',
          mode: 'open_circuit'
        }
      ],
      tankSummaries: [
        {
          timestamp: new Date(1_500),
          sensor: 10_001,
          startPressure: 199.46,
          endPressure: 74.67,
          volumeUsed: 1396.01
        }
      ],
      tankUpdates: [{ timestamp: new Date(1_600), sensor: 10_001, pressure: 198.4 }]
    });
    expect(activity.toJSON().diveSourceRecords).toEqual({
      gases: [
        {
          messageIndex: { value: 2, selected: true },
          oxygenContent: 32,
          heliumContent: 15,
          status: 'enabled',
          mode: 'open_circuit'
        }
      ],
      tankSummaries: [
        {
          timestamp: 1_500,
          sensor: 10_001,
          startPressure: 199.46,
          endPressure: 74.67,
          volumeUsed: 1396.01
        }
      ],
      tankUpdates: [{ timestamp: 1_600, sensor: 10_001, pressure: 198.4 }]
    });

    const activityWithoutSourceRecords = EventImporterJSON.getActivityFromJSON({
      name: 'dive-without-source-records',
      startDate: 1_000,
      endDate: 2_000,
      type: ActivityTypes.ScubaDiving,
      powerMeter: false,
      trainer: false,
      stats: {},
      streams: [],
      laps: [],
      creator: { name: 'test', devices: [] },
      intensityZones: [],
      events: []
    });
    expect(activityWithoutSourceRecords.getDiveSourceRecords()).toEqual({
      gases: [],
      tankSummaries: [],
      tankUpdates: []
    });
    expect(activityWithoutSourceRecords.toJSON()).not.toHaveProperty('diveSourceRecords');
  });

  it('hydrates speed-derived stats for events, activities, and laps without replacing explicit pace', () => {
    const event = EventImporterJSON.getEventFromJSON({
      name: 'speed-only-laps',
      startDate: 0,
      endDate: 2000,
      srcFileType: FileType.FIT,
      description: null,
      isMerge: false,
      privacy: Privacy.Private,
      powerCurve: null,
      stats: { [DataSpeedAvg.type]: 5 },
      activities: [
        {
          name: null,
          startDate: 0,
          endDate: 2000,
          type: ActivityTypes.Running,
          powerMeter: false,
          trainer: false,
          powerCurve: null,
          stats: { [DataSpeedAvg.type]: 4 },
          streams: [],
          laps: [
            {
              lapId: 1,
              startDate: 0,
              endDate: 1000,
              startIndex: null,
              endIndex: null,
              type: LapTypes.Manual,
              stats: { [DataSpeedAvg.type]: 3 }
            },
            {
              lapId: 2,
              startDate: 1000,
              endDate: 2000,
              startIndex: null,
              endIndex: null,
              type: LapTypes.Manual,
              stats: { [DataSpeedAvg.type]: 2, [DataPaceAvg.type]: 321 }
            }
          ],
          creator: { name: 'test', devices: [] },
          intensityZones: [],
          events: []
        }
      ]
    });

    const activity = event.getFirstActivity();
    const [derivedLap, explicitLap] = activity.getLaps();

    expect(event.getStat(DataPaceAvg.type)?.getValue()).toBe(200);
    expect(activity.getStat(DataPaceAvg.type)?.getValue()).toBe(250);
    expect(derivedLap.getStat(DataPaceAvg.type)?.getValue()).toBeCloseTo(1000 / 3, 10);
    expect(derivedLap.getStat(DataSwimPaceAvg.type)?.getValue()).toBeCloseTo(100 / 3, 10);
    expect(explicitLap.getStat(DataPaceAvg.type)?.getValue()).toBe(321);

    const serialized = event.toJSON();
    expect(serialized.activities[0].laps[0].stats[DataPaceAvg.type]).toBeCloseTo(1000 / 3, 10);
    expect(EventImporterJSON.getEventFromJSON(serialized).toJSON()).toEqual(serialized);
  });

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

  it('should hydrate event JSON that omits embedded activities for Firestore-style event documents', () => {
    const event = EventImporterJSON.getEventFromJSON({
      name: 'firestore-event',
      startDate: 0,
      endDate: 2000,
      srcFileType: FileType.FIT,
      description: null,
      isMerge: false,
      privacy: Privacy.Private,
      powerCurve: null,
      stats: {},
      activities: undefined as any
    });

    expect(event.getActivities()).toEqual([]);
    expect(event.name).toBe('firestore-event');
  });

  it('should hydrate all optional intensity zone lower limits', () => {
    const zones = EventImporterJSON.getIntensityZonesFromJSON({
      type: DataHeartRate.type,
      zone1Duration: 1,
      zone2Duration: 2,
      zone3Duration: 3,
      zone4Duration: 4,
      zone5Duration: 5,
      zone6Duration: 6,
      zone7Duration: 7,
      zone1LowerLimit: 90,
      zone2LowerLimit: 110,
      zone3LowerLimit: 130,
      zone4LowerLimit: 150,
      zone5LowerLimit: 170,
      zone6LowerLimit: 190,
      zone7LowerLimit: 210
    });

    expect(zones.toJSON()).toEqual({
      type: DataHeartRate.type,
      zone1Duration: 1,
      zone2Duration: 2,
      zone3Duration: 3,
      zone4Duration: 4,
      zone5Duration: 5,
      zone6Duration: 6,
      zone7Duration: 7,
      zone1LowerLimit: 90,
      zone2LowerLimit: 110,
      zone3LowerLimit: 130,
      zone4LowerLimit: 150,
      zone5LowerLimit: 170,
      zone6LowerLimit: 190,
      zone7LowerLimit: 210
    });
  });
});
