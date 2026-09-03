import { ActivityTypes, ActivityTypesHelper } from '../../activities/activity.types';
import { DataAbsolutePressure } from '../../data/data.absolute-pressure';
import { DataAbsolutePressureAvg } from '../../data/data.absolute-pressure-avg';
import { DataAbsolutePressureMax } from '../../data/data.absolute-pressure-max';
import { DataAbsolutePressureMin } from '../../data/data.absolute-pressure-min';
import { DataAirPower } from '../../data/data.air-power';
import { DataAirPowerAvg } from '../../data/data.air-power-avg';
import { DataAirPowerMax } from '../../data/data.air-power-max';
import { DataAirPowerMin } from '../../data/data.air-power-min';
import { DataAltitude } from '../../data/data.altitude';
import { DataAltitudeAvg } from '../../data/data.altitude-avg';
import { DataAltitudeMax } from '../../data/data.altitude-max';
import { DataAltitudeMin } from '../../data/data.altitude-min';
import { DataAltitudeSmooth } from '../../data/data.altitude-smooth';
import { DataCadence } from '../../data/data.cadence';
import { DataCadenceAvg } from '../../data/data.cadence-avg';
import { DataCadenceMax } from '../../data/data.cadence-max';
import { DataCadenceMin } from '../../data/data.cadence-min';
import { DataEffortPace } from '../../data/data.effort-pace';
import { DataEffortPaceAvg } from '../../data/data.effort-pace-avg';
import { DataEffortPaceMax } from '../../data/data.effort-pace-max';
import { DataEffortPaceMin } from '../../data/data.effort-pace-min';
import { DataEHPE } from '../../data/data.ehpe';
import { DataEHPEAvg } from '../../data/data.ehpe-avg';
import { DataEHPEMax } from '../../data/data.ehpe-max';
import { DataEHPEMin } from '../../data/data.ehpe-min';
import { DataEVPE } from '../../data/data.evpe';
import { DataEVPEAvg } from '../../data/data.evpe-avg';
import { DataEVPEMax } from '../../data/data.evpe-max';
import { DataEVPEMin } from '../../data/data.evpe-min';
import { DataGrade } from '../../data/data.grade';
import { DataGradeAdjustedSpeed } from '../../data/data.grade-adjusted-speed';
import { DataGradeAdjustedSpeedAvg } from '../../data/data.grade-adjusted-speed-avg';
import { DataGradeAdjustedSpeedMax } from '../../data/data.grade-adjusted-speed-max';
import { DataGradeAdjustedSpeedMin } from '../../data/data.grade-adjusted-speed-min';
import { DataGradeAvg } from '../../data/data.grade-avg';
import { DataGradeMax } from '../../data/data.grade-max';
import { DataGradeMin } from '../../data/data.grade-min';
import { DataGradeSmooth } from '../../data/data.grade-smooth';
import { DataGroundContactTime } from '../../data/data.ground-contact-time';
import { DataGroundContactTimeAvg } from '../../data/data.ground-contact-time-avg';
import { DataGroundContactTimeMax } from '../../data/data.ground-contact-time-max';
import { DataGroundContactTimeMin } from '../../data/data.ground-contact-time-min';
import { DataHeartRate } from '../../data/data.heart-rate';
import { DataHeartRateAvg } from '../../data/data.heart-rate-avg';
import { DataHeartRateMax } from '../../data/data.heart-rate-max';
import { DataHeartRateMin } from '../../data/data.heart-rate-min';
import { DataInterface } from '../../data/data.interface';
import { DataLegStiffness } from '../../data/data.leg-stiffness';
import { DataLegStiffnessAvg } from '../../data/data.leg-stiffness-avg';
import { DataLegStiffnessMax } from '../../data/data.leg-stiffness-max';
import { DataLegStiffnessMin } from '../../data/data.leg-stiffness-min';
import { DataNumberOfSatellites } from '../../data/data.number-of-satellites';
import { DataNumberOfSatellitesAvg } from '../../data/data.number-of-satellites-avg';
import { DataNumberOfSatellitesMax } from '../../data/data.number-of-satellites-max';
import { DataNumberOfSatellitesMin } from '../../data/data.number-of-satellites-min';
import { DataPower } from '../../data/data.power';
import { DataPowerAvg } from '../../data/data.power-avg';
import { DataPowerMax } from '../../data/data.power-max';
import { DataPowerMin } from '../../data/data.power-min';
import {
  DataContactTimeToFlightTimeRatio,
  DataContactTimeToFlightTimeRatioAvg,
  DataContactTimeToFlightTimeRatioMax,
  DataContactTimeToFlightTimeRatioMin,
  DataGroundContactTimePercentage,
  DataGroundContactTimePercentageAvg,
  DataGroundContactTimePercentageMax,
  DataGroundContactTimePercentageMin,
  DataRunningFlightTime,
  DataRunningFlightTimeAvg,
  DataRunningFlightTimeMax,
  DataRunningFlightTimeMin
} from '../../data/data.running-dynamics';
import { DataSatellite5BestSNR } from '../../data/data.satellite-5-best-snr';
import { DataSatellite5BestSNRAvg } from '../../data/data.satellite-5-best-snr-avg';
import { DataSatellite5BestSNRMax } from '../../data/data.satellite-5-best-snr-max';
import { DataSatellite5BestSNRMin } from '../../data/data.satellite-5-best-snr-min';
import { DataSpeed } from '../../data/data.speed';
import { DataSpeedAvg } from '../../data/data.speed-avg';
import { DataSpeedMax } from '../../data/data.speed-max';
import { DataSpeedMin } from '../../data/data.speed-min';
import {
  DataPotentialStamina,
  DataPotentialStaminaAvg,
  DataPotentialStaminaMax,
  DataPotentialStaminaMin,
  DataStamina,
  DataStaminaAvg,
  DataStaminaMax,
  DataStaminaMin
} from '../../data/data.stamina';
import { DataStrokeRate } from '../../data/data.stroke-rate';
import { DataStrokeRateAvg } from '../../data/data.stroke-rate-avg';
import { DataStrokeRateMax } from '../../data/data.stroke-rate-max';
import { DataStrokeRateMin } from '../../data/data.stroke-rate-min';
import { DataTemperature } from '../../data/data.temperature';
import { DataTemperatureAvg } from '../../data/data.temperature-avg';
import { DataTemperatureMax } from '../../data/data.temperature-max';
import { DataTemperatureMin } from '../../data/data.temperature-min';
import { DataVerticalOscillation } from '../../data/data.vertical-oscillation';
import { DataVerticalOscillationAvg } from '../../data/data.vertical-oscillation-avg';
import { DataVerticalOscillationMax } from '../../data/data.vertical-oscillation-max';
import { DataVerticalOscillationMin } from '../../data/data.vertical-oscillation-min';
import { DataVerticalRatio } from '../../data/data.vertical-ratio';
import { DataVerticalRatioAvg } from '../../data/data.vertical-ratio-avg';
import { DataVerticalRatioMax } from '../../data/data.vertical-ratio-max';
import { DataVerticalRatioMin } from '../../data/data.vertical-ratio-min';
import { DataVerticalSpeed } from '../../data/data.vertical-speed';
import { DataVerticalSpeedAvg } from '../../data/data.vertical-speed-avg';
import { DataVerticalSpeedMax } from '../../data/data.vertical-speed-max';
import { DataVerticalSpeedMin } from '../../data/data.vertical-speed-min';
import { StatsClassInterface } from '../../stats/stats.class.interface';

