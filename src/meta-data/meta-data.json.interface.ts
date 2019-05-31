import {ServiceNames} from './meta-data.interface';

export interface MetaDataJsonInterface {
  serviceName: ServiceNames;
  serviceUserName: string;
  serviceWorkoutID: string,
  date: number,
}
