import { DataBoolean } from './data.boolean';
export declare class DataFusedAltitude extends DataBoolean {
    static className: string;
    static type: string;
    static unit: string;
    getDisplayValue(): "Yes" | "No";
}
