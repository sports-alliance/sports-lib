import { DataNumber } from './data.number';
export declare class DataTemperature extends DataNumber {
    static type: string;
    static unit: string;
    getDisplayValue(): number;
}
