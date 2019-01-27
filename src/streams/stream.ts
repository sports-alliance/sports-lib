import {StreamDataItem, StreamInterface} from './stream.interface';
import {isNumber} from "../events/utilities/helpers";

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

  getStreamDataByTime(startDate: Date): StreamDataItem[]{
    return this.data.reduce((accu, dataItem, index) => {
      accu.push({
        time: startDate.getTime() + index * 1000,
        value: dataItem,
      });
      return accu;
    }, <StreamDataItem[]>[])
  }

  getStreamDataByDuration(offset?:number): StreamDataItem[]{
    return this.data.reduce((accu, dataItem, index) => {
      accu.push({
        time:  index * 1000 + (offset || 0),
        value: dataItem,
      });
      return accu;
    }, <StreamDataItem[]>[])
  }

  toJSON(): StreamJSONInterface {
    return {
      type: this.type,
      data: this.data,
    };
  }
}

export interface StreamJSONInterface {
  type: string;
  data: (number|null)[];
}
