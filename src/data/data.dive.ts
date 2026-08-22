import { DataDepth } from './data.depth';
import { DataDuration } from './data.duration';
import { UnitSystem } from './data.interface';
import { DataNumber } from './data.number';
import { DataPercent } from './data.percent';

abstract class DataFiniteNumber extends DataNumber {
  override isValueTypeValid(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value);
  }
}

abstract class DataFiniteDuration extends DataDuration {
  override isValueTypeValid(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value);
  }
}

abstract class DataFinitePercent extends DataPercent {
  override isValueTypeValid(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value);
  }
}

abstract class DataFiniteDiveRate extends DataFiniteNumber {
  static unit = 'm/s';

  override getDisplayValue(): string {
    return this.getValue().toFixed(3);
  }
}

abstract class DataFiniteDiveConsumptionRate extends DataFiniteNumber {
  override getDisplayValue(): string {
    return this.getValue().toFixed(2);
  }
}

/** Native FIT dive-summary average depth in meters. */
export class DataDepthAvg extends DataDepth {
  static override type = 'Average Depth';

  override isValueTypeValid(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value);
  }
}

/** Imperial presentation variant of the canonical meter-based average-depth stat. */
export class DataDepthAvgFeet extends DataDepthAvg {
  static override type = 'Average Depth in feet';
  static override displayType = DataDepthAvg.type;
  static override unit = 'ft';
  static override unitSystem = UnitSystem.Imperial;
}

/** Native FIT surface interval in seconds. */
export class DataSurfaceInterval extends DataFiniteDuration {
  static type = 'Surface Interval';
}

/** Native FIT bottom time in seconds. */
export class DataBottomTime extends DataFiniteDuration {
  static type = 'Bottom Time';
}

/** Native FIT dive number. */
export class DataDiveNumber extends DataFiniteNumber {
  static type = 'Dive Number';

  override getDisplayValue(): string {
    return this.getValue().toFixed(0);
  }
}

/** Native FIT dive descent time in seconds. */
export class DataDiveDescentTime extends DataFiniteDuration {
  static type = 'Dive Descent Time';
}

/** Native FIT dive ascent time in seconds. */
export class DataDiveAscentTime extends DataFiniteDuration {
  static type = 'Dive Ascent Time';
}

/** Native FIT record ascent-rate stream in meters per second. */
export class DataDiveAscentRate extends DataFiniteDiveRate {
  static type = 'Dive Ascent Rate';
}

/** Imperial presentation variant of the canonical meter-per-second ascent-rate stream. */
export class DataDiveAscentRateFeetPerSecond extends DataDiveAscentRate {
  static override type = 'Dive ascent rate in feet per second';
  static override displayType = DataDiveAscentRate.type;
  static override unit = 'ft/s';
  static override unitSystem = UnitSystem.Imperial;
}

/** Native FIT dive-summary average ascent rate in meters per second. */
export class DataDiveAscentRateAvg extends DataDiveAscentRate {
  static override type = 'Average Dive Ascent Rate';
}

export class DataDiveAscentRateAvgFeetPerSecond extends DataDiveAscentRateAvg {
  static override type = 'Average dive ascent rate in feet per second';
  static override displayType = DataDiveAscentRateAvg.type;
  static override unit = 'ft/s';
  static override unitSystem = UnitSystem.Imperial;
}

/** Native FIT dive-summary maximum ascent rate in meters per second. */
export class DataDiveAscentRateMax extends DataDiveAscentRate {
  static override type = 'Maximum Dive Ascent Rate';
}

export class DataDiveAscentRateMaxFeetPerSecond extends DataDiveAscentRateMax {
  static override type = 'Maximum dive ascent rate in feet per second';
  static override displayType = DataDiveAscentRateMax.type;
  static override unit = 'ft/s';
  static override unitSystem = UnitSystem.Imperial;
}

/** Native FIT dive-summary average descent rate in meters per second. */
export class DataDiveDescentRateAvg extends DataFiniteDiveRate {
  static type = 'Average Dive Descent Rate';
}

