/**
 * The supported API surface for the generated reference.
 *
 * This file is intentionally documentation-only. It does not replace the package entry point;
 * it defines the stable, consumer-oriented view that is published to GitHub Pages.
 *
 * @module API
 */

/**
 * Primary import/export facade. Native JSON restoration preserves applicable explicit stats except
 * Diving-group terrain summaries, and adds missing speed-derived pace summaries on events,
 * activities, and laps.
 *
 * @category Import and export
 */
export { SportsLib } from '../src/index';
export { EventExporterGPX } from '../src/events/adapters/exporters/exporter.gpx';
export { EventExporterJSON } from '../src/events/adapters/exporters/exporter.json';
export type { EventExporter } from '../src/events/adapters/exporters/exporter.interface';

/** @category Parsing options */
export { ActivityParsingOptions } from '../src/activities/activity-parsing-options';
export type {
  ActivityParsingOptionsInput,
  ActivityParsingStreamOptions,
  ActivityParsingTssOptions,
  ActivityParsingTssOverridesOptions
} from '../src/activities/activity-parsing-options';
export { RouteParsingOptions } from '../src/routes/route-parsing-options';
export type {
  RouteParsingGPXOptions,
  RouteParsingOptionsInput,
  RouteParsingStreamOptions
} from '../src/routes/route-parsing-options';

/** @category Activities and events */
export type { ActivityInterface } from '../src/activities/activity.interface';
export type { ActivityJSONInterface } from '../src/activities/activity.json.interface';
/**
 * Structured FIT gas and tank records are native activity JSON data, not
 * numeric metrics. `ActivityInterface.getDiveSourceRecords()` preserves their
 * source order and parser-decoded units; native JSON uses UTC milliseconds for
 * tank timestamps. Sports Lib does not derive a gas-to-tank association or
 * consumption summary.
 *
 * @category Activities and events
 */
export type {
  DiveGasMode,
  DiveGasJSONInterface,
  DiveGasRecord,
  DiveGasStatus,
  DiveMessageIndex,
  DiveSourceRecordsJSONInterface,
  DiveSourceRecords,
  DiveSourceRecordsInput,
  DiveTankSummaryJSONInterface,
  DiveTankSummaryRecord,
  DiveTankUpdateJSONInterface,
  DiveTankUpdateRecord
} from '../src/activities/dive-source-records';
/**
 * Canonicalizes unambiguous activity-summary semantics: cadence-shaped stroke-rate summaries
 * become `Stroke Rate`, and homogeneous Diving-group summaries omit terrain metrics.
 *
 * @category Activities and events
 */
export { normalizeActivityMetricSemanticsForStats } from '../src/activities/activity.metric-semantics';
/**
 * Canonical activity types, activity groups, and alias resolution. `Skating` and `Inline Skating`
 * belong to `skating_group`, while `Ice Skating` remains a winter sport. Aerial activities expose
 * vertical-speed derivation; Motorized and Adaptive Mobility activities do not receive calculated
 * TSS or durability, but preserve source-imported TSS. Snorkeling and Mermaiding are canonical
 * diving activities, whose terrain summaries are excluded while raw source streams remain available.
 *
 * @category Activities and events
 */
export { ActivityTypeGroups, ActivityTypes, ActivityTypesHelper } from '../src/activities/activity.types';
export type { ActivityTypeGroup } from '../src/activities/activity.types';
export type { EventInterface } from '../src/events/event.interface';
export type { EventJSONInterface } from '../src/events/event.json.interface';
export { FileType } from '../src/events/adapters/file-type.enum';

/** @category Routes */
export { Route, RouteFile, RouteStream } from '../src/routes';
export type {
  RouteFileInterface,
  RouteFileJSONInterface,
  RouteInterface,
  RouteJSONInterface,
  RouteLinkInterface,
  RouteMetadataInterface,
  RoutePointInterface,
  RouteStreamDataItem,
  RouteStreamInterface,
  RouteWaypointInterface
} from '../src/routes';
export {
  ROUTE_PREVIEW_DEFAULT_MAX_POINTS_PER_ROUTE,
  ROUTE_PREVIEW_DEFAULT_MAX_POINTS_PER_SEGMENT,
  ROUTE_PREVIEW_ENCODING,
  ROUTE_PREVIEW_POLYLINE_PRECISION,
  ROUTE_PREVIEW_VERSION,
  RoutePreviewUtilities,
  buildRoutePreviewBounds,
  decodeRoutePolyline5,
  encodeRoutePolyline5,
  mergeRoutePreviewBounds,
  simplifyCoordinatePairsVisvalingamWhyatt
} from '../src/routes/route-preview.utilities';
export type {
  CoordinatePairSimplificationOptions,
  CoordinatePairSimplificationResult
} from '../src/routes/route-preview.utilities';
export type {
  RoutePreviewBoundsInterface,
  RoutePreviewCoordinateInterface,
  RoutePreviewJSONInterface,
  RoutePreviewOptions,
  RoutePreviewRouteFileSourceInterface,
  RoutePreviewRouteSourceInterface,
  RoutePreviewSegmentJSONInterface
} from '../src/routes/route-preview.interface';
export { RouteFileUtilities } from '../src/routes/route-file.utilities';
export { RouteUtilities } from '../src/routes/route.utilities';

