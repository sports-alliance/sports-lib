import { DataDuration } from './data.duration';
export declare class DataSwimPace extends DataDuration {
    static type: string;
    static unit: string;
    getDisplayValue(): string;
    getDisplayUnit(): string;
    getValue(formatForDataType?: string): number;
}
export declare class DataSwimPaceMinutesPer100Yard extends DataSwimPace {
    static type: string;
    static displayType: string;
    static unit: string;
}
