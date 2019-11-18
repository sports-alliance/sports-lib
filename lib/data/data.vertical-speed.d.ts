import { DataNumber } from './data.number';
export declare class DataVerticalSpeed extends DataNumber {
    static type: string;
    static unit: string;
    getValue(formatForDataType?: string): number;
    getDisplayValue(): string;
}
export declare class DataVerticalSpeedFeetPerSecond extends DataVerticalSpeed {
    static type: string;
    static displayType: string;
    static unit: string;
    getDisplayType(): string;
}
export declare class DataVerticalSpeedMetersPerMinute extends DataVerticalSpeed {
    static type: string;
    static displayType: string;
    static unit: string;
    getDisplayType(): string;
    getDisplayValue(): string;
}
export declare class DataVerticalSpeedFeetPerMinute extends DataVerticalSpeed {
    static type: string;
    static displayType: string;
    static unit: string;
    getDisplayType(): string;
    getDisplayValue(): string;
}
export declare class DataVerticalSpeedMetersPerHour extends DataVerticalSpeed {
    static type: string;
    static displayType: string;
    static unit: string;
    getDisplayType(): string;
    getDisplayValue(): string;
}
export declare class DataVerticalSpeedFeetPerHour extends DataVerticalSpeed {
    static type: string;
    static displayType: string;
    static unit: string;
    getDisplayType(): string;
    getDisplayValue(): string;
}
export declare class DataVerticalSpeedKilometerPerHour extends DataVerticalSpeed {
    static type: string;
    static displayType: string;
    static unit: string;
    getDisplayType(): string;
    getDisplayValue(): string;
}
export declare class DataVerticalSpeedMilesPerHour extends DataVerticalSpeed {
    static type: string;
    static displayType: string;
    static unit: string;
    getDisplayType(): string;
    getDisplayValue(): string;
}
