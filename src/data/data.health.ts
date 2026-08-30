import { DataDistance } from './data.distance';
import { DataDuration } from './data.duration';
import { DataNumber } from './data.number';
import { DataPercent } from './data.percent';
import { DataJSONInterface } from './data.json.interface';
import { scalarDataFromJSON } from './data.scalar-json';
import { DataString } from './data.string';

abstract class DataFiniteHealthNumber extends DataNumber {
  /** Rehydrates the concrete Health metric from its canonical JSON object. */
  static fromJSON<TData extends DataNumber>(
    this: { readonly type: string; new (value: number): TData },
    json: DataJSONInterface
  ): TData {
    return scalarDataFromJSON(this, json);
  }

  override isValueTypeValid(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value);
  }
}

abstract class DataRoundedHealthNumber extends DataFiniteHealthNumber {
  override getDisplayValue(): number {
    return Math.round(this.getValue());
  }
}

abstract class DataOneDecimalHealthNumber extends DataFiniteHealthNumber {
  override getDisplayValue(): number {
    return Math.round(this.getValue() * 10) / 10;
  }
}

abstract class DataTwoDecimalHealthNumber extends DataFiniteHealthNumber {
  override getDisplayValue(): string {
    return this.getValue().toFixed(2);
  }
}

abstract class DataHealthCount extends DataRoundedHealthNumber {
  static override unit = 'count';

  override getDisplayUnit(): string {
    return '';
  }
}

abstract class DataHealthDuration extends DataDuration {
  /** Rehydrates the concrete Health duration from its canonical JSON object. */
  static fromJSON<TData extends DataNumber>(
    this: { readonly type: string; new (value: number): TData },
    json: DataJSONInterface
  ): TData {
    return scalarDataFromJSON(this, json);
  }

  override isValueTypeValid(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value);
  }
}

abstract class DataHealthEnergy extends DataRoundedHealthNumber {
  static override unit = 'kcal';
}

abstract class DataHealthHeartRate extends DataRoundedHealthNumber {
  static override unit = 'bpm';
}

abstract class DataHealthPercent extends DataPercent {
  /** Rehydrates the concrete Health percentage from its canonical JSON object. */
  static fromJSON<TData extends DataNumber>(
    this: { readonly type: string; new (value: number): TData },
    json: DataJSONInterface
  ): TData {
    return scalarDataFromJSON(this, json);
  }

  override isValueTypeValid(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value);
  }
}

abstract class DataHealthScore extends DataOneDecimalHealthNumber {
  static override unit = 'score';

  override getDisplayUnit(): string {
    return '';
  }
}

/**
 * Total wheelchair pushes recorded for an interval.
 * @category Health and sleep
 */
export class DataWheelchairPushes extends DataHealthCount {
  static override type = 'Wheelchair Pushes';
  static aliases = ['wheelchair_pushes'];
}

/**
 * Wheelchair travel distance, stored canonically in meters.
 * @category Health and sleep
 */
export class DataWheelchairPushDistance extends DataDistance {
  static override type = 'Wheelchair Push Distance';
  static aliases = ['wheelchair_push_distance'];

  override isValueTypeValid(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value);
  }
}

/**
 * Number of floors climbed for an interval.
 * @category Health and sleep
 */
export class DataFloorsClimbed extends DataHealthCount {
  static override type = 'Floors Climbed';
  static aliases = ['floors_climbed'];
}

/**
 * Active time in seconds.
 * @category Health and sleep
 */
export class DataActiveDuration extends DataHealthDuration {
  static override type = 'Active Duration';
  static aliases = ['active_duration'];
}

/**
 * Moderate-intensity time in seconds.
 * @category Health and sleep
 */
export class DataModerateIntensityDuration extends DataHealthDuration {
  static override type = 'Moderate Intensity Duration';
  static aliases = ['moderate_intensity_duration'];
}

/**
 * Vigorous-intensity time in seconds.
 * @category Health and sleep
 */
export class DataVigorousIntensityDuration extends DataHealthDuration {
  static override type = 'Vigorous Intensity Duration';
  static aliases = ['vigorous_intensity_duration'];
}

/**
 * Active energy expenditure in kilocalories.
 * @category Health and sleep
 */
export class DataActiveEnergy extends DataHealthEnergy {
  static override type = 'Active Energy';
  static aliases = ['active_energy'];
}

/**
 * Basal energy expenditure in kilocalories.
 * @category Health and sleep
 */
export class DataBasalEnergy extends DataHealthEnergy {
  static override type = 'Basal Energy';
  static aliases = ['basal_energy'];
}

/**
 * Total energy expenditure in kilocalories.
 * @category Health and sleep
 */
export class DataTotalEnergy extends DataHealthEnergy {
  static override type = 'Total Energy';
  static aliases = ['total_energy'];
}

/**
 * Resting heart rate in beats per minute.
 * @category Health and sleep
 */
export class DataRestingHeartRate extends DataHealthHeartRate {
  static override type = 'Resting Heart Rate';
  static aliases = ['resting_heart_rate'];
}

/**
 * Heart-rate variability in milliseconds.
 * @category Health and sleep
 */
