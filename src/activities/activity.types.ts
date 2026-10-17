import {
  resolveCommonActivityTypeAlias,
  resolveProviderActivityType,
  ActivityTypeSource
} from './activity-types.provider';
export type { ActivityTypeSource } from './activity-types.provider';

import { DataSpeedAvg } from '../data/data.speed-avg';
import { DataPaceAvg } from '../data/data.pace-avg';
import { DataSwimPaceAvg } from '../data/data.swim-pace-avg';
import { DataPace } from '../data/data.pace';
import { DataSpeed } from '../data/data.speed';
import { DataSwimPace } from '../data/data.swim-pace';
import { DataGradeAdjustedPace } from '../data/data.grade-adjusted-pace';
import { DataGradeAdjustedPaceAvg } from '../data/data.grade-adjusted-pace-avg';
import { DataGradeAdjustedSpeed } from '../data/data.grade-adjusted-speed';
import { DataGradeAdjustedSpeedAvg } from '../data/data.grade-adjusted-speed-avg';
import { DataVerticalSpeed } from '../data/data.vertical-speed';

export class ActivityTypesHelper {
  private static normalizeActivityTypeLookupKey(value: string): string {
    return value.toLowerCase().replace(/[\s_-]/g, '');
  }

  /** Resolves string sport names and aliases; invalid inputs return null. Uses provider context for source-specific names. */
  static resolveActivityType(value: unknown, source?: ActivityTypeSource): ActivityTypes | null {
    if (typeof value !== 'string') {
      return null;
    }

    const raw = value.trim();
    if (!raw) {
      return null;
    }

    const providerMatch = resolveProviderActivityType(raw, source);
    if (providerMatch) return providerMatch;

    if (Object.prototype.hasOwnProperty.call(ActivityTypes, raw)) {
      return ActivityTypes[raw as keyof typeof ActivityTypes];
    }

    const commonAlias = resolveCommonActivityTypeAlias(raw);
    if (commonAlias) return commonAlias;

    const normalizedRaw = this.normalizeActivityTypeLookupKey(raw);
    for (const enumKey of Object.keys(ActivityTypes)) {
      if (this.normalizeActivityTypeLookupKey(enumKey) === normalizedRaw) {
        return ActivityTypes[enumKey as keyof typeof ActivityTypes];
      }
    }

    for (const enumValue of Object.values(ActivityTypes)) {
      if (this.normalizeActivityTypeLookupKey(enumValue) === normalizedRaw) {
        return enumValue as ActivityTypes;
      }
    }

    return null;
  }

  static getActivityTypesAsUniqueArray(): string[] {
    return Array.from(
      new Set(
        Object.keys(ActivityTypes).reduce((array: string[], key: string) => {
          array.push(ActivityTypes[<keyof typeof ActivityTypes>key]); // Important get the key via the enum else it will be chaos
          return array;
        }, [])
      )
    ).sort((left, right) => {
      if (left < right) {
        return -1;
      }
      if (left > right) {
        return 1;
      }
      return 0;
    });
  }

  static getActivityTypeGroupsAsUniqueArray(): ActivityTypeGroup[] {
    const activityTypeGroups = Array.from(new Set(Object.values(ActivityTypeGroups))) as ActivityTypeGroup[];

    return activityTypeGroups.sort((left, right) => {
      if (left < right) {
        return -1;
      }
      if (left > right) {
        return 1;
      }
      return 0;
    });
  }

  /** Lists each canonical member once, including all intentionally unspecified activity types. */
  static getActivityTypesForActivityGroup(activityTypeGroup: ActivityTypeGroup): ActivityTypes[] {
    return [...(ActivityTypesGroupMapping.map[activityTypeGroup] || [])];
  }

  static averageSpeedDerivedDataTypesToUseForActivityType(activityType: ActivityTypes): string[] {
    switch (ActivityTypesHelper.getActivityGroupForActivityType(activityType)) {
      case ActivityTypeGroups.RunningGroup:
        return [DataPaceAvg.type, DataGradeAdjustedPaceAvg.type];
      case ActivityTypeGroups.TrailRunningGroup:
        return [DataPaceAvg.type, DataGradeAdjustedPaceAvg.type, DataSpeedAvg.type, DataGradeAdjustedSpeedAvg.type];
      case ActivityTypeGroups.WalkingGroup:
      case ActivityTypeGroups.OutdoorAdventuresGroup:
        return [DataPaceAvg.type, DataSpeedAvg.type];
      case ActivityTypeGroups.WaterSportsGroup:
      case ActivityTypeGroups.SwimmingGroup:
        return [DataSpeedAvg.type, DataSwimPaceAvg.type];
      default:
        return [DataSpeedAvg.type];
    }
  }

  static speedDerivedDataTypesToUseForActivityType(activityType: ActivityTypes): string[] {
    switch (ActivityTypesHelper.getActivityGroupForActivityType(activityType)) {
      case ActivityTypeGroups.RunningGroup:
        return [DataPace.type, DataSpeed.type];
      case ActivityTypeGroups.TrailRunningGroup:
        return [DataPace.type, DataSpeed.type];
      case ActivityTypeGroups.WalkingGroup:
      case ActivityTypeGroups.OutdoorAdventuresGroup:
        return [DataPace.type, DataSpeed.type];
      case ActivityTypeGroups.WaterSportsGroup:
      case ActivityTypeGroups.SwimmingGroup:
        return [DataSpeed.type, DataSwimPace.type];
      default:
        return [DataSpeed.type];
    }
  }

  static altiDistanceSpeedDerivedDataTypesToUseForActivityType(activityType: ActivityTypes): string[] {
    switch (ActivityTypesHelper.getActivityGroupForActivityType(activityType)) {
      case ActivityTypeGroups.RunningGroup:
        return [DataGradeAdjustedPace.type];
      case ActivityTypeGroups.TrailRunningGroup:
        return [DataGradeAdjustedPace.type, DataGradeAdjustedSpeed.type];
      default:
        return [];
    }
  }

  static verticalSpeedDerivedDataTypesToUseForActivityType(activityType: ActivityTypes): string[] {
    switch (ActivityTypesHelper.getActivityGroupForActivityType(activityType)) {
      case ActivityTypeGroups.RunningGroup:
      case ActivityTypeGroups.TrailRunningGroup:
      case ActivityTypeGroups.CyclingGroup:
      case ActivityTypeGroups.MountainBikingGroup:
      case ActivityTypeGroups.WalkingGroup:
      case ActivityTypeGroups.OutdoorAdventuresGroup:
      case ActivityTypeGroups.PerformanceGroup:
      case ActivityTypeGroups.AerialSportsGroup:
        return [DataVerticalSpeed.type];
      default:
        return [];
    }
  }

  /**
   * Identifies activities for which elevation descent should not be derived or summarized.
   * This includes water and diving activities, where altitude loss is not terrain descent.
   * @param activityType
   */
  static shouldExcludeDescent(activityType: ActivityTypes): boolean {
    return ACTIVITIES_EXCLUDED_FROM_DESCENT.includes(activityType);
  }

  /**
   * Identifies activities for which elevation ascent should not be derived or summarized.
   * This includes assisted and water/diving activities, where altitude gain is not terrain ascent.
   * @param activityType
   */
  static shouldExcludeAscent(activityType: ActivityTypes): boolean {
    return ACTIVITIES_EXCLUDED_FROM_ASCENT.includes(activityType);
  }

  /**
   * Identifies activities for which terrain elevation summaries are not meaningful.
   * Diving activities use depth for vertical movement, so terrain ascent, descent,
   * altitude, and grade summaries must not be imported or derived for them.
   * Source streams remain available to callers that explicitly request them.
   * @param activityType
   */
  static shouldExcludeTerrainSummaryMetrics(activityType: ActivityTypes): boolean {
    return this.getActivityGroupForActivityType(activityType) === ActivityTypeGroups.DivingGroup;
  }

  /**
   * Returns metric display families that consumers may hide by default for a given activity type.
   * This is a presentation hint only and must not be used to suppress imported/raw metrics.
   */
  static hiddenDisplayDataTypesToUseForActivityType(activityType: ActivityTypes): string[] {
    if (ACTIVITIES_WITH_SPEED_METRICS_HIDDEN_BY_DEFAULT.includes(activityType)) {
      return [DataSpeed.type, DataPace.type];
    }

    return [];
  }

  /**
   * Get's back the activity group an activity belongs to or returns unspecified activity group
   * @param activityType
   * This function can also be called: Fighting with a non functional language
   */
  static getActivityGroupForActivityType(activityType: ActivityTypes): ActivityTypeGroup {
    return (
      (Object.entries(ActivityTypesGroupMapping.map) as Array<[ActivityTypeGroup, ActivityTypes[]]>).find(
        ([, activityTypes]) => activityTypes.includes(activityType)
      )?.[0] || ActivityTypeGroups.UnspecifiedGroup
    );
  }

  static isIndoorActivityType(activityType: ActivityTypes): boolean {
    return EXPLICIT_INDOOR_ACTIVITY_TYPES.includes(activityType);
  }

  /** Returns whether cadence-shaped source data should use stroke-rate semantics. */
  static usesStrokeRate(activityType: ActivityTypes): boolean {
    return STROKE_RATE_ACTIVITY_TYPES.has(activityType);
  }
}

/* eslint-disable @typescript-eslint/no-duplicate-enum-values -- Provider aliases intentionally share canonical values. */
/**
 * This enum works like a all matchers for normalized sport types between different naming across services
 *
 * It helps as you can call request an activity type with different namin eg .BackCountrySki or .BackCountrySkiing and get a uniform value
 * Also helps in case you have persited data that do not match or have been peristed wrongly
 *
 * Important: don't forget to declare the original string value aka: 'Running' = 'Running'
 *
 * Activity names are normalized with title-style capitalization where a source does not provide a canonical name.
 */
export enum ActivityTypes {
  /**
   * Unknown sport
   */
  'unknown' = 'Unknown Sport',
  'Unknown sport' = 'Unknown Sport',
  'Unknown Sport' = 'Unknown Sport',
  'UnknownSport' = 'Unknown Sport',
  'undefined' = 'Unknown Sport',
  'Not specified sport' = 'Unknown Sport',
  /**
   * Other
   */
  'Other' = 'Other',
  /**
   * Generic
   */
  'generic' = 'Generic',
  'hiit' = 'HIIT',
  'HIIT' = 'HIIT',
  /** Distinct HIIT timer formats, preserving their recorded names. */
  'AMRAP' = 'AMRAP',
  'amrap' = 'AMRAP',
  'hiit_amrap' = 'AMRAP',
  'EMOM' = 'EMOM',
  'emom' = 'EMOM',
  'hiit_emom' = 'EMOM',
  'Tabata' = 'Tabata',
  'tabata' = 'Tabata',
  'hiit_tabata' = 'Tabata',
  'generic_exercise' = 'Generic',
  'generic_track_me' = 'Generic',
  'Generic' = 'Generic',
  /**
   * Chores, including Suunto's creator-qualified FIT generic/exercise classification.
   * Remains in Unspecified because chores do not establish a particular sport or indoor context.
   */
  'Chores' = 'Chores',
  'chores' = 'Chores',
  /**
   * Video Gaming; explicit FIT sport video_gaming (63), also named Gaming by Garmin.
   */
  'Video Gaming' = 'Video Gaming',
  'VideoGaming' = 'Video Gaming',
  'videoGaming' = 'Video Gaming',
  'video_gaming' = 'Video Gaming',
  'Gaming' = 'Video Gaming',
  'gaming' = 'Video Gaming',
  /** Broad FIT sport classifications; they do not imply a particular subtype or venue. */
  'Hockey' = 'Hockey',
  'hockey' = 'Hockey',
  'Winter Sport' = 'Winter Sport',
  'WinterSport' = 'Winter Sport',
  'winter_sport' = 'Winter Sport',
  'Team Sport' = 'Team Sport',
  'TeamSport' = 'Team Sport',
  'team_sport' = 'Team Sport',
  'Water Sport' = 'Water Sport',
  'WaterSport' = 'Water Sport',
  'water_sport' = 'Water Sport',
  /** Broad FIT para_sport (68); the source does not identify a particular discipline. */
  'Para Sport' = 'Para Sport',
  'ParaSport' = 'Para Sport',
  'para_sport' = 'Para Sport',
  /** Powered paragliding; explicit FIT flying/fly_paramotor (20/112). Imported TSS only. */
  'Paramotoring' = 'Paramotoring',
  'paramotoring' = 'Paramotoring',
  'Fly Paramotor' = 'Paramotoring',
  'FlyParamotor' = 'Paramotoring',
  'fly_paramotor' = 'Paramotoring',
  'flying_fly_paramotor' = 'Paramotoring',
  /** Remote-controlled aircraft or drone flight; explicit FIT flying/rc_drone (20/39). Imported TSS only. */
  'RC Drone Flying' = 'RC Drone Flying',
  'RCDroneFlying' = 'RC Drone Flying',
  'rc_drone_flying' = 'RC Drone Flying',
  'RC Drone' = 'RC Drone Flying',
  'RCDrone' = 'RC Drone Flying',
  'rc_drone' = 'RC Drone Flying',
  'flying_rc_drone' = 'RC Drone Flying',
  /**
   * Transition
   */
  'transition' = 'Transition',
  'Transition' = 'Transition',
  /**
   * Fitness Equipment
   */
  'fitness_equipment' = 'Fitness Equipment',
  'Fitness Equipment' = 'Fitness Equipment',
  'FitnessEquipment' = 'Fitness Equipment',

