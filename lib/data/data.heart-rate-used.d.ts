import { DataBoolean } from './data.boolean';
export declare class DataHeartRateUsed extends DataBoolean {
    static type: string;
    getDisplayValue(): "Yes" | "No";
}