/** @category Streams, stats, and data */
export { Stream } from '../src/streams/stream';
export type { StreamDataItem, StreamInterface } from '../src/streams/stream.interface';
export type { StreamJSONInterface } from '../src/streams/stream';
export type { StreamFilterInterface } from '../src/streams/stream.filter.interface';
export type { StatsClassInterface } from '../src/stats/stats.class.interface';
export { StatsUtilities } from '../src/stats/stats.utilities';
export type { NumericRecordAggregation } from '../src/stats/stats.utilities';
export { Data, DataArray, DataBare, DataBoolean, DataNumber, DataString } from '../src/data';
export type {
  DataInterface,
  DataJSONInterface,
  DataJSONPrimitive,
  DataJSONValue,
  DataPositionInterface,
  DefaultDataClassValue,
  DefaultDataValue
} from '../src/data';
export { UnitSystem } from '../src/data/data.interface';
/**
 * Canonical running-dynamics metrics. FIT protocol fields named `stance_time*` map to the
 * Ground Contact Time family; those protocol names are not public metric tokens. Suunto running
 * flight time and contact-time-to-flight-time ratio remain distinct from jump hang time and FIT
 * ground-contact-time percentage.
 *
 * @category Streams, stats, and data
 */
export {
  DataContactTimeToFlightTimeRatio,
  DataContactTimeToFlightTimeRatioAvg,
  DataContactTimeToFlightTimeRatioMax,
  DataContactTimeToFlightTimeRatioMin,
  DataGroundContactTime,
  DataGroundContactTimeAvg,
  DataGroundContactTimeBalanceLeft,
  DataGroundContactTimeBalanceRight,
  DataGroundContactTimeMax,
  DataGroundContactTimeMin,
  DataGroundContactTimePercentage,
  DataGroundContactTimePercentageAvg,
  DataGroundContactTimePercentageMax,
  DataGroundContactTimePercentageMin,
  DataRunningFlightTime,
  DataRunningFlightTimeAvg,
  DataRunningFlightTimeMax,
  DataRunningFlightTimeMin
} from '../src/data';
/**
 * Provider-neutral Health and sleep scalar data classes.
 *
 * @category Health and sleep
 * @category Streams, stats, and data
 */
export {
  DataActiveDuration,
  DataActiveEnergy,
  DataAltitude,
  DataBasalEnergy,
  DataBloodOxygenSaturation,
  DataBloodPressureDiastolic,
  DataBloodPressureSystolic,
  DataBodyEnergy,
  DataBodyEnergyChange,
  DataBodyFat,
  DataBodyMassIndex,
  DataBodyWater,
  DataBoneMass,
  DataDistance,
  DataFitnessAge,
  DataFloorsClimbed,
  DataHeartRate,
  DataHeartRateVariability,
  DataModerateIntensityDuration,
  DataMuscleMass,
  DataPulseRate,
  DataRecoveryScore,
  DataRespirationRate,
  DataRestingHeartRate,
  DataSkinTemperatureDeviation,
  DataSleepAwakeDuration,
  DataSleepBloodOxygenSaturationMax,
  DataSleepDeepDuration,
  DataSleepDuration,
  DataSleepHeartRateAvg,
  DataSleepHeartRateMin,
  DataSleepHRVAvg,
  DataSleepHRVOvernight,
  DataSleepHRVSampleCount,
  DataSleepInBedDuration,
  DataSleepLightDuration,
  DataSleepRemDuration,
  DataSleepRespirationRateAvg,
  DataSleepRestingHeartRate,
  DataSleepScore,
  DataSleepUnknownDuration,
  DataSleepUnmeasurableDuration,
  DataSteps,
  DataStressDuration,
  DataStressLevel,
  DataStressState,
  DataTotalEnergy,
  DataVigorousIntensityDuration,
  DataVO2Max,
  DataWeight,
  DataWheelchairPushDistance,
  DataWheelchairPushes
} from '../src/data';

