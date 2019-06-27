import {UserDashboardChartSettingsInterface} from './user.dashboard.chart.settings.interface';

export interface UserDashboardSettingsInterface {
  dateRange: DateRanges,
  startDate: number,
  endDate: number,
  chartsSettings: UserDashboardChartSettingsInterface[]
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
  all,
}
