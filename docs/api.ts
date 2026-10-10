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
 * activities, and laps. GPX route exports emit links before route numbers and waypoint symbols/types,
 * following the GPX 1.1 metadata sequence.
 *
 * @category Import and export
 */
export { SportsLib } from '../src/index';
export { EventExporterGPX } from '../src/events/adapters/exporters/exporter.gpx';
export { EventExporterJSON } from '../src/events/adapters/exporters/exporter.json';
export type { EventExporter } from '../src/events/adapters/exporters/exporter.interface';

/**
 * Opt-in source metadata reader with dynamic developer-field resolution, isolated diagnostics and no activity writes.
 * Invalid optional session context does not discard independent Guide evidence; ambiguous Guide groups are rejected.
 * @category FIT workout references
 */
export { readFITWorkoutReferences } from '../src/fit/fit-workout-references';
export type {
  FITWorkoutReferencesResult,
  FITWorkoutReferenceSession,
  FITWorkoutReferenceDiagnostic
} from '../src/fit/fit-workout-references';
/**
 * Strict JSON snapshot validation for observed Wahoo app reference metadata.
 * Does not authenticate an account, associate sessions or assert completion.
 * @category FIT workout references
 */
export { parseFITWahooWorkoutReferences } from '../src/fit/wahoo-workout-references';
export type { FITWahooWorkoutReference } from '../src/fit/wahoo-workout-references';
/**
 * Serializable source metadata with unversioned references or definitions values and strict JSON validation.
 * @category FIT workout references
 */
export {
  DataFITTrainingFileReferences,
  DataFITWorkoutDefinitions,
  DataSuuntoPlusGuideReferences
} from '../src/data/data.workout-references';
export type {
  FITTrainingFileReference,
  FITWorkoutDefinition,
  SuuntoPlusGuideReference,
  SuuntoPlusGuideExporter,
  FITTrainingFileReferencesValue,
  FITWorkoutDefinitionsValue,
  SuuntoPlusGuideReferencesValue
} from '../src/data/data.workout-references';

