import { DataNumber } from './data.number';

export class DataRightPedalSmoothness extends DataNumber {
    static type = 'Right Pedal Smoothness';
    static unit = '%';

    getDisplayValue() {
        return Math.round(this.getValue());
    }
}
