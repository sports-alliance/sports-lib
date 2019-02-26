import { DataInterface, UnitSystem } from './data.interface';
import { DataJSONInterface } from "./data.json.interface";
export declare abstract class Data implements DataInterface {
    static type: string;
    static unit: string;
    static displayType?: string;
    static unitSystem: UnitSystem;
    protected value: number | string | boolean;
    protected constructor(value: string | number | boolean);
    setValue(value: string | number | boolean): void;
    getValue(): string | number | boolean;
    getDisplayValue(): number | string;
    getType(): string;
    getUnit(): string;
    getDisplayUnit(): string;
    getDisplayType(): string;
    getUnitSystem(): UnitSystem;
    toJSON(): DataJSONInterface;
}
