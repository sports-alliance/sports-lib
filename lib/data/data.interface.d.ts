import { SerializableClassInterface } from '../serializable/serializable.class.interface';
import { DataJSONInterface } from './data.json.interface';
export interface DataInterface extends SerializableClassInterface {
    setValue(value: number | string | string[]): this;
    getValue(formatForDataType?: string): number | string | boolean | string[];
    getDisplayValue(): number | string | boolean | string[];
    getType(): string;
    getUnit(): string;
    getDisplayUnit(): string;
    getDisplayType(): string;
    getUnitSystem(): UnitSystem;
    toJSON(): DataJSONInterface;
}
export declare enum UnitSystem {
    Metric = 0,
    Imperial = 1
}
