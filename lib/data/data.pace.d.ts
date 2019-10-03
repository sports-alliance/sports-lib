import { DataDuration } from './data.duration';
export declare class DataPace extends DataDuration {
    static type: string;
    static unit: string;
    getDisplayValue(): string;
    getDisplayUnit(): string;
    getValue(formatForDataType?: string): number;
}
export declare class DataPaceMinutesPerMile extends DataPace {
    static type: string;
    static displayType: string;
    static unit: string;
    getValue(formatForDataType?: string): number;
}
