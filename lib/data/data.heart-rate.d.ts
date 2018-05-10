import { DataNumber } from './data.number';
export declare class DataHeartRate extends DataNumber {
    static className: string;
    static type: string;
    static unit: string;
    getDisplayValue(): number;
}
