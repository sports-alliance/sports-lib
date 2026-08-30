import { DataDuration } from './data.duration';
import { DataNumber } from './data.number';
import { DataPercent } from './data.percent';

abstract class DataFiniteSleepNumber extends DataNumber {
  override isValueTypeValid(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value);
  }
}

abstract class DataRoundedSleepNumber extends DataFiniteSleepNumber {
  override getDisplayValue(): number {
    return Math.round(this.getValue());
  }
}

abstract class DataOneDecimalSleepNumber extends DataFiniteSleepNumber {
  override getDisplayValue(): number {
    return Math.round(this.getValue() * 10) / 10;
  }
}

abstract class DataSleepDurationBase extends DataDuration {
  override isValueTypeValid(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value);
  }
}

abstract class DataSleepHeartRate extends DataRoundedSleepNumber {
  static override unit = 'bpm';
}

abstract class DataSleepHRV extends DataOneDecimalSleepNumber {
  static override unit = 'ms';
}

/** Total sleep duration in seconds. */
export class DataSleepDuration extends DataSleepDurationBase {
  static override type = 'Sleep Duration';
  static aliases = ['sleep_duration'];
}

/** Total time in bed in seconds. */
export class DataSleepInBedDuration extends DataSleepDurationBase {
  static override type = 'Sleep In-Bed Duration';
  static aliases = ['in_bed_duration', 'sleep_in_bed_duration'];
}

/** Time in the deep-sleep stage, in seconds. */
export class DataSleepDeepDuration extends DataSleepDurationBase {
  static override type = 'Deep Sleep Duration';
  static aliases = ['deep_sleep_duration'];
}

/** Time in the light-sleep stage, in seconds. */
export class DataSleepLightDuration extends DataSleepDurationBase {
  static override type = 'Light Sleep Duration';
  static aliases = ['light_sleep_duration'];
}

/** Time in the rapid-eye-movement sleep stage, in seconds. */
export class DataSleepRemDuration extends DataSleepDurationBase {
  static override type = 'REM Sleep Duration';
  static aliases = ['rem_sleep_duration'];
}

/** Time awake during a sleep session, in seconds. */
export class DataSleepAwakeDuration extends DataSleepDurationBase {
  static override type = 'Awake Sleep Duration';
  static aliases = ['awake_sleep_duration'];
}

/** Time the provider explicitly marked as unmeasurable, in seconds. */
export class DataSleepUnmeasurableDuration extends DataSleepDurationBase {
  static override type = 'Unmeasurable Sleep Duration';
  static aliases = ['unmeasurable_sleep_duration'];
}

/** Time with an unknown sleep stage, in seconds. */
export class DataSleepUnknownDuration extends DataSleepDurationBase {
  static override type = 'Unknown Sleep Duration';
  static aliases = ['unknown_sleep_duration'];
}

/** Provider-normalized sleep score. */
export class DataSleepScore extends DataOneDecimalSleepNumber {
  static override type = 'Sleep Score';
  static override unit = 'score';
  static aliases = ['sleep_score'];

  override getDisplayUnit(): string {
    return '';
  }
}

/** Average heart rate during a sleep session. */
export class DataSleepHeartRateAvg extends DataSleepHeartRate {
  static override type = 'Average Sleep Heart Rate';
  static aliases = ['sleep_average_heart_rate', 'vitals.averageHeartRateBpm'];
}

/** Minimum heart rate during a sleep session. */
export class DataSleepHeartRateMin extends DataSleepHeartRate {
  static override type = 'Minimum Sleep Heart Rate';
  static aliases = ['sleep_minimum_heart_rate', 'vitals.minimumHeartRateBpm'];
}

/** Resting heart rate reported for a sleep session. */
export class DataSleepRestingHeartRate extends DataSleepHeartRate {
  static override type = 'Sleep Resting Heart Rate';
  static aliases = ['sleep_resting_heart_rate', 'vitals.restingHeartRateBpm'];
}

/** Average heart-rate variability during a sleep session. */
export class DataSleepHRVAvg extends DataSleepHRV {
  static override type = 'Average Sleep HRV';
  static aliases = ['sleep_average_hrv', 'vitals.averageHrvMs'];
}

/** Overnight heart-rate variability reported for a sleep session. */
export class DataSleepHRVOvernight extends DataSleepHRV {
  static override type = 'Overnight HRV';
  static aliases = ['sleep_overnight_hrv', 'vitals.overnightHrvMs'];
}

/** Number of HRV samples contributing to the sleep aggregate. */
export class DataSleepHRVSampleCount extends DataRoundedSleepNumber {
  static override type = 'Sleep HRV Sample Count';
  static override unit = 'count';
  static aliases = ['sleep_hrv_sample_count', 'vitals.hrvSampleCount'];

  override getDisplayUnit(): string {
    return '';
  }
}

/** Maximum blood oxygen saturation during a sleep session. */
export class DataSleepBloodOxygenSaturationMax extends DataPercent {
  static override type = 'Maximum Sleep Blood Oxygen Saturation';
  static override displayType = 'Maximum Sleep SpO₂';
  static aliases = ['Maximum Sleep SpO2', 'sleep_maximum_spo2', 'vitals.maxSpo2Percent'];

  override isValueTypeValid(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value);
  }
}

/** Average respiration rate during a sleep session. */
export class DataSleepRespirationRateAvg extends DataOneDecimalSleepNumber {
  static override type = 'Average Sleep Respiration Rate';
  static override unit = 'br/min';
  static aliases = ['sleep_average_respiration_rate', 'vitals.averageRespirationBrpm'];
}
