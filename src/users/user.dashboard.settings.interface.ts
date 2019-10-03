import {UserDashboardChartSettingsInterface} from './user.dashboard.chart.settings.interface';

export interface UserDashboardSettingsInterface {
  dateRange: DateRanges,
  startDate: number,
  endDate: number,
  chartsSettings: UserDashboardChartSettingsInterface[],
  showSummaries: boolean,
  pinUploadSection: boolean,
  tableSettings: TableSettings
}

export interface TableSettings {
  eventsPerPage: number,
  active: string,
  direction: 'asc' | 'desc'
}

export enum DateRanges {
  thisWeek,
  lastWeek,
  lastSevenDays,
  thisMonth,
  lastMonth,
  lastThirtyDays,
  thisYear,
  lastYear,
  custom,
  // all,
}
