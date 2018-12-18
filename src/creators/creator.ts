import {CreatorInterface} from './creator.interface';
import {CreatorJSONInterface} from './creator.json.interface';

export class Creator implements CreatorInterface {
  public name: string;
  public swInfo?: string;
  public hwInfo?: string;
  public serialNumber?: string;

  constructor(name: string, swInfo?: string, hwInfo? : string, serialNumber?: string) {
    this.name = name;
    if (swInfo){
      this.swInfo = swInfo;
    }
    if (hwInfo) {
      this.hwInfo = hwInfo
    }
    if (serialNumber){
      this.serialNumber = serialNumber;
    }
  }

  toJSON(): CreatorJSONInterface {
    return {
      name: this.name,
      serialNumber: this.serialNumber ? this.serialNumber : null,
      swInfo: this.swInfo ? this.swInfo : null,
      hwInfo: this.hwInfo ? this.hwInfo : null,
    };
  }
}
