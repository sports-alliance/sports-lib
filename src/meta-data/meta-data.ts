import {
  GarminHealthAPIEventMetaDataInterface,
  ServiceNames,
  SuuntoAppEventMetaDataInterface
} from './event-meta-data.interface';
import {
  GarminHealthAPIEventMetaDataJsonInterface,
  SuuntoAppEventMetaDataJsonInterface
} from './meta-data.json.interface';

export class SuuntoAppEventMetaData implements SuuntoAppEventMetaDataInterface {
  serviceName: ServiceNames;

  constructor(public serviceWorkoutID: string, public serviceUserName: string, public date: Date) {
    this.serviceWorkoutID = serviceWorkoutID;
    this.serviceName = ServiceNames.SuuntoApp;
    this.date = date;
  }

  toJSON(): SuuntoAppEventMetaDataJsonInterface {
    return {
      serviceWorkoutID: this.serviceWorkoutID,
      serviceName: this.serviceName,
      serviceUserName: this.serviceUserName,
      date: this.date.getTime()
    }
  }

}

export class GarminHealthAPIEventMetaData implements GarminHealthAPIEventMetaDataInterface {
  serviceName: ServiceNames;

  constructor(public serviceUserID: string,
              public serviceActivityFileID: string,
              public serviceActivityFileType: 'FIT' | 'TCX' | 'GPX',
              public serviceManual: boolean,
              public serviceStartTimeInSeconds: number,
              public date: Date) {
    this.serviceName = ServiceNames.GarminHealthAPI;
    this.date = date;
  }

  toJSON(): GarminHealthAPIEventMetaDataJsonInterface {
    return {
      serviceUserID: this.serviceUserID,
      serviceName: this.serviceName,
      serviceActivityFileID: this.serviceActivityFileID,
      serviceActivityFileType: this.serviceActivityFileType,
      serviceManual: this.serviceManual,
      serviceStartTimeInSeconds: this.serviceStartTimeInSeconds,
      date: this.date.getTime()
    }
  }
}
