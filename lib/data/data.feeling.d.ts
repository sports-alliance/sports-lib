import { DataNumber } from './data.number';
export declare class DataFeeling extends DataNumber {
    static type: string;
    getDisplayValue(): number | string | string[];
}
export declare enum Feelings {
    'Poor' = 1,
    'Average' = 2,
    'Good' = 3,
    'Very Good' = 4,
    'Excellent' = 5
}
