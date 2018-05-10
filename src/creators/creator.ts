import {CreatorInterface} from './creatorInterface';

export class Creator implements CreatorInterface {
  public name: string;
  public swInfo?: string;
  public hwInfo?: string;
  public serialNumber?: string;

  constructor(name: string) {
    this.name = name;
  }

  toJSON(): any {
    return {
      name: this.name,
      serialNumber: this.serialNumber,
      swInfo: this.swInfo,
      hwInfo: this.hwInfo,
    };
  }
}
