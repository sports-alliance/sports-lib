import { DynamicDataLoader } from '../data/data.store';
import { isNumber } from '../events/utilities/helpers';
import { StreamJSONInterface } from '../streams/stream';
import { RouteStreamDataItem, RouteStreamInterface } from './route-stream.interface';

export class RouteStream implements RouteStreamInterface {
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
    return this.data.filter(dataItem => !this.shouldDataBeFiltered(dataItem, onlyNumeric, filterInfinity));
  }

  setData(data: (number | null)[]): this {
    this.data = data;
    return this;
  }

  getStreamDataByIndex(onlyNumeric = false, filterInfinity = false): RouteStreamDataItem[] {
    return this.data.reduce((accu: RouteStreamDataItem[], dataItem, index) => {
      if (this.shouldDataBeFiltered(dataItem, onlyNumeric, filterInfinity)) {
        return accu;
      }
      accu.push({ index, value: dataItem });
      return accu;
    }, []);
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
      data: this.data
    };
  }

  private shouldDataBeFiltered(data: any, onlyNumeric: boolean, filterInfinity: boolean): boolean {
    return (onlyNumeric && !isNumber(data)) || (filterInfinity && (data === Infinity || data === -Infinity));
  }
}
