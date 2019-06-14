export interface UserDashboardSettingsInterface{
  dateRange: DateRanges
}

export enum DateRanges {
  thisWeek,
  thisMonth,
  lastWeek,
  none,
}
