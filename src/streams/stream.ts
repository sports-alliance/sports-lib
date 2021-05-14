import { StreamDataItem, StreamInterface } from './stream.interface';
import { isNumber } from '../events/utilities/helpers';
import { DynamicDataLoader } from '../data/data.store';
import { StreamFilterInterface } from './stream.filter.interface';

export class Stream implements StreamInterface {
  public readonly type: string;
  protected data: (number | null)[] = [];

  protected filter: StreamFilterInterface | null = null;

  constructor(type: string, data?: (number | null)[]) {
    this.type = type;
    if (data) {
      this.data = data;
    }
  }

  clearFilters(): this {
    this.filter = null;
    return this;
  }

  useFilter(filter: StreamFilterInterface): this {
    this.filter = filter;
    return this;
  }

  hasFilter(): boolean {
    return !!this.filter;
  }

  getData(onlyNumeric = false, filterInfinity = false): (number | null)[] {
    const data = this.filter ? this.filter.filterData(this.data) : this.data;
    if (!onlyNumeric && !filterInfinity) {
      return data;
    }
    return <number[]>data.filter(dataItem => !this.shouldDataBeFiltered(dataItem, onlyNumeric, filterInfinity));
  }

  setData(data: (number | null)[]): this {
    this.data = data;
    return this;
  }

  getStreamDataByTime(startDate: Date, onlyNumeric = false, filterInfinity = false): StreamDataItem[] {
    return this.getData().reduce((accu, dataItem, index) => {
      if (this.shouldDataBeFiltered(dataItem, onlyNumeric, filterInfinity)) {
        return accu;
      }
      accu.push({
        time: startDate.getTime() + index * 1000,
        value: dataItem
      });
      return accu;
    }, <StreamDataItem[]>[]);
  }

  getStreamDataByDuration(offset: number = 0, onlyNumeric = false, filterInfinity = false): StreamDataItem[] {
    return this.getData().reduce((accu, dataItem, index) => {
      if (this.shouldDataBeFiltered(dataItem, onlyNumeric, filterInfinity)) {
        return accu;
      }
      accu.push({
        time: index * 1000 + (offset || 0),
        value: dataItem
      });
      return accu;
    }, <StreamDataItem[]>[]);
  }

  isExportable(): boolean {
    return (
      !DynamicDataLoader.isUnitDerivedDataType(this.type) &&
      !DynamicDataLoader.isSpeedDerivedDataType(this.type) &&
      !DynamicDataLoader.isBlackListedStream(this.type)
    );
  }

  toJSON(): StreamJSONInterface {
    return {
      type: this.type,
      data: this.data // Exporting does/ should not use a filter
    };
  }

  private shouldDataBeFiltered(data: any, onlyNumeric: boolean, filterInfinity: boolean): boolean {
    return (onlyNumeric && !isNumber(data)) || (filterInfinity && (data === Infinity || data === -Infinity));
  }
}

export interface StreamJSONInterface {
  type: string;
  data: (number | null)[];
}
