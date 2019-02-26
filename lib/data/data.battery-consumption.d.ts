import { DataNumber } from './data.number';
export declare class DataBatteryConsumption extends DataNumber {
    static type: string;
    static unit: string;
    getDisplayValue(): number | string;
}