export {
  DataCadence,
  DataStrokeRate,
  DataStrokeRateAvg,
  DataStrokeRateMax,
  DataStrokeRateMin,
  DataDepth,
  DataDepthAvg,
  DataDepthAvgFeet,
  DataDepthFeet,
  DataDepthMax,
  DataDepthMaxFeet,
  DataAirTimeRemaining,
  DataBottomTime,
  DataCNSLoad,
  DataDiveAscentRate,
  DataDiveAscentRateAvg,
  DataDiveAscentRateAvgFeetPerSecond,
  DataDiveAscentRateFeetPerSecond,
  DataDiveAscentRateMax,
  DataDiveAscentRateMaxFeetPerSecond,
  DataDiveAscentTime,
  DataDiveDescentRateAvg,
  DataDiveDescentRateAvgFeetPerSecond,
  DataDiveDescentRateMax,
  DataDiveDescentRateMaxFeetPerSecond,
  DataDiveDescentTime,
  DataDiveHangTime,
  DataDiveNumber,
  DataEndingCNSLoad,
  DataEndingN2Load,
  DataN2Load,
  DataNextStopDepth,
  DataNextStopDepthFeet,
  DataNextStopTime,
  DataNoDecompressionLimit,
  DataOxygenToxicity,
  DataPO2,
  DataPressureSAC,
  DataPressureSACAvg,
  DataRMV,
  DataRMVAvg,
  DataStartingCNSLoad,
  DataStartingN2Load,
  DataSurfaceInterval,
  DataTimeToSurface,
  DataVolumeSAC,
  DataVolumeSACAvg,
  DataDuration,
  DataEvent,
  DataEnergy,
  DataMetabolicCalories,
  DataIntensity,
  DataMovingTime,
  DataPause,
  DataPower,
  DataPowerCurve,
  DataPowerWattsPerKg,
  DataRiderPositionChangeEvent,
  DataSpeed,
  DataStartEvent,
  DataStopAllEvent,
  DataStopEvent,
  DataThreeDimensionalStrainEvidence,
  DataTimerTime
} from '../src/data';
export type { DataPowerCurvePoint } from '../src/data/data.power-curve';
export type {
  AerobicDurabilityEvidence,
  DurabilityContext,
  DurabilityDiscipline,
  DurabilityEligibility,
  DurabilityEligibilityReason,
  DurabilityEvidence,
  DurabilityEvidenceValue,
  DurabilityOutputSource,
  DurabilityOutputUnit,
  PoolDurabilityEvidence
} from '../src/data/data.durability-evidence';
export {
  THREE_DIMENSIONAL_STRAIN_LEGACY_PROTOCOL_VERSION,
  THREE_DIMENSIONAL_STRAIN_PROTOCOL_VERSION
} from '../src/data/data.three-dimensional-strain-evidence';
export type {
  ThreeDimensionalStrainDiscipline,
  ThreeDimensionalStrainEligibility,
  ThreeDimensionalStrainEligibilityReason,
  ThreeDimensionalStrainEvidence,
  ThreeDimensionalStrainEvidenceValue,
  ThreeDimensionalStrainEvidenceValueV1,
  ThreeDimensionalStrainEvidenceValueV2,
  ThreeDimensionalStrainFitDiagnostics,
  ThreeDimensionalStrainInputDiagnostics
} from '../src/data/data.three-dimensional-strain-evidence';
export { RiderPosition } from '../src/data/data.cycling-position';

/** @category Serialization and supporting contracts */
export type { SerializableClassInterface } from '../src/serializable/serializable.class.interface';
export type { IDClassInterface } from '../src/id/id.class.interface';
export type { DurationClassInterface } from '../src/duration/duration.class.interface';
export { Privacy } from '../src/privacy/privacy.class.interface';
export type { PrivacyClassInterface } from '../src/privacy/privacy.class.interface';
export type { CreatorInterface } from '../src/creators/creator.interface';
export type { CreatorJSONInterface } from '../src/creators/creator.json.interface';
export type { DeviceInterface } from '../src/activities/devices/device.interface';
export type { DeviceJsonInterface } from '../src/activities/devices/device.json.interface';
export type { IntensityZonesInterface } from '../src/intensity-zones/intensity-zones.interface';
export type { IntensityZonesJSONInterface } from '../src/intensity-zones/intensity-zones.json.interface';
export { LapTypes, LapTypesHelper } from '../src/laps/lap.types';
export type { LapType } from '../src/laps/lap.types';
export type { LapInterface } from '../src/laps/lap.interface';
export type { LapJSONInterface } from '../src/laps/lap.json.interface';
export type { SwimLengthInterface } from '../src/swim-lengths/swim-length.interface';
export type { SwimLengthJSONInterface } from '../src/swim-lengths/swim-length.json.interface';

