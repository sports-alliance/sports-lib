import { DataNumber } from './data.number';
export declare class DataRPE extends DataNumber {
    static type: string;
    getDisplayValue(): number | string | string[];
}
export declare enum RPEBorgCR10SCale {
    'No exertion at all' = 0,
    'Very, very slight' = 1,
    'Very slight' = 2,
    'Slight' = 3,
    'Moderate' = 4,
    'Somewhat severe' = 5,
    'Severe' = 6,
    'More than severe' = 7,
    'Very severe' = 8,
    'Extreme' = 9,
    'Maximal' = 10
}
