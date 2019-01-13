import {SerializableClassInterface} from '../serializable/serializable.class.interface';

export interface UserChartSettingsInterface extends SerializableClassInterface{
  dataTypeSettings: {
    [type:string]: {enabled: boolean, strokeColor?: string, fillColor?: string, fillOpacity?: string}
  }
}
