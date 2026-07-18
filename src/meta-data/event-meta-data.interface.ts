import { SerializableClassInterface } from '../serializable/serializable.class.interface';
import {
  COROSAPIEventMetaDataJsonInterface,
  EventMetaDataJsonInterface,
  GarminAPIEventMetaDataJsonInterface as GarminAPIEventMetaDataJsonInterface,
  SuuntoAppEventMetaDataJsonInterface,
  WahooAPIEventMetaDataJsonInterface
} from './meta-data.json.interface';

export interface EventMetaDataInterface extends SerializableClassInterface {
  serviceName: ServiceNames;
  date: Date;

  toJSON(): EventMetaDataJsonInterface;
}

export interface SuuntoAppEventMetaDataInterface extends EventMetaDataInterface {
  serviceUserName: string;
  serviceWorkoutID: string;
  toJSON(): SuuntoAppEventMetaDataJsonInterface;
}

export interface COROSAPIEventMetaDataInterface extends EventMetaDataInterface {
  serviceOpenId: string;
  serviceWorkoutID: string;
  serviceFITFileURI: string;
  toJSON(): COROSAPIEventMetaDataJsonInterface;
}

export interface GarminAPIEventMetaDataInterface extends EventMetaDataInterface {
  serviceUserID: string;
  serviceActivityFileID: string;
  serviceActivityFileType: 'FIT' | 'TCX' | 'GPX';
  serviceStartTimeInSeconds: number;
  serviceManual: boolean;

  toJSON(): GarminAPIEventMetaDataJsonInterface;
}

export interface WahooAPIEventMetaDataInterface extends EventMetaDataInterface {
  serviceUserID: string;
  serviceWorkoutID: string;
  serviceWorkoutSummaryID: string;
  serviceSummaryUpdatedAt: string;
  serviceManual?: boolean;
  serviceEdited?: boolean;
  serviceFitnessAppID?: number;

  toJSON(): WahooAPIEventMetaDataJsonInterface;
}

export enum ServiceNames {
  SuuntoApp = 'Suunto app',
  GarminAPI = 'Garmin API',
  COROSAPI = 'COROS API',
  WahooAPI = 'Wahoo API'
}
