import { DataBare } from './data.bare';

export class DataPowerWattsPerKg extends DataBare<number> {
  static type = 'PowerWattsPerKg';

  constructor(value: number) {
    super(value);
  }
}
