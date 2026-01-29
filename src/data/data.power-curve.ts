import { DataBare } from './data.bare';
import { DataDuration } from './data.duration';
import { DataPower } from './data.power';
import { DataPowerWattsPerKg } from './data.power-watts-per-kg';

export interface DataPowerCurvePoint {
    duration: DataDuration;
    power: DataPower;
    wattsPerKg?: DataPowerWattsPerKg;
}

export class DataPowerCurve extends DataBare<DataPowerCurvePoint[]> {
    static type = 'PowerCurve';

    constructor(value: DataPowerCurvePoint[]) {
        super(value);
    }
}
