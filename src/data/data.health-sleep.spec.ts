import { Data } from './data';
import { DataAltitude } from './data.altitude';
import { DataDistance } from './data.distance';
import { DataFitnessAge } from './data.fitness-age';
import { DataHeartRate } from './data.heart-rate';
import * as HealthData from './data.health';
import * as SleepData from './data.sleep';
import { DataSteps } from './data.steps';
import { DataStore, DynamicDataLoader } from './data.store';
import { DataVO2Max } from './data.vo2-max';
import { DataWeight } from './data.weight';

interface DataConstructor<T extends number | string> {
  new (value: T): Data<T>;
  readonly aliases?: readonly string[];
  readonly name: string;
  readonly type: string;
  readonly unit: string;
}

interface DisplayCase {
  cls: DataConstructor<number>;
  displayUnit: string;
  displayValue: number | string | string[];
  unit: string;
  value: number;
}

type HealthDataConstructor = DataConstructor<number> | DataConstructor<string>;

const healthDataClasses = Object.values(HealthData) as Array<DataConstructor<number | string>>;
const sleepDataClasses = Object.values(SleepData) as Array<DataConstructor<number>>;
const numericHealthDataClasses = healthDataClasses.filter(
  dataClass => dataClass !== (HealthData.DataStressState as DataConstructor<number | string>)
) as Array<DataConstructor<number>>;
const numericDataClasses = [...numericHealthDataClasses, ...sleepDataClasses];

const healthDataClassByMetricId: Readonly<Record<string, HealthDataConstructor>> = {
  active_duration: HealthData.DataActiveDuration,
  active_energy: HealthData.DataActiveEnergy,
  altitude: DataAltitude,
  basal_energy: HealthData.DataBasalEnergy,
  blood_oxygen_saturation: HealthData.DataBloodOxygenSaturation,
  blood_pressure_diastolic: HealthData.DataBloodPressureDiastolic,
  blood_pressure_systolic: HealthData.DataBloodPressureSystolic,
  body_energy: HealthData.DataBodyEnergy,
  body_energy_change: HealthData.DataBodyEnergyChange,
  body_fat: HealthData.DataBodyFat,
  body_mass_index: HealthData.DataBodyMassIndex,
  body_water: HealthData.DataBodyWater,
  body_weight: DataWeight,
  bone_mass: HealthData.DataBoneMass,
  distance: DataDistance,
  fitness_age: DataFitnessAge,
  floors_climbed: HealthData.DataFloorsClimbed,
  heart_rate: DataHeartRate,
  heart_rate_variability: HealthData.DataHeartRateVariability,
  moderate_intensity_duration: HealthData.DataModerateIntensityDuration,
  muscle_mass: HealthData.DataMuscleMass,
  pulse_rate: HealthData.DataPulseRate,
  recovery_score: HealthData.DataRecoveryScore,
  respiration_rate: HealthData.DataRespirationRate,
  resting_heart_rate: HealthData.DataRestingHeartRate,
  skin_temperature_deviation: HealthData.DataSkinTemperatureDeviation,
  sleep_duration: SleepData.DataSleepDuration,
  sleep_score: SleepData.DataSleepScore,
  steps: DataSteps,
  stress_duration: HealthData.DataStressDuration,
  stress_level: HealthData.DataStressLevel,
  stress_state: HealthData.DataStressState,
  total_energy: HealthData.DataTotalEnergy,
  vigorous_intensity_duration: HealthData.DataVigorousIntensityDuration,
  wheelchair_push_distance: HealthData.DataWheelchairPushDistance,
  wheelchair_pushes: HealthData.DataWheelchairPushes,
  vo2_max: DataVO2Max
};

