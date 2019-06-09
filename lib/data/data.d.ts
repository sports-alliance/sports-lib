import { DataInterface, UnitSystem } from './data.interface';
import { DataJSONInterface } from './data.json.interface';
export declare abstract class Data implements DataInterface {
    static type: string;
    static unit: string;
    static displayType?: string;
    static unitSystem: UnitSystem;
    protected value: number | string | boolean | string[];
    protected constructor(value: string | number | boolean | string[]);
    setValue(value: string | number | boolean | string[]): this;
    getValue(): string | number | boolean | string[];
    getDisplayValue(): number | string | string[];
    getType(): string;
    getUnit(): string;
    getDisplayUnit(): string;
    getDisplayType(): string;
    getUnitSystem(): UnitSystem;
    toJSON(): DataJSONInterface;
}
