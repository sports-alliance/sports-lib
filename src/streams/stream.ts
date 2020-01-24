import { StreamDataItem, StreamInterface } from './stream.interface';
import { isNumber } from '../events/utilities/helpers';
import { DynamicDataLoader } from '../data/data.store';

export class Stream implements StreamInterface {
  public readonly type: string;
  protected data: (number | null)[] = [];

  constructor(type: string, data?: (number | null)[]) {
    this.type = type;
    if (data) {
      this.data = data;
    }
  }

  getData(onlyNumeric = false, filterInfinity = false): (number | null)[] {
    if (!onlyNumeric && !filterInfinity) {
      return this.data;
    }
    return <number[]>this.data.filter(dataItem => !this.shouldDataBeFiltered(dataItem, onlyNumeric, filterInfinity))
  }

  getDurationOfData(onlyNumeric?: boolean, filterInfinity?: boolean): (number | null)[] {
    return this.getStreamDataByDuration(0, onlyNumeric, filterInfinity).map(data => data.time / 1000);
  }

  setData(data: (number | null)[]): this {
    this.data = data;
    return this;
  }

  getStreamDataByTime(startDate: Date, onlyNumeric = false, filterInfinity = false): StreamDataItem[] {
    return this.data.reduce((accu, dataItem, index) => {
      if (this.shouldDataBeFiltered(dataItem, onlyNumeric, filterInfinity)) {
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
      if (this.shouldDataBeFiltered(dataItem, onlyNumeric, filterInfinity)) {
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

  private shouldDataBeFiltered(data: any, onlyNumeric: boolean, filterInfinity: boolean): boolean {
    return (onlyNumeric && !isNumber(data)) || (filterInfinity && (data === Infinity || data === -Infinity))
  }
}

export interface StreamJSONInterface {
  type: string;
  data: (number | null)[];
}