export class DataDiveDescentRateAvgFeetPerSecond extends DataDiveDescentRateAvg {
  static override type = 'Average dive descent rate in feet per second';
  static override displayType = DataDiveDescentRateAvg.type;
  static override unit = 'ft/s';
  static override unitSystem = UnitSystem.Imperial;
}

/** Native FIT dive-summary maximum descent rate in meters per second. */
export class DataDiveDescentRateMax extends DataFiniteDiveRate {
  static type = 'Maximum Dive Descent Rate';
}

export class DataDiveDescentRateMaxFeetPerSecond extends DataDiveDescentRateMax {
  static override type = 'Maximum dive descent rate in feet per second';
  static override displayType = DataDiveDescentRateMax.type;
  static override unit = 'ft/s';
  static override unitSystem = UnitSystem.Imperial;
}

/** Native FIT dive-summary hang time in seconds. */
export class DataDiveHangTime extends DataFiniteDuration {
  static type = 'Dive Hang Time';
}

export class DataStartingCNSLoad extends DataFinitePercent {
  static type = 'Starting CNS Load';
}

export class DataEndingCNSLoad extends DataFinitePercent {
  static type = 'Ending CNS Load';
}

export class DataStartingN2Load extends DataFinitePercent {
  static type = 'Starting N2 Load';
}

export class DataEndingN2Load extends DataFinitePercent {
  static type = 'Ending N2 Load';
}

/** Native FIT oxygen-toxicity dose in oxygen-tolerance units. */
export class DataOxygenToxicity extends DataFiniteNumber {
  static type = 'Oxygen Toxicity';
  static unit = 'OTUs';

  override getDisplayValue(): string {
    return this.getValue().toFixed(0);
  }
}

export class DataPressureSAC extends DataFiniteDiveConsumptionRate {
  static type = 'Pressure SAC';
  static unit = 'bar/min';
}

export class DataPressureSACAvg extends DataPressureSAC {
  static override type = 'Average Pressure SAC';
}

export class DataVolumeSAC extends DataFiniteDiveConsumptionRate {
  static type = 'Volume SAC';
  static unit = 'L/min';
}

export class DataVolumeSACAvg extends DataVolumeSAC {
  static override type = 'Average Volume SAC';
}

export class DataRMV extends DataFiniteDiveConsumptionRate {
  static type = 'RMV';
  static unit = 'L/min';
}

export class DataRMVAvg extends DataRMV {
  static override type = 'Average RMV';
}

export class DataNextStopDepth extends DataFiniteNumber {
  static type = 'Next Stop Depth';
  static unit = 'm';

  override getDisplayValue(): string {
    return this.getValue().toFixed(3);
  }
}

/** Imperial presentation variant of the canonical meter-based next-stop-depth stream. */
export class DataNextStopDepthFeet extends DataNextStopDepth {
  static override type = 'Next Stop Depth in feet';
  static override displayType = DataNextStopDepth.type;
  static override unit = 'ft';
  static override unitSystem = UnitSystem.Imperial;
}

export class DataNextStopTime extends DataFiniteDuration {
  static type = 'Next Stop Time';
}

export class DataTimeToSurface extends DataFiniteDuration {
  static type = 'Time to Surface';
}

export class DataNoDecompressionLimit extends DataFiniteDuration {
  static type = 'No-Decompression Limit';
}

export class DataCNSLoad extends DataFinitePercent {
  static type = 'CNS Load';
}

export class DataN2Load extends DataFinitePercent {
  static type = 'N2 Load';
}

/** Native FIT record air-time-remaining value in seconds. */
export class DataAirTimeRemaining extends DataFiniteDuration {
  static type = 'Air Time Remaining';
}

/** Native FIT `po2` value, retaining the profile's percent representation. */
export class DataPO2 extends DataFinitePercent {
  static type = 'PO2';
  static displayType = 'PO₂';

  override getDisplayValue(): string {
    return this.getValue().toFixed(2);
  }
}
