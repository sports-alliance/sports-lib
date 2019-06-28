export interface UserDashboardChartSettingsInterface {
    name: string;
    order: number;
    type: ChartTypes;
    dataType: string;
    dataValueType: DataValueTypes;
}
export declare enum ChartTypes {
    Pie = "Pie",
    ColumnsHorizontal = "Columns Horizontal",
    PyramidsVertical = "Pyramids Vertical"
}
export declare enum DataValueTypes {
    Sum = "Sum",
    Average = "Average",
    Maximum = "Maximum",
    Minimum = "Minimum"
}
