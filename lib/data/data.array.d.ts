import { DataBare } from './data.bare';
export declare abstract class DataArray extends DataBare {
    protected value: string[];
    constructor(value: string[]);
    getValue(): string[];
}
