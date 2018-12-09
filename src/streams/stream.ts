import {StreamInterface} from './stream.interface';
import {StreamJSONInterface} from './stream.json.interface';

export class Stream implements StreamInterface {
  public readonly type: string;
  public data: number[] = [];

  constructor(type: string, data?: number[]) {
    this.type = type;
    if (data) {
      this.data = data;
    }
  }

  toJSON(): StreamJSONInterface {
    return {
      type: this.type,
      data: this.data
    };
  }
}
