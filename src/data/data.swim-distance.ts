import { DataDistance } from './data.distance';
import { formatMeterDistanceDisplayValue } from './data.meter-distance-display';

/** Display-only units for swim distances; canonical values remain meters. */
export enum SwimDistanceUnits {
  Meters = 'm',
  Yards = 'yd'
}

const METERS_PER_YARD = 0.9144;

/** Swim distance in canonical meters, displayed without switching to kilometers or miles. */
export class DataSwimDistance extends DataDistance {
  static override type = DataDistance.type;
  static override unit = DataDistance.unit;
  static override displayType = DataDistance.type;

  /** The selected unit affects display only, never getValue(), getUnit(), or JSON. */
  constructor(
    value: number,
    private readonly displayUnits: SwimDistanceUnits = SwimDistanceUnits.Meters
  ) {
    super(value);
  }

  override getDisplayValue(): string {
    const value = this.displayUnits === SwimDistanceUnits.Yards ? this.getValue() / METERS_PER_YARD : this.getValue();
    return formatMeterDistanceDisplayValue(value);
  }

  override getDisplayUnit(): string {
    return this.displayUnits;
  }
}
