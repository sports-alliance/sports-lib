import {CreatorInterface} from './creator.interface';
import {CreatorJSONInterface} from './creator.json.interface';

export class Creator implements CreatorInterface {
  public name: string;
  public swInfo?: string;
  public hwInfo?: string;
  public serialNumber?: string;

  constructor(name: string) {
    this.name = name;
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
