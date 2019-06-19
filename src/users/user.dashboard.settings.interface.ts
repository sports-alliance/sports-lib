export interface UserDashboardSettingsInterface {
  dateRange: DateRanges,
  startDate: number,
  endDate: number,
}

export enum DateRanges {
  thisWeek,
  lastWeek,
  lastSevenDays,
  thisMonth,
  lastMonth,
  lastThiryDays,
  thisYear,
  lastYear,
  custom,
  all,
}
