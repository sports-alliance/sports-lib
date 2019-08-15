import { DataNumber } from './data.number';
export declare abstract class DataBalance extends DataNumber {
    static unit: string;
    getDisplayValue(): number;
}
