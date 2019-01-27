import {Stream} from "./stream";
import {StreamDataItem} from "./stream.interface";
import {IBIData} from "../data/ibi/data.ibi";

export class IBIStream extends Stream {
  constructor(data?: number[]) {
    super('IBI');
    if (data) {
      this.data = data
    }
  }

  getStreamDataByTime(startDate: Date): StreamDataItem[] {
    let time = 0;
    return this.data.reduce((accu, dataItem, index) => {
      time += <number>dataItem;
      accu.push({
        time: startDate.getTime() + time,
        value: dataItem,
      });
      return accu;
    }, <StreamDataItem[]>[])
  }

  //
  getStreamDataByDuration(offset?: number, filter = true): StreamDataItem[] {
    // let data = (new IBIData(<number[]>this.data))
    //   .lowLimitBPMFilter()
    //   .lowPassFilter()
    //   .highLimitBPMFilter().getAsArray();
    let data = this.data;
    let time = offset || 0;
    return data.reduce((accu, dataItem, index) => {
      time += <number>dataItem;
      accu.push({
        time: time,
        value: dataItem,
      });
      return accu;
    }, <StreamDataItem[]>[])
  }
}
