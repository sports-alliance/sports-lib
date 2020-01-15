import {StreamDataItem, StreamInterface} from './stream.interface';
import {isNumber} from '../events/utilities/helpers';
import {DynamicDataLoader} from '../data/data.store';

export class Stream implements StreamInterface {
  public readonly type: string;
  public data: (number | null)[] = [];

  constructor(type: string, data?: (number | null)[]) {
    this.type = type;
    if (data) {
      this.data = data;
    }
  }

  getNumericData(): number[] {
    return <number[]>this.data.filter(data => isNumber(data))
  }

  getStreamDataByTime(startDate: Date, onlyNumeric = false, filterInfinity = false): StreamDataItem[] {
    return this.data.reduce((accu, dataItem, index) => {
      if ((onlyNumeric && !isNumber(dataItem)) || (filterInfinity && (dataItem === Infinity || dataItem === -Infinity))) {
        return accu
      }
      accu.push({
        time: startDate.getTime() + index * 1000,
        value: dataItem,
      });
      return accu;
    }, <StreamDataItem[]>[])
  }

  getStreamDataByDuration(offset: number = 0, onlyNumeric = false, filterInfinity = false): StreamDataItem[] {
    return this.data.reduce((accu, dataItem, index) => {
      if ((onlyNumeric && !isNumber(dataItem)) || (filterInfinity && (dataItem === Infinity || dataItem === -Infinity))) {
        return accu
      }
      accu.push({
        time: index * 1000 + (offset || 0),
        value: dataItem,
      });
      return accu;
    }, <StreamDataItem[]>[])
  }

  isUnitDerivedDataType(): boolean {
    return DynamicDataLoader.isUnitDerivedDataType(this.type);
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
  data: (number | null)[];
}
