import * as fs from 'fs';
import * as path from 'path';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { Device } from '../../../../activities/devices/device';
import { DeviceInterface } from '../../../../activities/devices/device.interface';
import { EventImporterFIT } from './importer.fit';

const signatureWithoutTimestamp = (device: DeviceInterface): string => {
  return JSON.stringify([
    device.type,
    device.name,
    device.index,
    device.batteryStatus,
    device.batteryLevel,
    device.batteryVoltage,
    device.manufacturer,
    device.serialNumber,
    device.product,
    device.swInfo,
    device.hwInfo,
    device.antDeviceNumber,
    device.antTransmissionType,
    device.antNetwork,
    device.sourceType,
    device.antId,
    device.cumOperatingTime
  ]);
};

describe('EventImporterFIT Device Info Mode', () => {
  const fitFilePath = path.join(
    __dirname,
    '../../../../specs/fixtures/rides/fit/garmin-device-info-spam.fit'
  );

  it('should keep raw behavior and compact timestamp-only device_info repeats in changes mode', async () => {
    const fileContent = fs.readFileSync(fitFilePath);
    const arrayBuffer = fileContent.buffer.slice(
      fileContent.byteOffset,
      fileContent.byteOffset + fileContent.byteLength
    );

    const rawOptions = new ActivityParsingOptions({ generateUnitStreams: false, deviceInfoMode: 'raw' });
    const changesOptions = new ActivityParsingOptions({ generateUnitStreams: false, deviceInfoMode: 'changes' });

    const [rawEvent, changesEvent] = await Promise.all([
      EventImporterFIT.getFromArrayBuffer(arrayBuffer, rawOptions, 'Raw Device Infos'),
      EventImporterFIT.getFromArrayBuffer(arrayBuffer, changesOptions, 'Compacted Device Infos')
    ]);

    const rawDevices = rawEvent.getFirstActivity().creator.devices;
    const changesDevices = changesEvent.getFirstActivity().creator.devices;

    expect(rawDevices.length).toBeGreaterThan(4000);
    expect(changesDevices.length).toBeLessThan(rawDevices.length / 10);

    let maxContiguousRun = 1;
    let currentRun = 1;
    for (let i = 1; i < changesDevices.length; i++) {
      const previousSignature = signatureWithoutTimestamp(changesDevices[i - 1]);
      const currentSignature = signatureWithoutTimestamp(changesDevices[i]);

      if (previousSignature === currentSignature) {
        currentRun++;
        const previousTimestamp = changesDevices[i - 1].timestamp?.toISOString();
        const currentTimestamp = changesDevices[i].timestamp?.toISOString();
        expect(previousTimestamp).not.toEqual(currentTimestamp);
      } else {
        currentRun = 1;
      }

      if (currentRun > maxContiguousRun) {
        maxContiguousRun = currentRun;
      }
    }

    expect(maxContiguousRun).toBeLessThanOrEqual(2);
  });

  it('should keep first and last item for each contiguous identical run', () => {
    const createDevice = (type: string, name: string, index: number, timestamp: string): DeviceInterface => {
      const device = new Device(type);
      device.name = name;
      device.index = index;
      device.timestamp = new Date(timestamp);
      return device;
    };

    const devices: DeviceInterface[] = [
      createDevice('fitness equipment', 'Tacx', 4, '2024-01-01T10:00:00.000Z'),
      createDevice('fitness equipment', 'Tacx', 4, '2024-01-01T10:00:01.000Z'),
      createDevice('fitness equipment', 'Tacx', 4, '2024-01-01T10:00:02.000Z'),
      createDevice('bike computer', 'Edge', 0, '2024-01-01T10:00:03.000Z'),
      createDevice('fitness equipment', 'Tacx', 4, '2024-01-01T10:00:04.000Z'),
      createDevice('fitness equipment', 'Tacx', 4, '2024-01-01T10:00:05.000Z'),
      createDevice('heart rate', 'HRM', 1, '2024-01-01T10:00:06.000Z')
    ];

    const compacted = (EventImporterFIT as any).compactDeviceInfosByRuns(devices) as DeviceInterface[];

    expect(compacted.map(device => device.timestamp?.toISOString())).toEqual([
      '2024-01-01T10:00:00.000Z',
      '2024-01-01T10:00:02.000Z',
      '2024-01-01T10:00:03.000Z',
      '2024-01-01T10:00:04.000Z',
      '2024-01-01T10:00:05.000Z',
      '2024-01-01T10:00:06.000Z'
    ]);
  });
});
