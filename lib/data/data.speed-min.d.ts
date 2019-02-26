import { DataSpeed, DataSpeedFeetPerMinute, DataSpeedFeetPerSecond, DataSpeedKilometersPerHour, DataSpeedMetersPerMinute, DataSpeedMilesPerHour } from './data.speed';
export declare class DataSpeedMin extends DataSpeed {
    static type: string;
}
export declare class DataSpeedMinKilometersPerHour extends DataSpeedKilometersPerHour {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataSpeedMinMilesPerHour extends DataSpeedMilesPerHour {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataSpeedMinFeetPerSecond extends DataSpeedFeetPerSecond {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataSpeedMinMetersPerMinute extends DataSpeedMetersPerMinute {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataSpeedMinFeetPerMinute extends DataSpeedFeetPerMinute {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
