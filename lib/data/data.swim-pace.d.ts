import { DataPace } from './data.pace';
export declare class DataSwimPace extends DataPace {
    static type: string;
    static unit: string;
    getDisplayValue(): string;
}
export declare class DataSwimPaceMinutesPer100Yard extends DataSwimPace {
    static type: string;
    static displayType: string;
    static unit: string;
}
