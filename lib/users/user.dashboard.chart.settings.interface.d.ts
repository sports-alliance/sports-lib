export interface UserDashboardChartSettingsInterface {
    name: string;
    order: number;
    type: ChartTypes;
    dataType: string;
    dataValueType: ChartDataValueTypes;
    dataCategoryType: ChartDataCategoryTypes;
    filterLowValues: boolean;
}
export declare enum ChartTypes {
    Pie = "Pie",
    ColumnsHorizontal = "Columns Horizontal",
    PyramidsVertical = "Pyramids Vertical"
}
export declare enum ChartDataValueTypes {
    Total = "Total",
    Average = "Average",
    Maximum = "Maximum",
    Minimum = "Minimum"
}
export declare enum ChartDataCategoryTypes {
    ActivityType = "Activity Type",
    DateType = "Date Type"
}