  /**
   * Multisport
   */
  'Multisport' = 'Multisport',
  'MultiSport' = 'Multisport',
  'multisport' = 'Multisport',

  /** Brick Training; explicit FIT multisport/brick (18/80), without inferring its component sports. */
  'Brick Training' = 'Brick Training',
  'BrickTraining' = 'Brick Training',
  'brick_training' = 'Brick Training',
  'Brick' = 'Brick Training',
  'brick' = 'Brick Training',
  'multisport_brick' = 'Brick Training',

  /**
   * Virtual Running
   */
  'running_virtual_activity' = 'Virtual Running',
  'VirtualRun' = 'Virtual Running',
  'Virtual running' = 'Virtual Running',
  'Virtual Running' = 'Virtual Running',
  'VirtualRunning' = 'Virtual Running',
  /**
   * Running
   */
  'Run' = 'Running',
  'run' = 'Running',
  'running_track' = 'Running',
  'running_trail' = 'Trail Running',
  'Running' = 'Running',
  'running' = 'Running',
  'running_street' = 'Running',
  'running_road' = 'Road Running',
  /**
   * Track Running, identified by an explicit sport or profile name.
   * The ambiguous FIT running/track pair alone retains Running.
   */
  'Track Running' = 'Track Running',
  'TrackRunning' = 'Track Running',
  'track_running' = 'Track Running',
  'Track Run' = 'Track Running',
  'TrackRun' = 'Track Running',
  'track_run' = 'Track Running',
  /**
   * Obstacle Racing; explicit FIT running/obstacle (1/59), distinct from general Running.
   */
  'Obstacle Racing' = 'Obstacle Racing',
  'ObstacleRacing' = 'Obstacle Racing',
  'obstacleRacing' = 'Obstacle Racing',
  'obstacle_racing' = 'Obstacle Racing',
  'Obstacle Run' = 'Obstacle Racing',
  'ObstacleRun' = 'Obstacle Racing',
  'obstacle_run' = 'Obstacle Racing',
  'running_obstacle' = 'Obstacle Racing',
  /**
   * Ultra Running; explicit FIT running/ultra (1/67), without inferring terrain or distance.
   */
  'Ultra Running' = 'Ultra Running',
  'UltraRunning' = 'Ultra Running',
  'ultraRunning' = 'Ultra Running',
  'ultra_running' = 'Ultra Running',
  'Ultra Run' = 'Ultra Running',
  'UltraRun' = 'Ultra Running',
  'ultra_run' = 'Ultra Running',
  'running_ultra' = 'Ultra Running',
  /**
   * Trail Running
   */
  'TrailRunning' = 'Trail Running',
  'Trail Running' = 'Trail Running',
  'Trail running' = 'Trail Running',
  'trail_running' = 'Trail Running',
  /**
   * Indoor Running when the source does not identify an indoor track.
   */
  'Indoor running' = 'Indoor Running',
  'Indoor Running' = 'Indoor Running',
  'IndoorRunning' = 'Indoor Running',
  'running_indoor' = 'Indoor Running',
  'running_indoor_running' = 'Indoor Running',
  'training_indoor_running' = 'Indoor Running',
  'Indoor Track' = 'Indoor Track Running',
  'IndoorTrack' = 'Indoor Track Running',
  'indoor_track' = 'Indoor Track Running',
  'Indoor Track Running' = 'Indoor Track Running',
  'IndoorTrackRunning' = 'Indoor Track Running',
  'indoor_track_running' = 'Indoor Track Running',
  /**
   * Cycling
   */
  'Cycling' = 'Cycling',
  'cycling' = 'Cycling',
  'cycling_road' = 'Road Cycling',
  'road_biking' = 'Road Cycling',
  'Biking' = 'Cycling',
  'biking' = 'Cycling',
  'Ride' = 'Cycling',
  /** Garmin activity-profile names reuse the existing cycling types. */
  'Bike' = 'Cycling',
  'Bike Tour' = 'Cycling',
  'BikeTour' = 'Cycling',
  'bike_tour' = 'Cycling',
  'Road Bike' = 'Road Cycling',
  'RoadBike' = 'Road Cycling',
  'road_bike' = 'Road Cycling',
  'cycling_commuting' = 'Cycling',
  'Bike Commute' = 'Cycling',
  'BikeCommute' = 'Cycling',
  'bike_commute' = 'Cycling',
  'Bike Commuting' = 'Cycling',
  'BikeCommuting' = 'Cycling',
  'bike_commuting' = 'Cycling',
  'cycling_mixed_surface' = 'Cycling',
  /** Track Cycling; FIT cycling/track_cycling (2/13) does not establish an indoor venue. */
  'Track Cycling' = 'Track Cycling',
  'TrackCycling' = 'Track Cycling',
  'track_cycling' = 'Track Cycling',
  'cycling_track_cycling' = 'Track Cycling',
  /** Recumbent Cycling; FIT cycling/recumbent (2/10) does not establish an indoor venue. */
  'Recumbent Cycling' = 'Recumbent Cycling',
  'RecumbentCycling' = 'Recumbent Cycling',
  'recumbent_cycling' = 'Recumbent Cycling',
  'Recumbent' = 'Recumbent Cycling',
  'recumbent' = 'Recumbent Cycling',
  'cycling_recumbent' = 'Recumbent Cycling',
  /**
   * BMX; explicit FIT cycling/bmx (2/29), distinct from general Cycling.
   */
  'BMX' = 'BMX',
  'Bmx' = 'BMX',
  'bmx' = 'BMX',
  'BMX Cycling' = 'BMX',
  'BMXCycling' = 'BMX',
  'bmx_cycling' = 'BMX',
  'cycling_bmx' = 'BMX',
  /**
   * Cyclocross
   */
  'Cyclocross' = 'Cyclocross',
  'cyclocross' = 'Cyclocross',
  'cycling_cyclocross' = 'Cyclocross',
  /**
   * Gravel Cycling
   */
  'GravelCycling' = 'Gravel Cycling',
  'Gravel Cycling' = 'Gravel Cycling',
  'gravel_cycling' = 'Gravel Cycling',
  'cycling_gravel_cycling' = 'Gravel Cycling',
  'GravelRide' = 'Gravel Cycling',
  'Gravel Bike' = 'Gravel Cycling',
  'GravelBike' = 'Gravel Cycling',
  'gravel_bike' = 'Gravel Cycling',
  /**
   * Indoor Cycling
   */
  'cycling_indoor_cycling' = 'Indoor Cycling',
  'Indoorcycling' = 'Indoor Cycling',
  'indoor_cycling' = 'Indoor Cycling',
  'Indoor cycling' = 'Indoor Cycling',
  'IndoorCycling' = 'Indoor Cycling',
  'Indoor Cycling' = 'Indoor Cycling',
  'Spin' = 'Indoor Cycling',
  'spin' = 'Indoor Cycling',
  'cycling_spin' = 'Indoor Cycling',
  'Bike Indoor' = 'Indoor Cycling',
  'BikeIndoor' = 'Indoor Cycling',
  'bike_indoor' = 'Indoor Cycling',
  /**
   * Virtual Cycling
   */
  'cycling_virtual_activity' = 'Virtual Cycling',
  'VirtualRide' = 'Virtual Cycling',
  'Virtual Cycling' = 'Virtual Cycling',
  'VirtualCycling' = 'Virtual Cycling',

  /**
   * E-Biking
   */
  'e_biking' = 'E-Biking',
  'E Biking' = 'E-Biking',
  'EBiking' = 'E-Biking',
  'E biking' = 'E-Biking',
  'EBikeRide' = 'E-Biking',
  'eBike' = 'E-Biking',
  'E-Biking' = 'E-Biking',
  'E-Bike Fitness' = 'E-Biking',
  'EBikeFitness' = 'E-Biking',
  'e_bike_fitness' = 'E-Biking',
  'e_biking_e_bike_fitness' = 'E-Biking',
  /**
   * Mountain biking
   */
  'cycling_mountain' = 'Mountain Biking',
  'MountainBiking' = 'Mountain Biking',
  'Mountain Biking' = 'Mountain Biking',
  'mountain' = 'Mountain Biking', // @todo this feels hacky but exists and indeed it's MTB
  'Mountain biking' = 'Mountain Biking',
  'MTB' = 'Mountain Biking',

  /**
   * E-Mountain Biking
   */
  'EMountainBiking' = 'E-Mountain Biking',
  'E-Mountain Biking' = 'E-Mountain Biking',
  'e_mountain_biking' = 'E-Mountain Biking',
  'e_biking_e_bike_mountain' = 'E-Mountain Biking',
  'cycling_e_bike_mountain' = 'E-Mountain Biking',
  'e_bike_mountain' = 'E-Mountain Biking',
  'EBikeMountain' = 'E-Mountain Biking',
  'EMountainBikeRide' = 'E-Mountain Biking',
  'E-MTB' = 'E-Mountain Biking',

  /**
   * Enduro mountain biking; cycling/enduro (2/123) establishes the existing type.
   * Plain Enduro remains ambiguous between cycling and motorcycling.
   */
  'cycling_mountain_enduro' = 'Enduro MTB',
  'cycling_enduro' = 'Enduro MTB',
  'Enduro MTB' = 'Enduro MTB',
  'EnduroMTB' = 'Enduro MTB',
  'enduroMTB' = 'Enduro MTB',
  'enduro_mtb' = 'Enduro MTB',

  /** Electric enduro mountain biking; explicit FIT cycling/e_bike_enduro (2/127). */
  'E-Enduro MTB' = 'E-Enduro MTB',
  'EEnduroMTB' = 'E-Enduro MTB',
  'e_enduro_mtb' = 'E-Enduro MTB',
  'Electric Enduro MTB' = 'E-Enduro MTB',
  'ElectricEnduroMTB' = 'E-Enduro MTB',
  'electric_enduro_mtb' = 'E-Enduro MTB',
  'EBikeEnduro' = 'E-Enduro MTB',
  'eBikeEnduro' = 'E-Enduro MTB',
  'e_bike_enduro' = 'E-Enduro MTB',
  'cycling_e_bike_enduro' = 'E-Enduro MTB',

  // Downhill
  'cycling_downhill' = 'Downhill Cycling',
  'cycling_mountain_downhill' = 'Downhill Cycling',
  'DownhillCycling' = 'Downhill Cycling',
  'Downhill Cycling' = 'Downhill Cycling',
  /**
   * Motorcycling
   */
  'motorcycling' = 'Motorcycling',
  'Motorcycling' = 'Motorcycling',
  /**
   * ATV; explicit FIT motorcycling/atv (22/35), distinct from general Motorcycling.
   */
  'ATV' = 'ATV',
  'Atv' = 'ATV',
  'atv' = 'ATV',
  'All-Terrain Vehicle' = 'ATV',
  'All Terrain Vehicle' = 'ATV',
  'AllTerrainVehicle' = 'ATV',
  'all_terrain_vehicle' = 'ATV',
  'motorcycling_atv' = 'ATV',
  /**
   * Motocross; explicit FIT motorcycling/motocross (22/36).
   */
  'Motocross' = 'Motocross',
  'MotoCross' = 'Motocross',
  'motocross' = 'Motocross',
  'motorcycling_motocross' = 'Motocross',
  /**
   * Boating
   */
  'boating' = 'Boating',
  'Boating' = 'Boating',
  /**
   * Driving
   */
  'driving' = 'Driving',
  'Driving' = 'Driving',
  /**
   * Circuit training
   */
  'Circuit training' = 'Circuit Training',
  'Circuit Training' = 'Circuit Training',
  /**
   * Swimming
   */
  'Swimming' = 'Swimming',
  'swimming' = 'Swimming',
  'Swim' = 'Swimming',
  'swim' = 'Swimming',
  'swimming_lap_swimming' = 'Swimming',
  'Pool Swim' = 'Swimming',
  'PoolSwim' = 'Swimming',
  'pool_swim' = 'Swimming',
  /**
   * Open Water Swimming
   */
  'swimming_open_water' = 'Open Water Swimming',
  'Open water swimming' = 'Open Water Swimming',
  'open water swimming' = 'Open Water Swimming',
  'Open Water Swimming' = 'Open Water Swimming',
  'OpenWaterSwimming' = 'Open Water Swimming',
  'open_water' = 'Open Water Swimming',
  /**
   * Basketball
   */
  'basketball' = 'Basketball',
  /**
   * Soccer
   */
  'soccer' = 'Soccer',
  'Soccer' = 'Soccer',
  /**
   * American Football
   */
  'american_football' = 'American Football',
  'American footBall' = 'American Football',
  'American Football' = 'American Football',
  'AmericanFootball' = 'American Football',
  /**
   * Skating
   */
  'Skating' = 'Skating',
  /**
   * Aerobics
   */
  'Aerobics' = 'Aerobics',
  /**
   * Yoga
   */
  'training_yoga' = 'Yoga',
  'yoga' = 'Yoga',
  'Yoga' = 'Yoga',
  'YogaPilates' = 'Yoga',

