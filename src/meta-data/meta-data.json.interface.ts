import { ServiceNames } from './event-meta-data.interface';

export interface EventMetaDataJsonInterface {
  serviceName: ServiceNames;
  date: number;
}

export interface SuuntoAppEventMetaDataJsonInterface extends EventMetaDataJsonInterface {
  serviceUserName: string;
  serviceWorkoutID: string;
}

export interface COROSAPIEventMetaDataJsonInterface extends EventMetaDataJsonInterface {
  serviceOpenId: string;
  serviceWorkoutID: string;
  serviceFITFileURI: string;
}

export interface GarminAPIEventMetaDataJsonInterface extends EventMetaDataJsonInterface {
  serviceUserID: string;
  serviceActivityFileID: string;
  serviceActivityFileType: 'FIT' | 'TCX' | 'GPX';
  serviceStartTimeInSeconds: number;
  serviceManual: boolean;
}

export interface WahooAPIEventMetaDataJsonInterface extends EventMetaDataJsonInterface {
  serviceUserID: string;
  serviceWorkoutID: string;
  serviceWorkoutSummaryID: string;
  serviceSummaryUpdatedAt: string;
  serviceManual?: boolean;
  serviceEdited?: boolean;
  serviceFitnessAppID?: number;
}