const healthDisplayCases: DisplayCase[] = [
  { cls: HealthData.DataWheelchairPushes, value: 12.6, displayValue: 13, unit: 'count', displayUnit: '' },
  {
    cls: HealthData.DataWheelchairPushDistance,
    value: 1234.5,
    displayValue: '1.23',
    unit: 'm',
    displayUnit: 'Km'
  },
  { cls: HealthData.DataFloorsClimbed, value: 4.6, displayValue: 5, unit: 'count', displayUnit: '' },
  { cls: HealthData.DataActiveDuration, value: 3661, displayValue: '01h 01m 01s', unit: 's', displayUnit: '' },
  {
    cls: HealthData.DataModerateIntensityDuration,
    value: 3661,
    displayValue: '01h 01m 01s',
    unit: 's',
    displayUnit: ''
  },
  {
    cls: HealthData.DataVigorousIntensityDuration,
    value: 3661,
    displayValue: '01h 01m 01s',
    unit: 's',
    displayUnit: ''
  },
  { cls: HealthData.DataActiveEnergy, value: 123.6, displayValue: 124, unit: 'kcal', displayUnit: 'kcal' },
  { cls: HealthData.DataBasalEnergy, value: 123.6, displayValue: 124, unit: 'kcal', displayUnit: 'kcal' },
  { cls: HealthData.DataTotalEnergy, value: 123.6, displayValue: 124, unit: 'kcal', displayUnit: 'kcal' },
  { cls: HealthData.DataRestingHeartRate, value: 54.6, displayValue: 55, unit: 'bpm', displayUnit: 'bpm' },
  { cls: HealthData.DataHeartRateVariability, value: 32.26, displayValue: 32.3, unit: 'ms', displayUnit: 'ms' },
  {
    cls: HealthData.DataBloodOxygenSaturation,
    value: 96.26,
    displayValue: 96.3,
    unit: '%',
    displayUnit: '%'
  },
  { cls: HealthData.DataRespirationRate, value: 14.26, displayValue: 14.3, unit: 'br/min', displayUnit: 'br/min' },
  { cls: HealthData.DataStressLevel, value: 42.26, displayValue: 42.3, unit: 'score', displayUnit: '' },
  { cls: HealthData.DataStressDuration, value: 3661, displayValue: '01h 01m 01s', unit: 's', displayUnit: '' },
  { cls: HealthData.DataBodyEnergy, value: 72.26, displayValue: 72.3, unit: '%', displayUnit: '%' },
  { cls: HealthData.DataBodyEnergyChange, value: -12.34, displayValue: -12.3, unit: '%', displayUnit: '%' },
  { cls: HealthData.DataRecoveryScore, value: 84.26, displayValue: 84.3, unit: 'score', displayUnit: '' },
  { cls: HealthData.DataBodyMassIndex, value: 22.26, displayValue: 22.3, unit: 'kg/m²', displayUnit: 'kg/m²' },
  { cls: HealthData.DataBodyFat, value: 18.26, displayValue: 18.3, unit: '%', displayUnit: '%' },
  { cls: HealthData.DataBodyWater, value: 58.26, displayValue: 58.3, unit: '%', displayUnit: '%' },
  { cls: HealthData.DataMuscleMass, value: 62.26, displayValue: 62.3, unit: 'kg', displayUnit: 'kg' },
  { cls: HealthData.DataBoneMass, value: 2.846, displayValue: '2.85', unit: 'kg', displayUnit: 'kg' },
  {
    cls: HealthData.DataBloodPressureSystolic,
    value: 121.6,
    displayValue: 122,
    unit: 'mmHg',
    displayUnit: 'mmHg'
  },
  {
    cls: HealthData.DataBloodPressureDiastolic,
    value: 78.6,
    displayValue: 79,
    unit: 'mmHg',
    displayUnit: 'mmHg'
  },
  { cls: HealthData.DataPulseRate, value: 61.6, displayValue: 62, unit: 'bpm', displayUnit: 'bpm' },
  {
    cls: HealthData.DataSkinTemperatureDeviation,
    value: -0.56,
    displayValue: -0.6,
    unit: '°C',
    displayUnit: '°C'
  }
];

