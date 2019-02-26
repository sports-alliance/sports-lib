import { DataVerticalSpeed, DataVerticalSpeedFeetPerHour, DataVerticalSpeedFeetPerMinute, DataVerticalSpeedFeetPerSecond, DataVerticalSpeedKilometerPerHour, DataVerticalSpeedMetersPerHour, DataVerticalSpeedMetersPerMinute, DataVerticalSpeedMilesPerHour } from './data.vertical-speed';
export declare class DataVerticalSpeedMin extends DataVerticalSpeed {
    static type: string;
}
export declare class DataVerticalSpeedMinFeetPerSecond extends DataVerticalSpeedFeetPerSecond {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataVerticalSpeedMinMetersPerMinute extends DataVerticalSpeedMetersPerMinute {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataVerticalSpeedMinFeetPerMinute extends DataVerticalSpeedFeetPerMinute {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataVerticalSpeedMinMetersPerHour extends DataVerticalSpeedMetersPerHour {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataVerticalSpeedMinFeetPerHour extends DataVerticalSpeedFeetPerHour {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataVerticalSpeedMinKilometerPerHour extends DataVerticalSpeedKilometerPerHour {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataVerticalSpeedMinMilesPerHour extends DataVerticalSpeedMilesPerHour {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