  /**
   * Meditation, including Suunto's FIT generic/breathing classification.
   */
  'Meditation' = 'Meditation',
  'meditation' = 'Meditation',
  'generic_breathing' = 'Meditation',
  'breathing' = 'Meditation',

  /**
   * Pilates
   */
  'fitness_equipment_pilates' = 'Pilates',
  'Pilates' = 'Pilates',
  'pilates' = 'Pilates',
  /**
   * Trekking
   */
  'Trekking' = 'Trekking',
  'Trek' = 'Trekking',
  /**
   * Walking
   */
  'Walking' = 'Walking',
  'walking' = 'Walking',
  'Walk' = 'Walking',
  'walk' = 'Walking',
  'walking_casual_walking' = 'Walking',
  'Casual Walking' = 'Walking',
  'CasualWalking' = 'Walking',
  'casual_walking' = 'Walking',
  /** Speed Walking; explicit FIT walking/speed_walking (11/31), without inferring race-walking rules. */
  'Speed Walking' = 'Speed Walking',
  'SpeedWalking' = 'Speed Walking',
  'speed_walking' = 'Speed Walking',
  'walking_speed_walking' = 'Speed Walking',
  /**
   * Indoor Walking; FIT walking/indoor_walking (11/27) or fitness_equipment/indoor_walking (4/27).
   */
  'Indoor Walking' = 'Indoor Walking',
  'IndoorWalking' = 'Indoor Walking',
  'indoorWalking' = 'Indoor Walking',
  'indoor_walking' = 'Indoor Walking',
  'Walk Indoor' = 'Indoor Walking',
  'WalkIndoor' = 'Indoor Walking',
  'walk_indoor' = 'Indoor Walking',
  'walking_indoor' = 'Indoor Walking',
  'walking_indoor_walking' = 'Indoor Walking',
  'fitness_equipment_indoor_walking' = 'Indoor Walking',
  /**
   * Sailing
   */
  'Sailing' = 'Sailing',
  'sailing' = 'Sailing',
  /**
   * Sailing Expedition; explicit FIT sailing/expedition (32/66), also named Sail Expedition by Garmin.
   */
  'Sailing Expedition' = 'Sailing Expedition',
  'SailingExpedition' = 'Sailing Expedition',
  'sailingExpedition' = 'Sailing Expedition',
  'sailing_expedition' = 'Sailing Expedition',
  'Sail Expedition' = 'Sailing Expedition',
  'SailExpedition' = 'Sailing Expedition',
  'sailExpedition' = 'Sailing Expedition',
  'sail_expedition' = 'Sailing Expedition',
  /**
   * Sail Racing; explicit FIT sailing/sail_race (32/65), distinct from general Sailing.
   */
  'Sail Racing' = 'Sail Racing',
  'SailRacing' = 'Sail Racing',
  'sailRacing' = 'Sail Racing',
  'sail_racing' = 'Sail Racing',
  'Sail Race' = 'Sail Racing',
  'SailRace' = 'Sail Racing',
  'sailRace' = 'Sail Racing',
  'sail_race' = 'Sail Racing',
  'sailing_sail_race' = 'Sail Racing',
  /**
   * Grinding; explicit FIT sport grinding (59), operating sailing winches.
   */
  'Grinding' = 'Grinding',
  'grinding' = 'Grinding',
  'Grind Offshore' = 'Grinding',
  'GrindOffshore' = 'Grinding',
  'grind_offshore' = 'Grinding',
  'Offshore Sail Grinding' = 'Grinding',
  'OffshoreSailGrinding' = 'Grinding',
  'offshore_sail_grinding' = 'Grinding',
  /**
   * Indoor Grinding; explicit FIT grinding/indoor_grinding (59/71), also named Grind Onshore by Garmin.
   */
  'Indoor Grinding' = 'Indoor Grinding',
  'IndoorGrinding' = 'Indoor Grinding',
  'indoorGrinding' = 'Indoor Grinding',
  'indoor_grinding' = 'Indoor Grinding',
  'grinding_indoor_grinding' = 'Indoor Grinding',
  'Grind Onshore' = 'Indoor Grinding',
  'GrindOnshore' = 'Indoor Grinding',
  'grind_onshore' = 'Indoor Grinding',
  'Onshore Sail Grinding' = 'Indoor Grinding',
  'OnshoreSailGrinding' = 'Indoor Grinding',
  'onshore_sail_grinding' = 'Indoor Grinding',
  /**
   * Kayaking
   */
  'Kayaking' = 'Kayaking',
  'kayaking' = 'Kayaking',
  'Kayak' = 'Kayaking',
  /** Whitewater Kayaking; FIT kayaking/whitewater (41/41), distinct from Whitewater Rafting. */
  'Whitewater Kayaking' = 'Whitewater Kayaking',
  'WhitewaterKayaking' = 'Whitewater Kayaking',
  'whitewater_kayaking' = 'Whitewater Kayaking',
  'kayaking_whitewater' = 'Whitewater Kayaking',
  /**
   * Rafting
   */
  'rafting' = 'Rafting',
  'Rafting' = 'Rafting',
  /** Whitewater Rafting; FIT rafting/whitewater (42/41), distinct from Whitewater Kayaking. */
  'Whitewater Rafting' = 'Whitewater Rafting',
  'WhitewaterRafting' = 'Whitewater Rafting',
  'whitewater_rafting' = 'Whitewater Rafting',
  'rafting_whitewater' = 'Whitewater Rafting',
  /**
   * Rowing
   */
  'rowing' = 'Rowing',
  'Rowing' = 'Rowing',
  'Row' = 'Rowing',
  /**
   * Indoor Rowing
   */
  'fitness_equipment_indoor_rowing' = 'Indoor Rowing',
  'IndoorRowing' = 'Indoor Rowing',
  'Indoor Rowing' = 'Indoor Rowing',
  'indoor_rowing' = 'Indoor Rowing',
  'rowing_indoor' = 'Indoor Rowing',
  'rowing_indoor_rowing' = 'Indoor Rowing',
  'Row Indoor' = 'Indoor Rowing',
  'RowIndoor' = 'Indoor Rowing',
  'row_indoor' = 'Indoor Rowing',
  /**
   * Climbing
   */
  'Climbing' = 'Climbing',
  /**
   * Triathlon
   */
  'Triathlon' = 'Triathlon',
  /**
   * Pool Triathlon; explicit FIT multisport/pool_triathlon (18/126).
   * A pool classification alone does not establish that every leg is indoors.
   */
  'Pool Triathlon' = 'Pool Triathlon',
  'PoolTriathlon' = 'Pool Triathlon',
  'poolTriathlon' = 'Pool Triathlon',
  'pool_triathlon' = 'Pool Triathlon',
  'multisport_pool_triathlon' = 'Pool Triathlon',
  /**
   * Duathlon
   */
  'Duathlon' = 'Duathlon',
  /**
   * Aquathlon
   */
  'Aquathlon' = 'Aquathlon',
  /**
   * Alpine Skiing
   * https://en.wikipedia.org/wiki/Alpine_skiing
   */
  'Alpine skiing' = 'Alpine Skiing',
  'Alpine Skiing' = 'Alpine Skiing',
  'AlpineSkiing' = 'Alpine Skiing',
  'alpine_skiing' = 'Alpine Skiing',
  'AlpineSki' = 'Alpine Skiing',
  'downhill' = 'Alpine Skiing',
  'Downhill skiing' = 'Alpine Skiing',
  'DownhillSkiing' = 'Alpine Skiing',
  /**
   * Indoor Skiing; FIT fitness_equipment/indoor_skiing (4/25), also named XC Ski Indoor.
   */
  'Indoor Skiing' = 'Indoor Skiing',
  'IndoorSkiing' = 'Indoor Skiing',
  'indoorSkiing' = 'Indoor Skiing',
  'indoor_skiing' = 'Indoor Skiing',
  'XC Ski Indoor' = 'Indoor Skiing',
  'XCSkiIndoor' = 'Indoor Skiing',
  'xc_ski_indoor' = 'Indoor Skiing',
  'Indoor Crosscountry Skiing' = 'Indoor Skiing',
  'IndoorCrosscountrySkiing' = 'Indoor Skiing',
  'indoor_crosscountry_skiing' = 'Indoor Skiing',
  'Indoor Cross Country Skiing' = 'Indoor Skiing',
  'IndoorCrossCountrySkiing' = 'Indoor Skiing',
  'indoor_cross_country_skiing' = 'Indoor Skiing',
  'fitness_equipment_indoor_skiing' = 'Indoor Skiing',
  /**
   * Crosscountry Skiing
   * https://en.wikipedia.org/wiki/Cross-country_skiing
   */

  'Crosscountry Skiing' = 'Crosscountry Skiing',
  'Crosscountry skiing' = 'Crosscountry Skiing',
  'CrosscountrySkiing' = 'Crosscountry Skiing',
  'CrossCountrySkiing' = 'Crosscountry Skiing',
  'cross_country_skiing' = 'Crosscountry Skiing',
  'XC Classic Ski' = 'Classic Crosscountry Skiing',
  'XCClassicSki' = 'Classic Crosscountry Skiing',
  'xc_classic_ski' = 'Classic Crosscountry Skiing',

  /**
   * Skate Skiing
   */
  'SkateSkiing' = 'Skate Skiing',
  'Skate Skiing' = 'Skate Skiing',
  'skate_skiing' = 'Skate Skiing',
  'cross_country_skiing_skate_skiing' = 'Skate Skiing',
  'XC Skate Ski' = 'Skate Skiing',
  'XCSkateSki' = 'Skate Skiing',
  'xc_skate_ski' = 'Skate Skiing',

