import { UserChartSettingsInterface } from './user.chart.settings.interface';
import { UserAppSettingsInterface } from './user.app.settings.interface';
import { UserUnitSettingsInterface } from './user.unit.settings.interface';
import { UserDashboardSettingsInterface } from './dashboard/user.dashboard.settings.interface';
import { UserMapSettingsInterface } from './user.map.settings.interface';
import { UserExportToCsvSettingsInterface } from '../user.export-to-csv.settings.interface';
import { UserStatsSettingsInterface } from './user.stats-settings.interface';
import { UserSummariesSettingsInterface } from './user.summaries.settings.interface';
import { UserMyTracksSettingsInterface } from './user.my-tracks.settings.interface';

export interface UserSettingsInterface {
  mapSettings?: UserMapSettingsInterface,
  chartSettings?: UserChartSettingsInterface,
  myTracksSettings?: UserMyTracksSettingsInterface,
  appSettings?: UserAppSettingsInterface,
  unitSettings?: UserUnitSettingsInterface,
  statsSettings?: UserStatsSettingsInterface,
  dashboardSettings?: UserDashboardSettingsInterface,
  summariesSettings?: UserSummariesSettingsInterface,
  exportToCSVSettings?: UserExportToCsvSettingsInterface
}
