import { DataSpeed, DataSpeedFeetPerMinute, DataSpeedFeetPerSecond, DataSpeedKilometersPerHour, DataSpeedMetersPerMinute, DataSpeedMilesPerHour } from './data.speed';
export declare class DataSpeedAvg extends DataSpeed {
    static type: string;
}
export declare class DataSpeedAvgKilometersPerHour extends DataSpeedKilometersPerHour {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataSpeedAvgMilesPerHour extends DataSpeedMilesPerHour {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataSpeedAvgFeetPerSecond extends DataSpeedFeetPerSecond {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataSpeedAvgMetersPerMinute extends DataSpeedMetersPerMinute {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataSpeedAvgFeetPerMinute extends DataSpeedFeetPerMinute {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
