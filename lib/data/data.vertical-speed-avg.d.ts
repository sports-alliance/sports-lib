import { DataVerticalSpeed, DataVerticalSpeedFeetPerHour, DataVerticalSpeedFeetPerMinute, DataVerticalSpeedFeetPerSecond, DataVerticalSpeedKilometerPerHour, DataVerticalSpeedMetersPerHour, DataVerticalSpeedMetersPerMinute, DataVerticalSpeedMilesPerHour } from './data.vertical-speed';
export declare class DataVerticalSpeedAvg extends DataVerticalSpeed {
    static type: string;
}
export declare class DataVerticalSpeedAvgFeetPerSecond extends DataVerticalSpeedFeetPerSecond {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataVerticalSpeedAvgMetersPerMinute extends DataVerticalSpeedMetersPerMinute {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataVerticalSpeedAvgFeetPerMinute extends DataVerticalSpeedFeetPerMinute {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataVerticalSpeedAvgMetersPerHour extends DataVerticalSpeedMetersPerHour {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataVerticalSpeedAvgFeetPerHour extends DataVerticalSpeedFeetPerHour {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataVerticalSpeedAvgKilometerPerHour extends DataVerticalSpeedKilometerPerHour {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
export declare class DataVerticalSpeedAvgMilesPerHour extends DataVerticalSpeedMilesPerHour {
    static type: string;
    static displayType: string;
    getDisplayType(): string;
}
