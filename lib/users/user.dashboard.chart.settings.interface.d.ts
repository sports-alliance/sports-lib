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
    ColumnsVertical = "Columns Vertical",
    PyramidsVertical = "Pyramids Vertical",
    LinesHorizontal = "Lines Horizontal",
    LinesVertical = "Lines Vertical",
    Spiral = "Spiral"
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