/**
 * FIT device metadata can retain all rows or compact unchanged runs per device index, including interleaved devices.
 * preserveImportedTss defaults to true and preserves finite imported TSS for every sport, including zero and method-less scores.
 * False discards existing TSS and its method, calculates a replacement where supported, and leaves both unset otherwise.
 * @category Parsing options
 */
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
 * Meditation belongs to Indoor Sports; the FIT `generic/breathing` classification resolves to Meditation.
 * Padel belongs to Team/Racket; the FIT `racket/padel` classification resolves to Padel.
 * Racket Sport (FIT 64) and Ultimate Disc belong to Team/Racket; Para Sport (FIT 68) belongs to Unspecified.
 * Bare Racket preserves its broad category; recognized racket sub-sports or precise racket profiles retain their specific type.
 * A recognized Para Sport profile can identify its discipline. Ultimate Disc/Ultimate Frisbee require explicit names; sub-sport 92 alone is ambiguous.
 * AMRAP, EMOM, and Tabata reuse HIIT, including FIT pairs 62/73, 62/74, and 62/75.
 * E-Bike Fitness (21/28), Casual Walking (11/30), and Bike Commute (2/48) reuse E-Biking, Walking, and Cycling.
 * Dynamic Apnea (53/121) reuses Pool Apnea in Diving. Workout-specific sub-sports require their documented parents.
 * Garmin profile names reuse existing sports: Bike Indoor, Bike Tour, Road Bike, Gravel Bike, MTB, Climb Indoor, Row Indoor,
 * XC Classic Ski, XC Skate Ski, Pool Swim, Bike, eBike, Cardio, Floor Climb, Strength, Fish, Horseback, Hunt, Kayak, and Row.
 * These aliases normalize through FIT sport/profile fallback and native JSON, retaining each canonical type's group and calculations.
 * Numeric FIT parent/sub-sport precedence is unchanged; arbitrary activity titles do not identify a profile name.
 * Pickleball belongs to Team/Racket; FIT `racket/pickleball` (64/84) preserves it separately from Racquet Ball and Padel.
 * Platform Tennis belongs to Team/Racket; FIT `racket/platform` (64/93) preserves it separately from Tennis and Padel.
 * Shooting and Geocaching belong to Outdoor Adventures; explicit FIT sports 56 and 87 retain their distinct canonical types.
 * Pool Apnea belongs to Diving; explicit FIT sport 85 preserves it separately from Free Diving and excludes terrain summaries.
 * Mobility belongs to Indoor Sports; explicit FIT sport 86 preserves it separately from Flexibility Training and Stretching.
 * Video Gaming belongs to Unspecified; explicit FIT sport 63 and Gaming aliases resolve to it without calculated TSS.
 * Video Gaming retains source-imported TSS; the shared FIT esport sub-sport does not establish Video Gaming on its own.
 * Grinding belongs to Water Sports; explicit FIT sport 59 preserves sailing winch activity.
 * Indoor Grinding belongs to Indoor Sports; FIT grinding/indoor_grinding (59/71) and Grind Onshore names preserve it separately.
 * Sail Racing belongs to Water Sports; FIT sailing/sail_race (32/65) and Sail Race names preserve it separately from Sailing.
 * Rucking belongs to Outdoor Adventures; FIT hiking/rucking (17/124) preserves it separately from Hiking and Walking.
 * Sailing Expedition belongs to Water Sports; FIT sailing/expedition (32/66) and Sail Expedition names preserve it separately.
 * CCR Diving belongs to Diving; FIT diving/ccr_diving (53/63) preserves the closed-circuit rebreather type and excludes terrain summaries.
 * Walking, Indoor Walking, and Nordic Walking belong to WalkingGroup; the indoor hint is independent of group membership.
 * FIT walking/indoor_walking (11/27) and fitness_equipment/indoor_walking (4/27) preserve Indoor Walking.
 * Obstacle Racing and Ultra Running belong to Running; FIT running/obstacle (1/59) and running/ultra (1/67) preserve them.
 * FIT cycling/enduro (2/123) reuses Enduro MTB; ambiguous Enduro names without cycling context do not establish it.
 * Rally belongs to Motorized; FIT motor_sports/rally (81/125) preserves it without calculating TSS.
 * FIT Spin (2/5) reuses Indoor Cycling; cycling/e_bike_mountain (2/47) reuses E-Mountain Biking, like e_biking/47.
 * Adventure Race (18/82, 1/82) reuses Adventure Racing; Fly Paraglide (20/111) reuses Paragliding.
 * Broad Hockey (73), Winter Sport (58), Team Sport (70), and Water Sport (78) preserve the source category without guessing subtypes.
 * Paramotoring (20/112) belongs to Aerial Sports; RC Drone Flying (20/39) belongs to Unspecified. Both retain imported TSS only.
 * E-Enduro MTB belongs to Mountain Biking; FIT cycling/e_bike_enduro (2/127) retains gravity-MTB durability exclusion.
 * Track Cycling (2/13) and Recumbent Cycling (2/10) belong to Cycling without assuming an indoor venue.
 * Speed Walking (11/31) belongs to Walking, without inferring race-walking rules.
 * Whitewater Kayaking (41/41) and Whitewater Rafting (42/41) remain separate Water Sports types.
 * Wingsuit Flying (20/40), Brick Training (18/80), and Hunting with Dogs (28/72) belong to Aerial Sports, Performance, and Outdoor Adventures.
 * Explicit Indoor Track and Indoor Track Running names reuse Indoor Running; bare running/track remains ambiguous.
 * BMX belongs to Cycling; FIT cycling/bmx (2/29) preserves it separately from general Cycling.
 * Indoor Skiing belongs to Indoor Sports; FIT fitness_equipment/indoor_skiing (4/25) and XC Ski Indoor names preserve it.
 * ATV and Motocross belong to Motorized; FIT motorcycling/atv (22/35) and motorcycling/motocross (22/36) preserve them.
 * Pool Triathlon belongs to Performance; FIT multisport/pool_triathlon (18/126) preserves it without assuming all legs are indoors.
 * Indoor Hand Cycle belongs to Cycling; FIT cycling/indoor_hand_cycling (2/88) preserves its indoor hint and existing cycling calculations.
 * Indoor Wheelchair Push Walk and Run belong to Adaptive Mobility; FIT pairs 65/86 and 66/87 retain their separate indoor types.
 * Overlanding belongs to Motorized; Overland names and the overland sub-sport under motorized parents retain it without calculated TSS.
 * Trucker Workout belongs to Indoor Sports; generic, fitness_equipment, and training parents with sub-sport 83 identify exercise during driving breaks.
 * FIT Dance (sport 83) reuses the existing Dancing type in Indoor Sports.
 * Jump Rope belongs to Indoor Sports; explicit FIT sport 84 preserves it separately from Pickleball sub-sport 84.
 * Disc Golf belongs to Team/Racket, distinct from Golf and Frisbee; FIT `disc_golf` and explicit Frisbee golf names resolve to it.
 * Lacrosse belongs to Team/Racket; FIT sport 74 and explicit Lacrosse names preserve its distinct canonical type.
 * Water Tubing belongs to Water Sports; explicit FIT sport 76 preserves it separately from Water Skiing and Wakeboarding.
 * Wakesurfing belongs to Water Sports; explicit FIT sport 77 preserves it separately from Surfing and Wakeboarding.
 * Archery belongs to Outdoor Adventures; explicit FIT sport 79 preserves it separately from Hunting.
 * Mixed Martial Arts belongs to Indoor Sports; explicit FIT sport 80 and MMA aliases preserve it separately from Combat and Boxing.
 * Field Hockey belongs to Team/Racket; FIT `hockey/field` resolves to it across manufacturers.
 * Suunto FIT `generic/match` resolves to Field Hockey using creator identity.
 * Ice Hockey belongs to Team/Racket; FIT `hockey/ice` resolves to it across manufacturers.
 * Chores belongs to Unspecified; Suunto FIT `generic/exercise` resolves to it using creator identity.
 * Hand Cycle belongs to Cycling; the FIT `cycling/hand_cycling` classification resolves to Hand Cycle.
 * Suunto FIT `generic/hand_cycling` resolves to the existing Wheel Chair type in Adaptive Mobility using creator identity.
 * Wheelchair Push Walk and Wheelchair Push Run belong to Adaptive Mobility, distinct from general Wheel Chair.
 * FIT `wheelchair_push_walk` and `wheelchair_push_run` preserve the distinct push modes across manufacturers before profile fallbacks.
 * Cyclocross belongs to Cycling; the FIT `cycling/cyclocross` classification resolves to Cyclocross.
 * Gravel Cycling belongs to Cycling; FIT `cycling/gravel_cycling` and the `GravelRide` alias resolve to Gravel Cycling.
 * E-Mountain Biking belongs to Mountain Biking; FIT `e_biking/e_bike_mountain` and `EMountainBikeRide` resolve to it.
 * Splitboarding belongs to Winter Sports; the FIT `snowboarding/backcountry` classification resolves to Splitboarding.
 * Ski Mountaineering belongs to Winter Sports; FIT `mountaineering/backcountry` resolves to Ski Mountaineering.
 * Skate Skiing belongs to Winter Sports; FIT `cross_country_skiing/skate_skiing` resolves to Skate Skiing.
 * FIT `backcountry` sub-sports require sport context and do not classify unrelated sports as skiing.
 * Track Running belongs to Running and recognizes explicit Track Run/Track Running sport or profile names.
 * FIT `running/track` honors explicit Track Running or Track and Field profiles; the pair alone remains Running.
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
  DataSwimDistance,
  SwimDistanceUnits,
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

/** @category Unit settings */
export {
  DaysOfTheWeek,
  DistanceUnits,
  GradeAdjustedPaceUnits,
  GradeAdjustedSpeedUnits,
  PaceUnits,
  SpeedUnits,
  SwimPaceUnits,
  VerticalSpeedUnits,
  WeightUnits
} from '../src/users/settings/user.unit.settings.interface';
export type { UserUnitSettingsInterface } from '../src/users/settings/user.unit.settings.interface';

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