const sleepDisplayCases: DisplayCase[] = [
  { cls: SleepData.DataSleepDuration, value: 3661, displayValue: '01h 01m 01s', unit: 's', displayUnit: '' },
  { cls: SleepData.DataSleepInBedDuration, value: 3661, displayValue: '01h 01m 01s', unit: 's', displayUnit: '' },
  { cls: SleepData.DataSleepDeepDuration, value: 3661, displayValue: '01h 01m 01s', unit: 's', displayUnit: '' },
  { cls: SleepData.DataSleepLightDuration, value: 3661, displayValue: '01h 01m 01s', unit: 's', displayUnit: '' },
  { cls: SleepData.DataSleepRemDuration, value: 3661, displayValue: '01h 01m 01s', unit: 's', displayUnit: '' },
  { cls: SleepData.DataSleepAwakeDuration, value: 3661, displayValue: '01h 01m 01s', unit: 's', displayUnit: '' },
  {
    cls: SleepData.DataSleepUnmeasurableDuration,
    value: 3661,
    displayValue: '01h 01m 01s',
    unit: 's',
    displayUnit: ''
  },
  { cls: SleepData.DataSleepUnknownDuration, value: 3661, displayValue: '01h 01m 01s', unit: 's', displayUnit: '' },
  { cls: SleepData.DataSleepScore, value: 82.26, displayValue: 82.3, unit: 'score', displayUnit: '' },
  { cls: SleepData.DataSleepHeartRateAvg, value: 54.6, displayValue: 55, unit: 'bpm', displayUnit: 'bpm' },
  { cls: SleepData.DataSleepHeartRateMin, value: 47.6, displayValue: 48, unit: 'bpm', displayUnit: 'bpm' },
  { cls: SleepData.DataSleepRestingHeartRate, value: 51.6, displayValue: 52, unit: 'bpm', displayUnit: 'bpm' },
  { cls: SleepData.DataSleepHRVAvg, value: 32.26, displayValue: 32.3, unit: 'ms', displayUnit: 'ms' },
  { cls: SleepData.DataSleepHRVOvernight, value: 35.26, displayValue: 35.3, unit: 'ms', displayUnit: 'ms' },
  { cls: SleepData.DataSleepHRVSampleCount, value: 24.6, displayValue: 25, unit: 'count', displayUnit: '' },
  {
    cls: SleepData.DataSleepBloodOxygenSaturationMax,
    value: 96.26,
    displayValue: 96.3,
    unit: '%',
    displayUnit: '%'
  },
  {
    cls: SleepData.DataSleepRespirationRateAvg,
    value: 14.26,
    displayValue: 14.3,
    unit: 'br/min',
    displayUnit: 'br/min'
  }
];

