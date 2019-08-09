import { DataNumber } from './data.number';
export declare class DataBatteryVoltage extends DataNumber {
    static type: string;
    static unit: string;
    getDisplayValue(): string;
}
