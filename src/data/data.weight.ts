import { DataNumber } from './data.number';

export class DataWeight extends DataNumber {
    static type = 'Weight';
    static unit = 'kg';

    getDisplayValue(): string {
        return this.getValue().toFixed(1);
    }
}
