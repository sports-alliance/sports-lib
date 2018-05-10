import { DataInterface, UnitSystem } from './data.interface';
export declare abstract class Data implements DataInterface {
    static className: string;
    static type: string;
    static unit: string;
    static unitSystem: UnitSystem;
    protected value: number | string | boolean;
    protected constructor(value: string | number | boolean);
    setValue(value: string | number | boolean): void;
    getValue(): string | number | boolean;
    getDisplayValue(): number | string;
    getType(): string;
    getUnit(): string;
    getDisplayUnit(): string;
    getUnitSystem(): UnitSystem;
    getClassName(): string;
    toJSON(): any;
}
