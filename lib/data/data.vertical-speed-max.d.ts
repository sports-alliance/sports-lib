import { DataVerticalSpeed, DataVerticalSpeedFeetPerHour, DataVerticalSpeedFeetPerMinute, DataVerticalSpeedFeetPerSecond, DataVerticalSpeedKilometerPerHour, DataVerticalSpeedMetersPerHour, DataVerticalSpeedMetersPerMinute, DataVerticalSpeedMilesPerHour } from './data.vertical-speed';
export declare class DataVerticalSpeedMax extends DataVerticalSpeed {
    static type: string;
}
export declare class DataVerticalSpeedMaxFeetPerSecond extends DataVerticalSpeedFeetPerSecond {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataVerticalSpeedMaxMetersPerMinute extends DataVerticalSpeedMetersPerMinute {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataVerticalSpeedMaxFeetPerMinute extends DataVerticalSpeedFeetPerMinute {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataVerticalSpeedMaxMetersPerHour extends DataVerticalSpeedMetersPerHour {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataVerticalSpeedMaxFeetPerHour extends DataVerticalSpeedFeetPerHour {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataVerticalSpeedMaxKilometerPerHour extends DataVerticalSpeedKilometerPerHour {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataVerticalSpeedMaxMilesPerHour extends DataVerticalSpeedMilesPerHour {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
