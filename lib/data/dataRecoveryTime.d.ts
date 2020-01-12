import { DataDuration } from './data.duration';
export declare class DataRecoveryTime extends DataDuration {
    static type: string;
    getDisplayValue(showDays?: boolean, showSeconds?: boolean): string;
}
