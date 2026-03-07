import { EventImporterJSON } from './importer.json';
import { ActivityTypes } from '../../../../activities/activity.types';
import { DataAvgVAM } from '../../../../data/data.avg-vam';
import { DataJumpHeightAvg } from '../../../../data/data.jump-stats';
import { DataMaxHRSetting } from '../../../../data/data.max-hr-setting';
import { DataAvgRespirationRate } from '../../../../data/data.avg-respiration-rate';
import { DataDistance } from '../../../../data/data.distance';
import { DataIBI } from '../../../../data/data.ibi';
import { DataTime } from '../../../../data/data.time';
import { IBIStream } from '../../../../streams/ibi-stream';

describe('EventImporterJSON legacy type compatibility', () => {
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
        'Respiration Rate Avg': 16
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
