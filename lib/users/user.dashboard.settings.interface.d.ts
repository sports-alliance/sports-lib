export interface UserDashboardSettingsInterface {
    dateRange: DateRanges;
    startDate: number;
    endDate: number;
}
export declare enum DateRanges {
    thisWeek = 0,
    lastWeek = 1,
    lastSevenDays = 2,
    thisMonth = 3,
    lastMonth = 4,
    lastThiryDays = 5,
    thisYear = 6,
    lastYear = 7,
    custom = 8,
    all = 9
}
