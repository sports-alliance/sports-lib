import {StreamInterface} from './stream.interface';
import {StreamJSONInterface} from './stream.json.interface';
import {isNumber} from '../events/utilities/event.utilities';

export class Stream implements StreamInterface {
  public readonly type: string;
  public data: (number|null)[] = [];

  constructor(type: string, data?: (number|null)[]) {
    this.type = type;
    if (data) {
      this.data = data;
    }
  }

  getNumericData(): number[] {
    return <number[]>this.data.filter(data => isNumber(data))
  }

  toJSON(): StreamJSONInterface {
    return {
      type: this.type,
      data: this.data,
    };
  }
}
