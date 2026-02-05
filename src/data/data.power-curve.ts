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
    super(DataPowerCurve.hydrate(value));
  }

  static hydrate(value: (DataPowerCurvePoint | any)[]): DataPowerCurvePoint[] {
    return (value || []).map(point => ({
      duration: point.duration instanceof DataDuration ? point.duration : new DataDuration(point.duration),
      power: point.power instanceof DataPower ? point.power : new DataPower(point.power),
      wattsPerKg: point.wattsPerKg
        ? point.wattsPerKg instanceof DataPowerWattsPerKg
          ? point.wattsPerKg
          : new DataPowerWattsPerKg(point.wattsPerKg)
        : undefined
    }));
  }

  toJSON(): { [key: string]: any[] } {
    return {
      [DataPowerCurve.type]: this.value.map(point => {
        const json: { duration: number; power: number; wattsPerKg?: number } = {
          duration: point.duration.getValue(),
          power: point.power.getValue()
        };
        if (point.wattsPerKg) {
          json.wattsPerKg = point.wattsPerKg.getValue();
        }
        return json;
      })
    };
  }
}
