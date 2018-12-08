import {StreamInterface} from './stream.interface';

export class Stream implements StreamInterface {
  public readonly type: string;
  public data: number[] = [];

  constructor(type: string, data?: number[]) {
    this.type = type;
    if (data) {
      this.data = data;
    }
  }

  toJSON(): any {
    return {
      type: this.type,
      data: this.data // @todo should perhaps iterate
    };
  }
}
