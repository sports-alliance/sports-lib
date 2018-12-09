import {DataInterface, UnitSystem} from './data.interface';

export abstract class Data implements DataInterface {

  static className: string;
  static type: string;
  static unit: string;
  static unitSystem = UnitSystem.Metric;
  protected value: number | string | boolean;

  protected constructor(value: string | number | boolean) {
    if ((typeof value !== 'string') && (typeof value !== 'number') && (typeof value !== 'boolean')) {
      throw new Error('Value is not boolean or number or string ');
    }
    this.value = value;
  }

  setValue(value: string | number | boolean) {
    this.value = value;
  }

  getValue(): string | number | boolean {
    return this.value;
  }

  getDisplayValue(): number | string {
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

  getUnitSystem(): UnitSystem {
    return (<typeof Data>this.constructor).unitSystem;
  }

  getClassName(): string {
    return (<typeof Data>this.constructor).className;
  }

  toJSON(): {className: string, value: number | string | boolean} {
    return {
      className: this.getClassName(),
      value: this.getValue(),
    };
  }
}
