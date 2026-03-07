import { Device } from './device';

describe('Device', () => {
  it('should preserve zero-valued numeric fields when exporting to JSON', () => {
    const device = new Device('bike computer');
    device.index = 0;
    device.batteryLevel = 0;
    device.batteryVoltage = 0;
    device.product = 0;
    device.antDeviceNumber = 0;
    device.antTransmissionType = 0;
    device.cumOperatingTime = 0;

    expect(device.toJSON()).toEqual({
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
      antId: null,
      cumOperatingTime: 0,
      timestamp: null
    });
  });
});