  /**
   * Nordic skiing
   */
  'NordicSki' = 'Nordic Skiing',
  'Nordic skiing' = 'Nordic Skiing',
  'Nordic Skiing' = 'Nordic Skiing',
  /**
   * Backcountry Skiing
   * https://en.wikipedia.org/wiki/Backcountry_skiing
   */
  'Backcountry skiing' = 'Backcountry Skiing',
  'Backcountry Skiing' = 'Backcountry Skiing',
  'BackCountrySkiing' = 'Backcountry Skiing',
  'BackcountrySkiing' = 'Backcountry Skiing',
  'BackcountrySki' = 'Backcountry Skiing',
  'cross_country_skiing_backcountry' = 'Backcountry Skiing', // Hack for suunto
  'alpine_skiing_backcountry' = 'Backcountry Skiing', // Hack for suunto
  'backcountry' = 'Backcountry Skiing',
  'BackCountrySki' = 'Backcountry Skiing',
  /**
   * Ski Touring
   * https://en.wikipedia.org/wiki/Ski_touring
   */
  'Ski Touring' = 'Ski Touring',
  'SkiTouring' = 'Ski Touring',
  /**
   * Ski Mountaineering
   */
  'SkiMountaineering' = 'Ski Mountaineering',
  'Ski Mountaineering' = 'Ski Mountaineering',
  'ski_mountaineering' = 'Ski Mountaineering',
  'mountaineering_backcountry' = 'Ski Mountaineering',
  /**
   * Telemark Skiing
   */
  'Telemark skiing' = 'Telemark Skiing',
  'TelemarkSkiing' = 'Telemark Skiing',
  'Telemark Skiing' = 'Telemark Skiing',
  'cross_country_skiing_downhill' = 'Telemark Skiing',
  'alpine_skiing_downhill' = 'Alpine Skiing',
  /**
   * Roller Skiing
   */
  'Roller skiing' = 'Roller Skiing',
  'RollerSki' = 'Roller Skiing',
  'Roller Skiing' = 'Roller Skiing',
  /**
   * Snowboarding
   */
  'Snowboarding' = 'Snowboarding',
  'snowboarding' = 'Snowboarding',
  'Snowboard' = 'Snowboarding',
  /**
   * Splitboarding
   */
  'Splitboarding' = 'Splitboarding',
  'splitboarding' = 'Splitboarding',
  'snowboarding_backcountry' = 'Splitboarding',
  /**
   * Weight training
   */
  'Weight Training' = 'Weight Training',
  'Weight training' = 'Weight Training',
  'WeightTraining' = 'Weight Training',
  /**
   * Basketball
   */
  'Basketball' = 'Basketball',
  /**
   * Ice Hockey, including the explicit FIT hockey/ice classification.
   */
  'Ice Hockey' = 'Ice Hockey',
  'IceHockey' = 'Ice Hockey',
  'hockey_ice' = 'Ice Hockey',
  /**
   * Field Hockey, including FIT hockey/field and Suunto's creator-qualified generic/match classification.
   */
  'Field Hockey' = 'Field Hockey',
  'FieldHockey' = 'Field Hockey',
  'field_hockey' = 'Field Hockey',
  'hockey_field' = 'Field Hockey',
  /**
   * Lacrosse, identified by an explicit sport name or FIT sport 74.
   */
  'Lacrosse' = 'Lacrosse',
  'lacrosse' = 'Lacrosse',
  'LACROSSE' = 'Lacrosse',
  /**
   * Volleyball
   */
  'Volleyball' = 'Volleyball',
  /**
   * Football
   */
  'Football' = 'Football',
  /**
   * Softball
   */
  'Softball' = 'Softball',
  /**
   * Handball
   */
  'Handball' = 'Handball',
  /**
   * Cheerleading
   */
  'Cheerleading' = 'Cheerleading',
  /**
   * Baseball
   */
  'Baseball' = 'Baseball',
  /**
   * Tennis
   */
  'tennis' = 'Tennis',
  'Tennis' = 'Tennis',
  'tennis_match' = 'Tennis',
  /**
   * Padel
   */
  'Padel' = 'Padel',
  'padel' = 'Padel',
  'racket_padel' = 'Padel',
  /**
   * Pickleball; FIT racket/pickleball (sport 64, sub-sport 84), distinct from Racquet Ball and Padel.
   */
  'Pickleball' = 'Pickleball',
  'pickleball' = 'Pickleball',
  'PICKLEBALL' = 'Pickleball',
  'racket_pickleball' = 'Pickleball',
  /**
   * Platform Tennis; FIT racket/platform (sport 64, sub-sport 93), distinct from Tennis and Padel.
   */
  'Platform Tennis' = 'Platform Tennis',
  'PlatformTennis' = 'Platform Tennis',
  'platformTennis' = 'Platform Tennis',
  'platform_tennis' = 'Platform Tennis',
  'racket_platform' = 'Platform Tennis',
  /**
   * Badminton
   */
  'Badminton' = 'Badminton',
  /**
   * Table Tennis
   */
  'Table tennis' = 'Table Tennis',
  'Table Tennis' = 'Table Tennis',
  'TableTennis' = 'Table Tennis',
  /** Broad FIT racket (64), preserving the source category when its subtype is unknown. */
  'Racket Sport' = 'Racket Sport',
  'RacketSport' = 'Racket Sport',
  'racket_sport' = 'Racket Sport',
  'Racket Sports' = 'Racket Sport',
  'RacketSports' = 'Racket Sport',
  'racket_sports' = 'Racket Sport',
  'racket' = 'Racket Sport',
  /**
   * Racquet Ball
   */
  'racket_racquetball' = 'Racquet Ball',
  'racquet_ball' = 'Racquet Ball',
  'Racquet Ball' = 'Racquet Ball',
  'RacquetBall' = 'Racquet Ball',
  'Racquet ball' = 'Racquet Ball',
  /**
   * Squash
   */
  'Squash' = 'Squash',
  /**
   * Combat sport
   */
  'Combat sport' = 'Combat',
  'Combat' = 'Combat',
  /**
   * Mixed Martial Arts; explicit FIT sport mixed_martial_arts (80), distinct from generic Combat.
   */
  'Mixed Martial Arts' = 'Mixed Martial Arts',
  'MixedMartialArts' = 'Mixed Martial Arts',
  'mixedMartialArts' = 'Mixed Martial Arts',
  'mixed_martial_arts' = 'Mixed Martial Arts',
  'MMA' = 'Mixed Martial Arts',
  'mma' = 'Mixed Martial Arts',
  /**
   * Boxing
   */
  'Boxing' = 'Boxing',
  /**
   * Floorball
   */
  'Floorball' = 'Floorball',
  /**
   * Scuba Diving
   */
  'Scuba diving' = 'Scuba Diving',
  'Scuba Diving' = 'Scuba Diving',
  'ScubaDiving' = 'Scuba Diving',
  /**
   * CCR Diving; explicit FIT diving/ccr_diving (53/63), using a closed-circuit rebreather.
   */
  'CCR Diving' = 'CCR Diving',
  'CCRDiving' = 'CCR Diving',
  'ccrDiving' = 'CCR Diving',
  'ccr_diving' = 'CCR Diving',
  'diving_ccr_diving' = 'CCR Diving',
  'CCR' = 'CCR Diving',
  'ccr' = 'CCR Diving',
  /**
   * Free Diving
   */
  'Free diving' = 'Free Diving',
  'Free Diving' = 'Free Diving',
  'FreeDiving' = 'Free Diving',
  /**
   * Pool Apnea; explicit FIT sport pool_apnea (85), distinct from Free Diving.
   */
  'Pool Apnea' = 'Pool Apnea',
  'PoolApnea' = 'Pool Apnea',
  'poolApnea' = 'Pool Apnea',
  'pool_apnea' = 'Pool Apnea',
  /** Dynamic Apnea, including FIT diving/dynamic_apnea (53/121), distinct from broad Pool Apnea. */
  'Dynamic Apnea' = 'Dynamic Apnea',
  'DynamicApnea' = 'Dynamic Apnea',
  'dynamic_apnea' = 'Dynamic Apnea',
  'diving_dynamic_apnea' = 'Dynamic Apnea',
  'pool_apnea_dynamic_apnea' = 'Dynamic Apnea',
  /**
   * Diving
   */
  'diving' = 'Diving',
  'Diving' = 'Diving',
  'diving_apnea_hunting' = 'Diving',
  /**
   * Snorkeling
   */
  'snorkeling' = 'Snorkeling',
  'Snorkeling' = 'Snorkeling',
  /**
   * Mermaiding
   */
  'mermaiding' = 'Mermaiding',
  'Mermaiding' = 'Mermaiding',
  /**
   * Swimrun
   */
  'Swimrun' = 'Swimrun',
  /**
   * Adventure Racing
   */
  'Adventure Racing' = 'Adventure Racing',
  'AdventureRacing' = 'Adventure Racing',
  'adventure_racing' = 'Adventure Racing',
  'Adventure Race' = 'Adventure Racing',
  'AdventureRace' = 'Adventure Racing',
  'adventure_race' = 'Adventure Racing',
  'multisport_adventure_race' = 'Adventure Racing',
  'running_adventure_race' = 'Adventure Racing',
  /**
   * Bowling
   */
  'Bowling' = 'Bowling',
  /**
   * Cricket
   */
  'Cricket' = 'Cricket',
  /**
   * Crosstrainer
   */
  'Crosstrainer' = 'Crosstrainer',
  /**
   * Dancing, including explicit FIT sport dance (83).
   */
  'Dancing' = 'Dancing',
  'dancing' = 'Dancing',
  'DANCING' = 'Dancing',
  'Dance' = 'Dancing',
  'dance' = 'Dancing',
  /**
   * Jump Rope; explicit FIT sport jump_rope (84).
   */
  'Jump Rope' = 'Jump Rope',
  'JumpRope' = 'Jump Rope',
  'jumpRope' = 'Jump Rope',
  'jump_rope' = 'Jump Rope',
  'JUMP_ROPE' = 'Jump Rope',
  /**
   * Golf
   */
  'Golf' = 'Golf',
  'golf' = 'Golf',
  /**
   * Disc Golf, including FIT sport 69 and explicit Frisbee golf provider names.
   * Distinct from Golf and the general Frisbee activity.
   */
  'Disc Golf' = 'Disc Golf',
  'DiscGolf' = 'Disc Golf',
  'disc_golf' = 'Disc Golf',
  'FrisbeeGolf' = 'Disc Golf',
  'Frisbee Golf' = 'Disc Golf',
  'Frisbee golf' = 'Disc Golf',
  'frisbee_golf' = 'Disc Golf',
  'FRISBEEGOLF' = 'Disc Golf',
  /**
   * Hand Gliding
   */
  'hang_gliding' = 'Hang Gliding',
  'Hang gliding' = 'Hang Gliding',
  'HangGliding' = 'Hang Gliding',
  'Hang Gliding' = 'Hang Gliding',

