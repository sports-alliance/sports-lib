import { DeviceJsonInterface } from '../activities/devices/device.json.interface';

export interface CreatorJSONInterface {
  name: string;
  productId?: string | null;
  serialNumber?: string | null;
  swInfo?: string | null;
  hwInfo?: string | null;
  devices: DeviceJsonInterface[];
}
