import { DataNumber } from './data.number';
export declare class DataBatteryCharge extends DataNumber {
    static type: string;
    static unit: string;
    getDisplayValue(): string;
}