  /**
   * Horseback Ridding
   */
  'horseback_riding' = 'Horseback Riding',
  'Horseback Riding' = 'Horseback Riding',
  'HorsebackRiding' = 'Horseback Riding',
  'Horseback riding' = 'Horseback Riding',
  'Horseback' = 'Horseback Riding',
  /**
   * Gymnastics
   */
  'Gymnastics' = 'Gymnastics',
  /**
   * Ice Skating
   */
  'Ice Skating' = 'Ice Skating',
  'IceSkating' = 'Ice Skating',
  'ice_skating' = 'Ice Skating',
  'ice skating' = 'Ice Skating',
  'Ice skating' = 'Ice Skating',
  'IceSkate' = 'Ice Skating',
  'Ice Skate' = 'Ice Skating',
  /**
   * Canoeing
   */
  'Canoeing' = 'Canoeing',
  /**
   * Motorsports
   */
  'Motorsports' = 'Motorsports',
  /**
   * Overlanding; Garmin's Overland motorized activity, distinct from general Driving and Motorcycling.
   */
  'Overlanding' = 'Overlanding',
  'overlanding' = 'Overlanding',
  'Overland' = 'Overlanding',
  'overland' = 'Overlanding',
  'motor_sports_overland' = 'Overlanding',
  'driving_overland' = 'Overlanding',
  'motorcycling_overland' = 'Overlanding',
  /**
   * Rally; explicit FIT motor_sports/rally (81/125), distinct from general Motorsports.
   */
  'Rally' = 'Rally',
  'rally' = 'Rally',
  'Rally Driving' = 'Rally',
  'RallyDriving' = 'Rally',
  'rally_driving' = 'Rally',
  'motor_sports_rally' = 'Rally',
  /**
   * Mountaineering
   */
  'Mountaineering' = 'Mountaineering',
  'mountaineering' = 'Mountaineering',
  /**
   * Orienteering
   */
  'Orienteering' = 'Orienteering',
  'running_navigate' = 'Orienteering',
  'generic_navigate' = 'Orienteering',
  /**
   * Rugby
   */
  'Rugby' = 'Rugby',
  /**
   * Stretching
   */
  'Stretching' = 'Stretching',
  /**
   * Mobility; explicit FIT sport mobility (86), distinct from Flexibility Training.
   */
  'Mobility' = 'Mobility',
  'mobility' = 'Mobility',
  /**
   * Strength Training
   */
  'training_strength_training' = 'Strength Training',
  'fitness_equipment_strength_training' = 'Strength Training',
  'strength_training' = 'Strength Training',
  'Strength training' = 'Strength Training',
  'strength training' = 'Strength Training',
  'Strength Training' = 'Strength Training',
  'StrengthTraining' = 'Strength Training',
  'generic_strength_training' = 'Strength Training',
  'Strength' = 'Strength Training',
  /**
   * Track and Field
   */
  'TrackAndField' = 'Track and Field',
  'Track and Field' = 'Track and Field',
  /**
   * Nordic walking
   */
  'NordicWalking' = 'Nordic Walking',
  'Nordic Walking' = 'Nordic Walking',
  'Nordic walking' = 'Nordic Walking',
  /**
   * Snowshoeing
   */
  'Snow shoeing' = 'Snowshoeing',
  /**
   * Windsrufing
   */
  'Windsurfing/Surfing' = 'Windsurfing',
  'windsurfing' = 'Windsurfing',
  'Windsurfing' = 'Windsurfing',
  'Windsurf' = 'Windsurfing',
  /**
   * Kettlebell
   */
  'Kettlebell' = 'Kettlebell',
  /**
   * Paddling
   */
  'paddling' = 'Paddling',
  'Paddling' = 'Paddling',
  /**
   * Flying
   */
  'flying' = 'Flying',
  'Flying' = 'Flying',
  /** Wingsuit Flying; explicit FIT flying/wingsuit (20/40). */
  'Wingsuit Flying' = 'Wingsuit Flying',
  'WingsuitFlying' = 'Wingsuit Flying',
  'wingsuit_flying' = 'Wingsuit Flying',
  'Wingsuit' = 'Wingsuit Flying',
  'wingsuit' = 'Wingsuit Flying',
  'flying_wingsuit' = 'Wingsuit Flying',
  /**
   * Crossfit
   */
  'Cross fit' = 'Crossfit',
  'Cross Fit' = 'Crossfit',
  'cross_fit' = 'Crossfit',
  'Crossfit' = 'Crossfit',
  /**
   * Kitesurfing
   */
  'Kitesurfing/Kiting' = 'Kitesurfing',
  'kitesurfing' = 'Kitesurfing',
  'Kitesurfing' = 'Kitesurfing',
  'Kitesurf' = 'Kitesurfing',
  /**
   * Tactical
   */
  'tactical' = 'Tactical',
  'Tactical' = 'Tactical',
  /**
   * Jumpmaster
   */
  'jumpmaster' = 'Jumpmaster',
  'Jumpmaster' = 'Jumpmaster',
  /**
   * Boxing
   */
  'boxing' = 'Boxing',
  /**
   * Floor Climbing
   */
  'floor_climbing' = 'Floor Climbing',
  'Floor climbing' = 'Floor Climbing',
  'Floor Climbing' = 'Floor Climbing',
  'FloorClimbing' = 'Floor Climbing',
  'Floor Climb' = 'Floor Climbing',
  'FloorClimb' = 'Floor Climbing',
  'floor_climb' = 'Floor Climbing',
  /**
   * Paragliding
   */
  'Paragliding' = 'Paragliding',
  'paragliding' = 'Paragliding',
  'Fly Paraglide' = 'Paragliding',
  'FlyParaglide' = 'Paragliding',
  'fly_paraglide' = 'Paragliding',
  'flying_fly_paraglide' = 'Paragliding',
  /**
   * Treadmill
   */
  'fitness_equipment_treadmill' = 'Treadmill',
  'running_treadmill' = 'Treadmill',
  'Treadmill' = 'Treadmill',
  'treadmill' = 'Treadmill',
  /**
   * Frisbee
   */
  'Frisbee' = 'Frisbee',
  /** Ultimate Disc is distinct from recreational Frisbee and Disc Golf; explicit names establish it. */
  'Ultimate Disc' = 'Ultimate Disc',
  'UltimateDisc' = 'Ultimate Disc',
  'ultimate_disc' = 'Ultimate Disc',
  'Ultimate Frisbee' = 'Ultimate Disc',
  'UltimateFrisbee' = 'Ultimate Disc',
  'ultimate_frisbee' = 'Ultimate Disc',
  /**
   * Indoor Training
   */
  'Indoor training' = 'Indoor Training',
  'Indoor Training' = 'Indoor Training',
  'IndoorTraining' = 'Indoor Training',
  /**
   * Trucker Workout; exercise during driving breaks, classified with Indoor Sports.
   */
  'Trucker Workout' = 'Trucker Workout',
  'TruckerWorkout' = 'Trucker Workout',
  'truckerWorkout' = 'Trucker Workout',
  'trucker_workout' = 'Trucker Workout',
  'Trucker Workouts' = 'Trucker Workout',
  'TruckerWorkouts' = 'Trucker Workout',
  'truckerWorkouts' = 'Trucker Workout',
  'trucker_workouts' = 'Trucker Workout',
  'Trucker Health' = 'Trucker Workout',
  'TruckerHealth' = 'Trucker Workout',
  'trucker_health' = 'Trucker Workout',
  'generic_trucker_workout' = 'Trucker Workout',
  'fitness_equipment_trucker_workout' = 'Trucker Workout',
  'training_trucker_workout' = 'Trucker Workout',
  /**
   * Hiking
   */
  'Hiking' = 'Hiking',
  /**
   * Rucking; explicit FIT hiking/rucking (17/124), distinct from general Hiking and Walking.
   */
  'Rucking' = 'Rucking',
  'rucking' = 'Rucking',
  'hiking_rucking' = 'Rucking',
  'hiking_trail' = 'Hiking',
  'hiking' = 'Hiking',
  'hike' = 'Hiking',
  'Hike' = 'Hiking',

  /**
   * Canyoning
   */
  'canyoning' = 'Canyoning',
  'Canyoning' = 'Canyoning',

