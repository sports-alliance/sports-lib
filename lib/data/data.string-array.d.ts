import { DataBare } from './data.bare';
export declare abstract class DataStringArray extends DataBare {
    protected value: string[];
    constructor(value: string[]);
    getValue(): string[];
    getDisplayValue(): string;
}
