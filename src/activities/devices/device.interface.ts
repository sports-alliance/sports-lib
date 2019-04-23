import {SerializableClassInterface} from "../../serializable/serializable.class.interface";

export interface DeviceInterface extends SerializableClassInterface {
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
}
