import { DataNumber } from './data.number';

export class DataHeight extends DataNumber {
    static type = 'Height';
    static unit = 'm';

    getDisplayValue(): string {
        return this.getValue().toFixed(2);
    }
}
