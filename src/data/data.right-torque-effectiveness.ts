import { DataNumber } from './data.number';

export class DataRightTorqueEffectiveness extends DataNumber {
    static type = 'Right Torque Effectiveness';
    static unit = '%';

    getDisplayValue() {
        return Math.round(this.getValue());
    }
}
