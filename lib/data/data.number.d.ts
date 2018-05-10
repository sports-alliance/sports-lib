import { DataBare } from './data.bare';
export declare abstract class DataNumber extends DataBare {
    static className: string;
    protected value: any;
    constructor(value: string | number);
    getValue(): number;
}
