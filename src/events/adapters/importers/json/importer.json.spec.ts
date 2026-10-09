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
import { DataStore, DynamicDataLoader } from '../../../../data/data.store';
import {
  DataContactTimeToFlightTimeRatio,
  DataContactTimeToFlightTimeRatioAvg,
  DataGroundContactTimePercentage,
  DataGroundContactTimePercentageAvg,
  DataRunningFlightTime,
  DataRunningFlightTimeAvg
} from '../../../../data/data.running-dynamics';

describe('EventImporterJSON', () => {
  it.each(['Suunto', 'Garmin', undefined])(
    'preserves all legacy stamina keys, values and gaps across repeated JSON reloads for %p',
    manufacturer => {
      // Literal persisted keys guard compatibility independently of class/token changes.
      const stats = {
        Stamina: 0,
        'Minimum Stamina': 0,
        'Maximum Stamina': 100,
        'Average Stamina': 85.123,
        'Potential Stamina': 66,
        'Minimum Potential Stamina': 50,
        'Maximum Potential Stamina': 99,
        'Average Potential Stamina': 79.876,
        'Beginning Potential Stamina': 99,
        'Ending Potential Stamina': 66
      };
      const streams = [
        { type: 'Stamina', data: [100, null, 0, 72] },
        { type: 'Potential Stamina', data: [99, null, 50, 66] }
      ];
      Object.keys(stats).forEach(type => {
        const DataClass = DynamicDataLoader.getDataClassFromDataType(type);
        expect(Object.values(DataStore).filter((candidate: any) => candidate.type === type)).toEqual([DataClass]);
      });

      for (const storedStreams of [
        [],
        streams,
        Object.fromEntries(streams.map(stream => [stream.type, stream.data]))
      ]) {
        let event = EventImporterJSON.getEventFromJSON({
          name: 'Synthetic legacy workout',
          startDate: 0,
          endDate: 3000,
          srcFileType: FileType.FIT,
          description: null,
          isMerge: false,
          privacy: Privacy.Private,
          powerCurve: null,
          stats,
          activities: [
            {
              name: null,
              startDate: 0,
              endDate: 3000,
              type: ActivityTypes.Running,
              powerMeter: false,
              trainer: false,
              stats,
              streams: storedStreams,
              creator: { name: 'Custom name', manufacturer, devices: [] },
              intensityZones: [],
              events: [],
              laps: [
                {
                  lapId: 0,
                  startIndex: null,
                  endIndex: null,
                  startDate: 0,
                  endDate: 3000,
                  type: LapTypes.Manual,
                  stats
                }
              ]
            }
          ]
        });
        for (let pass = 0; pass < 3; pass++) {
          const json = JSON.parse(JSON.stringify(event.toJSON()));
          expect(json.stats).toEqual(stats);
          expect(json.activities[0].stats).toEqual(stats);
          expect(json.activities[0].laps[0].stats).toEqual(stats);
          const activity = event.getFirstActivity();
          expect(
            activity
              .getAllStreams()
              .map(stream => stream.type)
              .sort()
          ).toEqual(Array.isArray(storedStreams) && storedStreams.length === 0 ? [] : ['Potential Stamina', 'Stamina']);
          for (const stream of activity.getAllStreams()) {
            expect(stream.getData()).toEqual(streams.find(candidate => candidate.type === stream.type)?.data);
          }
          expect(activity.creator.manufacturer).toBe(manufacturer);
          expect(JSON.stringify(json)).not.toMatch(/EnergySense|Sustainable Distance/);
          event = EventImporterJSON.getEventFromJSON(json);
        }
      }
    }
  );

  it.each(['Morning walk', 'Πρωινή βόλτα 🥾', '  Warm-up  ', '', null, undefined])(
    'restores the activity name %p while preserving legacy unnamed activities',
    name => {
      const json = {
        name: name ?? null,
        startDate: 0,
        endDate: 60000,
        type: ActivityTypes.Walking,
        powerMeter: false,
        trainer: false,
        stats: {},
        streams: [],
        laps: [],
        creator: { name: 'Example Exporter', devices: [] },
        intensityZones: [],
        events: []
      };
      if (name === undefined) {
        delete (json as Partial<typeof json>).name;
      }

      const activity = EventImporterJSON.getActivityFromJSON(json);
      expect(activity.name).toBe(name ?? '');
      const roundTrip = EventImporterJSON.getActivityFromJSON(JSON.parse(JSON.stringify(activity.toJSON())));
      expect(roundTrip.name).toBe(name ?? '');
      expect(roundTrip.toJSON().name).toBe(name || null);
    }
  );

  it.each([
    ['Field Hockey', ActivityTypes.FieldHockey],
    ['FieldHockey', ActivityTypes.FieldHockey],
    ['field_hockey', ActivityTypes.FieldHockey],
    ['hockey_field', ActivityTypes.FieldHockey],
    ['Ice Hockey', ActivityTypes.IceHockey],
    ['IceHockey', ActivityTypes.IceHockey],
    ['hockey_ice', ActivityTypes.IceHockey],
    ['Wheel Chair', ActivityTypes.Wheelchair],
    ['Wheelchair', ActivityTypes.Wheelchair],
    ['wheelchair_push_walk', ActivityTypes.Wheelchair],
    ['Walking', ActivityTypes.Walking],
    ['Unknown Sport', ActivityTypes.unknown],
    ['Chores', ActivityTypes.Chores],
    ['chores', ActivityTypes.Chores],
    ['Generic', ActivityTypes.Generic],
    ['generic_exercise', ActivityTypes.Generic],
    ['Track and Field', ActivityTypes.TrackAndField],
    ['TrackAndField', ActivityTypes.TrackAndField],
    ['Track Running', ActivityTypes.TrackRunning],
    ['TrackRunning', ActivityTypes.TrackRunning],
    ['track_running', ActivityTypes.TrackRunning],
    ['Track Run', ActivityTypes.TrackRunning],
    ['TrackRun', ActivityTypes.TrackRunning],
    ['track_run', ActivityTypes.TrackRunning],
    ['Running', ActivityTypes.Running],
    ['running_track', ActivityTypes.Running],
    ['Match', ActivityTypes.Match],
    ['generic_match', ActivityTypes.Match]
  ])('restores activity type %s without reclassifying legacy labels', (type, expectedType) => {
    const activity = EventImporterJSON.getActivityFromJSON({
      name: 'activity-type-round-trip',
      startDate: 1_000,
      endDate: 2_000,
      type: type as ActivityTypes,
      powerMeter: false,
      trainer: false,
      stats: {},
      streams: [],
      laps: [],
      creator: { name: 'test', devices: [] },
      intensityZones: [],
      events: []
    });

    expect(activity.type).toBe(expectedType);
    expect(activity.toJSON().type).toBe(expectedType);
    expect(EventImporterJSON.getActivityFromJSON(activity.toJSON()).type).toBe(expectedType);
  });

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