type NumericDataConstructor = { type: string; new (value: number): DataInterface };

interface StreamSummaryAggregatePolicy {
  target: NumericDataConstructor;
  isValueValid?: (value: number) => boolean;
  transform?: (value: number) => number;
}

interface StreamSummaryFamilyPolicy {
  key: string;
  sourceTypes: readonly string[];
  min: StreamSummaryAggregatePolicy;
  max: StreamSummaryAggregatePolicy;
  avg: StreamSummaryAggregatePolicy;
  isActivityTypeEligible?: (activityType: ActivityTypes) => boolean;
}

export interface StreamSummaryPolicyContext {
  activityType: ActivityTypes;
  target: StatsClassInterface;
  readStream: (streamType: string) => readonly (number | null)[] | undefined;
}

const isPositive = (value: number) => value > 0;
const isNonNegative = (value: number) => value >= 0;
const isValidGroundContactPercentage = (value: number) => value > 0 && value <= 100;
const excludesTerrainSummary = (activityType: ActivityTypes) =>
  !ActivityTypesHelper.shouldExcludeTerrainSummaryMetrics(activityType);

function family(
  key: string,
  sourceTypes: readonly string[],
  min: NumericDataConstructor,
  max: NumericDataConstructor,
  avg: NumericDataConstructor,
  options: {
    minFilter?: (value: number) => boolean;
    maxFilter?: (value: number) => boolean;
    avgFilter?: (value: number) => boolean;
    avgTransform?: (value: number) => number;
    isActivityTypeEligible?: (activityType: ActivityTypes) => boolean;
  } = {}
): StreamSummaryFamilyPolicy {
  return {
    key,
    sourceTypes,
    min: { target: min, isValueValid: options.minFilter },
    max: { target: max, isValueValid: options.maxFilter },
    avg: { target: avg, isValueValid: options.avgFilter, transform: options.avgTransform },
    isActivityTypeEligible: options.isActivityTypeEligible
  };
}

