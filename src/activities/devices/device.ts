import { DeviceInterface } from './device.interface';
import { DeviceJsonInterface } from './device.json.interface';
import { isNumber } from '../../events/utilities/helpers';

export class Device implements DeviceInterface {
  type: string;
  name?: string;
  index?: number;
  batteryStatus?: string;
  batteryLevel?: number;
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
  antId?: string;
  cumOperatingTime?: number;
  timestamp?: Date;

  constructor(type: string) {
    this.type = type || 'Unknown';
  }

  toJSON(): DeviceJsonInterface {
    return {
      type: this.type,
      index: isNumber(this.index) ? <number>this.index : null,
      batteryStatus: this.batteryStatus || null,
      batteryLevel: isNumber(this.batteryLevel) ? <number>this.batteryLevel : null,
      name: this.name || null,
      batteryVoltage: isNumber(this.batteryVoltage) ? <number>this.batteryVoltage : null,
      manufacturer: this.manufacturer || null,
      serialNumber: this.serialNumber || null,
      product: isNumber(this.product) ? <number>this.product : null,
      swInfo: this.swInfo || null,
      hwInfo: this.hwInfo || null,
      antDeviceNumber: isNumber(this.antDeviceNumber) ? <number>this.antDeviceNumber : null,
      antTransmissionType: isNumber(this.antTransmissionType) ? <number>this.antTransmissionType : null,
      antNetwork: this.antNetwork || null,
      sourceType: this.sourceType || null,
      antId: this.antId || null,
      cumOperatingTime: isNumber(this.cumOperatingTime) ? <number>this.cumOperatingTime : null,
      timestamp: this.timestamp ? this.timestamp.toISOString() : null
    };
  }
}