  /**
   * Via ferrata
   */
  'ViaFerrata' = 'Via Ferrata',
  'Via Ferrata' = 'Via Ferrata',
  'via Ferrata' = 'Via Ferrata',
  'via ferrata' = 'Via Ferrata',
  /**
   * Fishing
   */
  'Fishing' = 'Fishing',
  'fishing' = 'Fishing',
  'Fish' = 'Fishing',
  /**
   * Hunting
   */
  'Hunting' = 'Hunting',
  'hunting' = 'Hunting',
  'Hunt' = 'Hunting',
  /** Hunting with Dogs; explicit FIT hunting/hunting_with_dogs (28/72). */
  'Hunting with Dogs' = 'Hunting with Dogs',
  'HuntingWithDogs' = 'Hunting with Dogs',
  'hunting_with_dogs' = 'Hunting with Dogs',
  'hunting_hunting_with_dogs' = 'Hunting with Dogs',
  /**
   * Archery; explicit FIT sport archery (79).
   */
  'Archery' = 'Archery',
  'archery' = 'Archery',
  /**
   * Shooting; explicit FIT sport shooting (56), distinct from Archery and Hunting.
   */
  'Shooting' = 'Shooting',
  'shooting' = 'Shooting',
  /**
   * Geocaching; explicit FIT sport geocaching (87), distinct from Hiking and Walking.
   */
  'Geocaching' = 'Geocaching',
  'geocaching' = 'Geocaching',
  /**
   * Route
   */
  'route' = 'Route',
  'Route' = 'Route',
  /**
   * Inline Skating
   */
  'inline_skating' = 'Inline Skating',
  'InlineSkating' = 'Inline Skating',
  'Inline Skating' = 'Inline Skating',
  'Inline skating' = 'Inline Skating',
  'InlineSkate' = 'Inline Skating',
  /**
   * Rock Climbing
   */
  'rock_climbing' = 'Rock Climbing',
  'Rock Climbing' = 'Rock Climbing',
  'Rock climbing' = 'Rock Climbing',
  'RockClimbing' = 'Rock Climbing',
  /**
   * Indoor Climbing (Garmin sub_sport: rock_climbing + indoor_climbing)
   */
  'indoor_climbing' = 'Indoor Climbing',
  'IndoorClimbing' = 'Indoor Climbing',
  'Indoor Climbing' = 'Indoor Climbing',
  'rock_climbing_indoor_climbing' = 'Indoor Climbing',
  'Climb Indoor' = 'Indoor Climbing',
  'ClimbIndoor' = 'Indoor Climbing',
  'climb_indoor' = 'Indoor Climbing',
  /**
   * Bouldering (Garmin sub_sport: rock_climbing + bouldering)
   */
  'bouldering' = 'Bouldering',
  'Bouldering' = 'Bouldering',
  'rock_climbing_bouldering' = 'Bouldering',
  /**
   * Sky Diving
   */
  'sky_diving' = 'Sky Diving',
  'Sky Diving' = 'Sky Diving',
  'Sky diving' = 'Sky Diving',
  'sky diving' = 'Sky Diving',
  'SkyDiving' = 'Sky Diving',
  /**
   * Snowshoeing
   */
  'snowshoeing' = 'Snowshoeing',
  'Snowshoeing' = 'Snowshoeing',
  'Snowshoe' = 'Snowshoeing',
  /**
   * Snowmobiling
   */
  'snowmobiling' = 'Snowmobiling',
  'Snowmobiling' = 'Snowmobiling',
  /**
   * Stand Up Paddling
   */
  'stand_up_paddleboarding' = 'Stand Up Paddling',
  'Standup paddling (SUP)' = 'Stand Up Paddling',
  'Stand up paddling' = 'Stand Up Paddling',
  'stand up paddling' = 'Stand Up Paddling',
  'Stand Up Paddling' = 'Stand Up Paddling',
  'Stand up Paddling' = 'Stand Up Paddling',
  'StandUpPaddling' = 'Stand Up Paddling',
  /**
   * Surfing
   */
  'surfing' = 'Surfing',
  'Surfing' = 'Surfing',
  /**
   * Wakeboarding
   */
  'wakeboarding' = 'Wakeboarding',
  'Wakeboarding' = 'Wakeboarding',
  /**
   * Wakesurfing; explicit FIT sport wakesurfing (77), distinct from Surfing and Wakeboarding.
   */
  'Wakesurfing' = 'Wakesurfing',
  'wakesurfing' = 'Wakesurfing',
  /**
   * Water Skiing
   */
  'water_skiing' = 'Water Skiing',
  'Water skiing' = 'Water Skiing',
  'Water Skiing' = 'Water Skiing',
  'WaterSkiing' = 'Water Skiing',
  /**
   * Water Tubing; explicit FIT sport water_tubing (76).
   */
  'water_tubing' = 'Water Tubing',
  'Water Tubing' = 'Water Tubing',
  'WaterTubing' = 'Water Tubing',
  /**
   * Flexibility Training
   */
  'training_flexibility_training' = 'Flexibility Training',
  'flexibility_training' = 'Flexibility Training',
  'Flexibility Training' = 'Flexibility Training',
  'FlexibilityTraining' = 'Flexibility Training',
  'generic_flexibility_training' = 'Flexibility Training',
  /**
   * Training
   */
  'training' = 'Training',
  'Training' = 'Training',
  /**
   * Cardio Training
   */
  'cardio_training' = 'Cardio Training',
  'training_cardio_training' = 'Cardio Training',
  'Cardio Training' = 'Cardio Training',
  'CardioTraining' = 'Cardio Training',
  'fitness_equipment_cardio_training' = 'Cardio Training',
  'Cardio' = 'Cardio Training',
  /**
   * Elliptical trainer
   */
  'fitness_equipment_elliptical' = 'Elliptical Trainer',
  'Elliptical trainer' = 'Elliptical Trainer',
  'Elliptical' = 'Elliptical Trainer',
  'EllipticalTrainer' = 'Elliptical Trainer',
  'Elliptical Trainer' = 'Elliptical Trainer',
  /**
   * Hand Cycle
   */
  'Handcycle' = 'Hand Cycle',
  'Hand cycle' = 'Hand Cycle',
  'Hand Cycle' = 'Hand Cycle',
  'cycling_hand_cycling' = 'Hand Cycle',
  /**
   * Indoor Hand Cycle; explicit FIT cycling/indoor_hand_cycling (2/88).
   */
  'Indoor Hand Cycle' = 'Indoor Hand Cycle',
  'IndoorHandCycle' = 'Indoor Hand Cycle',
  'indoorHandCycle' = 'Indoor Hand Cycle',
  'indoor_hand_cycle' = 'Indoor Hand Cycle',
  'IndoorHandCycling' = 'Indoor Hand Cycle',
  'indoorHandCycling' = 'Indoor Hand Cycle',
  'indoor_hand_cycling' = 'Indoor Hand Cycle',
  'cycling_indoor_hand_cycling' = 'Indoor Hand Cycle',
  /**
   * Stair Stepper
   */
  'StairStepper' = 'Stair Stepper',
  'Stair Stepper' = 'Stair Stepper',
  /**
   * Velomobile
   */
  'Velomobile' = 'Velomobile',
  /**
   * Wheel Chair, when the source does not identify a more specific wheelchair activity.
   */
  'Wheelchair' = 'Wheel Chair',
  'Wheel chair' = 'Wheel Chair',
  'Wheel Chair' = 'Wheel Chair',
  /**
   * Wheelchair pushes at walking speed, identified by an explicit sport name or FIT sport 65.
   */
  'Wheelchair Push Walk' = 'Wheelchair Push Walk',
  'WheelchairPushWalk' = 'Wheelchair Push Walk',
  'wheelchair_push_walk' = 'Wheelchair Push Walk',
  /**
   * Indoor wheelchair pushes at walking speed; FIT wheelchair_push_walk/indoor_wheelchair_walk (65/86).
   */
  'Indoor Wheelchair Push Walk' = 'Indoor Wheelchair Push Walk',
  'IndoorWheelchairPushWalk' = 'Indoor Wheelchair Push Walk',
  'indoorWheelchairPushWalk' = 'Indoor Wheelchair Push Walk',
  'indoor_wheelchair_push_walk' = 'Indoor Wheelchair Push Walk',
  'IndoorWheelchairWalk' = 'Indoor Wheelchair Push Walk',
  'indoorWheelchairWalk' = 'Indoor Wheelchair Push Walk',
  'indoor_wheelchair_walk' = 'Indoor Wheelchair Push Walk',
  'wheelchair_push_walk_indoor_wheelchair_walk' = 'Indoor Wheelchair Push Walk',
  /**
   * Wheelchair pushes at running speed, identified by an explicit sport name or FIT sport 66.
   */
  'Wheelchair Push Run' = 'Wheelchair Push Run',
  'WheelchairPushRun' = 'Wheelchair Push Run',
  'wheelchair_push_run' = 'Wheelchair Push Run',
  /**
   * Indoor wheelchair pushes at running speed; FIT wheelchair_push_run/indoor_wheelchair_run (66/87).
   */
  'Indoor Wheelchair Push Run' = 'Indoor Wheelchair Push Run',
  'IndoorWheelchairPushRun' = 'Indoor Wheelchair Push Run',
  'indoorWheelchairPushRun' = 'Indoor Wheelchair Push Run',
  'indoor_wheelchair_push_run' = 'Indoor Wheelchair Push Run',
  'IndoorWheelchairRun' = 'Indoor Wheelchair Push Run',
  'indoorWheelchairRun' = 'Indoor Wheelchair Push Run',
  'indoor_wheelchair_run' = 'Indoor Wheelchair Push Run',
  'wheelchair_push_run_indoor_wheelchair_run' = 'Indoor Wheelchair Push Run',
  /** Ballet Dancing; preserves an explicitly recorded discipline or workout name. */
  'BalletDancing' = 'Ballet Dancing',
  'Ballet Dancing' = 'Ballet Dancing',
  /** Ballroom Dancing; preserves an explicitly recorded discipline or workout name. */
  'BallroomDancing' = 'Ballroom Dancing',
  'Ballroom Dancing' = 'Ballroom Dancing',
  /** Jazz Dancing; preserves an explicitly recorded discipline or workout name. */
  'JazzDancing' = 'Jazz Dancing',
  'Jazz Dancing' = 'Jazz Dancing',
  /** Latin Dancing; preserves an explicitly recorded discipline or workout name. */
  'LatinDancing' = 'Latin Dancing',
  'Latin Dancing' = 'Latin Dancing',
  /** Modern Dancing; preserves an explicitly recorded discipline or workout name. */
  'ModernDancing' = 'Modern Dancing',
  'Modern Dancing' = 'Modern Dancing',
  /** Show Dancing; preserves an explicitly recorded discipline or workout name. */
  'ShowDancing' = 'Show Dancing',
  'Show Dancing' = 'Show Dancing',
  /** Street Dancing; preserves an explicitly recorded discipline or workout name. */
  'StreetDancing' = 'Street Dancing',
  'Street Dancing' = 'Street Dancing',
  /** Fitness Dancing; preserves an explicitly recorded discipline or workout name. */
  'FitnessDancing' = 'Fitness Dancing',
  'Fitness Dancing' = 'Fitness Dancing',
  /** Classic Crosscountry Skiing; preserves an explicitly recorded discipline or workout name. */
  'ClassicCrosscountrySkiing' = 'Classic Crosscountry Skiing',
  'Classic Crosscountry Skiing' = 'Classic Crosscountry Skiing',
  'Classic Skiing' = 'Classic Crosscountry Skiing',
  'Classic XC Skiing' = 'Classic Crosscountry Skiing',
  /** Dynamic Mobility; preserves an explicitly recorded discipline or workout name. */
  'DynamicMobility' = 'Dynamic Mobility',
  'Dynamic Mobility' = 'Dynamic Mobility',
  'Mobility (dynamic)' = 'Dynamic Mobility',
  /** Static Mobility; preserves an explicitly recorded discipline or workout name. */
  'StaticMobility' = 'Static Mobility',
  'Static Mobility' = 'Static Mobility',
  'Mobility (static)' = 'Static Mobility',
  /** Fitness Boxing; preserves an explicitly recorded discipline or workout name. */
  'FitnessBoxing' = 'Fitness Boxing',
  'Fitness Boxing' = 'Fitness Boxing',
  /** Fitness Martial Arts; preserves an explicitly recorded discipline or workout name. */
  'FitnessMartialArts' = 'Fitness Martial Arts',
  'Fitness Martial Arts' = 'Fitness Martial Arts',
  /** Road Running; preserves an explicitly recorded discipline or workout name. */
  'RoadRunning' = 'Road Running',
  'Road Running' = 'Road Running',
  /** Road Cycling; preserves an explicitly recorded discipline or workout name. */
  'RoadCycling' = 'Road Cycling',
  'Road Cycling' = 'Road Cycling',
  /** LES MILLS BARRE; preserves an explicitly recorded discipline or workout name. */
  'LesMillsBarre' = 'LES MILLS BARRE',
  'LES MILLS BARRE' = 'LES MILLS BARRE',
  /** LES MILLS BODYATTACK; preserves an explicitly recorded discipline or workout name. */
  'LesMillsBodyAttack' = 'LES MILLS BODYATTACK',
  'LES MILLS BODYATTACK' = 'LES MILLS BODYATTACK',
  /** LES MILLS BODYBALANCE; preserves an explicitly recorded discipline or workout name. */
  'LesMillsBodyBalance' = 'LES MILLS BODYBALANCE',
  'LES MILLS BODYBALANCE' = 'LES MILLS BODYBALANCE',
  /** LES MILLS BODYCOMBAT; preserves an explicitly recorded discipline or workout name. */
  'LesMillsBodyCombat' = 'LES MILLS BODYCOMBAT',
  'LES MILLS BODYCOMBAT' = 'LES MILLS BODYCOMBAT',
  /** LES MILLS BODYJAM; preserves an explicitly recorded discipline or workout name. */
  'LesMillsBodyJam' = 'LES MILLS BODYJAM',
  'LES MILLS BODYJAM' = 'LES MILLS BODYJAM',
  /** LES MILLS BODYPUMP; preserves an explicitly recorded discipline or workout name. */
  'LesMillsBodyPump' = 'LES MILLS BODYPUMP',
  'LES MILLS BODYPUMP' = 'LES MILLS BODYPUMP',
  /** LES MILLS BODYSTEP; preserves an explicitly recorded discipline or workout name. */
  'LesMillsBodyStep' = 'LES MILLS BODYSTEP',
  'LES MILLS BODYSTEP' = 'LES MILLS BODYSTEP',
  /** LES MILLS CORE; preserves an explicitly recorded discipline or workout name. */
  'LesMillsCore' = 'LES MILLS CORE',
  'LES MILLS CORE' = 'LES MILLS CORE',
  'LES MILLS CXWORX' = 'LES MILLS CORE',
  /** LES MILLS GRIT Athletic; preserves an explicitly recorded discipline or workout name. */
  'LesMillsGritAthletic' = 'LES MILLS GRIT Athletic',
  'LES MILLS GRIT Athletic' = 'LES MILLS GRIT Athletic',
  /** LES MILLS GRIT Cardio; preserves an explicitly recorded discipline or workout name. */
  'LesMillsGritCardio' = 'LES MILLS GRIT Cardio',
  'LES MILLS GRIT Cardio' = 'LES MILLS GRIT Cardio',
  /** LES MILLS GRIT Strength; preserves an explicitly recorded discipline or workout name. */
  'LesMillsGritStrength' = 'LES MILLS GRIT Strength',
  'LES MILLS GRIT Strength' = 'LES MILLS GRIT Strength',
  /** LES MILLS RPM; preserves an explicitly recorded discipline or workout name. */
  'LesMillsRPM' = 'LES MILLS RPM',
  'LES MILLS RPM' = 'LES MILLS RPM',
  /** LES MILLS SH'BAM; preserves an explicitly recorded discipline or workout name. */
  'LesMillsShBam' = "LES MILLS SH'BAM",
  "LES MILLS SH'BAM" = "LES MILLS SH'BAM",
  /** LES MILLS SPRINT; preserves an explicitly recorded discipline or workout name. */
  'LesMillsSprint' = 'LES MILLS SPRINT',
  'LES MILLS SPRINT' = 'LES MILLS SPRINT',
  /** LES MILLS TONE; preserves an explicitly recorded discipline or workout name. */
  'LesMillsTone' = 'LES MILLS TONE',
  'LES MILLS TONE' = 'LES MILLS TONE',
  /** LES MILLS THE TRIP; preserves an explicitly recorded discipline or workout name. */
  'LesMillsTheTrip' = 'LES MILLS THE TRIP',
  'LES MILLS THE TRIP' = 'LES MILLS THE TRIP',
  'LES MILLS TRIP' = 'LES MILLS THE TRIP',
  /** Parkour; preserves an explicitly recorded sport name. */
  'Parkour' = 'Parkour',
  'Parkouring' = 'Parkour',
  /** Vertical Running; preserves an explicitly recorded sport name. */
  'VerticalRunning' = 'Vertical Running',
  'Vertical Running' = 'Vertical Running',
  /** Spearfishing; preserves an explicitly recorded sport name. */
  'Spearfishing' = 'Spearfishing',
  /** Adaptive Water Skiing; recognized from an explicit provider sport/profile. */
  'AdaptiveWaterSkiing' = 'Adaptive Water Skiing',
  'Adaptive Water Skiing' = 'Adaptive Water Skiing',
  /** Aqua Fitness; recognized from an explicit provider sport/profile. */
  'AquaFitness' = 'Aqua Fitness',
  'Aqua Fitness' = 'Aqua Fitness',
  /** Backcountry Snowboarding; recognized from an explicit provider sport/profile. */
  'BackcountrySnowboarding' = 'Backcountry Snowboarding',
  'Backcountry Snowboarding' = 'Backcountry Snowboarding',
  /** Barre; recognized from an explicit provider sport/profile. */
  'Barre' = 'Barre',
  /** Beach Tennis; recognized from an explicit provider sport/profile. */
  'BeachTennis' = 'Beach Tennis',
  'Beach Tennis' = 'Beach Tennis',
  /** Beach Volleyball; recognized from an explicit provider sport/profile. */
  'BeachVolleyball' = 'Beach Volleyball',
  'Beach Volleyball' = 'Beach Volleyball',
  /** Biathlon; recognized from an explicit provider sport/profile. */
  'Biathlon' = 'Biathlon',
  /** Bootcamp; recognized from an explicit provider sport/profile. */
  'Bootcamp' = 'Bootcamp',
  /** Breathwork; recognized from an explicit provider sport/profile. */
  'Breathwork' = 'Breathwork',
  /** Calisthenics; recognized from an explicit provider sport/profile. */
  'Calisthenics' = 'Calisthenics',
  /** Car Racing; recognized from an explicit provider sport/profile. */
  'CarRacing' = 'Car Racing',
  'Car Racing' = 'Car Racing',
  /** Classic Roller Skiing; recognized from an explicit provider sport/profile. */
  'ClassicRollerSkiing' = 'Classic Roller Skiing',
  'Classic Roller Skiing' = 'Classic Roller Skiing',
  /** Core Training; recognized from an explicit provider sport/profile. */
  'CoreTraining' = 'Core Training',
  'Core Training' = 'Core Training',
  /** Crosscountry Running; recognized from an explicit provider sport/profile. */
  'CrosscountryRunning' = 'Crosscountry Running',
  'Crosscountry Running' = 'Crosscountry Running',
  /** Curling; recognized from an explicit provider sport/profile. */
  'Curling' = 'Curling',
  /** Dog Agility; recognized from an explicit provider sport/profile. */
  'DogAgility' = 'Dog Agility',
  'Dog Agility' = 'Dog Agility',
  /** Expedition; recognized from an explicit provider sport/profile. */
  'Expedition' = 'Expedition',
  /** Finnish Baseball; recognized from an explicit provider sport/profile. */
  'FinnishBaseball' = 'Finnish Baseball',
  'Finnish Baseball' = 'Finnish Baseball',
  /** Fitness Racing; recognized from an explicit provider sport/profile. */
  'FitnessRacing' = 'Fitness Racing',
  'Fitness Racing' = 'Fitness Racing',
  /** Functional Training; recognized from an explicit provider sport/profile. */
  'FunctionalTraining' = 'Functional Training',
  'Functional Training' = 'Functional Training',
  /** Futsal; recognized from an explicit provider sport/profile. */
  'Futsal' = 'Futsal',
  /** Hard Enduro; recognized from an explicit provider sport/profile. */
  'HardEnduro' = 'Hard Enduro',
  'Hard Enduro' = 'Hard Enduro',
  /** Indoor Shooting; recognized from an explicit provider sport/profile. */
  'IndoorShooting' = 'Indoor Shooting',
  'Indoor Shooting' = 'Indoor Shooting',
  /** Judo; recognized from an explicit provider sport/profile. */
  'Judo' = 'Judo',
  /** Kickbiking; recognized from an explicit provider sport/profile. */
  'Kickbiking' = 'Kickbiking',
  /** Kickboxing; recognized from an explicit provider sport/profile. */
  'Kickboxing' = 'Kickboxing',
  /** Mind-Body Training; recognized from an explicit provider sport/profile. */
  'MindBodyTraining' = 'Mind-Body Training',
  'Mind-Body Training' = 'Mind-Body Training',
  /** Motorcycle Enduro; recognized from an explicit provider sport/profile. */
  'MotorcycleEnduro' = 'Motorcycle Enduro',
  'Motorcycle Enduro' = 'Motorcycle Enduro',
  /** Mountain Bike Orienteering; recognized from an explicit provider sport/profile. */
  'MountainBikeOrienteering' = 'Mountain Bike Orienteering',
  'Mountain Bike Orienteering' = 'Mountain Bike Orienteering',
  /** Offroad Duathlon; recognized from an explicit provider sport/profile. */
  'OffroadDuathlon' = 'Offroad Duathlon',
  'Offroad Duathlon' = 'Offroad Duathlon',
  /** Offroad Triathlon; recognized from an explicit provider sport/profile. */
  'OffroadTriathlon' = 'Offroad Triathlon',
  'Offroad Triathlon' = 'Offroad Triathlon',
  /** Physical Therapy; recognized from an explicit provider sport/profile. */
  'PhysicalTherapy' = 'Physical Therapy',
  'Physical Therapy' = 'Physical Therapy',
  /** Ringette; recognized from an explicit provider sport/profile. */
  'Ringette' = 'Ringette',
  /** Skate Roller Skiing; recognized from an explicit provider sport/profile. */
  'SkateRollerSkiing' = 'Skate Roller Skiing',
  'Skate Roller Skiing' = 'Skate Roller Skiing',
  /** Skateboarding; recognized from an explicit provider sport/profile. */
  'Skateboarding' = 'Skateboarding',
  /** Ski Orienteering; recognized from an explicit provider sport/profile. */
  'SkiOrienteering' = 'Ski Orienteering',
  'Ski Orienteering' = 'Ski Orienteering',
  /** Sled Hockey; recognized from an explicit provider sport/profile. */
  'SledHockey' = 'Sled Hockey',
  'Sled Hockey' = 'Sled Hockey',
  /** Snocross; recognized from an explicit provider sport/profile. */
  'Snocross' = 'Snocross',
  /** Step Training; recognized from an explicit provider sport/profile. */
  'StepTraining' = 'Step Training',
  'Step Training' = 'Step Training',
  /** Taekwondo; recognized from an explicit provider sport/profile. */
  'Taekwondo' = 'Taekwondo',
  /** Trotting; recognized from an explicit provider sport/profile. */
  'Trotting' = 'Trotting',
  /** Virtual Rowing; recognized from an explicit provider sport/profile. */
  'VirtualRowing' = 'Virtual Rowing',
  'Virtual Rowing' = 'Virtual Rowing',
  /** Water Running; recognized from an explicit provider sport/profile. */
  'WaterRunning' = 'Water Running',
  'Water Running' = 'Water Running',
  /** Wheelchair Basketball; recognized from an explicit provider sport/profile. */
  'WheelchairBasketball' = 'Wheelchair Basketball',
  'Wheelchair Basketball' = 'Wheelchair Basketball',
  /** Wheelchair Racing; recognized from an explicit provider sport/profile. */
  'WheelchairRacing' = 'Wheelchair Racing',
  'Wheelchair Racing' = 'Wheelchair Racing',
  /** Wheelchair Tennis; recognized from an explicit provider sport/profile. */
  'WheelchairTennis' = 'Wheelchair Tennis',
  'Wheelchair Tennis' = 'Wheelchair Tennis',

