import { DataNumber } from './data.number';

export class DataLeftPedalSmoothness extends DataNumber {
    static type = 'Left Pedal Smoothness';
    static unit = '%';

    getDisplayValue() {
        return Math.round(this.getValue());
    }
}
