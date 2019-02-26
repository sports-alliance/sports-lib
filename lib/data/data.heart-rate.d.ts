import { DataNumber } from './data.number';
export declare class DataHeartRate extends DataNumber {
    static type: string;
    static unit: string;
    getDisplayValue(): number;
}