/**
 * Explicit registry for canonical stream-derived min/max/average families.
 *
 * This is intentionally internal to Sports Lib. Adding a DataStore relationship does not enroll a new family here;
 * each source must opt in with its calculation and eligibility policies.
 */
export const STREAM_SUMMARY_FAMILY_POLICIES: readonly StreamSummaryFamilyPolicy[] = [
  family('altitude', [DataAltitudeSmooth.type, DataAltitude.type], DataAltitudeMin, DataAltitudeMax, DataAltitudeAvg, {
    isActivityTypeEligible: excludesTerrainSummary
  }),
  family('heart-rate', [DataHeartRate.type], DataHeartRateMin, DataHeartRateMax, DataHeartRateAvg, {
    avgTransform: Math.round
  }),
  family('cadence', [DataCadence.type], DataCadenceMin, DataCadenceMax, DataCadenceAvg, {
    minFilter: isPositive,
    avgFilter: isPositive,
    avgTransform: Math.round
  }),
  family('stroke-rate', [DataStrokeRate.type], DataStrokeRateMin, DataStrokeRateMax, DataStrokeRateAvg, {
    minFilter: isPositive,
    avgFilter: isPositive,
    avgTransform: Math.round
  }),
  family('speed', [DataSpeed.type], DataSpeedMin, DataSpeedMax, DataSpeedAvg),
  family('effort-pace', [DataEffortPace.type], DataEffortPaceMin, DataEffortPaceMax, DataEffortPaceAvg),
  family(
    'grade-adjusted-speed',
    [DataGradeAdjustedSpeed.type],
    DataGradeAdjustedSpeedMin,
    DataGradeAdjustedSpeedMax,
    DataGradeAdjustedSpeedAvg
  ),
  family('grade', [DataGradeSmooth.type, DataGrade.type], DataGradeMin, DataGradeMax, DataGradeAvg, {
    isActivityTypeEligible: excludesTerrainSummary
  }),
  family('vertical-speed', [DataVerticalSpeed.type], DataVerticalSpeedMin, DataVerticalSpeedMax, DataVerticalSpeedAvg),
  family('power', [DataPower.type], DataPowerMin, DataPowerMax, DataPowerAvg),
  family('air-power', [DataAirPower.type], DataAirPowerMin, DataAirPowerMax, DataAirPowerAvg),
  family(
    'absolute-pressure',
    [DataAbsolutePressure.type],
    DataAbsolutePressureMin,
    DataAbsolutePressureMax,
    DataAbsolutePressureAvg
  ),
  family('evpe', [DataEVPE.type], DataEVPEMin, DataEVPEMax, DataEVPEAvg),
  family('ehpe', [DataEHPE.type], DataEHPEMin, DataEHPEMax, DataEHPEAvg),
  family(
    'satellite-5-best-snr',
    [DataSatellite5BestSNR.type],
    DataSatellite5BestSNRMin,
    DataSatellite5BestSNRMax,
    DataSatellite5BestSNRAvg
  ),
  family(
    'number-of-satellites',
    [DataNumberOfSatellites.type],
    DataNumberOfSatellitesMin,
    DataNumberOfSatellitesMax,
    DataNumberOfSatellitesAvg
  ),
  family('temperature', [DataTemperature.type], DataTemperatureMin, DataTemperatureMax, DataTemperatureAvg),
  family(
    'ground-contact-time',
    [DataGroundContactTime.type],
    DataGroundContactTimeMin,
    DataGroundContactTimeMax,
    DataGroundContactTimeAvg
  ),
  family(
    'ground-contact-time-percentage',
    [DataGroundContactTimePercentage.type],
    DataGroundContactTimePercentageMin,
    DataGroundContactTimePercentageMax,
    DataGroundContactTimePercentageAvg,
    {
      minFilter: isValidGroundContactPercentage,
      maxFilter: isValidGroundContactPercentage,
      avgFilter: isValidGroundContactPercentage
    }
  ),
  family(
    'running-flight-time',
    [DataRunningFlightTime.type],
    DataRunningFlightTimeMin,
    DataRunningFlightTimeMax,
    DataRunningFlightTimeAvg,
    { minFilter: isNonNegative, maxFilter: isNonNegative, avgFilter: isNonNegative }
  ),
  family(
    'contact-time-to-flight-time-ratio',
    [DataContactTimeToFlightTimeRatio.type],
    DataContactTimeToFlightTimeRatioMin,
    DataContactTimeToFlightTimeRatioMax,
    DataContactTimeToFlightTimeRatioAvg,
    { minFilter: isNonNegative, maxFilter: isNonNegative, avgFilter: isNonNegative }
  ),
  family('leg-stiffness', [DataLegStiffness.type], DataLegStiffnessMin, DataLegStiffnessMax, DataLegStiffnessAvg),
  family(
    'vertical-oscillation',
    [DataVerticalOscillation.type],
    DataVerticalOscillationMin,
    DataVerticalOscillationMax,
    DataVerticalOscillationAvg
  ),
  family('vertical-ratio', [DataVerticalRatio.type], DataVerticalRatioMin, DataVerticalRatioMax, DataVerticalRatioAvg),
  family('stamina', [DataStamina.type], DataStaminaMin, DataStaminaMax, DataStaminaAvg),
  family(
    'potential-stamina',
    [DataPotentialStamina.type],
    DataPotentialStaminaMin,
    DataPotentialStaminaMax,
    DataPotentialStaminaAvg
  )
];

