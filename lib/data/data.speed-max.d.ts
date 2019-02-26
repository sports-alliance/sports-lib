import { DataSpeed, DataSpeedFeetPerMinute, DataSpeedFeetPerSecond, DataSpeedKilometersPerHour, DataSpeedMetersPerMinute, DataSpeedMilesPerHour } from './data.speed';
export declare class DataSpeedMax extends DataSpeed {
    static type: string;
}
export declare class DataSpeedMaxKilometersPerHour extends DataSpeedKilometersPerHour {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataSpeedMaxMilesPerHour extends DataSpeedMilesPerHour {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataSpeedMaxFeetPerSecond extends DataSpeedFeetPerSecond {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataSpeedMaxMetersPerMinute extends DataSpeedMetersPerMinute {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataSpeedMaxFeetPerMinute extends DataSpeedFeetPerMinute {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
