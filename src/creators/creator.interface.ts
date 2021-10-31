import { SerializableClassInterface } from '../serializable/serializable.class.interface';
import { CreatorJSONInterface } from './creator.json.interface';
import { DeviceInterface } from '../activities/devices/device.interface';

export interface CreatorInterface extends SerializableClassInterface {
  name: string;
  productId?: string;
  serialNumber?: string;
  devices: DeviceInterface[];
  swInfo?: string;
  hwInfo?: string;
  isRecognized?: boolean;

  toJSON(): CreatorJSONInterface;
}
