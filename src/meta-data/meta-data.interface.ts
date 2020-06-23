import { SerializableClassInterface } from '../serializable/serializable.class.interface';
import { MetaDataJsonInterface } from './meta-data.json.interface';

export interface MetaDataInterface extends SerializableClassInterface {
  serviceName: ServiceNames;
  serviceUserName: string;
  serviceWorkoutID: string;
  date: Date;

  toJSON(): MetaDataJsonInterface;
}


export enum ServiceNames {
  SuuntoApp = 'Suunto app',
  GarminHealthAPI = 'Garmin Health API',
}
