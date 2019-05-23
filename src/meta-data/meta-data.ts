import {MetaDataInterface, ServiceNames} from './meta-data.interface';
import {MetaDataJsonInterface} from './meta-data.json.interface';

export class MetaData implements MetaDataInterface {
  date: Date;
  id: string;
  serviceNames: ServiceNames;

  constructor(service: ServiceNames, id: string, date: Date) {
    this.id = id;
    this.serviceNames = service;
    this.date = date;
  }

  toJSON(): MetaDataJsonInterface {
    return {
      id: this.id,
      service: this.serviceNames,
      date: this.date.toJSON()
    }
  }

}


