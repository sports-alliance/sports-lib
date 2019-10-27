import { LapTypes } from '../laps/lap.types';
export interface UserChartSettingsInterface {
    dataTypeSettings: DataTypeSettings;
    theme: ChartThemes;
    useAnimations: boolean;
    xAxisType: XAxisTypes;
    showAllData: boolean;
    dataSmoothingLevel: number;
    chartCursorBehaviour: ChartCursorBehaviours;
    strokeWidth: number;
    strokeOpacity: number;
    fillOpacity: number;
    lapTypes: LapTypes[];
    showLaps: boolean;
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
        fillColor?: number;
        fillOpacity?: number;
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
