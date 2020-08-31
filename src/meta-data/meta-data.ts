import {
  COROSAPIEventMetaDataInterface,
  GarminHealthAPIEventMetaDataInterface,
  ServiceNames,
  SuuntoAppEventMetaDataInterface
} from './event-meta-data.interface';
import {
  COROSAPIEventMetaDataJsonInterface,
  GarminHealthAPIEventMetaDataJsonInterface,
  SuuntoAppEventMetaDataJsonInterface
} from './meta-data.json.interface';

export class SuuntoAppEventMetaData implements SuuntoAppEventMetaDataInterface {
  serviceName = ServiceNames.SuuntoApp;

  constructor(public serviceWorkoutID: string, public serviceUserName: string, public date: Date) {
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

export class COROSAPIEventMetaData implements COROSAPIEventMetaDataInterface {
  serviceName = ServiceNames.COROSAPI

  constructor(public serviceWorkoutID: string, public serviceOpenId: string, public serviceFITFileURI: string , public date: Date) {
  }

  toJSON(): COROSAPIEventMetaDataJsonInterface {
    return {
      serviceWorkoutID: this.serviceWorkoutID,
      serviceName: this.serviceName,
      serviceOpenId: this.serviceOpenId,
      serviceFITFileURI: this.serviceFITFileURI,
      date: this.date.getTime()
    }
  }

}

export class GarminHealthAPIEventMetaData implements GarminHealthAPIEventMetaDataInterface {
  serviceName = ServiceNames.GarminHealthAPI

  constructor(public serviceUserID: string,
              public serviceActivityFileID: string,
              public serviceActivityFileType: 'FIT' | 'TCX' | 'GPX',
              public serviceManual: boolean,
              public serviceStartTimeInSeconds: number,
              public date: Date) {
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
