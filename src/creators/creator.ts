import { CreatorInterface } from './creator.interface';
import { CreatorJSONInterface } from './creator.json.interface';
import { DeviceInterface } from '../activities/devices/device.interface';

export class Creator implements CreatorInterface {
  public name: string;
  public productId?: string;
  public manufacturer?: string;
  public swInfo?: string;
  public hwInfo?: string;
  public serialNumber?: string;
  public isRecognized?: boolean;
  public devices: DeviceInterface[] = [];

  constructor(
    name: string,
    productId?: string,
    manufacturer?: string,
    swInfo?: string,
    hwInfo?: string,
    serialNumber?: string,
    isRecognized?: boolean
  ) {
    this.name = name;

    if (productId) {
      this.productId = productId;
    }
    if (manufacturer) {
      this.manufacturer = manufacturer;
    }
    if (swInfo) {
      this.swInfo = swInfo;
    }
    if (hwInfo) {
      this.hwInfo = hwInfo;
    }
    if (serialNumber) {
      this.serialNumber = serialNumber;
    }

    this.isRecognized = !!isRecognized;
  }

  toJSON(): CreatorJSONInterface {
    return {
      name: this.name,
      manufacturer: this.manufacturer,
      isRecognized: this.isRecognized,
      productId: this.productId,
      serialNumber: this.serialNumber ? this.serialNumber : null,
      swInfo: this.swInfo ? this.swInfo : null,
      hwInfo: this.hwInfo ? this.hwInfo : null,
      devices: this.devices.reduce((devicesArray: any[], device: DeviceInterface) => {
        devicesArray.push(device.toJSON());
        return devicesArray;
      }, [])
    };
  }
}
