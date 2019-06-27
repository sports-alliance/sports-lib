export interface UserDashboardChartSettingsInterface {
    name: string;
    order: number;
    type: ChartTypes;
    dataType: string;
}
export declare enum ChartTypes {
    Pie = 0,
    ColumnHorizontal = 1,
    ColumnVertical = 2
}
