import { DataNumber } from './data.number';
export declare class DataSpeed extends DataNumber {
    static type: string;
    static unit: string;
    getDisplayValue(): string;
}
export declare class DataSpeedKilometersPerHour extends DataSpeed {
    static type: string;
    static displayType: string;
    static unit: string;
    getDisplayType(): string;
}
export declare class DataSpeedMilesPerHour extends DataSpeed {
    static type: string;
    static displayType: string;
    static unit: string;
    getDisplayType(): string;
}
export declare class DataSpeedFeetPerSecond extends DataSpeed {
    static type: string;
    static displayType: string;
    static unit: string;
    getDisplayType(): string;
}
export declare class DataSpeedMetersPerMinute extends DataSpeed {
    static type: string;
    static displayType: string;
    static unit: string;
    getDisplayType(): string;
}
export declare class DataSpeedFeetPerMinute extends DataSpeed {
    static type: string;
    static displayType: string;
    static unit: string;
    getDisplayType(): string;
}
