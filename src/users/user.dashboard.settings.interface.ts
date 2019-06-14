export interface UserDashboardSettingsInterface {
  dateRange: DateRanges,
  startDate: number,
  endDate: number,
}

export enum DateRanges {
  thisWeek,
  thisMonth,
  lastWeek,
  none,
}
