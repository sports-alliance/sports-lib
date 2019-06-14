import {UserChartSettingsInterface} from './user.chart.settings.interface';
import {UserAppSettingsInterface} from './user.app.settings.interface';
import {UserUnitSettingsInterface} from './user.unit.settings.interface';
import {UserDashboardSettingsInterface} from './user.dashboard.settings.interface';

export interface UserSettingsInterface {
  chartSettings?: UserChartSettingsInterface,
  appSettings?: UserAppSettingsInterface,
  unitSettings?: UserUnitSettingsInterface,
  dashboardSettings?: UserDashboardSettingsInterface,
}
