import { DataNumber } from './data.number';

export class DataJumpDistance extends DataNumber {
    static type = 'Jump Distance';
    static unit = 'm';

    constructor(value: number) {
        super(value);
    }

    getDisplayValue(): string {
        // Always display in meters with 2 decimal places (e.g. 2.07)
        return this.getValue().toFixed(2);
    }
}
