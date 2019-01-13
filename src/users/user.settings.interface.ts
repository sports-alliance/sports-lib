import {SerializableClassInterface} from '../serializable/serializable.class.interface';
import {UserChartSettingsInterface} from "./user.chart.settings.interface";

export interface UserSettingsInterface extends SerializableClassInterface{
  chartSettings?: UserChartSettingsInterface
}
