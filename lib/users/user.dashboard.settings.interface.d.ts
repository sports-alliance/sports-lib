export interface UserDashboardSettingsInterface {
    dateRange: DateRanges;
    startDate: number;
    endDate: number;
}
export declare enum DateRanges {
    thisWeek = 0,
    thisMonth = 1,
    lastWeek = 2,
    custom = 3,
    all = 4
}
