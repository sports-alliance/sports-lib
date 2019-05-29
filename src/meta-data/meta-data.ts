import {MetaDataInterface, ServiceNames} from './meta-data.interface';
import {MetaDataJsonInterface} from './meta-data.json.interface';

export class MetaData implements MetaDataInterface {
  date: Date;
  id: string;
  serviceName: ServiceNames;
  serviceUserName: string;

  constructor(service: ServiceNames, id: string, serviceUser: string, date: Date) {
    this.id = id;
    this.serviceName = service;
    this.date = date;
    this.serviceUserName = serviceUser
  }

  toJSON(): MetaDataJsonInterface {
    return {
      id: this.id,
      serviceName: this.serviceName,
      serviceUserName: this.serviceUserName,
      date: this.date.getTime()
    }
  }

}
