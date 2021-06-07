import { DeviceInterface } from './device.interface';
import { DeviceJsonInterface } from './device.json.interface';
import { isNumber } from '../../events/utilities/helpers';

export class Device implements DeviceInterface {
  type: string;
  name?: string;
  index?: number;
  batteryStatus?: string;
  batteryVoltage?: number;
  manufacturer?: string;
  serialNumber?: string;
  product?: number;
  swInfo?: string;
  hwInfo?: string;
  antDeviceNumber?: number;
  antTransmissionType?: number;
  antNetwork?: string;
  sourceType?: string;
  cumOperatingTime?: number;

  constructor(type: string) {
    this.type = type || 'Unknown';
  }

  toJSON(): DeviceJsonInterface {
    return {
      type: this.type,
      index: isNumber(this.index) ? this.index || null : null,
      batteryStatus: this.batteryStatus || null,
      name: this.name || null,
      batteryVoltage: this.batteryVoltage || null,
      manufacturer: this.manufacturer || null,
      serialNumber: this.serialNumber || null,
      product: this.product || null,
      swInfo: this.swInfo || null,
      hwInfo: this.hwInfo || null,
      antDeviceNumber: this.antDeviceNumber || null,
      antTransmissionType: this.antTransmissionType || null,
      antNetwork: this.antNetwork || null,
      sourceType: this.sourceType || null,
      cumOperatingTime: this.cumOperatingTime || null
    };
  }
}
