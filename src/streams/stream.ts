import {StreamInterface} from './stream.interface';
import {StreamDataInterface} from './stream.data.interface';

export class Stream implements StreamInterface {
  public readonly type: string;
  public stream: StreamDataInterface[] = [];

  constructor(type: string) {
    this.type = type;
  }

  toJSON(): any {
    return {
      type: this.type,
      stream: this.stream // @todo should perhaps iterate
    };
  }
}
