import {MetaDataInterface, ServiceNames} from './meta-data.interface';
import {MetaDataJsonInterface} from './meta-data.json.interface';

export class MetaData implements MetaDataInterface {
  date: Date;
  id: string;
  serviceName: ServiceNames;
  serviceUser: string;

  constructor(service: ServiceNames, id: string, serviceUser: string, date: Date) {
    this.id = id;
    this.serviceName = service;
    this.date = date;
    this.serviceUser = serviceUser
  }

  toJSON(): MetaDataJsonInterface {
    return {
      id: this.id,
      serviceName: this.serviceName,
      serviceUser: this.serviceUser,
      date: this.date.toJSON()
    }
  }

}
