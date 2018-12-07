import {PointInterface} from './point.interface';
import {DataInterface} from '../data/data.interface';
import {DataLatitudeDegrees} from '../data/data.latitude-degrees';
import {DataPositionInterface} from '../data/data.position.interface';
import {DataLongitudeDegrees} from '../data/data.longitude-degrees';
import {IDClass} from '../id/id.abstract.class';
import {IDClassInterface} from '../id/id.class.interface';

export class Point extends IDClass implements PointInterface {

  private date: Date;
  private data: Map<string, DataInterface> = new Map<string, DataInterface>();

  constructor(date: Date) {
    super();
    this.date = date;
  }

  getDate(): Date {
    return this.date;
  }

  addData(data: DataInterface) {
    this.data.set(data.getType(), data);
  }

  removeDataByType(dataType: string) {
    this.data.delete(dataType)
  }

  getData(): Map<string, DataInterface> {
    return this.data;
  }

  getDataByType(dataType: string): DataInterface | void {
    return this.data.get(dataType);
  }

  getPosition(): DataPositionInterface | void {
    const dataLatitudeDegrees = this.getData().get(DataLatitudeDegrees.type);
    const dataLongitudeDegrees = this.getData().get(DataLongitudeDegrees.type);
    if (!dataLongitudeDegrees || !dataLatitudeDegrees) {
      return;
    }
    return {
      latitudeDegrees: Number(dataLatitudeDegrees.getValue()),
      longitudeDegrees: Number(dataLongitudeDegrees.getValue()),
    };
  }

  toJSON(): any {
    let dataArray: any[] = [];
    this.getData().forEach((value, key, map) => {
      dataArray = dataArray.concat(value);
    });
    return {
      date: this.getDate().toJSON(),
      data: dataArray.reduce((jsonDataArray: any[], data: DataInterface) => {
        jsonDataArray.push(data.toJSON());
        return jsonDataArray;
      }, []),
    };
  }
}
