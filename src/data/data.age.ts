import { DataNumber } from './data.number';

export class DataAge extends DataNumber {
    static type = 'Age';
    static unit = 'years';

    getDisplayValue(): string {
        return this.getValue().toString();
    }
}
