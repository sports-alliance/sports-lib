import { DataNumber } from './data.number';
export declare class DataDistance extends DataNumber {
    static className: string;
    static type: string;
    static unit: string;
    getDisplayValue(): string;
    getDisplayUnit(): string;
}
