import { Stream } from './stream';
import { StreamDataItem } from './stream.interface';

export class IBIStream extends Stream {
  constructor(data?: number[]) {
    super('IBI');
    if (data) {
      this.data = data;
    }
  }

  getStreamDataByTime(startDate: Date, filterNull = false): StreamDataItem[] {
    let time = 0;
    return this.data.reduce((accu, dataItem, index) => {
      time += <number>dataItem;
      if (filterNull && dataItem === null) {
        return accu;
      }
      accu.push({
        time: startDate.getTime() + time,
        value: dataItem
      });
      return accu;
    }, <StreamDataItem[]>[]);
  }

  //
  getStreamDataByDuration(offset?: number, filterNull = false): StreamDataItem[] {
    // let data = (new IBIData(<number[]>this.data))
    //   .lowLimitBPMFilter()
    //   .lowPassFilter()
    //   .highLimitBPMFilter().getAsArray();
    const data = this.data;
    let time = offset || 0;
    return data.reduce((accu, dataItem, index) => {
      time += <number>dataItem;
      if (filterNull && dataItem === null) {
        return accu;
      }
      accu.push({
        time: time,
        value: dataItem
      });
      return accu;
    }, <StreamDataItem[]>[]);
  }
}