  /** Australian Football; recognized from an explicit sport/profile name. */
  'AustralianFootball' = 'Australian Football',
  'Australian Football' = 'Australian Football',
  /** Korfball; recognized from an explicit sport/profile name. */
  'Korfball' = 'Korfball',
  /** Netball; recognized from an explicit sport/profile name. */
  'Netball' = 'Netball',

  'Workout' = 'Workout',

  'generic_match' = 'Match',
  'Match' = 'Match'
}
/* eslint-enable @typescript-eslint/no-duplicate-enum-values */

/**
 * Activities whose cadence-shaped source fields represent strokes or paddle cycles per minute.
 * Keep this centralized so support for another sport is a single explicit addition.
 */
const STROKE_RATE_ACTIVITY_TYPES = new Set<ActivityTypes>([
  ActivityTypes.Swimming,
  ActivityTypes.OpenWaterSwimming,
  ActivityTypes.Rowing,
  ActivityTypes.IndoorRowing,
  ActivityTypes.VirtualRowing,
  ActivityTypes.Kayaking,
  ActivityTypes.WhitewaterKayaking,
  ActivityTypes.Canoeing,
  ActivityTypes.Paddling,
  ActivityTypes.StandUpPaddling
]);

export const ACTIVITIES_EXCLUDED_FROM_DESCENT = [
  ActivityTypes.AquaFitness,
  ActivityTypes.AdaptiveWaterSkiing,
  ActivityTypes.WaterRunning,
  ActivityTypes.Sailing,
  ActivityTypes.SailingExpedition,
  ActivityTypes.SailRacing,
  ActivityTypes.Grinding,
  ActivityTypes.Rowing,
  ActivityTypes.Windsurfing,
  ActivityTypes.Paddling,
  ActivityTypes.Surfing,
  ActivityTypes.StandUpPaddling,
  ActivityTypes.WaterSkiing,
  ActivityTypes.Wakeboarding,
  ActivityTypes.WaterTubing,
  ActivityTypes.Wakesurfing,
  ActivityTypes.Swimming,
  ActivityTypes.OpenWaterSwimming,
  ActivityTypes.Diving,
  ActivityTypes.ScubaDiving,
  ActivityTypes.CCRDiving,
  ActivityTypes.FreeDiving,
  ActivityTypes.PoolApnea,
  ActivityTypes.DynamicApnea,
  ActivityTypes.Spearfishing,
  ActivityTypes.Snorkeling,
  ActivityTypes.Mermaiding
];

export const ACTIVITIES_EXCLUDED_FROM_ASCENT = [
  ActivityTypes.AquaFitness,
  ActivityTypes.AdaptiveWaterSkiing,
  ActivityTypes.WaterRunning,
  ActivityTypes.AlpineSkiing,
  ActivityTypes.Snowboarding,
  ActivityTypes.DownhillCycling,
  ActivityTypes.Sailing,
  ActivityTypes.SailingExpedition,
  ActivityTypes.SailRacing,
  ActivityTypes.Grinding,
  ActivityTypes.Rowing,
  ActivityTypes.Windsurfing,
  ActivityTypes.Paddling,
  ActivityTypes.Surfing,
  ActivityTypes.StandUpPaddling,
  ActivityTypes.WaterSkiing,
  ActivityTypes.Wakeboarding,
  ActivityTypes.WaterTubing,
  ActivityTypes.Wakesurfing,
  ActivityTypes.Swimming,
  ActivityTypes.OpenWaterSwimming,
  ActivityTypes.Diving,
  ActivityTypes.ScubaDiving,
  ActivityTypes.CCRDiving,
  ActivityTypes.FreeDiving,
  ActivityTypes.PoolApnea,
  ActivityTypes.DynamicApnea,
  ActivityTypes.Spearfishing,
  ActivityTypes.Snorkeling,
  ActivityTypes.Mermaiding
];

export const ACTIVITIES_WITH_SPEED_METRICS_HIDDEN_BY_DEFAULT = [
  ActivityTypes.Climbing,
  ActivityTypes.FloorClimbing,
  ActivityTypes.RockClimbing,
  ActivityTypes['Indoor Climbing'],
  ActivityTypes.Bouldering
];

export const ActivityTypeGroups = {
  RunningGroup: 'running_group',
  /** Walking family, independent of the activity's indoor hint. */
  WalkingGroup: 'walking_group',
  TrailRunningGroup: 'trail_running_group',
  CyclingGroup: 'cycling_group',
  MountainBikingGroup: 'mountain_biking_group',
  SwimmingGroup: 'swimming_group',
  PerformanceGroup: 'performance_group',
  IndoorSportsGroup: 'indoor_sports_group',
  OutdoorAdventuresGroup: 'outdoor_adventures_group',
  WinterSportsGroup: 'winter_sports_group',
  SkatingGroup: 'skating_group',
  AerialSportsGroup: 'aerial_sports_group',
  MotorizedGroup: 'motorized_group',
  AdaptiveMobilityGroup: 'adaptive_mobility_group',
  WaterSportsGroup: 'water_sports_group',
  DivingGroup: 'diving_group',
  TeamRacketGroup: 'team_racket_group',
  UnspecifiedGroup: 'unspecified_group'
} as const;

export type ActivityTypeGroup = (typeof ActivityTypeGroups)[keyof typeof ActivityTypeGroups];

