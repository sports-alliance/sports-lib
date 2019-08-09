import { DataNumber } from './data.number';
export declare class DataBatteryCurrent extends DataNumber {
    static type: string;
    static unit: string;
    getDisplayValue(): string;
}
