import {StreamDataInterface} from './stream.data.interface';
import {DataInterface} from '../data/data.interface';

export class StreamData implements StreamDataInterface {

  date: Date;
  data: DataInterface;

  constructor(date: Date, data: DataInterface){
    this.date = date;
    this.data = data;
  }

  toJSON(): any {
    return {
      [this.date.getTime()]: this.data.getValue()
    }
  }
}
