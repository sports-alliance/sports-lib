export interface UserStatsSettingsInterface {
    selectedAdvancedStats: UserSelectedAdvancedStats;
}
export interface UserSelectedAdvancedStats {
    [type: string]: boolean;
}
