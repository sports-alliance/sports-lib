import {Stream} from "./stream";
import {StreamDataItem} from "./stream.interface";

export class IBIStream extends Stream{
  constructor(data?: number[]){
    super('IBI');
    if (data) {
      this.data = data
    }
  }
  getStreamDataByTime(startDate: Date): StreamDataItem[]{
    let time = 0;
    return this.data.reduce((accu, dataItem, index) => {
      time += <number>dataItem;
      accu.push({
        time: startDate.getTime() + time ,
        value: dataItem,
      });
      return accu;
    }, <StreamDataItem[]>[])
  }
  //
  getStreamDataByDuration(offset?:number): StreamDataItem[]{
    let time = offset || 0;
    return this.data.reduce((accu, dataItem, index) => {
      time += <number>dataItem;
      accu.push({
        time:  time,
        value: dataItem,
      });
      return accu;
    }, <StreamDataItem[]>[])
  }
}