export class DataHeartRateVariability extends DataOneDecimalHealthNumber {
  static override type = 'Heart Rate Variability';
  static override displayType = 'HRV';
  static override unit = 'ms';
  static aliases = ['HRV', 'hrv', 'heart_rate_variability'];
}

/**
 * Blood oxygen saturation as a percentage.
 * @category Health and sleep
 */
export class DataBloodOxygenSaturation extends DataHealthPercent {
  static override type = 'Blood Oxygen Saturation';
  static override displayType = 'SpO₂';
  static aliases = ['Blood Oxygen', 'Pulse Ox', 'SpO2', 'SpO₂', 'blood_oxygen_saturation'];
}

/**
 * Respiration rate in breaths per minute.
 * @category Health and sleep
 */
export class DataRespirationRate extends DataOneDecimalHealthNumber {
  static override type = 'Respiration Rate';
  static override unit = 'br/min';
  static aliases = ['Breathing Rate', 'respiration_rate'];
}

/**
 * Provider-normalized stress score.
 * @category Health and sleep
 */
export class DataStressLevel extends DataHealthScore {
  static override type = 'Stress Level';
  static aliases = ['stress_level'];
}

/**
 * Provider stress-state category, such as rest or activity.
 * @category Health and sleep
 */
export class DataStressState extends DataString {
  static override type = 'Stress State';
  static override unit = 'category';
  static aliases = ['stress_state'];

  /** Rehydrates a stress-state category from its canonical JSON object. */
  static fromJSON<TData extends DataString>(
    this: { readonly type: string; new (value: string): TData },
    json: DataJSONInterface
  ): TData {
    return scalarDataFromJSON(this, json);
  }

  override getDisplayUnit(): string {
    return '';
  }
}

/**
 * Time spent in a stress state, in seconds.
 * @category Health and sleep
 */
export class DataStressDuration extends DataHealthDuration {
  static override type = 'Stress Duration';
  static aliases = ['stress_duration'];
}

/**
 * Provider-neutral body-energy level, as a percentage.
 * @category Health and sleep
 */
export class DataBodyEnergy extends DataHealthPercent {
  static override type = 'Body Energy';
  static aliases = ['Body Battery', 'body_energy'];
}

/**
 * Signed change in provider-neutral body energy, in percentage points.
 * @category Health and sleep
 */
export class DataBodyEnergyChange extends DataHealthPercent {
  static override type = 'Body Energy Change';
  static aliases = ['Body Battery Change', 'body_energy_change'];
}

/**
 * Provider-normalized recovery score.
 * @category Health and sleep
 */
export class DataRecoveryScore extends DataHealthScore {
  static override type = 'Recovery Score';
  static aliases = ['recovery_score'];
}

/**
 * Body mass index in kilograms per square meter.
 * @category Health and sleep
 */
export class DataBodyMassIndex extends DataOneDecimalHealthNumber {
  static override type = 'Body Mass Index';
  static override displayType = 'BMI';
  static override unit = 'kg/m²';
  static aliases = ['BMI', 'body_mass_index'];
}

/**
 * Body-fat percentage.
 * @category Health and sleep
 */
export class DataBodyFat extends DataHealthPercent {
  static override type = 'Body Fat';
  static aliases = ['Body Fat Percentage', 'body_fat'];
}

/**
 * Body-water percentage.
 * @category Health and sleep
 */
export class DataBodyWater extends DataHealthPercent {
  static override type = 'Body Water';
  static aliases = ['Body Water Percentage', 'body_water'];
}

/**
 * Muscle mass in kilograms.
 * @category Health and sleep
 */
export class DataMuscleMass extends DataOneDecimalHealthNumber {
  static override type = 'Muscle Mass';
  static override unit = 'kg';
  static aliases = ['muscle_mass'];
}

/**
 * Bone mass in kilograms.
 * @category Health and sleep
 */
export class DataBoneMass extends DataTwoDecimalHealthNumber {
  static override type = 'Bone Mass';
  static override unit = 'kg';
  static aliases = ['bone_mass'];
}

/**
 * Systolic blood pressure in millimeters of mercury.
 * @category Health and sleep
 */
export class DataBloodPressureSystolic extends DataRoundedHealthNumber {
  static override type = 'Systolic Blood Pressure';
  static override unit = 'mmHg';
  static aliases = ['blood_pressure_systolic'];
}

/**
 * Diastolic blood pressure in millimeters of mercury.
 * @category Health and sleep
 */
export class DataBloodPressureDiastolic extends DataRoundedHealthNumber {
  static override type = 'Diastolic Blood Pressure';
  static override unit = 'mmHg';
  static aliases = ['blood_pressure_diastolic'];
}

/**
 * Pulse rate associated with a cardiovascular measurement.
 * @category Health and sleep
 */
export class DataPulseRate extends DataHealthHeartRate {
  static override type = 'Pulse Rate';
  static aliases = ['pulse_rate'];
}

/**
 * Signed skin-temperature deviation from baseline in degrees Celsius.
 * @category Health and sleep
 */
export class DataSkinTemperatureDeviation extends DataOneDecimalHealthNumber {
  static override type = 'Skin Temperature Deviation';
  static override unit = '°C';
  static aliases = ['skin_temperature_deviation'];
}
