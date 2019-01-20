import {UserChartSettingsInterface} from "./user.chart.settings.interface";
import {UserAppSettingsInterface} from "./user.app.settings.interface";

export interface UserSettingsInterface {
  chartSettings?: UserChartSettingsInterface,
  appSettings?: UserAppSettingsInterface,
}