describe('Health and sleep data types', () => {
  it('enumerates every new class publicly and resolves all canonical types and aliases', () => {
    expect(healthDataClasses).toHaveLength(28);
    expect(sleepDataClasses).toHaveLength(17);

    [...healthDataClasses, ...sleepDataClasses].forEach(dataClass => {
      expect(DataStore[dataClass.name]).toBe(dataClass);
      expect(DynamicDataLoader.getDataClassFromDataType(dataClass.type)).toBe(dataClass);
      dataClass.aliases?.forEach(alias => {
        expect(DynamicDataLoader.getDataClassFromDataType(alias)).toBe(dataClass);
      });
    });
  });

  it('covers every provider-neutral Health metric identifier', () => {
    expect(Object.keys(healthDataClassByMetricId)).toHaveLength(37);

    Object.entries(healthDataClassByMetricId).forEach(([metricId, dataClass]) => {
      expect(DynamicDataLoader.getDataClassFromDataType(metricId)).toBe(dataClass);
    });
  });

  it('retains finite numeric values through canonical JSON round trips', () => {
    numericDataClasses.forEach(dataClass => {
      const value = 42.25;
      const instance = new dataClass(value);
      const json = instance.toJSON();
      const restored = DynamicDataLoader.getDataInstanceFromDataType(dataClass.type, json[dataClass.type]);

      expect(Number.isFinite(instance.getValue())).toBe(true);
      expect(json).toEqual({ [dataClass.type]: value });
      expect(restored).toBeInstanceOf(dataClass);
      expect(restored.getValue()).toBe(value);
    });
  });

  it('rejects non-finite numeric values before persistence', () => {
    numericDataClasses.forEach(dataClass => {
      [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY].forEach(value => {
        expect(() => new dataClass(value)).toThrow('Value is not boolean or number or string or Date or position');
      });
    });
  });

  it.each(healthDisplayCases)('$cls.type formats its Health value and unit', testCase => {
    const instance = new testCase.cls(testCase.value);

    expect(instance.getDisplayValue()).toBe(testCase.displayValue);
    expect(instance.getUnit()).toBe(testCase.unit);
    expect(instance.getDisplayUnit()).toBe(testCase.displayUnit);
  });

  it.each(sleepDisplayCases)('$cls.type formats its sleep value and unit', testCase => {
    const instance = new testCase.cls(testCase.value);

    expect(instance.getDisplayValue()).toBe(testCase.displayValue);
    expect(instance.getUnit()).toBe(testCase.unit);
    expect(instance.getDisplayUnit()).toBe(testCase.displayUnit);
  });

  it('formats and round-trips the nonnumeric stress-state category', () => {
    const instance = new HealthData.DataStressState('rest');
    const restored = DynamicDataLoader.getDataInstanceFromDataType('stress_state', 'rest');

    expect(instance.getDisplayValue()).toBe('rest');
    expect(instance.getUnit()).toBe('category');
    expect(instance.getDisplayUnit()).toBe('');
    expect(instance.toJSON()).toEqual({ 'Stress State': 'rest' });
    expect(restored).toBeInstanceOf(HealthData.DataStressState);
    expect(restored.getValue()).toBe('rest');
  });

  it('uses familiar Health abbreviations only as display labels', () => {
    expect(new HealthData.DataHeartRateVariability(32).getDisplayType()).toBe('HRV');
    expect(new HealthData.DataBloodOxygenSaturation(96).getDisplayType()).toBe('SpO₂');
    expect(new HealthData.DataBodyMassIndex(22).getDisplayType()).toBe('BMI');
    expect(new SleepData.DataSleepBloodOxygenSaturationMax(98).getDisplayType()).toBe('Maximum Sleep SpO₂');
  });

  it('keeps the pre-existing Health primitives in the public registry', () => {
    [DataSteps, DataDistance, DataAltitude, DataHeartRate, DataWeight, DataVO2Max, DataFitnessAge].forEach(
      dataClass => {
        expect(DataStore[dataClass.name]).toBe(dataClass);
        expect(DynamicDataLoader.getDataClassFromDataType(dataClass.type)).toBe(dataClass);
      }
    );

    expect(new DataSteps(1234.6).getDisplayValue()).toBe(1235);
    expect(new DataSteps(1234.6).getUnit()).toBe('count');
    expect(new DataSteps(1234.6).getDisplayUnit()).toBe('');
    expect(DynamicDataLoader.getDataClassFromDataType('steps')).toBe(DataSteps);
    expect(DynamicDataLoader.getDataClassFromDataType('distance')).toBe(DataDistance);
    expect(DynamicDataLoader.getDataClassFromDataType('altitude')).toBe(DataAltitude);
    expect(DynamicDataLoader.getDataClassFromDataType('heart_rate')).toBe(DataHeartRate);
    expect(DynamicDataLoader.getDataClassFromDataType('body_weight')).toBe(DataWeight);
    expect(DynamicDataLoader.getDataClassFromDataType('vo2_max')).toBe(DataVO2Max);
    expect(DynamicDataLoader.getDataClassFromDataType('fitness_age')).toBe(DataFitnessAge);
    expect(new DataVO2Max(52.345).getDisplayValue()).toBe('52.34');
    expect(new DataVO2Max(52.345).getDisplayType()).toBe('VO₂ Max');
    expect(new DataVO2Max(52.345).getUnit()).toBe('ml/kg/min');
  });
});
