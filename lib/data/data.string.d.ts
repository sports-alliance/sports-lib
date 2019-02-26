import { DataBare } from './data.bare';
export declare abstract class DataString extends DataBare {
    protected value: string;
    constructor(value: string);
    getValue(): string;
}
