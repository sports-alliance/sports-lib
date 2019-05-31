import {MetaDataInterface, ServiceNames} from './meta-data.interface';
import {MetaDataJsonInterface} from './meta-data.json.interface';

export class MetaData implements MetaDataInterface {
  date: Date;
  serviceWorkoutID: string;
  serviceName: ServiceNames;
  serviceUserName: string;

  constructor(service: ServiceNames, serviceWorkoutID: string, serviceUser: string, date: Date) {
    this.serviceWorkoutID = serviceWorkoutID;
    this.serviceName = service;
    this.date = date;
    this.serviceUserName = serviceUser
  }

  toJSON(): MetaDataJsonInterface {
    return {
      serviceWorkoutID: this.serviceWorkoutID,
      serviceName: this.serviceName,
      serviceUserName: this.serviceUserName,
      date: this.date.getTime()
    }
  }

}