/** @category Analytics */
export {
  DEFAULT_DURABILITY_PROTOCOL,
  analyzeActivityDurability,
  calculateActivityDurabilitySourceFingerprint,
  calculateAerobicEfficiency,
  hasActivityDurabilitySourceData
} from '../src/events/utilities/activity-durability';
export type {
  ActivityDurabilityAnalysis,
  AnalyzeActivityDurabilityOptions,
  DurabilityProtocol,
  DurabilityTimelinePoint
} from '../src/events/utilities/activity-durability';
export {
  DEFAULT_POWER_CURVE_MAXIMUM_BRACKET_DURATION_RATIO,
  MAXIMUM_ALLOWED_POWER_CURVE_BRACKET_DURATION_RATIO,
  comparePowerCurveWindows,
  samplePowerCurveAtDuration
} from '../src/events/utilities/power-curve-sampling';
export type {
  PowerCurveSampleLike,
  PowerCurveWindowComparison,
  SamplePowerCurveOptions
} from '../src/events/utilities/power-curve-sampling';
export {
  THREE_DIMENSIONAL_CAPACITY_CRITICAL_POWER_ANCHORS_SECONDS,
  THREE_DIMENSIONAL_CAPACITY_MAXIMUM_POWER_ANCHORS_SECONDS,
  buildPowerDurationEnvelope,
  fitThreeDimensionalCapacityModel
} from '../src/events/utilities/three-dimensional-capacity';
export type {
  BuildPowerDurationEnvelopeOptions,
  CriticalPowerFitCandidate,
  CriticalPowerFitMethod,
  DatedActivityPowerCurve,
  FitThreeDimensionalCapacityOptions,
  PowerDurationEnvelope,
  PowerDurationEnvelopePoint,
  PowerDurationEnvelopeStatus,
  ThreeDimensionalCapacityComponent,
  ThreeDimensionalCapacityComponentStatus,
  ThreeDimensionalCapacityDiagnostics,
  ThreeDimensionalCapacityFit,
  ThreeDimensionalCapacityReason,
  ThreeDimensionalCapacityStatus
} from '../src/events/utilities/three-dimensional-capacity';
export {
  calculateImpulseResponse,
  calculateMaximumPowerAvailable,
  calculateThreeDimensionalImpulseResponse,
  calculateThreeDimensionalStrain,
  calculateThreeDimensionalStrainCoefficient,
  fitThreeParameterCriticalPowerModel,
  predictThreeParameterCriticalPower,
  resolveThreeDimensionalPowerContributions
} from '../src/events/utilities/three-dimensional-impulse-response';
export type {
  CalculateThreeDimensionalStrainOptions,
  ImpulseResponseParameters,
  ImpulseResponsePoint,
  ThreeDimensionalImpulseResponseParameters,
  ThreeDimensionalImpulseResponsePoint,
  ThreeDimensionalPowerContributions,
  ThreeDimensionalPowerSample,
  ThreeDimensionalStrainAnalysis,
  ThreeDimensionalStrainLoad,
  ThreeDimensionalStrainReason,
  ThreeDimensionalStrainScores,
  ThreeDimensionalStrainStatus,
  ThreeParameterCriticalPowerFit,
  ThreeParameterCriticalPowerFitOptions,
  ThreeParameterCriticalPowerModel,
  WPrimeBalanceTiming
} from '../src/events/utilities/three-dimensional-impulse-response';
export { fitThreeDimensionalImpulseResponseParameters } from '../src/events/utilities/three-dimensional-impulse-response-calibration';
export type {
  FitThreeDimensionalImpulseResponseOptions,
  ImpulseResponseCalibrationDiagnostics,
  ImpulseResponseCalibrationError,
  ImpulseResponseCalibrationReason,
  ImpulseResponseCalibrationStatus,
  ImpulseResponseComponentCalibration,
  ThreeDimensionalDailyStrainLoad,
  ThreeDimensionalImpulseResponseCalibration,
  ThreeDimensionalImpulseResponseCalibrationReason,
  ThreeDimensionalImpulseResponseCalibrationStatus,
  ThreeDimensionalPerformanceObservation
} from '../src/events/utilities/three-dimensional-impulse-response-calibration';
/**
 * Event aggregation and regeneration. Generated homogeneous Diving-group event summaries omit
 * terrain ascent/descent, altitude min/max/avg, and grade min/max/avg; mixed event summaries
 * aggregate those metrics only from their non-diving activities.
 *
 * @category Activities and events
 */
export { EventUtilities } from '../src/events/utilities/event.utilities';
