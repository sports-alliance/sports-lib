import { DataBare } from './data.bare';
export declare abstract class DataNumber extends DataBare {
    protected value: number;
    constructor(value: number);
    getValue(formatForDataType?: string): number;
}