export class ActivityTypesGroupMapping {
  public static readonly map: Record<ActivityTypeGroup, ActivityTypes[]> = {
    [ActivityTypeGroups.RunningGroup]: [
      ActivityTypes.IndoorTrackRunning,
      ActivityTypes.RoadRunning,

      ActivityTypes.CrosscountryRunning,
      ActivityTypes.Running,
      ActivityTypes.TrackRunning,
      ActivityTypes.ObstacleRacing,
      ActivityTypes.UltraRunning,
      ActivityTypes.Treadmill,
      ActivityTypes.IndoorRunning,
      ActivityTypes.VirtualRunning
    ],
    [ActivityTypeGroups.TrailRunningGroup]: [ActivityTypes.TrailRunning, ActivityTypes.VerticalRunning],
    [ActivityTypeGroups.WalkingGroup]: [
      ActivityTypes.Walking,
      ActivityTypes.SpeedWalking,
      ActivityTypes.IndoorWalking,
      ActivityTypes.NordicWalking
    ],
    [ActivityTypeGroups.CyclingGroup]: [
      ActivityTypes.RoadCycling,
      ActivityTypes.LesMillsRPM,
      ActivityTypes.LesMillsSprint,
      ActivityTypes.LesMillsTheTrip,

      ActivityTypes.Kickbiking,
      ActivityTypes.Cycling,
      ActivityTypes.TrackCycling,
      ActivityTypes.RecumbentCycling,
      ActivityTypes.BMX,
      ActivityTypes.Cyclocross,
      ActivityTypes.GravelCycling,
      ActivityTypes.IndoorCycling,
      ActivityTypes.VirtualCycling,
      ActivityTypes.EBiking,
      ActivityTypes.Handcycle,
      ActivityTypes.IndoorHandCycle,
      ActivityTypes.Velomobile
    ],
    [ActivityTypeGroups.MountainBikingGroup]: [
      ActivityTypes.MountainBikeOrienteering,
      ActivityTypes.MountainBiking,
      ActivityTypes.EMountainBiking,
      ActivityTypes['Enduro MTB'],
      ActivityTypes.EEnduroMTB,
      ActivityTypes.DownhillCycling
    ],
    [ActivityTypeGroups.SwimmingGroup]: [ActivityTypes.Swimming, ActivityTypes.OpenWaterSwimming],
    [ActivityTypeGroups.PerformanceGroup]: [
      ActivityTypes.Parkour,
      ActivityTypes.FitnessRacing,
      ActivityTypes.OffroadDuathlon,
      ActivityTypes.OffroadTriathlon,
      ActivityTypes.ClassicRollerSkiing,
      ActivityTypes.SkateRollerSkiing,
      ActivityTypes.Crossfit,
      ActivityTypes.Orienteering,
      ActivityTypes.RollerSki,
      ActivityTypes.TrackAndField,
      ActivityTypes.Triathlon,
      ActivityTypes.PoolTriathlon,
      ActivityTypes.Multisport,
      ActivityTypes.BrickTraining,
      ActivityTypes['Adventure Racing'],
      ActivityTypes.Aquathlon,
      ActivityTypes.Duathlon,
      ActivityTypes.Swimrun
    ],
    [ActivityTypeGroups.IndoorSportsGroup]: [
      ActivityTypes.BalletDancing,
      ActivityTypes.BallroomDancing,
      ActivityTypes.JazzDancing,
      ActivityTypes.LatinDancing,
      ActivityTypes.ModernDancing,
      ActivityTypes.ShowDancing,
      ActivityTypes.StreetDancing,
      ActivityTypes.FitnessDancing,
      ActivityTypes.DynamicMobility,
      ActivityTypes.StaticMobility,
      ActivityTypes.AMRAP,
      ActivityTypes.EMOM,
      ActivityTypes.Tabata,
      ActivityTypes.FitnessBoxing,
      ActivityTypes.FitnessMartialArts,
      ActivityTypes.LesMillsBarre,
      ActivityTypes.LesMillsBodyAttack,
      ActivityTypes.LesMillsBodyBalance,
      ActivityTypes.LesMillsBodyCombat,
      ActivityTypes.LesMillsBodyJam,
      ActivityTypes.LesMillsBodyPump,
      ActivityTypes.LesMillsBodyStep,
      ActivityTypes.LesMillsCore,
      ActivityTypes.LesMillsGritAthletic,
      ActivityTypes.LesMillsGritCardio,
      ActivityTypes.LesMillsGritStrength,
      ActivityTypes.LesMillsShBam,
      ActivityTypes.LesMillsTone,

      ActivityTypes.Breathwork,
      ActivityTypes.MindBodyTraining,
      ActivityTypes.Bootcamp,
      ActivityTypes.Calisthenics,
      ActivityTypes.CoreTraining,
      ActivityTypes.StepTraining,
      ActivityTypes.FunctionalTraining,
      ActivityTypes.Judo,
      ActivityTypes.Kickboxing,
      ActivityTypes.Barre,
      ActivityTypes.IndoorShooting,
      ActivityTypes.Taekwondo,
      ActivityTypes.PhysicalTherapy,
      ActivityTypes.VirtualRowing,
      ActivityTypes.Gymnastics,
      ActivityTypes.Yoga,
      ActivityTypes.Meditation,
      ActivityTypes.Stretching,
      ActivityTypes.Mobility,
      ActivityTypes.Kettlebell,
      ActivityTypes.IndoorRowing,
      ActivityTypes.IndoorGrinding,
      ActivityTypes.IndoorSkiing,
      ActivityTypes.Floorball,
      ActivityTypes.Dancing,
      ActivityTypes.JumpRope,
      ActivityTypes.Crosstrainer,
      ActivityTypes.WeightTraining,
      ActivityTypes.StrengthTraining,
      ActivityTypes.Training,
      ActivityTypes.FlexibilityTraining,
      ActivityTypes.FitnessEquipment,
      ActivityTypes.Aerobics,
      ActivityTypes.Boxing,
      ActivityTypes.CardioTraining,
      ActivityTypes.Cheerleading,
      ActivityTypes['Circuit Training'],
      ActivityTypes.Combat,
      ActivityTypes.MixedMartialArts,
      ActivityTypes.EllipticalTrainer,
      ActivityTypes.HIIT,
      ActivityTypes.IndoorTraining,
      ActivityTypes.TruckerWorkout,
      ActivityTypes.Pilates,
      ActivityTypes.StairStepper
    ],
    [ActivityTypeGroups.OutdoorAdventuresGroup]: [
      ActivityTypes.Expedition,
      ActivityTypes.DogAgility,
      ActivityTypes.Trotting,
      ActivityTypes.Hiking,
      ActivityTypes.Rucking,
      ActivityTypes.HorsebackRiding,
      ActivityTypes.Climbing,
      ActivityTypes.RockClimbing,
      ActivityTypes['Indoor Climbing'],
      ActivityTypes.Bouldering,
      ActivityTypes.Canyoning,
      ActivityTypes.ViaFerrata,
      ActivityTypes.Fishing,
      ActivityTypes.FloorClimbing,
      ActivityTypes.Hunting,
      ActivityTypes.HuntingWithDogs,
      ActivityTypes.Archery,
      ActivityTypes.Shooting,
      ActivityTypes.Geocaching,
      ActivityTypes.Mountaineering,
      ActivityTypes.Trekking
    ],
    [ActivityTypeGroups.WinterSportsGroup]: [
      ActivityTypes.ClassicCrosscountrySkiing,

      ActivityTypes.BackcountrySnowboarding,
      ActivityTypes.Biathlon,
      ActivityTypes.Curling,
      ActivityTypes.SkiOrienteering,
      ActivityTypes.WinterSport,
      ActivityTypes.CrosscountrySkiing,
      ActivityTypes.SkateSkiing,
      ActivityTypes.BackCountrySkiing,
      ActivityTypes.AlpineSkiing,
      ActivityTypes.TelemarkSkiing,
      ActivityTypes.Snowboarding,
      ActivityTypes.Splitboarding,
      ActivityTypes.Snowshoeing,
      ActivityTypes.SkiTouring,
      ActivityTypes.SkiMountaineering,
      ActivityTypes.IceSkating,
      ActivityTypes.NordicSki
    ],
    [ActivityTypeGroups.SkatingGroup]: [
      ActivityTypes.Skateboarding,
      ActivityTypes.InlineSkating,
      ActivityTypes.Skating
    ],
    [ActivityTypeGroups.AerialSportsGroup]: [
      ActivityTypes.Paramotoring,
      ActivityTypes.Flying,
      ActivityTypes.WingsuitFlying,
      ActivityTypes.HangGliding,
      ActivityTypes.Jumpmaster,
      ActivityTypes.Paragliding,
      ActivityTypes.SkyDiving
    ],
    [ActivityTypeGroups.MotorizedGroup]: [
      ActivityTypes.CarRacing,
      ActivityTypes.MotorcycleEnduro,
      ActivityTypes.HardEnduro,
      ActivityTypes.Snocross,
      ActivityTypes.Boating,
      ActivityTypes.Driving,
      ActivityTypes.Motorcycling,
      ActivityTypes.ATV,
      ActivityTypes.Motocross,
      ActivityTypes.Motorsports,
      ActivityTypes.Overlanding,
      ActivityTypes.Rally,
      ActivityTypes.Snowmobiling
    ],
    [ActivityTypeGroups.AdaptiveMobilityGroup]: [
      ActivityTypes.WheelchairRacing,
      ActivityTypes.Wheelchair,
      ActivityTypes.WheelchairPushWalk,
      ActivityTypes.WheelchairPushRun,
      ActivityTypes.IndoorWheelchairPushWalk,
      ActivityTypes.IndoorWheelchairPushRun
    ],
    [ActivityTypeGroups.WaterSportsGroup]: [
      ActivityTypes.AquaFitness,
      ActivityTypes.AdaptiveWaterSkiing,
      ActivityTypes.WaterRunning,
      ActivityTypes.WaterSport,
      ActivityTypes.Rowing,
      ActivityTypes.Surfing,
      ActivityTypes.Kitesurfing,
      ActivityTypes.Wakeboarding,
      ActivityTypes.Wakesurfing,
      ActivityTypes.Sailing,
      ActivityTypes.SailingExpedition,
      ActivityTypes.SailRacing,
      ActivityTypes.Grinding,
      ActivityTypes.Canoeing,
      ActivityTypes.Kayaking,
      ActivityTypes.WhitewaterKayaking,
      ActivityTypes.Paddling,
      ActivityTypes.StandUpPaddling,
      ActivityTypes.Rafting,
      ActivityTypes.WhitewaterRafting,
      ActivityTypes.WaterSkiing,
      ActivityTypes.WaterTubing,
      ActivityTypes.Windsurfing
    ],
    [ActivityTypeGroups.DivingGroup]: [
      ActivityTypes.Spearfishing,
      ActivityTypes.DynamicApnea,

      ActivityTypes.Diving,
      ActivityTypes.ScubaDiving,
      ActivityTypes.CCRDiving,
      ActivityTypes.FreeDiving,
      ActivityTypes.PoolApnea,
      ActivityTypes.Snorkeling,
      ActivityTypes.Mermaiding
    ],
    [ActivityTypeGroups.TeamRacketGroup]: [
      ActivityTypes.AustralianFootball,
      ActivityTypes.Korfball,
      ActivityTypes.Netball,
      ActivityTypes.BeachTennis,
      ActivityTypes.BeachVolleyball,
      ActivityTypes.FinnishBaseball,
      ActivityTypes.Futsal,
      ActivityTypes.SledHockey,
      ActivityTypes.WheelchairBasketball,
      ActivityTypes.WheelchairTennis,
      ActivityTypes.Ringette,
      ActivityTypes.RacketSport,
      ActivityTypes.UltimateDisc,
      ActivityTypes.Hockey,
      ActivityTypes.TeamSport,
      ActivityTypes.Golf,
      ActivityTypes.DiscGolf,
      ActivityTypes.AmericanFootball,
      ActivityTypes.Football,
      ActivityTypes.Badminton,
      ActivityTypes.Baseball,
      ActivityTypes.Basketball,
      ActivityTypes.Bowling,
      ActivityTypes.Handball,
      ActivityTypes.IceHockey,
      ActivityTypes.FieldHockey,
      ActivityTypes.Lacrosse,
      ActivityTypes.Rugby,
      ActivityTypes.Softball,
      ActivityTypes.Squash,
      ActivityTypes.RacquetBall,
      ActivityTypes.TableTennis,
      ActivityTypes.Tennis,
      ActivityTypes.Padel,
      ActivityTypes.Pickleball,
      ActivityTypes.PlatformTennis,
      ActivityTypes.Cricket,
      ActivityTypes.Frisbee,
      ActivityTypes.Soccer,
      ActivityTypes.Volleyball
    ],
    [ActivityTypeGroups.UnspecifiedGroup]: [
      ActivityTypes.ParaSport,
      ActivityTypes.Chores,
      ActivityTypes.VideoGaming,
      ActivityTypes.RCDroneFlying,
      ActivityTypes.Generic,
      ActivityTypes.Match,
      ActivityTypes.Other,
      ActivityTypes.Route,
      ActivityTypes.Tactical,
      ActivityTypes.Transition,
      ActivityTypes.unknown,
      ActivityTypes.Workout
    ]
  };
}

const EXPLICIT_INDOOR_ACTIVITY_TYPES: ActivityTypes[] = [
  ...ActivityTypesGroupMapping.map[ActivityTypeGroups.IndoorSportsGroup],
  ActivityTypes.IndoorTrackRunning,
  ActivityTypes.LesMillsRPM,
  ActivityTypes.LesMillsSprint,
  ActivityTypes.LesMillsTheTrip,
  ActivityTypes.IndoorCycling,
  ActivityTypes.IndoorHandCycle,
  ActivityTypes.IndoorWheelchairPushWalk,
  ActivityTypes.IndoorWheelchairPushRun,
  ActivityTypes.IndoorRunning,
  ActivityTypes.IndoorWalking,
  ActivityTypes.IndoorTraining,
  ActivityTypes['Indoor Climbing'],
  ActivityTypes.Treadmill
];

export class ActivityTypesMoving {
  /**
   * Holds moving speed threshold in m/s per sport group
   */
  private static SPORTS_MOVING_SPEED_THRESHOLD_MAP = new Map<ActivityTypeGroup, number>([
    [ActivityTypeGroups.RunningGroup, 1.5 / 3.6], // kph to m/s
    [ActivityTypeGroups.CyclingGroup, 4 / 3.6], // kph to m/s
    [ActivityTypeGroups.MountainBikingGroup, 4 / 3.6], // kph to m/s
    [ActivityTypeGroups.SwimmingGroup, 0.3] // 30 cm/s
  ]);

  private static DEFAULT_MOVING_SPEED_THRESHOLD = 0.3; // m/s

  /**
   * Provides speed threshold by sport to compute moving time
   * @param activityType
   */
  static getSpeedThreshold(activityType: ActivityTypes): number {
    const threshold = this.SPORTS_MOVING_SPEED_THRESHOLD_MAP.get(
      ActivityTypesHelper.getActivityGroupForActivityType(activityType)
    );
    return threshold && Number.isFinite(threshold) ? threshold : this.DEFAULT_MOVING_SPEED_THRESHOLD;
  }
}

export class StravaGPXTypes {
  public static readonly map: Map<number, ActivityTypes> = new Map<number, ActivityTypes>([
    [1, ActivityTypes.Cycling],
    [2, ActivityTypes.AlpineSki],
    [3, ActivityTypes.BackCountrySki],
    [4, ActivityTypes.Hiking],
    [6, ActivityTypes.InlineSkate],
    [7, ActivityTypes.NordicSki],
    [9, ActivityTypes.Running],
    [10, ActivityTypes.Walking],
    [12, ActivityTypes.Snowboard],
    [13, ActivityTypes.Snowshoeing],
    [16, ActivityTypes.Swimming],
    [17, ActivityTypes.VirtualCycling],
    [18, ActivityTypes.EBikeRide],
    [23, ActivityTypes.Rowing],
    [53, ActivityTypes.VirtualRunning]
  ]);
}
