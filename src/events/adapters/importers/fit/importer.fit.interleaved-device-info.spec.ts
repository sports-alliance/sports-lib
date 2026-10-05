const mockParse = jest.fn();

jest.mock('fit-file-parser', () => {
  const actual = jest.requireActual('fit-file-parser');
  return {
    ...actual,
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({ parse: mockParse }))
  };
});

import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { DataBatteryConsumption } from '../../../../data/data.battery-consumption';
import { EventImporterFIT } from './importer.fit';

// Synthetic decoded FIT messages reproduce the alternating equipment-profile
// pattern. No source file, user identifiers, or private device values are used.
const createInterleavedFitPayload = () => {
  const samples = 3000;
  const at = (second: number) => new Date(Date.UTC(2024, 0, 1, 10, 0, second));
  const creator = {
    device_index: 0,
    source_type: 'local',
    manufacturer: 'garmin',
    product: 1836
  };
  const equipment = {
    source_type: 'antplus',
    manufacturer: 'wahoo_fitness',
    product_name: 'Synthetic trainer',
    serial_number: 123456,
    ant_device_number: 123,
    ant_transmission_type: 1,
    ant_network: 'antplus'
  };
  const deviceInfos = [
    { ...creator, battery_level: 100, timestamp: at(0) },
    ...Array.from({ length: samples }, (_, second) => [
      { ...equipment, device_index: 4, device_type: 'fitness_equipment', timestamp: at(second) },
      { ...equipment, device_index: 5, device_type: 11, timestamp: at(second) }
    ]).flat(),
    { ...creator, battery_level: 98, timestamp: at(samples - 1) }
  ];
  const summary = {
    start_time: at(0),
    timestamp: at(samples - 1),
    total_elapsed_time: samples - 1,
    total_timer_time: samples - 1,
    total_distance: 12000
  };

  return {
    file_ids: [{ manufacturer: 'garmin', product: 1836 }],
    device_infos: deviceInfos,
    events: [],
    sessions: [{ ...summary, sport: 'cycling', sub_sport: 'indoor_cycling', laps: [summary] }],
    records: [
      { timestamp: at(0), distance: 0, power: 180, heart_rate: 120 },
      { timestamp: at(samples - 1), distance: 12000, power: 200, heart_rate: 140 }
    ]
  };
};

describe('EventImporterFIT interleaved device-info regression', () => {
  beforeEach(() => {
    mockParse.mockReset();
    mockParse.mockImplementation((_buffer: ArrayBuffer, callback: (error: unknown, payload: unknown) => void) => {
      callback(null, createInterleavedFitPayload());
    });
  });

  it('compacts thousands of alternating profiles without changing workout data or raw mode', async () => {
    const importWithMode = (deviceInfoMode: 'raw' | 'changes') =>
      EventImporterFIT.getFromArrayBuffer(
        new ArrayBuffer(1),
        new ActivityParsingOptions({ generateUnitStreams: false, deviceInfoMode })
      );
    const raw = (await importWithMode('raw')).getFirstActivity();
    const changes = (await importWithMode('changes')).getFirstActivity();

    expect(raw.creator.devices).toHaveLength(6002);
    expect(changes.creator.devices).toHaveLength(6);
    expect(changes.creator.devices.map(device => [device.index, device.timestamp?.toISOString()])).toEqual([
      [0, '2024-01-01T10:00:00.000Z'],
      [4, '2024-01-01T10:00:00.000Z'],
      [5, '2024-01-01T10:00:00.000Z'],
      [4, '2024-01-01T10:49:59.000Z'],
      [5, '2024-01-01T10:49:59.000Z'],
      [0, '2024-01-01T10:49:59.000Z']
    ]);
    expect(Buffer.byteLength(JSON.stringify(raw.creator.toJSON()))).toBeGreaterThan(1024 * 1024);
    expect(Buffer.byteLength(JSON.stringify(changes.creator.toJSON()))).toBeLessThan(10_000);

    expect(changes.toJSON()).toEqual({
      ...raw.toJSON(),
      creator: { ...raw.creator.toJSON(), devices: changes.creator.devices.map(device => device.toJSON()) }
    });
    expect(changes.getStat(DataBatteryConsumption.type)?.getValue()).toBe(2);
  });
});