function deriveAggregate(
  target: StatsClassInterface,
  values: readonly (number | null)[],
  policy: StreamSummaryAggregatePolicy,
  aggregate: 'min' | 'max' | 'avg'
): void {
  if (target.getStat(policy.target.type)) {
    return;
  }

  const validValues = values.filter(
    (value): value is number =>
      typeof value === 'number' && Number.isFinite(value) && (!policy.isValueValid || policy.isValueValid(value))
  );
  if (validValues.length === 0) {
    return;
  }

  let value: number;
  if (aggregate === 'min') {
    value = validValues.reduce((minimum, current) => Math.min(minimum, current), Infinity);
  } else if (aggregate === 'max') {
    value = validValues.reduce((maximum, current) => Math.max(maximum, current), -Infinity);
  } else {
    value = validValues.reduce((sum, current) => sum + current, 0) / validValues.length;
  }

  target.addStat(new policy.target(policy.transform ? policy.transform(value) : value));
}

/** Fill missing canonical min/max/average stats using the registered stream policies. */
export function addMissingStreamSummaryStats(context: StreamSummaryPolicyContext): void {
  STREAM_SUMMARY_FAMILY_POLICIES.forEach(policy => {
    if (policy.isActivityTypeEligible && !policy.isActivityTypeEligible(context.activityType)) {
      return;
    }

    const values = policy.sourceTypes.reduce<readonly (number | null)[] | undefined>(
      (selectedValues, sourceType) => selectedValues ?? context.readStream(sourceType),
      undefined
    );
    if (!values) {
      return;
    }

    deriveAggregate(context.target, values, policy.min, 'min');
    deriveAggregate(context.target, values, policy.max, 'max');
    deriveAggregate(context.target, values, policy.avg, 'avg');
  });
}
