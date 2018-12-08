import {StreamInterface} from './stream.interface';
import {StreamDataInterface} from './stream.data.interface';

export class Stream implements StreamInterface {
  public readonly type: string;
  public data: StreamDataInterface[] = [];

  constructor(type: string) {
    this.type = type;
  }

  toJSON(): any {
    return {
      type: this.type,
      data: this.data // @todo should perhaps iterate
    };
  }
}
