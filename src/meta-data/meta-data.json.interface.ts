import { ServiceNames } from './event-meta-data.interface';

export interface EventMetaDataJsonInterface {
  serviceName: ServiceNames;
  date: number,
}

export interface SuuntoAppEventMetaDataJsonInterface extends EventMetaDataJsonInterface{
  serviceUserName: string;
  serviceWorkoutID: string,
}

export interface GarminHealthAPIEventMetaDataJsonInterface extends EventMetaDataJsonInterface{
  serviceUserID: string;
  serviceActivityFileID: string;
  serviceActivityFileType: 'FIT' | 'TCX' | 'GPX';
  serviceStartTimeInSeconds: number;
  serviceManual: boolean;
}
