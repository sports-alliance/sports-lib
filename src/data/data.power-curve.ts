import { DataBare } from './data.bare';
import { DataDuration } from './data.duration';
import { DataPower } from './data.power';

export interface DataPowerCurvePoint {
    duration: DataDuration;
    power: DataPower;
}

export class DataPowerCurve extends DataBare<DataPowerCurvePoint[]> {
    static type = 'PowerCurve';

    constructor(value: DataPowerCurvePoint[]) {
        super(value);
    }
}
