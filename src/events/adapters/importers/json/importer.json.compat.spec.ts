import { EventImporterJSON } from './importer.json';
import { ActivityTypes } from '../../../../activities/activity.types';
import { DataActivityTypes } from '../../../../data/data.activity-types';
import { DataAvgVAM } from '../../../../data/data.avg-vam';
import { DataJumpHeightAvg } from '../../../../data/data.jump-stats';
import { DataMaxHRSetting } from '../../../../data/data.max-hr-setting';
import { DataAvgRespirationRate } from '../../../../data/data.avg-respiration-rate';
import { DataDistance } from '../../../../data/data.distance';
import { DataIBI } from '../../../../data/data.ibi';
import { DataPowerBalanceLeft } from '../../../../data/data.power-balance-left';
import { DataPowerBalanceRight } from '../../../../data/data.power-balance-right';
import { DataTime } from '../../../../data/data.time';
import { IBIStream } from '../../../../streams/ibi-stream';
import { DataCadence } from '../../../../data/data.cadence';
import { DataCadenceAvg } from '../../../../data/data.cadence-avg';
import { DataStrokeRate } from '../../../../data/data.stroke-rate';
import { DataStrokeRateAvg } from '../../../../data/data.stroke-rate-avg';
import { DataAscent } from '../../../../data/data.ascent';
import { DataDescent } from '../../../../data/data.descent';
import { DataAltitudeMin } from '../../../../data/data.altitude-min';
import { DataAltitudeMax } from '../../../../data/data.altitude-max';
import { DataAltitudeAvg } from '../../../../data/data.altitude-avg';
import { DataGradeMin } from '../../../../data/data.grade-min';
import { DataGradeMax } from '../../../../data/data.grade-max';
import { DataGradeAvg } from '../../../../data/data.grade-avg';
import { DataAltitude } from '../../../../data/data.altitude';
import { DataGrade } from '../../../../data/data.grade';
import { LapTypes } from '../../../../laps/lap.types';
import { FileType } from '../../file-type.enum';
import { Privacy } from '../../../../privacy/privacy.class.interface';

