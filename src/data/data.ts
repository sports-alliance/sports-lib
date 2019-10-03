import {DataInterface, UnitSystem} from './data.interface';
import {DataJSONInterface} from './data.json.interface';

export abstract class Data implements DataInterface {
  static type: string; // @todo perhas add generic type
  static unit: string;
  static displayType?: string;
  static unitSystem = UnitSystem.Metric;
  protected value: number | string | boolean | string[];

  protected constructor(value: string | number | boolean | string[]) {
    if ((typeof value !== 'string') && (typeof value !== 'number') && (typeof value !== 'boolean') && !Array.isArray(value)) {
      throw new Error('Value is not boolean or number or string ');
    }
    this.value = value;
  }

  setValue(value: string | number | boolean| string[]): this {
    this.value = value;
    return this;
  }

  getValue(formatForDataType?: string): string | number | boolean | string[] {
    return this.value;
  }

  getDisplayValue(): number | string | string[] {
    let value = this.getValue();
    if (typeof value === 'boolean') {
      value = String(value);
    }
    return value;
  }

  getType(): string {
    return (<typeof Data>this.constructor).type;
  }

  getUnit(): string {
    return (<typeof Data>this.constructor).unit;
  }

  getDisplayUnit(): string {
    return this.getUnit();
  }

  getDisplayType(): string {
    return (<typeof Data>this.constructor).displayType || (<typeof Data>this.constructor).type;
  }

  getUnitSystem(): UnitSystem {
    return (<typeof Data>this.constructor).unitSystem;
  }

  toJSON(): DataJSONInterface {
    return {
      [this.getType()]: this.getValue(),
    };
  }
}
