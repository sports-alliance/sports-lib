export interface UserChartSettingsInterface {
    dataTypeSettings: DataTypeSettings;
    theme: ChartThemes;
    useAnimations: boolean;
    xAxisType: XAxisTypes;
    showAllData: boolean;
    dataSmoothingLevel: number;
    chartCursorBehaviour: ChartCursorBehaviours;
}
export declare enum ChartThemes {
    Charts = "amcharts",
    ChartsDark = "amchartsdark",
    DataViz = "dataviz",
    Frozen = "frozen",
    Dark = "dark",
    Kelly = "kelly",
    Material = "material",
    MoonriseKingdom = "moonrisekingdom",
    SpiritedAway = "spiritedaway"
}
export interface DataTypeSettings {
    [type: string]: {
        enabled: boolean;
        strokeColor?: string;
        fillColor?: string;
        fillOpacity?: string;
    };
}
export declare enum XAxisTypes {
    Time = "Time",
    Duration = "Duration",
    Distance = "Distance"
}
export declare enum ChartCursorBehaviours {
    ZoomX = "zoomX",
    SelectX = "selectX"
}
