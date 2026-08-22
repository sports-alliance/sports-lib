import { DataDepth } from './data.depth';
import { DataDuration } from './data.duration';
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

/** Native FIT dive-summary average depth in meters. */
export class DataDepthAvg extends DataDepth {
  static override type = 'Average Depth';

  override isValueTypeValid(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value);
  }
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
export class DataDiveAscentRate extends DataFiniteNumber {
  static type = 'Dive Ascent Rate';
  static unit = 'm/s';
}

/** Native FIT dive-summary average ascent rate in meters per second. */
export class DataDiveAscentRateAvg extends DataDiveAscentRate {
  static override type = 'Average Dive Ascent Rate';
}

/** Native FIT dive-summary maximum ascent rate in meters per second. */
export class DataDiveAscentRateMax extends DataDiveAscentRate {
  static override type = 'Maximum Dive Ascent Rate';
}

/** Native FIT dive-summary average descent rate in meters per second. */
export class DataDiveDescentRateAvg extends DataFiniteNumber {
  static type = 'Average Dive Descent Rate';
  static unit = 'm/s';
}

/** Native FIT dive-summary maximum descent rate in meters per second. */
export class DataDiveDescentRateMax extends DataFiniteNumber {
  static type = 'Maximum Dive Descent Rate';
  static unit = 'm/s';
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
}

export class DataPressureSAC extends DataFiniteNumber {
  static type = 'Pressure SAC';
  static unit = 'bar/min';
}

export class DataPressureSACAvg extends DataPressureSAC {
  static override type = 'Average Pressure SAC';
}

export class DataVolumeSAC extends DataFiniteNumber {
  static type = 'Volume SAC';
  static unit = 'L/min';
}

export class DataVolumeSACAvg extends DataVolumeSAC {
  static override type = 'Average Volume SAC';
}

export class DataRMV extends DataFiniteNumber {
  static type = 'RMV';
  static unit = 'L/min';
}

export class DataRMVAvg extends DataRMV {
  static override type = 'Average RMV';
}

export class DataNextStopDepth extends DataFiniteNumber {
  static type = 'Next Stop Depth';
  static unit = 'm';
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

/** Native FIT `po_2` value, retaining the profile's percent representation. */
export class DataPO2 extends DataFinitePercent {
  static type = 'PO2';
  static displayType = 'PO₂';
}