describe('EventImporterJSON legacy type compatibility', () => {
  const divingTerrainSummaryTypes = [
    DataAscent.type,
    DataDescent.type,
    DataAltitudeMin.type,
    DataAltitudeMax.type,
    DataAltitudeAvg.type,
    DataGradeMin.type,
    DataGradeMax.type,
    DataGradeAvg.type
  ];

  const divingTerrainStats = {
    [DataAscent.type]: 20,
    [DataDescent.type]: 10,
    [DataAltitudeMin.type]: -5,
    [DataAltitudeMax.type]: 5,
    [DataAltitudeAvg.type]: 0,
    [DataGradeMin.type]: -10,
    [DataGradeMax.type]: 10,
    [DataGradeAvg.type]: 0
  };

  it('normalizes stored cadence streams and summaries using activity semantics', () => {
    const activity = EventImporterJSON.getActivityFromJSON({
      name: 'stored-open-water-swim',
      startDate: 0,
      endDate: 2000,
      type: ActivityTypes.OpenWaterSwimming,
      powerMeter: false,
      trainer: false,
      stats: { [DataCadenceAvg.type]: 32 },
      streams: [{ type: DataCadence.type, data: [30, 32, 34] }],
      laps: [
        {
          lapId: 1,
          startDate: 0,
          endDate: 2000,
          startIndex: null,
          endIndex: null,
          type: LapTypes.Manual,
          stats: { [DataCadenceAvg.type]: 31 }
        }
      ],
      creator: { name: 'test', devices: [] },
      intensityZones: [],
      events: []
    });

    expect(activity.hasStreamData(DataCadence.type)).toBe(false);
    expect(activity.getStream(DataStrokeRate.type).getData()).toEqual([30, 32, 34]);
    expect(activity.getStat(DataCadenceAvg.type)).toBeUndefined();
    expect(activity.getStat(DataStrokeRateAvg.type)?.getValue()).toBe(32);
    expect(activity.getLaps()[0].getStat(DataStrokeRateAvg.type)?.getValue()).toBe(31);
    const serialized = activity.toJSON();
    expect(serialized.streams).toContainEqual({ type: DataStrokeRate.type, data: [30, 32, 34] });
    expect(EventImporterJSON.getActivityFromJSON(serialized).toJSON()).toEqual(serialized);
  });

  it('normalizes homogeneous stroke-rate event summaries without reparsing source files', () => {
    const event = EventImporterJSON.getEventFromJSON({
      name: 'stored-rowing-event',
      startDate: 0,
      endDate: 1000,
      srcFileType: FileType.FIT,
      description: null,
      isMerge: false,
      privacy: Privacy.Private,
      powerCurve: null,
      stats: { [DataCadenceAvg.type]: 28 },
      activities: [
        {
          name: null,
          startDate: 0,
          endDate: 1000,
          type: ActivityTypes.Rowing,
          powerMeter: false,
          trainer: false,
          powerCurve: null,
          stats: { [DataCadenceAvg.type]: 28 },
          streams: [],
          laps: [],
          creator: { name: 'test', devices: [] },
          intensityZones: [],
          events: []
        }
      ]
    });

    expect(event.getStat(DataCadenceAvg.type)).toBeUndefined();
    expect(event.getStat(DataStrokeRateAvg.type)?.getValue()).toBe(28);
    expect(event.getFirstActivity().getStat(DataStrokeRateAvg.type)?.getValue()).toBe(28);
  });

  it.each([
    ActivityTypes.Diving,
    ActivityTypes.ScubaDiving,
    ActivityTypes.FreeDiving,
    ActivityTypes.Snorkeling,
    ActivityTypes.Mermaiding
  ])('removes stored terrain summaries for %s without removing source streams', activityType => {
    const event = EventImporterJSON.getEventFromJSON({
      name: 'stored-dive-event',
      startDate: 0,
      endDate: 1000,
      srcFileType: FileType.FIT,
      description: null,
      isMerge: false,
      privacy: Privacy.Private,
      powerCurve: null,
      stats: {
        [DataActivityTypes.type]: [activityType],
        ...divingTerrainStats
      },
      activities: [
        {
          name: null,
          startDate: 0,
          endDate: 1000,
          type: activityType,
          powerMeter: false,
          trainer: false,
          powerCurve: null,
          stats: divingTerrainStats,
          streams: [
            { type: DataAltitude.type, data: [-5, 0, 5] },
            { type: DataGrade.type, data: [-10, 0, 10] }
          ],
          laps: [
            {
              lapId: 1,
              startDate: 0,
              endDate: 1000,
              startIndex: null,
              endIndex: null,
              type: LapTypes.Manual,
              stats: divingTerrainStats
            }
          ],
          creator: { name: 'test', devices: [] },
          intensityZones: [],
          events: []
        }
      ]
    });
    const activity = event.getFirstActivity();
    const lap = activity.getLaps()[0];

    [event, activity, lap].forEach(target => {
      divingTerrainSummaryTypes.forEach(dataType => expect(target.getStat(dataType)).toBeUndefined());
    });
    expect(activity.getStreamData(DataAltitude.type)).toEqual([-5, 0, 5]);
    expect(activity.getStreamData(DataGrade.type)).toEqual([-10, 0, 10]);
  });

  it('uses a summary-only event activity-type stat and preserves mixed terrain summaries', () => {
    const divingEvent = EventImporterJSON.getEventFromJSON({
      name: 'stored-summary-only-dive',
      startDate: 0,
      endDate: 1000,
      srcFileType: FileType.FIT,
      description: null,
      isMerge: false,
      privacy: Privacy.Private,
      powerCurve: null,
      stats: {
        [DataActivityTypes.type]: [ActivityTypes.ScubaDiving],
        ...divingTerrainStats
      },
      activities: []
    });
    const mixedEvent = EventImporterJSON.getEventFromJSON({
      name: 'stored-mixed-summary',
      startDate: 0,
      endDate: 1000,
      srcFileType: FileType.FIT,
      description: null,
      isMerge: false,
      privacy: Privacy.Private,
      powerCurve: null,
      stats: {
        [DataActivityTypes.type]: [ActivityTypes.ScubaDiving, ActivityTypes.Running],
        ...divingTerrainStats
      },
      activities: []
    });

    divingTerrainSummaryTypes.forEach(dataType => expect(divingEvent.getStat(dataType)).toBeUndefined());
    expect(mixedEvent.getStat(DataAscent.type)?.getValue()).toBe(20);
  });

  it('maps legacy stat keys to canonical types via DynamicDataLoader aliases', () => {
    const activity = EventImporterJSON.getActivityFromJSON({
      name: 'legacy-json',
      startDate: 0,
      endDate: 1000,
      type: ActivityTypes.Running,
      powerMeter: false,
      trainer: false,
      stats: {
        'Avg VAM': 123,
        'Jump Height Avg': 1.5,
        'Max HR Setting': 190,
        'Respiration Rate Avg': 16,
        'Left Balance': 51,
        'Right Balance': 49
      },
      streams: [],
      laps: [],
      creator: { name: 'test', devices: [] },
      intensityZones: [],
      events: []
    });

    expect(activity.getStat(DataAvgVAM.type)?.getValue()).toBe(123);
    expect(activity.getStat(DataJumpHeightAvg.type)?.getValue()).toBe(1.5);
    expect(activity.getStat(DataMaxHRSetting.type)?.getValue()).toBe(190);
    expect(activity.getStat(DataAvgRespirationRate.type)?.getValue()).toBe(16);
    expect(activity.getStat(DataPowerBalanceLeft.type)?.getValue()).toBe(51);
    expect(activity.getStat(DataPowerBalanceRight.type)?.getValue()).toBe(49);
  });

  it('prefers canonical stat keys when legacy aliases collide with them', () => {
    const activity = EventImporterJSON.getActivityFromJSON({
      name: 'mixed-json-balance-stats',
      startDate: 0,
      endDate: 1000,
      type: ActivityTypes.Cycling,
      powerMeter: true,
      trainer: false,
      stats: {
        [DataPowerBalanceLeft.type]: 61,
        'Left Balance': 51,
        'Right Balance': 49,
        [DataPowerBalanceRight.type]: 39
      },
      streams: [],
      laps: [],
      creator: { name: 'test', devices: [] },
      intensityZones: [],
      events: []
    });

    expect(activity.getStat(DataPowerBalanceLeft.type)?.getValue()).toBe(61);
    expect(activity.getStat(DataPowerBalanceRight.type)?.getValue()).toBe(39);
  });

  it('maps legacy balance stream keys to canonical power balance types', () => {
    const activity = EventImporterJSON.getActivityFromJSON({
      name: 'legacy-json-balance-streams',
      startDate: 0,
      endDate: 3000,
      type: ActivityTypes.Cycling,
      powerMeter: true,
      trainer: false,
      stats: {},
      streams: {
        'Left Balance': [51, 52, 53],
        'Right Balance': [49, 48, 47]
      },
      laps: [],
      creator: { name: 'test', devices: [] },
      intensityZones: [],
      events: []
    });

    expect(activity.hasStreamData('Left Balance')).toBe(false);
    expect(activity.hasStreamData('Right Balance')).toBe(false);
    expect(activity.getStream(DataPowerBalanceLeft.type).getData()).toEqual([51, 52, 53]);
    expect(activity.getStream(DataPowerBalanceRight.type).getData()).toEqual([49, 48, 47]);
  });

  it('dedupes mixed legacy and canonical balance streams without throwing', () => {
    const activity = EventImporterJSON.getActivityFromJSON({
      name: 'mixed-json-balance-streams',
      startDate: 0,
      endDate: 3000,
      type: ActivityTypes.Cycling,
      powerMeter: true,
      trainer: false,
      stats: {},
      streams: {
        [DataPowerBalanceLeft.type]: [61, 62, 63],
        'Left Balance': [51, 52, 53],
        'Right Balance': [49, 48, 47],
        [DataPowerBalanceRight.type]: [39, 38, 37]
      },
      laps: [],
      creator: { name: 'test', devices: [] },
      intensityZones: [],
      events: []
    });

    expect(activity.getStream(DataPowerBalanceLeft.type).getData()).toEqual([61, 62, 63]);
    expect(activity.getStream(DataPowerBalanceRight.type).getData()).toEqual([39, 38, 37]);
  });

  it('dedupes mixed legacy and canonical array streams without throwing', () => {
    const activity = EventImporterJSON.getActivityFromJSON({
      name: 'mixed-json-balance-array-streams',
      startDate: 0,
      endDate: 3000,
      type: ActivityTypes.Cycling,
      powerMeter: true,
      trainer: false,
      stats: {},
      streams: [
        { type: DataPowerBalanceLeft.type, data: [61, 62, 63] },
        { type: 'Left Balance', data: [51, 52, 53] },
        { type: 'Right Balance', data: [49, 48, 47] },
        { type: DataPowerBalanceRight.type, data: [39, 38, 37] }
      ],
      laps: [],
      creator: { name: 'test', devices: [] },
      intensityZones: [],
      events: []
    });

    expect(activity.getStream(DataPowerBalanceLeft.type).getData()).toEqual([61, 62, 63]);
    expect(activity.getStream(DataPowerBalanceRight.type).getData()).toEqual([39, 38, 37]);
  });

  it('ignores legacy object-form Time streams while preserving IBI streams', () => {
    const activity = EventImporterJSON.getActivityFromJSON({
      name: 'legacy-json-streams',
      startDate: 0,
      endDate: 3000,
      type: ActivityTypes.Running,
      powerMeter: false,
      trainer: false,
      stats: {},
      streams: {
        [DataTime.type]: [0, 1, 2, 3],
        [DataDistance.type]: [0, null, null, 30],
        [DataIBI.type]: [823, 823, 823]
      },
      laps: [],
      creator: { name: 'test', devices: [] },
      intensityZones: [],
      events: []
    });

    expect(activity.hasStreamData(DataTime.type)).toBe(false);
    expect(activity.getStream(DataDistance.type).getData()).toEqual([0, null, null, 30]);
    expect(activity.getStream(DataIBI.type)).toBeInstanceOf(IBIStream);
    expect(activity.generateTimeStream([DataIBI.type]).getData(true)).toEqual([1, 2]);
  });

  it('preserves zero-valued device fields and timestamps when importing creator JSON', () => {
    const creator = EventImporterJSON.getCreatorFromJSON({
      name: 'test',
      devices: [
        {
          type: 'bike computer',
          name: null,
          index: 0,
          batteryStatus: null,
          batteryLevel: 0,
          batteryVoltage: 0,
          manufacturer: null,
          serialNumber: null,
          product: 0,
          swInfo: null,
          hwInfo: null,
          antDeviceNumber: 0,
          antTransmissionType: 0,
          antNetwork: null,
          sourceType: null,
          antId: '0:0',
          cumOperatingTime: 0,
          timestamp: '2024-01-01T10:00:00.000Z'
        }
      ]
    });

    expect(creator.devices[0]).toMatchObject({
      type: 'bike computer',
      index: 0,
      batteryLevel: 0,
      batteryVoltage: 0,
      product: 0,
      antDeviceNumber: 0,
      antTransmissionType: 0,
      antId: '0:0',
      cumOperatingTime: 0
    });
    expect(creator.devices[0].timestamp?.toISOString()).toBe('2024-01-01T10:00:00.000Z');
  });
});
