import {Stream} from "./stream";
import {StreamDataItem} from "./stream.interface";

export class IBIStream extends Stream{
  public data: number[] = [];
  constructor(data?: number[]){
    super('IBI', data)
  }
  getStreamDataByTime(startDate: Date): StreamDataItem[]{
    return this.data.reduce((accu, dataItem, index) => {
      accu.push({
        time: startDate.getTime() + dataItem,
        value: dataItem,
      });
      return accu;
    }, <StreamDataItem[]>[])
  }
}
