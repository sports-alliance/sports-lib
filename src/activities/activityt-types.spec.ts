import { DataPaceAvg } from '../data/data.pace-avg';
import { DataGradeAdjustedPace } from '../data/data.grade-adjusted-pace';
import { DataGradeAdjustedPaceAvg } from '../data/data.grade-adjusted-pace-avg';
import { DataPace } from '../data/data.pace';
import { DataSpeedAvg } from '../data/data.speed-avg';
import { DataSpeed } from '../data/data.speed';
import { DataSwimPace } from '../data/data.swim-pace';
import { DataSwimPaceAvg } from '../data/data.swim-pace-avg';
import { DataVerticalSpeed } from '../data/data.vertical-speed';
import { ActivityTypeGroups, ActivityTypes, ActivityTypesHelper, ActivityTypesMoving } from './activity.types';

describe('Activity type lookup input validation', () => {
  it.each(['constructor', 'toString', '__proto__', 'hasOwnProperty', 'valueOf'])(
    'rejects inherited object key %s',
    name => {
      expect(ActivityTypesHelper.resolveActivityType(name)).toBeNull();
    }
  );

  it('rejects non-string values without coercing or throwing', () => {
    for (const value of [null, undefined, 42, {}, ['Running'], Object.create(null)]) {
      expect(ActivityTypesHelper.resolveActivityType(value)).toBeNull();
    }
  });
});

const proposedGroupAssignments = [
  [ActivityTypes.RacketSport, ActivityTypeGroups.TeamRacketGroup],
  [ActivityTypes.UltimateDisc, ActivityTypeGroups.TeamRacketGroup],
  [ActivityTypes.ParaSport, ActivityTypeGroups.UnspecifiedGroup],
  [ActivityTypes.Hockey, ActivityTypeGroups.TeamRacketGroup],
  [ActivityTypes.WinterSport, ActivityTypeGroups.WinterSportsGroup],
  [ActivityTypes.TeamSport, ActivityTypeGroups.TeamRacketGroup],
  [ActivityTypes.WaterSport, ActivityTypeGroups.WaterSportsGroup],
  [ActivityTypes.Paramotoring, ActivityTypeGroups.AerialSportsGroup],
  [ActivityTypes.RCDroneFlying, ActivityTypeGroups.UnspecifiedGroup],
  [ActivityTypes.EEnduroMTB, ActivityTypeGroups.MountainBikingGroup],
  [ActivityTypes.TrackCycling, ActivityTypeGroups.CyclingGroup],
  [ActivityTypes.RecumbentCycling, ActivityTypeGroups.CyclingGroup],
  [ActivityTypes.SpeedWalking, ActivityTypeGroups.WalkingGroup],
  [ActivityTypes.WhitewaterKayaking, ActivityTypeGroups.WaterSportsGroup],
  [ActivityTypes.WhitewaterRafting, ActivityTypeGroups.WaterSportsGroup],
  [ActivityTypes.WingsuitFlying, ActivityTypeGroups.AerialSportsGroup],
  [ActivityTypes.BrickTraining, ActivityTypeGroups.PerformanceGroup],
  [ActivityTypes.HuntingWithDogs, ActivityTypeGroups.OutdoorAdventuresGroup],
  [ActivityTypes.BMX, ActivityTypeGroups.CyclingGroup],
  [ActivityTypes.IndoorSkiing, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.ATV, ActivityTypeGroups.MotorizedGroup],
  [ActivityTypes.Motocross, ActivityTypeGroups.MotorizedGroup],
  [ActivityTypes.PoolTriathlon, ActivityTypeGroups.PerformanceGroup],
  [ActivityTypes.ObstacleRacing, ActivityTypeGroups.RunningGroup],
  [ActivityTypes.UltraRunning, ActivityTypeGroups.RunningGroup],
  [ActivityTypes.Walking, ActivityTypeGroups.WalkingGroup],
  [ActivityTypes.IndoorWalking, ActivityTypeGroups.WalkingGroup],
  [ActivityTypes.NordicWalking, ActivityTypeGroups.WalkingGroup],
  [ActivityTypes.Rally, ActivityTypeGroups.MotorizedGroup],
  [ActivityTypes.Aerobics, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.Boxing, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.CardioTraining, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.Cheerleading, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes['Circuit Training'], ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.Combat, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.Dancing, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.JumpRope, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.MixedMartialArts, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.EllipticalTrainer, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.FitnessEquipment, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.HIIT, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.IndoorTraining, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.Meditation, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.Mobility, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.PoolApnea, ActivityTypeGroups.DivingGroup],
  [ActivityTypes.VideoGaming, ActivityTypeGroups.UnspecifiedGroup],
  [ActivityTypes.Pilates, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.StairStepper, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes['Adventure Racing'], ActivityTypeGroups.PerformanceGroup],
  [ActivityTypes.Aquathlon, ActivityTypeGroups.PerformanceGroup],
  [ActivityTypes.Duathlon, ActivityTypeGroups.PerformanceGroup],
  [ActivityTypes.Swimrun, ActivityTypeGroups.PerformanceGroup],
  [ActivityTypes.TrackRunning, ActivityTypeGroups.RunningGroup],
  [ActivityTypes.Fishing, ActivityTypeGroups.OutdoorAdventuresGroup],
  [ActivityTypes.FloorClimbing, ActivityTypeGroups.OutdoorAdventuresGroup],
  [ActivityTypes.Hunting, ActivityTypeGroups.OutdoorAdventuresGroup],
  [ActivityTypes.Archery, ActivityTypeGroups.OutdoorAdventuresGroup],
  [ActivityTypes.Shooting, ActivityTypeGroups.OutdoorAdventuresGroup],
  [ActivityTypes.Geocaching, ActivityTypeGroups.OutdoorAdventuresGroup],
  [ActivityTypes.Mountaineering, ActivityTypeGroups.OutdoorAdventuresGroup],
  [ActivityTypes.Trekking, ActivityTypeGroups.OutdoorAdventuresGroup],
  [ActivityTypes.Rucking, ActivityTypeGroups.OutdoorAdventuresGroup],
  [ActivityTypes.SailingExpedition, ActivityTypeGroups.WaterSportsGroup],
  [ActivityTypes.CCRDiving, ActivityTypeGroups.DivingGroup],
  [ActivityTypes.IndoorHandCycle, ActivityTypeGroups.CyclingGroup],
  [ActivityTypes.Overlanding, ActivityTypeGroups.MotorizedGroup],
  [ActivityTypes.TruckerWorkout, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.IndoorWheelchairPushWalk, ActivityTypeGroups.AdaptiveMobilityGroup],
  [ActivityTypes.IndoorWheelchairPushRun, ActivityTypeGroups.AdaptiveMobilityGroup],
  [ActivityTypes.Cyclocross, ActivityTypeGroups.CyclingGroup],
  [ActivityTypes.GravelCycling, ActivityTypeGroups.CyclingGroup],
  [ActivityTypes.EMountainBiking, ActivityTypeGroups.MountainBikingGroup],
  [ActivityTypes.Handcycle, ActivityTypeGroups.CyclingGroup],
  [ActivityTypes.Velomobile, ActivityTypeGroups.CyclingGroup],
  [ActivityTypes.Rafting, ActivityTypeGroups.WaterSportsGroup],
  [ActivityTypes.WaterSkiing, ActivityTypeGroups.WaterSportsGroup],
  [ActivityTypes.WaterTubing, ActivityTypeGroups.WaterSportsGroup],
  [ActivityTypes.Wakesurfing, ActivityTypeGroups.WaterSportsGroup],
  [ActivityTypes.Grinding, ActivityTypeGroups.WaterSportsGroup],
  [ActivityTypes.SailRacing, ActivityTypeGroups.WaterSportsGroup],
  [ActivityTypes.IndoorGrinding, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.Windsurfing, ActivityTypeGroups.WaterSportsGroup],
  [ActivityTypes.Cricket, ActivityTypeGroups.TeamRacketGroup],
  [ActivityTypes.DiscGolf, ActivityTypeGroups.TeamRacketGroup],
  [ActivityTypes.FieldHockey, ActivityTypeGroups.TeamRacketGroup],
  [ActivityTypes.Lacrosse, ActivityTypeGroups.TeamRacketGroup],
  [ActivityTypes.Frisbee, ActivityTypeGroups.TeamRacketGroup],
  [ActivityTypes.Padel, ActivityTypeGroups.TeamRacketGroup],
  [ActivityTypes.Pickleball, ActivityTypeGroups.TeamRacketGroup],
  [ActivityTypes.PlatformTennis, ActivityTypeGroups.TeamRacketGroup],
  [ActivityTypes.Soccer, ActivityTypeGroups.TeamRacketGroup],
  [ActivityTypes.Volleyball, ActivityTypeGroups.TeamRacketGroup],
  [ActivityTypes.InlineSkating, ActivityTypeGroups.SkatingGroup],
  [ActivityTypes.Skating, ActivityTypeGroups.SkatingGroup],
  [ActivityTypes.Flying, ActivityTypeGroups.AerialSportsGroup],
  [ActivityTypes.HangGliding, ActivityTypeGroups.AerialSportsGroup],
  [ActivityTypes.Jumpmaster, ActivityTypeGroups.AerialSportsGroup],
  [ActivityTypes.Paragliding, ActivityTypeGroups.AerialSportsGroup],
  [ActivityTypes.SkyDiving, ActivityTypeGroups.AerialSportsGroup],
  [ActivityTypes.Boating, ActivityTypeGroups.MotorizedGroup],
  [ActivityTypes.Driving, ActivityTypeGroups.MotorizedGroup],
  [ActivityTypes.Motorcycling, ActivityTypeGroups.MotorizedGroup],
  [ActivityTypes.Motorsports, ActivityTypeGroups.MotorizedGroup],
  [ActivityTypes.Snowmobiling, ActivityTypeGroups.MotorizedGroup],
  [ActivityTypes.Splitboarding, ActivityTypeGroups.WinterSportsGroup],
  [ActivityTypes.SkiMountaineering, ActivityTypeGroups.WinterSportsGroup],
  [ActivityTypes.SkateSkiing, ActivityTypeGroups.WinterSportsGroup],
  [ActivityTypes.Wheelchair, ActivityTypeGroups.AdaptiveMobilityGroup],
  [ActivityTypes.WheelchairPushWalk, ActivityTypeGroups.AdaptiveMobilityGroup],
  [ActivityTypes.WheelchairPushRun, ActivityTypeGroups.AdaptiveMobilityGroup],
  [ActivityTypes.Chores, ActivityTypeGroups.UnspecifiedGroup]
] as const;

const intentionalUnspecifiedActivityTypes = [
  ActivityTypes.ParaSport,
  ActivityTypes.RCDroneFlying,
  ActivityTypes.Chores,
  ActivityTypes.Generic,
  ActivityTypes.Match,
  ActivityTypes.Other,
  ActivityTypes.Route,
  ActivityTypes.Tactical,
  ActivityTypes.Transition,
  ActivityTypes.UnknownSport,
  ActivityTypes.Workout,
  ActivityTypes.VideoGaming
].sort();

describe('ActivityTypes', () => {
  it.each([
    [ActivityTypes.RacketSport, [DataSpeed.type], [DataSpeedAvg.type], []],
    [ActivityTypes.UltimateDisc, [DataSpeed.type], [DataSpeedAvg.type], []],
    [ActivityTypes.ParaSport, [DataSpeed.type], [DataSpeedAvg.type], []],
    [ActivityTypes.Hockey, [DataSpeed.type], [DataSpeedAvg.type], []],
    [ActivityTypes.TeamSport, [DataSpeed.type], [DataSpeedAvg.type], []],
    [ActivityTypes.WinterSport, [DataSpeed.type], [DataSpeedAvg.type], []],
    [ActivityTypes.WaterSport, [DataSpeed.type, DataSwimPace.type], [DataSpeedAvg.type, DataSwimPaceAvg.type], []],
    [ActivityTypes.Paramotoring, [DataSpeed.type], [DataSpeedAvg.type], [DataVerticalSpeed.type]],
    [ActivityTypes.RCDroneFlying, [DataSpeed.type], [DataSpeedAvg.type], []]
  ] as const)(
    'preserves broad sport metric families without inferring a subtype for %s',
    (type, speedTypes, averageTypes, verticalTypes) => {
      expect(ActivityTypesHelper.isIndoorActivityType(type)).toBe(false);
      expect(ActivityTypesMoving.getSpeedThreshold(type)).toBe(0.3);
      expect(ActivityTypesHelper.usesStrokeRate(type)).toBe(false);
      expect(ActivityTypesHelper.speedDerivedDataTypesToUseForActivityType(type)).toEqual(speedTypes);
      expect(ActivityTypesHelper.averageSpeedDerivedDataTypesToUseForActivityType(type)).toEqual(averageTypes);
      expect(ActivityTypesHelper.verticalSpeedDerivedDataTypesToUseForActivityType(type)).toEqual(verticalTypes);
      expect(ActivityTypesHelper.altiDistanceSpeedDerivedDataTypesToUseForActivityType(type)).toEqual([]);
      expect(ActivityTypesHelper.shouldExcludeTerrainSummaryMetrics(type)).toBe(false);
      expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(value => value === type)).toEqual([type]);
      for (const [alias] of Object.entries(ActivityTypes).filter(([, value]) => value === type)) {
        expect(ActivityTypesHelper.resolveActivityType(alias)).toBe(type);
        expect(ActivityTypesHelper.resolveActivityType(alias.toUpperCase().replace(/_/g, '-'))).toBe(type);
      }
    }
  );

  beforeEach(() => {});

  it('get the correct activity group', () => {
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Running)).toBe(
      ActivityTypeGroups.RunningGroup
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Cycling)).toBe(
      ActivityTypeGroups.CyclingGroup
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.MountainBiking)).toBe(
      ActivityTypeGroups.MountainBikingGroup
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes['Enduro MTB'])).toBe(
      ActivityTypeGroups.MountainBikingGroup
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.DownhillCycling)).toBe(
      ActivityTypeGroups.MountainBikingGroup
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Crossfit)).toBe(
      ActivityTypeGroups.PerformanceGroup
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.IndoorRowing)).toBe(
      ActivityTypeGroups.IndoorSportsGroup
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Climbing)).toBe(
      ActivityTypeGroups.OutdoorAdventuresGroup
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.AlpineSkiing)).toBe(
      ActivityTypeGroups.WinterSportsGroup
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Wakeboarding)).toBe(
      ActivityTypeGroups.WaterSportsGroup
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Diving)).toBe(
      ActivityTypeGroups.DivingGroup
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Snorkeling)).toBe(
      ActivityTypeGroups.DivingGroup
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Mermaiding)).toBe(
      ActivityTypeGroups.DivingGroup
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Tennis)).toBe(
      ActivityTypeGroups.TeamRacketGroup
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.IceSkating)).toBe(
      ActivityTypeGroups.WinterSportsGroup
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Workout)).toBe(
      ActivityTypeGroups.UnspecifiedGroup
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.HIIT)).toBe(
      ActivityTypeGroups.IndoorSportsGroup
    );
  });

  it.each(proposedGroupAssignments)('assigns %s to %s', (activityType, activityGroup) => {
    expect(ActivityTypesHelper.getActivityGroupForActivityType(activityType)).toBe(activityGroup);
  });

  it('keeps only intentionally unclassified activity types unspecified', () => {
    const unspecifiedActivityTypes = ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(
      activityType =>
        ActivityTypesHelper.getActivityGroupForActivityType(activityType as ActivityTypes) ===
        ActivityTypeGroups.UnspecifiedGroup
    );

    expect(unspecifiedActivityTypes).toEqual(intentionalUnspecifiedActivityTypes);
  });

  it('exposes canonical group ids and members', () => {
    expect(ActivityTypesHelper.getActivityTypeGroupsAsUniqueArray()).toContain(ActivityTypeGroups.WaterSportsGroup);
    expect(ActivityTypeGroups.WaterSportsGroup).toBe('water_sports_group');
    expect(ActivityTypesHelper.getActivityTypesForActivityGroup(ActivityTypeGroups.WaterSportsGroup)).toContain(
      ActivityTypes.Kayaking
    );
    expect(ActivityTypesHelper.getActivityTypeGroupsAsUniqueArray()).toContain(ActivityTypeGroups.SkatingGroup);
    expect(ActivityTypeGroups.SkatingGroup).toBe('skating_group');
    expect(ActivityTypesHelper.getActivityTypesForActivityGroup(ActivityTypeGroups.SkatingGroup)).toEqual([
      ActivityTypes.Skateboarding,
      ActivityTypes.InlineSkating,
      ActivityTypes.Skating
    ]);
  });

  it.each([
    [ActivityTypes.IndoorHandCycle, true, 4 / 3.6, [DataVerticalSpeed.type]],
    [ActivityTypes.Overlanding, false, 0.3, []],
    [ActivityTypes.TruckerWorkout, true, 0.3, []],
    [ActivityTypes.IndoorWheelchairPushWalk, true, 0.3, []],
    [ActivityTypes.IndoorWheelchairPushRun, true, 0.3, []]
  ] as const)('preserves indoor and metric semantics for %s', (type, indoor, threshold, verticalTypes) => {
    expect(ActivityTypesHelper.isIndoorActivityType(type)).toBe(indoor);
    expect(ActivityTypesMoving.getSpeedThreshold(type)).toBe(threshold);
    expect(ActivityTypesHelper.usesStrokeRate(type)).toBe(false);
    expect(ActivityTypesHelper.speedDerivedDataTypesToUseForActivityType(type)).toEqual([DataSpeed.type]);
    expect(ActivityTypesHelper.averageSpeedDerivedDataTypesToUseForActivityType(type)).toEqual([DataSpeedAvg.type]);
    expect(ActivityTypesHelper.verticalSpeedDerivedDataTypesToUseForActivityType(type)).toEqual(verticalTypes);
    expect(ActivityTypesHelper.altiDistanceSpeedDerivedDataTypesToUseForActivityType(type)).toEqual([]);
    expect(ActivityTypesHelper.shouldExcludeTerrainSummaryMetrics(type)).toBe(false);
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(value => value === type)).toEqual([type]);
    for (const [alias, value] of Object.entries(ActivityTypes).filter(([, value]) => value === type)) {
      expect(ActivityTypesHelper.resolveActivityType(alias)).toBe(value);
      expect(ActivityTypesHelper.resolveActivityType(alias.toUpperCase().replace(/_/g, '-'))).toBe(value);
    }
  });

  it.each([
    [ActivityTypes.BMX, false, 4 / 3.6, [DataVerticalSpeed.type]],
    [ActivityTypes.IndoorSkiing, true, 0.3, []],
    [ActivityTypes.ATV, false, 0.3, []],
    [ActivityTypes.Motocross, false, 0.3, []],
    [ActivityTypes.PoolTriathlon, false, 0.3, [DataVerticalSpeed.type]]
  ] as const)('preserves group calculations and explicit names for %s', (type, indoor, threshold, verticalTypes) => {
    expect(ActivityTypesHelper.isIndoorActivityType(type)).toBe(indoor);
    expect(ActivityTypesMoving.getSpeedThreshold(type)).toBe(threshold);
    expect(ActivityTypesHelper.speedDerivedDataTypesToUseForActivityType(type)).toEqual([DataSpeed.type]);
    expect(ActivityTypesHelper.averageSpeedDerivedDataTypesToUseForActivityType(type)).toEqual([DataSpeedAvg.type]);
    expect(ActivityTypesHelper.verticalSpeedDerivedDataTypesToUseForActivityType(type)).toEqual(verticalTypes);
    expect(ActivityTypesHelper.altiDistanceSpeedDerivedDataTypesToUseForActivityType(type)).toEqual([]);
    expect(ActivityTypesHelper.usesStrokeRate(type)).toBe(false);
    expect(ActivityTypesHelper.shouldExcludeTerrainSummaryMetrics(type)).toBe(false);
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(value => value === type)).toEqual([type]);
    for (const [alias] of Object.entries(ActivityTypes).filter(([, value]) => value === type)) {
      expect(ActivityTypesHelper.resolveActivityType(alias)).toBe(type);
      expect(ActivityTypesHelper.resolveActivityType(alias.toUpperCase().replace(/_/g, '-'))).toBe(type);
    }
  });

  it.each([
    [ActivityTypes.EEnduroMTB, ActivityTypes.EnduroMTB],
    [ActivityTypes.TrackCycling, ActivityTypes.Cycling],
    [ActivityTypes.RecumbentCycling, ActivityTypes.Cycling],
    [ActivityTypes.SpeedWalking, ActivityTypes.Walking],
    [ActivityTypes.WhitewaterKayaking, ActivityTypes.Kayaking],
    [ActivityTypes.WhitewaterRafting, ActivityTypes.Rafting],
    [ActivityTypes.WingsuitFlying, ActivityTypes.Flying],
    [ActivityTypes.BrickTraining, ActivityTypes.Multisport],
    [ActivityTypes.HuntingWithDogs, ActivityTypes.Hunting]
  ] as const)('preserves the existing %s metric semantics from %s', (type, parent) => {
    expect(type).not.toBe(parent);
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(value => value === type)).toEqual([type]);
    expect(ActivityTypesHelper.isIndoorActivityType(type)).toBe(false);
    expect(ActivityTypesMoving.getSpeedThreshold(type)).toBe(ActivityTypesMoving.getSpeedThreshold(parent));
    for (const getter of [
      'speedDerivedDataTypesToUseForActivityType',
      'averageSpeedDerivedDataTypesToUseForActivityType',
      'verticalSpeedDerivedDataTypesToUseForActivityType',
      'altiDistanceSpeedDerivedDataTypesToUseForActivityType',
      'usesStrokeRate',
      'shouldExcludeAscent',
      'shouldExcludeDescent',
      'shouldExcludeTerrainSummaryMetrics'
    ] as const) {
      expect(ActivityTypesHelper[getter](type)).toEqual(ActivityTypesHelper[getter](parent));
    }
    for (const [alias] of Object.entries(ActivityTypes).filter(([, value]) => value === type)) {
      expect(ActivityTypesHelper.resolveActivityType(alias)).toBe(type);
      expect(ActivityTypesHelper.resolveActivityType(alias.toUpperCase().replace(/_/g, '-'))).toBe(type);
    }
  });

  it.each([
    'Indoor Track',
    'IndoorTrack',
    'indoor_track',
    'Indoor Track Running',
    'IndoorTrackRunning',
    'INDOOR-TRACK-RUNNING'
  ])('preserves %s as Indoor Track Running', name => {
    expect(ActivityTypesHelper.resolveActivityType(name)).toBe(ActivityTypes.IndoorTrackRunning);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.IndoorTrackRunning)).toBe(true);
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray()).toContain('Indoor Track Running');
  });

  it('keeps whitewater parents and ambiguous names separate', () => {
    expect(ActivityTypes.WhitewaterKayaking).not.toBe(ActivityTypes.WhitewaterRafting);
    expect(ActivityTypes.EEnduroMTB).not.toBe(ActivityTypes.EMountainBiking);
    expect(ActivityTypesHelper.resolveActivityType('whitewater')).toBeNull();
    expect(ActivityTypesHelper.resolveActivityType('Enduro')).toBeNull();
    expect(ActivityTypesHelper.resolveActivityType('Race Walking')).toBeNull();
  });

  it('keeps BMX, indoor skiing, ATV, motocross, and pool triathlon separate from broad types', () => {
    expect(
      new Set([
        ActivityTypes.BMX,
        ActivityTypes.Cycling,
        ActivityTypes.IndoorSkiing,
        ActivityTypes.FitnessEquipment,
        ActivityTypes.CrosscountrySkiing,
        ActivityTypes.ATV,
        ActivityTypes.Motocross,
        ActivityTypes.Motorcycling,
        ActivityTypes.PoolTriathlon,
        ActivityTypes.Triathlon,
        ActivityTypes.Multisport,
        ActivityTypes.Swimming
      ]).size
    ).toBe(12);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.CrosscountrySkiing)).toBe(false);
    expect(ActivityTypesHelper.resolveActivityType('Quad')).toBeNull();
    expect(ActivityTypesHelper.resolveActivityType('MX')).toBeNull();
  });

  it.each([
    [ActivityTypes.Walking, false],
    [ActivityTypes.IndoorWalking, true],
    [ActivityTypes.NordicWalking, false]
  ] as const)('preserves walking metrics and the independent indoor hint for %s', (type, indoor) => {
    expect(ActivityTypesHelper.getActivityGroupForActivityType(type)).toBe(ActivityTypeGroups.WalkingGroup);
    expect(ActivityTypesHelper.isIndoorActivityType(type)).toBe(indoor);
    expect(ActivityTypesMoving.getSpeedThreshold(type)).toBe(0.3);
    expect(ActivityTypesHelper.speedDerivedDataTypesToUseForActivityType(type)).toEqual([
      DataPace.type,
      DataSpeed.type
    ]);
    expect(ActivityTypesHelper.averageSpeedDerivedDataTypesToUseForActivityType(type)).toEqual([
      DataPaceAvg.type,
      DataSpeedAvg.type
    ]);
    expect(ActivityTypesHelper.verticalSpeedDerivedDataTypesToUseForActivityType(type)).toEqual([
      DataVerticalSpeed.type
    ]);
    expect(ActivityTypesHelper.altiDistanceSpeedDerivedDataTypesToUseForActivityType(type)).toEqual([]);
  });

  it.each([ActivityTypes.ObstacleRacing, ActivityTypes.UltraRunning])('inherits running calculations for %s', type => {
    expect(ActivityTypesHelper.isIndoorActivityType(type)).toBe(false);
    expect(ActivityTypesMoving.getSpeedThreshold(type)).toBe(1.5 / 3.6);
    expect(ActivityTypesHelper.speedDerivedDataTypesToUseForActivityType(type)).toEqual([
      DataPace.type,
      DataSpeed.type
    ]);
    expect(ActivityTypesHelper.averageSpeedDerivedDataTypesToUseForActivityType(type)).toEqual([
      DataPaceAvg.type,
      DataGradeAdjustedPaceAvg.type
    ]);
    expect(ActivityTypesHelper.verticalSpeedDerivedDataTypesToUseForActivityType(type)).toEqual([
      DataVerticalSpeed.type
    ]);
    expect(ActivityTypesHelper.altiDistanceSpeedDerivedDataTypesToUseForActivityType(type)).toEqual([
      DataGradeAdjustedPace.type
    ]);
  });

  it.each([
    ActivityTypes.ObstacleRacing,
    ActivityTypes.UltraRunning,
    ActivityTypes.IndoorWalking,
    ActivityTypes.EnduroMTB,
    ActivityTypes.Rally
  ])('resolves every explicit alias of %s once', type => {
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(value => value === type)).toEqual([type]);
    for (const [alias] of Object.entries(ActivityTypes).filter(([, value]) => value === type)) {
      expect(ActivityTypesHelper.resolveActivityType(alias)).toBe(type);
      expect(ActivityTypesHelper.resolveActivityType(alias.toUpperCase().replace(/_/g, '-'))).toBe(type);
    }
  });

  it('keeps ambiguous Enduro names and neighboring activity families separate', () => {
    expect(ActivityTypesHelper.resolveActivityType('Enduro')).toBeNull();
    expect(ActivityTypesHelper.resolveActivityType('Ultra')).toBeNull();
    expect(ActivityTypesHelper.resolveActivityType('Obstacle')).toBeNull();
    expect(ActivityTypesHelper.resolveActivityType('walking_indoor')).toBe(ActivityTypes.IndoorWalking);
    expect(ActivityTypesHelper.resolveActivityType('walking_indoor_walking')).toBe(ActivityTypes.IndoorWalking);
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Hiking)).toBe(
      ActivityTypeGroups.OutdoorAdventuresGroup
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Rucking)).toBe(
      ActivityTypeGroups.OutdoorAdventuresGroup
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.EnduroMTB)).toBe(
      ActivityTypeGroups.MountainBikingGroup
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Motorcycling)).toBe(
      ActivityTypeGroups.MotorizedGroup
    );
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.Rally)).toBe(false);
    expect(ActivityTypesHelper.speedDerivedDataTypesToUseForActivityType(ActivityTypes.Rally)).toEqual([
      DataSpeed.type
    ]);
    expect(ActivityTypesHelper.verticalSpeedDerivedDataTypesToUseForActivityType(ActivityTypes.Rally)).toEqual([]);
  });

  it('keeps the five new classifications distinct from broader and neighboring types', () => {
    expect(
      new Set([
        ActivityTypes.IndoorHandCycle,
        ActivityTypes.Handcycle,
        ActivityTypes.IndoorCycling,
        ActivityTypes.Cycling,
        ActivityTypes.Overlanding,
        ActivityTypes.Driving,
        ActivityTypes.Motorcycling,
        ActivityTypes.Motorsports,
        ActivityTypes.TruckerWorkout,
        ActivityTypes.Training,
        ActivityTypes.FitnessEquipment,
        ActivityTypes.IndoorWheelchairPushWalk,
        ActivityTypes.WheelchairPushWalk,
        ActivityTypes.IndoorWheelchairPushRun,
        ActivityTypes.WheelchairPushRun,
        ActivityTypes.Wheelchair
      ]).size
    ).toBe(16);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.Handcycle)).toBe(false);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.WheelchairPushWalk)).toBe(false);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.WheelchairPushRun)).toBe(false);
    expect(ActivityTypesHelper.resolveActivityType('Indoor Push')).toBeNull();
    expect(ActivityTypesHelper.resolveActivityType('Truck Driving')).toBeNull();
  });

  it('should identify indoor activity types across indoor labels and indoor-group members', () => {
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.IndoorCycling)).toBe(true);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.IndoorRunning)).toBe(true);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.IndoorTraining)).toBe(true);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.IndoorClimbing)).toBe(true);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.Yoga)).toBe(true);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.Meditation)).toBe(true);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.Treadmill)).toBe(true);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.FitnessEquipment)).toBe(true);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.Cycling)).toBe(false);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.Running)).toBe(false);
  });

  it('applies the agreed family-specific metric behavior', () => {
    expect(ActivityTypesHelper.verticalSpeedDerivedDataTypesToUseForActivityType(ActivityTypes.Flying)).toEqual([
      DataVerticalSpeed.type
    ]);
    expect(ActivityTypesHelper.speedDerivedDataTypesToUseForActivityType(ActivityTypes.Flying)).toEqual([
      DataSpeed.type
    ]);
    expect(ActivityTypesHelper.averageSpeedDerivedDataTypesToUseForActivityType(ActivityTypes.Flying)).toEqual([
      DataSpeedAvg.type
    ]);
    expect(ActivityTypesHelper.altiDistanceSpeedDerivedDataTypesToUseForActivityType(ActivityTypes.Flying)).toEqual([]);
    expect(ActivityTypesHelper.shouldExcludeTerrainSummaryMetrics(ActivityTypes.Flying)).toBe(false);

    [
      ActivityTypes.InlineSkating,
      ActivityTypes.Skating,
      ActivityTypes.Flying,
      ActivityTypes.Driving,
      ActivityTypes.Lacrosse,
      ActivityTypes.Wheelchair,
      ActivityTypes.WheelchairPushWalk,
      ActivityTypes.WheelchairPushRun
    ].forEach(activityType => {
      expect(ActivityTypesMoving.getSpeedThreshold(activityType)).toBe(0.3);
    });

    [
      ActivityTypes.InlineSkating,
      ActivityTypes.Driving,
      ActivityTypes.Lacrosse,
      ActivityTypes.Wheelchair,
      ActivityTypes.WheelchairPushWalk,
      ActivityTypes.WheelchairPushRun
    ].forEach(activityType => {
      expect(ActivityTypesHelper.speedDerivedDataTypesToUseForActivityType(activityType)).toEqual([DataSpeed.type]);
      expect(ActivityTypesHelper.averageSpeedDerivedDataTypesToUseForActivityType(activityType)).toEqual([
        DataSpeedAvg.type
      ]);
      expect(ActivityTypesHelper.verticalSpeedDerivedDataTypesToUseForActivityType(activityType)).toEqual([]);
      expect(ActivityTypesHelper.altiDistanceSpeedDerivedDataTypesToUseForActivityType(activityType)).toEqual([]);
    });
  });

  it('should map alpine_skiing_downhill to AlpineSkiing', () => {
    // @ts-ignore
    expect(ActivityTypes.alpine_skiing_downhill as ActivityTypes).toBe(ActivityTypes.AlpineSkiing);
  });

  it('should resolve HIIT aliases to canonical HIIT', () => {
    expect(ActivityTypes.hiit).toBe(ActivityTypes.HIIT);
    expect(ActivityTypesHelper.resolveActivityType('HIIT')).toBe(ActivityTypes.HIIT);
  });

  it.each(['Meditation', 'meditation', 'breathing', 'generic_breathing', 'GENERIC-BREATHING'])(
    'resolves %s to canonical Meditation',
    value => {
      expect(ActivityTypesHelper.resolveActivityType(value)).toBe(ActivityTypes.Meditation);
    }
  );

  it('exposes Meditation once in the canonical catalog and Indoor Sports group', () => {
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(type => type === 'Meditation')).toEqual([
      ActivityTypes.Meditation
    ]);
    expect(ActivityTypesHelper.getActivityTypesForActivityGroup(ActivityTypeGroups.IndoorSportsGroup)).toContain(
      ActivityTypes.Meditation
    );
  });

  it.each(['Padel', 'padel', 'racket_padel', 'RACKET-PADEL'])('resolves %s to canonical Padel', value => {
    expect(ActivityTypesHelper.resolveActivityType(value)).toBe(ActivityTypes.Padel);
  });

  it('exposes Padel once in the canonical catalog and Team/Racket group', () => {
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(type => type === 'Padel')).toEqual([
      ActivityTypes.Padel
    ]);
    expect(
      ActivityTypesHelper.getActivityTypesForActivityGroup(ActivityTypeGroups.TeamRacketGroup).filter(
        type => type === ActivityTypes.Padel
      )
    ).toEqual([ActivityTypes.Padel]);
  });

  it.each([
    ['Dance', ActivityTypes.Dancing],
    [' dance ', ActivityTypes.Dancing],
    ['DANCING', ActivityTypes.Dancing],
    ['Jump Rope', ActivityTypes.JumpRope],
    ['JumpRope', ActivityTypes.JumpRope],
    ['jumpRope', ActivityTypes.JumpRope],
    ['jump_rope', ActivityTypes.JumpRope],
    ['JUMP-ROPE', ActivityTypes.JumpRope],
    ['Pickleball', ActivityTypes.Pickleball],
    ['PICKLEBALL', ActivityTypes.Pickleball],
    ['racket_pickleball', ActivityTypes.Pickleball],
    ['RACKET-PICKLEBALL', ActivityTypes.Pickleball]
  ])('resolves explicit %s to %s', (value, expectedType) => {
    expect(ActivityTypesHelper.resolveActivityType(value)).toBe(expectedType);
  });

  it.each([
    [ActivityTypes.Dancing, ActivityTypeGroups.IndoorSportsGroup, true],
    [ActivityTypes.JumpRope, ActivityTypeGroups.IndoorSportsGroup, true],
    [ActivityTypes.Pickleball, ActivityTypeGroups.TeamRacketGroup, false]
  ] as const)('exposes %s once in %s with indoor hint %s', (type, group, indoor) => {
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(value => value === type)).toEqual([type]);
    expect(ActivityTypesHelper.getActivityTypesForActivityGroup(group).filter(value => value === type)).toEqual([type]);
    expect(ActivityTypesHelper.isIndoorActivityType(type)).toBe(indoor);
    expect(ActivityTypesMoving.getSpeedThreshold(type)).toBe(0.3);
    expect(ActivityTypesHelper.usesStrokeRate(type)).toBe(false);
    expect(ActivityTypesHelper.speedDerivedDataTypesToUseForActivityType(type)).toEqual([DataSpeed.type]);
    expect(ActivityTypesHelper.averageSpeedDerivedDataTypesToUseForActivityType(type)).toEqual([DataSpeedAvg.type]);
    expect(ActivityTypesHelper.verticalSpeedDerivedDataTypesToUseForActivityType(type)).toEqual([]);
    expect(ActivityTypesHelper.altiDistanceSpeedDerivedDataTypesToUseForActivityType(type)).toEqual([]);
    expect(ActivityTypesHelper.shouldExcludeTerrainSummaryMetrics(type)).toBe(false);
  });

  it('keeps Pickleball distinct from other racket sports and adds no second Dance type', () => {
    expect(ActivityTypes.Pickleball).not.toBe(ActivityTypes.RacquetBall);
    expect(ActivityTypes.Pickleball).not.toBe(ActivityTypes.Padel);
    expect(ActivityTypes.Pickleball).not.toBe(ActivityTypes.Tennis);
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray()).not.toContain('Dance');
    expect(ActivityTypesHelper.resolveActivityType('rope')).toBeNull();
    expect(ActivityTypesHelper.resolveActivityType('jump')).toBeNull();
  });

  it.each([
    ['Shooting', ActivityTypes.Shooting],
    [' SHOOTING ', ActivityTypes.Shooting],
    ['Geocaching', ActivityTypes.Geocaching],
    [' GEOCACHING ', ActivityTypes.Geocaching],
    ['Platform Tennis', ActivityTypes.PlatformTennis],
    ['PlatformTennis', ActivityTypes.PlatformTennis],
    ['platformTennis', ActivityTypes.PlatformTennis],
    ['platform_tennis', ActivityTypes.PlatformTennis],
    ['PLATFORM-TENNIS', ActivityTypes.PlatformTennis],
    ['racket_platform', ActivityTypes.PlatformTennis],
    ['RACKET-PLATFORM', ActivityTypes.PlatformTennis]
  ])('resolves explicit %s to %s', (value, expectedType) => {
    expect(ActivityTypesHelper.resolveActivityType(value)).toBe(expectedType);
  });

  it.each([
    [ActivityTypes.Shooting, ActivityTypeGroups.OutdoorAdventuresGroup],
    [ActivityTypes.Geocaching, ActivityTypeGroups.OutdoorAdventuresGroup],
    [ActivityTypes.PlatformTennis, ActivityTypeGroups.TeamRacketGroup]
  ] as const)('exposes %s once in %s with the existing group behavior', (type, group) => {
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(value => value === type)).toEqual([type]);
    expect(ActivityTypesHelper.getActivityTypesForActivityGroup(group).filter(value => value === type)).toEqual([type]);
    expect(ActivityTypesHelper.isIndoorActivityType(type)).toBe(false);
    expect(ActivityTypesMoving.getSpeedThreshold(type)).toBe(0.3);
    expect(ActivityTypesHelper.usesStrokeRate(type)).toBe(false);
    expect(ActivityTypesHelper.altiDistanceSpeedDerivedDataTypesToUseForActivityType(type)).toEqual([]);
    expect(ActivityTypesHelper.shouldExcludeAscent(type)).toBe(false);
    expect(ActivityTypesHelper.shouldExcludeDescent(type)).toBe(false);
    expect(ActivityTypesHelper.shouldExcludeTerrainSummaryMetrics(type)).toBe(false);
  });

  it.each([ActivityTypes.Shooting, ActivityTypes.Geocaching])('gives %s Outdoor Adventures metric families', type => {
    expect(ActivityTypesHelper.speedDerivedDataTypesToUseForActivityType(type)).toEqual([
      DataPace.type,
      DataSpeed.type
    ]);
    expect(ActivityTypesHelper.averageSpeedDerivedDataTypesToUseForActivityType(type)).toEqual([
      DataPaceAvg.type,
      DataSpeedAvg.type
    ]);
    expect(ActivityTypesHelper.verticalSpeedDerivedDataTypesToUseForActivityType(type)).toEqual([
      DataVerticalSpeed.type
    ]);
  });

  it('keeps Platform Tennis distinct with Team/Racket metric families', () => {
    expect(ActivityTypes.PlatformTennis).not.toBe(ActivityTypes.Tennis);
    expect(ActivityTypes.PlatformTennis).not.toBe(ActivityTypes.RacquetBall);
    expect(ActivityTypes.PlatformTennis).not.toBe(ActivityTypes.Padel);
    expect(ActivityTypes.PlatformTennis).not.toBe(ActivityTypes.Pickleball);
    expect(ActivityTypes.Shooting).not.toBe(ActivityTypes.Archery);
    expect(ActivityTypes.Shooting).not.toBe(ActivityTypes.Hunting);
    expect(ActivityTypes.Geocaching).not.toBe(ActivityTypes.Hiking);
    expect(ActivityTypes.Geocaching).not.toBe(ActivityTypes.Walking);
    expect(ActivityTypesHelper.speedDerivedDataTypesToUseForActivityType(ActivityTypes.PlatformTennis)).toEqual([
      DataSpeed.type
    ]);
    expect(ActivityTypesHelper.averageSpeedDerivedDataTypesToUseForActivityType(ActivityTypes.PlatformTennis)).toEqual([
      DataSpeedAvg.type
    ]);
    expect(ActivityTypesHelper.verticalSpeedDerivedDataTypesToUseForActivityType(ActivityTypes.PlatformTennis)).toEqual(
      []
    );
    expect(ActivityTypesHelper.resolveActivityType('platform')).toBeNull();
  });

  it.each([
    ['Pool Apnea', ActivityTypes.PoolApnea],
    ['PoolApnea', ActivityTypes.PoolApnea],
    ['pool_apnea', ActivityTypes.PoolApnea],
    [' POOL-APNEA ', ActivityTypes.PoolApnea],
    ['Mobility', ActivityTypes.Mobility],
    [' MOBILITY ', ActivityTypes.Mobility],
    ['Video Gaming', ActivityTypes.VideoGaming],
    ['videoGaming', ActivityTypes.VideoGaming],
    ['video_gaming', ActivityTypes.VideoGaming],
    [' VIDEO-GAMING ', ActivityTypes.VideoGaming],
    ['Gaming', ActivityTypes.VideoGaming]
  ])('resolves explicit %s to %s', (value, expectedType) => {
    expect(ActivityTypesHelper.resolveActivityType(value)).toBe(expectedType);
  });

  it.each([
    [ActivityTypes.PoolApnea, ActivityTypeGroups.DivingGroup, false, true],
    [ActivityTypes.Mobility, ActivityTypeGroups.IndoorSportsGroup, true, false],
    [ActivityTypes.VideoGaming, ActivityTypeGroups.UnspecifiedGroup, false, false]
  ] as const)('exposes %s once with its group semantics', (type, group, indoor, excludesTerrain) => {
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(value => value === type)).toEqual([type]);
    expect(ActivityTypesHelper.getActivityTypesForActivityGroup(group).filter(value => value === type)).toEqual([type]);
    expect(ActivityTypesHelper.isIndoorActivityType(type)).toBe(indoor);
    expect(ActivityTypesMoving.getSpeedThreshold(type)).toBe(0.3);
    expect(ActivityTypesHelper.usesStrokeRate(type)).toBe(false);
    expect(ActivityTypesHelper.speedDerivedDataTypesToUseForActivityType(type)).toEqual([DataSpeed.type]);
    expect(ActivityTypesHelper.averageSpeedDerivedDataTypesToUseForActivityType(type)).toEqual([DataSpeedAvg.type]);
    expect(ActivityTypesHelper.verticalSpeedDerivedDataTypesToUseForActivityType(type)).toEqual([]);
    expect(ActivityTypesHelper.altiDistanceSpeedDerivedDataTypesToUseForActivityType(type)).toEqual([]);
    expect(ActivityTypesHelper.shouldExcludeAscent(type)).toBe(excludesTerrain);
    expect(ActivityTypesHelper.shouldExcludeDescent(type)).toBe(excludesTerrain);
    expect(ActivityTypesHelper.shouldExcludeTerrainSummaryMetrics(type)).toBe(excludesTerrain);
  });

  it('keeps the new activities distinct without broad apnea or esport aliases', () => {
    expect(ActivityTypes.PoolApnea).not.toBe(ActivityTypes.FreeDiving);
    expect(ActivityTypes.Mobility).not.toBe(ActivityTypes.FlexibilityTraining);
    expect(ActivityTypes.Mobility).not.toBe(ActivityTypes.Stretching);
    expect(ActivityTypesHelper.resolveActivityType('apnea')).toBeNull();
    expect(ActivityTypesHelper.resolveActivityType('esport')).toBeNull();
    expect(ActivityTypesHelper.resolveActivityType('MOBILITY_DYNAMIC', 'polar')).toBe(ActivityTypes.DynamicMobility);
    expect(ActivityTypesHelper.resolveActivityType('MOBILITY_STATIC', 'polar')).toBe(ActivityTypes.StaticMobility);
  });

  it.each([
    ['Grinding', ActivityTypes.Grinding],
    [' GRINDING ', ActivityTypes.Grinding],
    ['Grind Offshore', ActivityTypes.Grinding],
    ['Offshore Sail Grinding', ActivityTypes.Grinding],
    ['Indoor Grinding', ActivityTypes.IndoorGrinding],
    ['indoorGrinding', ActivityTypes.IndoorGrinding],
    ['indoor_grinding', ActivityTypes.IndoorGrinding],
    ['grinding_indoor_grinding', ActivityTypes.IndoorGrinding],
    ['Grind Onshore', ActivityTypes.IndoorGrinding],
    ['Onshore Sail Grinding', ActivityTypes.IndoorGrinding],
    ['Sail Racing', ActivityTypes.SailRacing],
    ['SailRacing', ActivityTypes.SailRacing],
    ['sail_racing', ActivityTypes.SailRacing],
    ['Sail Race', ActivityTypes.SailRacing],
    ['sailRace', ActivityTypes.SailRacing],
    ['sail_race', ActivityTypes.SailRacing],
    ['SAILING-SAIL-RACE', ActivityTypes.SailRacing]
  ])('resolves explicit sailing activity %s to %s', (name, expectedType) => {
    expect(ActivityTypesHelper.resolveActivityType(name)).toBe(expectedType);
  });

  it.each([
    [ActivityTypes.Grinding, ActivityTypeGroups.WaterSportsGroup, false],
    [ActivityTypes.SailRacing, ActivityTypeGroups.WaterSportsGroup, false],
    [ActivityTypes.IndoorGrinding, ActivityTypeGroups.IndoorSportsGroup, true]
  ] as const)('exposes %s once with its sailing or indoor group behavior', (type, group, indoor) => {
    expect(ActivityTypesHelper.getActivityGroupForActivityType(type)).toBe(group);
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(value => value === type)).toEqual([type]);
    expect(ActivityTypesHelper.getActivityTypesForActivityGroup(group).filter(value => value === type)).toEqual([type]);
    expect(ActivityTypesHelper.isIndoorActivityType(type)).toBe(indoor);
    expect(ActivityTypesMoving.getSpeedThreshold(type)).toBe(0.3);
    expect(ActivityTypesHelper.usesStrokeRate(type)).toBe(false);
    expect(ActivityTypesHelper.verticalSpeedDerivedDataTypesToUseForActivityType(type)).toEqual([]);
    expect(ActivityTypesHelper.altiDistanceSpeedDerivedDataTypesToUseForActivityType(type)).toEqual([]);
    expect(ActivityTypesHelper.shouldExcludeTerrainSummaryMetrics(type)).toBe(false);
    expect(ActivityTypesHelper.shouldExcludeAscent(type)).toBe(!indoor);
    expect(ActivityTypesHelper.shouldExcludeDescent(type)).toBe(!indoor);
    expect(ActivityTypesHelper.speedDerivedDataTypesToUseForActivityType(type)).toEqual(
      indoor ? [DataSpeed.type] : [DataSpeed.type, DataSwimPace.type]
    );
    expect(ActivityTypesHelper.averageSpeedDerivedDataTypesToUseForActivityType(type)).toEqual(
      indoor ? [DataSpeedAvg.type] : [DataSpeedAvg.type, DataSwimPaceAvg.type]
    );
  });

  it('keeps Grinding, Indoor Grinding, and Sail Racing separate from each other and Sailing', () => {
    expect(
      new Set([ActivityTypes.Grinding, ActivityTypes.IndoorGrinding, ActivityTypes.SailRacing, ActivityTypes.Sailing])
        .size
    ).toBe(4);
    expect(ActivityTypesHelper.resolveActivityType('grind')).toBeNull();
    expect(ActivityTypesHelper.resolveActivityType('onshore')).toBeNull();
    expect(ActivityTypesHelper.resolveActivityType('offshore')).toBeNull();
    expect(ActivityTypesHelper.resolveActivityType('race')).toBeNull();
  });

  it.each([
    [' RUCKING ', ActivityTypes.Rucking],
    ['hiking_rucking', ActivityTypes.Rucking],
    ['Sailing Expedition', ActivityTypes.SailingExpedition],
    ['SailingExpedition', ActivityTypes.SailingExpedition],
    ['sailing_expedition', ActivityTypes.SailingExpedition],
    ['Sail Expedition', ActivityTypes.SailingExpedition],
    ['sailExpedition', ActivityTypes.SailingExpedition],
    ['SAIL-EXPEDITION', ActivityTypes.SailingExpedition],
    ['CCR Diving', ActivityTypes.CCRDiving],
    ['CCRDiving', ActivityTypes.CCRDiving],
    ['ccrDiving', ActivityTypes.CCRDiving],
    ['ccr_diving', ActivityTypes.CCRDiving],
    ['diving_ccr_diving', ActivityTypes.CCRDiving],
    [' CCR ', ActivityTypes.CCRDiving]
  ])('resolves explicit %s to its distinct canonical type %s', (name, expectedType) => {
    expect(ActivityTypesHelper.resolveActivityType(name)).toBe(expectedType);
  });

  it.each([
    [ActivityTypes.Rucking, ActivityTypeGroups.OutdoorAdventuresGroup, false],
    [ActivityTypes.SailingExpedition, ActivityTypeGroups.WaterSportsGroup, true],
    [ActivityTypes.CCRDiving, ActivityTypeGroups.DivingGroup, true]
  ] as const)('exposes %s once with the appropriate group and elevation behavior', (type, group, excludesElevation) => {
    expect(ActivityTypesHelper.getActivityGroupForActivityType(type)).toBe(group);
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(value => value === type)).toEqual([type]);
    expect(ActivityTypesHelper.getActivityTypesForActivityGroup(group).filter(value => value === type)).toEqual([type]);
    expect(ActivityTypesHelper.isIndoorActivityType(type)).toBe(false);
    expect(ActivityTypesMoving.getSpeedThreshold(type)).toBe(0.3);
    expect(ActivityTypesHelper.usesStrokeRate(type)).toBe(false);
    expect(ActivityTypesHelper.shouldExcludeAscent(type)).toBe(excludesElevation);
    expect(ActivityTypesHelper.shouldExcludeDescent(type)).toBe(excludesElevation);
    expect(ActivityTypesHelper.shouldExcludeTerrainSummaryMetrics(type)).toBe(type === ActivityTypes.CCRDiving);
    expect(ActivityTypesHelper.altiDistanceSpeedDerivedDataTypesToUseForActivityType(type)).toEqual([]);
  });

  it('retains the existing metric families for Rucking, Sailing Expedition, and CCR Diving', () => {
    expect(ActivityTypesHelper.speedDerivedDataTypesToUseForActivityType(ActivityTypes.Rucking)).toEqual([
      DataPace.type,
      DataSpeed.type
    ]);
    expect(ActivityTypesHelper.averageSpeedDerivedDataTypesToUseForActivityType(ActivityTypes.Rucking)).toEqual([
      DataPaceAvg.type,
      DataSpeedAvg.type
    ]);
    expect(ActivityTypesHelper.verticalSpeedDerivedDataTypesToUseForActivityType(ActivityTypes.Rucking)).toEqual([
      DataVerticalSpeed.type
    ]);
    expect(ActivityTypesHelper.speedDerivedDataTypesToUseForActivityType(ActivityTypes.SailingExpedition)).toEqual([
      DataSpeed.type,
      DataSwimPace.type
    ]);
    expect(
      ActivityTypesHelper.averageSpeedDerivedDataTypesToUseForActivityType(ActivityTypes.SailingExpedition)
    ).toEqual([DataSpeedAvg.type, DataSwimPaceAvg.type]);
    expect(
      ActivityTypesHelper.verticalSpeedDerivedDataTypesToUseForActivityType(ActivityTypes.SailingExpedition)
    ).toEqual([]);
    expect(ActivityTypesHelper.speedDerivedDataTypesToUseForActivityType(ActivityTypes.CCRDiving)).toEqual([
      DataSpeed.type
    ]);
    expect(ActivityTypesHelper.averageSpeedDerivedDataTypesToUseForActivityType(ActivityTypes.CCRDiving)).toEqual([
      DataSpeedAvg.type
    ]);
    expect(ActivityTypesHelper.verticalSpeedDerivedDataTypesToUseForActivityType(ActivityTypes.CCRDiving)).toEqual([]);
  });

  it('preserves separate Hiking, Sailing, and diving types without broad aliases', () => {
    expect(ActivityTypes.Rucking).not.toBe(ActivityTypes.Hiking);
    expect(ActivityTypes.Rucking).not.toBe(ActivityTypes.Walking);
    expect(ActivityTypes.SailingExpedition).not.toBe(ActivityTypes.Sailing);
    expect(ActivityTypes.SailingExpedition).not.toBe(ActivityTypes.SailRacing);
    expect(ActivityTypes.CCRDiving).not.toBe(ActivityTypes.Diving);
    expect(ActivityTypes.CCRDiving).not.toBe(ActivityTypes.ScubaDiving);
    expect(ActivityTypes.CCRDiving).not.toBe(ActivityTypes.FreeDiving);
    expect(ActivityTypesHelper.resolveActivityType('ruck')).toBeNull();
    expect(ActivityTypesHelper.resolveActivityType('expedition')).toBe(ActivityTypes.Expedition);
    expect(ActivityTypesHelper.resolveActivityType('rebreather')).toBeNull();
  });

  it.each(['Hand Cycle', 'Handcycle', 'cycling_hand_cycling', 'CYCLING-HAND-CYCLING'])(
    'resolves %s to canonical Hand Cycle',
    value => {
      expect(ActivityTypesHelper.resolveActivityType(value)).toBe(ActivityTypes.Handcycle);
    }
  );

  it.each([
    'Field Hockey',
    'FieldHockey',
    'field_hockey',
    'FIELD_HOCKEY',
    'FIELD-HOCKEY',
    'hockey_field',
    'HOCKEY-FIELD'
  ])('resolves %s to canonical Field Hockey', value => {
    expect(ActivityTypesHelper.resolveActivityType(value)).toBe(ActivityTypes.FieldHockey);
  });

  it.each(['Ice Hockey', 'IceHockey', 'ice_hockey', 'hockey_ice', 'HOCKEY-ICE'])(
    'resolves %s to canonical Ice Hockey',
    value => {
      expect(ActivityTypesHelper.resolveActivityType(value)).toBe(ActivityTypes.IceHockey);
    }
  );

  it('keeps Ice Hockey unique in Team/Racket while keeping broad Hockey distinct and ice without a standalone alias', () => {
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(type => type === 'Ice Hockey')).toEqual([
      ActivityTypes.IceHockey
    ]);
    expect(
      ActivityTypesHelper.getActivityTypesForActivityGroup(ActivityTypeGroups.TeamRacketGroup).filter(
        type => type === ActivityTypes.IceHockey
      )
    ).toEqual([ActivityTypes.IceHockey]);
    expect(ActivityTypesHelper.resolveActivityType('hockey')).toBe(ActivityTypes.Hockey);
    expect(ActivityTypesHelper.resolveActivityType('ice')).toBeNull();
    expect(ActivityTypes.IceHockey).not.toBe(ActivityTypes.FieldHockey);
    expect(ActivityTypes.IceHockey).not.toBe(ActivityTypes.IceSkating);
  });

  it.each(['Chores', 'chores', 'CHORES'])('resolves %s to canonical Chores', value => {
    expect(ActivityTypesHelper.resolveActivityType(value)).toBe(ActivityTypes.Chores);
  });

  it('retains the existing Track and Field catalog value and Performance group', () => {
    expect(ActivityTypesHelper.resolveActivityType('Track and Field')).toBe(ActivityTypes.TrackAndField);
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(type => type === 'Track and Field')).toEqual([
      ActivityTypes.TrackAndField
    ]);
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.TrackAndField)).toBe(
      ActivityTypeGroups.PerformanceGroup
    );
    expect(ActivityTypesHelper.resolveActivityType('running_track')).toBe(ActivityTypes.Running);
  });

  it.each(['Track Running', 'TrackRunning', 'track_running', 'Track Run', 'TrackRun', 'track_run', 'TRACK-RUN'])(
    'resolves %s to canonical Track Running',
    value => {
      expect(ActivityTypesHelper.resolveActivityType(value)).toBe(ActivityTypes.TrackRunning);
    }
  );

  it('exposes Track Running once in Running and keeps ambiguous track aliases unchanged', () => {
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(type => type === 'Track Running')).toEqual([
      ActivityTypes.TrackRunning
    ]);
    expect(
      ActivityTypesHelper.getActivityTypesForActivityGroup(ActivityTypeGroups.RunningGroup).filter(
        type => type === ActivityTypes.TrackRunning
      )
    ).toEqual([ActivityTypes.TrackRunning]);
    expect(ActivityTypesHelper.averageSpeedDerivedDataTypesToUseForActivityType(ActivityTypes.TrackRunning)).toEqual(
      ActivityTypesHelper.averageSpeedDerivedDataTypesToUseForActivityType(ActivityTypes.Running)
    );
    expect(ActivityTypesMoving.getSpeedThreshold(ActivityTypes.TrackRunning)).toBe(
      ActivityTypesMoving.getSpeedThreshold(ActivityTypes.Running)
    );
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.TrackRunning)).toBe(false);
    expect(ActivityTypesHelper.resolveActivityType('running_track')).toBe(ActivityTypes.Running);
    expect(ActivityTypesHelper.resolveActivityType('track')).toBeNull();
    expect(ActivityTypes.TrackRunning).not.toBe(ActivityTypes.TrackAndField);
  });

  it('exposes Chores once under Unspecified while retaining the generic exercise alias', () => {
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(type => type === 'Chores')).toEqual([
      ActivityTypes.Chores
    ]);
    expect(ActivityTypesHelper.getActivityTypesForActivityGroup(ActivityTypeGroups.UnspecifiedGroup)).toEqual([
      ActivityTypes.ParaSport,
      ActivityTypes.Chores,
      ActivityTypes.VideoGaming,
      ActivityTypes.RCDroneFlying
    ]);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.Chores)).toBe(false);
    expect(ActivityTypesMoving.getSpeedThreshold(ActivityTypes.Chores)).toBe(
      ActivityTypesMoving.getSpeedThreshold(ActivityTypes.Generic)
    );
    expect(ActivityTypesHelper.resolveActivityType('generic_exercise')).toBe(ActivityTypes.Generic);
    expect(ActivityTypesHelper.resolveActivityType('exercise')).toBeNull();
  });

  it('exposes Field Hockey once in Team/Racket without changing Match or Ice Hockey', () => {
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(type => type === 'Field Hockey')).toEqual([
      ActivityTypes.FieldHockey
    ]);
    expect(
      ActivityTypesHelper.getActivityTypesForActivityGroup(ActivityTypeGroups.TeamRacketGroup).filter(
        type => type === ActivityTypes.FieldHockey
      )
    ).toEqual([ActivityTypes.FieldHockey]);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.FieldHockey)).toBe(false);
    expect(ActivityTypesHelper.resolveActivityType('generic_match')).toBe(ActivityTypes.Match);
    expect(ActivityTypesHelper.resolveActivityType('IceHockey')).toBe(ActivityTypes.IceHockey);
    expect(ActivityTypesHelper.resolveActivityType('hockey')).toBe(ActivityTypes.Hockey);
    expect(ActivityTypesHelper.resolveActivityType('field')).toBeNull();
    expect(ActivityTypes.FieldHockey).not.toBe(ActivityTypes.IceHockey);
  });

  it('keeps Hand Cycle unique in the canonical catalog and Cycling group', () => {
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(type => type === 'Hand Cycle')).toEqual([
      ActivityTypes.Handcycle
    ]);
    expect(
      ActivityTypesHelper.getActivityTypesForActivityGroup(ActivityTypeGroups.CyclingGroup).filter(
        type => type === ActivityTypes.Handcycle
      )
    ).toEqual([ActivityTypes.Handcycle]);
  });

  it.each([
    'Disc Golf',
    'DiscGolf',
    'disc_golf',
    'DISC-GOLF',
    'FrisbeeGolf',
    'Frisbee Golf',
    'Frisbee golf',
    'frisbee_golf',
    'FRISBEEGOLF'
  ])('resolves explicit %s to the distinct Disc Golf type', value => {
    expect(ActivityTypesHelper.resolveActivityType(value)).toBe(ActivityTypes.DiscGolf);
  });

  it('exposes Disc Golf once alongside Golf and Frisbee without merging their identities', () => {
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(type => type === 'Disc Golf')).toEqual([
      ActivityTypes.DiscGolf
    ]);
    const groupTypes = ActivityTypesHelper.getActivityTypesForActivityGroup(ActivityTypeGroups.TeamRacketGroup);
    expect(groupTypes.filter(type => type === ActivityTypes.DiscGolf)).toEqual([ActivityTypes.DiscGolf]);
    expect(groupTypes).toContain(ActivityTypes.Golf);
    expect(groupTypes).toContain(ActivityTypes.Frisbee);
    expect(ActivityTypesHelper.resolveActivityType('Golf')).toBe(ActivityTypes.Golf);
    expect(ActivityTypesHelper.resolveActivityType('Frisbee')).toBe(ActivityTypes.Frisbee);
    expect(ActivityTypes.DiscGolf).not.toBe(ActivityTypes.Golf);
    expect(ActivityTypes.DiscGolf).not.toBe(ActivityTypes.Frisbee);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.DiscGolf)).toBe(false);
    expect(ActivityTypesMoving.getSpeedThreshold(ActivityTypes.DiscGolf)).toBe(
      ActivityTypesMoving.getSpeedThreshold(ActivityTypes.Golf)
    );
    expect(ActivityTypesHelper.speedDerivedDataTypesToUseForActivityType(ActivityTypes.DiscGolf)).toEqual([
      DataSpeed.type
    ]);
    expect(ActivityTypesHelper.averageSpeedDerivedDataTypesToUseForActivityType(ActivityTypes.DiscGolf)).toEqual([
      DataSpeedAvg.type
    ]);
    expect(ActivityTypesHelper.verticalSpeedDerivedDataTypesToUseForActivityType(ActivityTypes.DiscGolf)).toEqual([]);
    expect(ActivityTypesHelper.altiDistanceSpeedDerivedDataTypesToUseForActivityType(ActivityTypes.DiscGolf)).toEqual(
      []
    );
  });

  it.each(['Lacrosse', 'lacrosse', 'LACROSSE', ' LaCrOsSe '])('resolves %s to canonical Lacrosse', value => {
    expect(ActivityTypesHelper.resolveActivityType(value)).toBe(ActivityTypes.Lacrosse);
  });

  it('exposes Lacrosse once in Team/Racket without merging it with hockey or generic sports', () => {
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(type => type === 'Lacrosse')).toEqual([
      ActivityTypes.Lacrosse
    ]);
    expect(
      ActivityTypesHelper.getActivityTypesForActivityGroup(ActivityTypeGroups.TeamRacketGroup).filter(
        type => type === ActivityTypes.Lacrosse
      )
    ).toEqual([ActivityTypes.Lacrosse]);
    expect(ActivityTypes.Lacrosse).not.toBe(ActivityTypes.FieldHockey);
    expect(ActivityTypes.Lacrosse).not.toBe(ActivityTypes.IceHockey);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.Lacrosse)).toBe(false);
    expect(ActivityTypesHelper.resolveActivityType('generic')).toBe(ActivityTypes.Generic);
    expect(ActivityTypesHelper.resolveActivityType('generic_match')).toBe(ActivityTypes.Match);
    expect(ActivityTypesHelper.resolveActivityType('team_sport')).toBe(ActivityTypes.TeamSport);
  });

  it.each(['Water Tubing', 'WaterTubing', 'water_tubing', 'WATER-TUBING', ' Water tubing '])(
    'resolves explicit %s to canonical Water Tubing',
    value => {
      expect(ActivityTypesHelper.resolveActivityType(value)).toBe(ActivityTypes.WaterTubing);
    }
  );

  it('exposes Water Tubing once with the existing towed water-sport behavior', () => {
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(type => type === 'Water Tubing')).toEqual([
      ActivityTypes.WaterTubing
    ]);
    expect(
      ActivityTypesHelper.getActivityTypesForActivityGroup(ActivityTypeGroups.WaterSportsGroup).filter(
        type => type === ActivityTypes.WaterTubing
      )
    ).toEqual([ActivityTypes.WaterTubing]);
    expect(ActivityTypes.WaterTubing).not.toBe(ActivityTypes.WaterSkiing);
    expect(ActivityTypes.WaterTubing).not.toBe(ActivityTypes.Wakeboarding);
    expect(ActivityTypes.WaterTubing).not.toBe(ActivityTypes.Rafting);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.WaterTubing)).toBe(false);
    expect(ActivityTypesHelper.usesStrokeRate(ActivityTypes.WaterTubing)).toBe(false);
    expect(ActivityTypesMoving.getSpeedThreshold(ActivityTypes.WaterTubing)).toBe(0.3);
    expect(ActivityTypesHelper.speedDerivedDataTypesToUseForActivityType(ActivityTypes.WaterTubing)).toEqual([
      DataSpeed.type,
      DataSwimPace.type
    ]);
    expect(ActivityTypesHelper.averageSpeedDerivedDataTypesToUseForActivityType(ActivityTypes.WaterTubing)).toEqual([
      DataSpeedAvg.type,
      DataSwimPaceAvg.type
    ]);
    expect(ActivityTypesHelper.verticalSpeedDerivedDataTypesToUseForActivityType(ActivityTypes.WaterTubing)).toEqual(
      []
    );
    expect(
      ActivityTypesHelper.altiDistanceSpeedDerivedDataTypesToUseForActivityType(ActivityTypes.WaterTubing)
    ).toEqual([]);
    expect(ActivityTypesHelper.shouldExcludeAscent(ActivityTypes.WaterTubing)).toBe(true);
    expect(ActivityTypesHelper.shouldExcludeDescent(ActivityTypes.WaterTubing)).toBe(true);
    expect(ActivityTypesHelper.shouldExcludeTerrainSummaryMetrics(ActivityTypes.WaterTubing)).toBe(false);
    expect(ActivityTypesHelper.resolveActivityType('tubing')).toBeNull();
    expect(ActivityTypesHelper.resolveActivityType('water_sport')).toBe(ActivityTypes.WaterSport);
  });

  it.each([
    ['Wakesurfing', ActivityTypes.Wakesurfing],
    [' WaKeSuRfInG ', ActivityTypes.Wakesurfing],
    ['Archery', ActivityTypes.Archery],
    [' ARCHERY ', ActivityTypes.Archery],
    ['Mixed Martial Arts', ActivityTypes.MixedMartialArts],
    ['MixedMartialArts', ActivityTypes.MixedMartialArts],
    ['mixedMartialArts', ActivityTypes.MixedMartialArts],
    ['mixed_martial_arts', ActivityTypes.MixedMartialArts],
    ['MIXED-MARTIAL-ARTS', ActivityTypes.MixedMartialArts],
    [' MMA ', ActivityTypes.MixedMartialArts]
  ])('resolves explicit %s to %s', (value, expectedType) => {
    expect(ActivityTypesHelper.resolveActivityType(value)).toBe(expectedType);
  });

  it.each([
    [ActivityTypes.Wakesurfing, ActivityTypeGroups.WaterSportsGroup, false],
    [ActivityTypes.Archery, ActivityTypeGroups.OutdoorAdventuresGroup, false],
    [ActivityTypes.MixedMartialArts, ActivityTypeGroups.IndoorSportsGroup, true]
  ] as const)('exposes %s once in %s with indoor hint %s', (type, group, indoor) => {
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(value => value === type)).toEqual([type]);
    expect(ActivityTypesHelper.getActivityTypesForActivityGroup(group).filter(value => value === type)).toEqual([type]);
    expect(ActivityTypesHelper.isIndoorActivityType(type)).toBe(indoor);
    expect(ActivityTypesHelper.usesStrokeRate(type)).toBe(false);
    expect(ActivityTypesMoving.getSpeedThreshold(type)).toBe(0.3);
    expect(ActivityTypesHelper.altiDistanceSpeedDerivedDataTypesToUseForActivityType(type)).toEqual([]);
    expect(ActivityTypesHelper.shouldExcludeTerrainSummaryMetrics(type)).toBe(false);
  });

  it('gives Wakesurfing the existing water-sport metric and elevation behavior', () => {
    expect(ActivityTypesHelper.speedDerivedDataTypesToUseForActivityType(ActivityTypes.Wakesurfing)).toEqual([
      DataSpeed.type,
      DataSwimPace.type
    ]);
    expect(ActivityTypesHelper.averageSpeedDerivedDataTypesToUseForActivityType(ActivityTypes.Wakesurfing)).toEqual([
      DataSpeedAvg.type,
      DataSwimPaceAvg.type
    ]);
    expect(ActivityTypesHelper.verticalSpeedDerivedDataTypesToUseForActivityType(ActivityTypes.Wakesurfing)).toEqual(
      []
    );
    expect(ActivityTypesHelper.shouldExcludeAscent(ActivityTypes.Wakesurfing)).toBe(true);
    expect(ActivityTypesHelper.shouldExcludeDescent(ActivityTypes.Wakesurfing)).toBe(true);
    expect(ActivityTypes.Wakesurfing).not.toBe(ActivityTypes.Surfing);
    expect(ActivityTypes.Wakesurfing).not.toBe(ActivityTypes.Wakeboarding);
    expect(ActivityTypesHelper.resolveActivityType('water_sport')).toBe(ActivityTypes.WaterSport);
  });

  it('keeps Archery and Mixed Martial Arts distinct with their existing group metric families', () => {
    expect(ActivityTypes.Archery).not.toBe(ActivityTypes.Hunting);
    expect(ActivityTypes.MixedMartialArts).not.toBe(ActivityTypes.Combat);
    expect(ActivityTypes.MixedMartialArts).not.toBe(ActivityTypes.Boxing);
    expect(ActivityTypesHelper.speedDerivedDataTypesToUseForActivityType(ActivityTypes.Archery)).toEqual([
      DataPace.type,
      DataSpeed.type
    ]);
    expect(ActivityTypesHelper.averageSpeedDerivedDataTypesToUseForActivityType(ActivityTypes.Archery)).toEqual([
      DataPaceAvg.type,
      DataSpeedAvg.type
    ]);
    expect(ActivityTypesHelper.verticalSpeedDerivedDataTypesToUseForActivityType(ActivityTypes.Archery)).toEqual([
      DataVerticalSpeed.type
    ]);
    expect(ActivityTypesHelper.shouldExcludeAscent(ActivityTypes.Archery)).toBe(false);
    expect(ActivityTypesHelper.shouldExcludeDescent(ActivityTypes.Archery)).toBe(false);
    expect(ActivityTypesHelper.speedDerivedDataTypesToUseForActivityType(ActivityTypes.MixedMartialArts)).toEqual([
      DataSpeed.type
    ]);
    expect(
      ActivityTypesHelper.averageSpeedDerivedDataTypesToUseForActivityType(ActivityTypes.MixedMartialArts)
    ).toEqual([DataSpeedAvg.type]);
    expect(
      ActivityTypesHelper.verticalSpeedDerivedDataTypesToUseForActivityType(ActivityTypes.MixedMartialArts)
    ).toEqual([]);
    expect(ActivityTypesHelper.resolveActivityType('martial_arts')).toBeNull();
    expect(ActivityTypesHelper.resolveActivityType('shooting')).toBe(ActivityTypes.Shooting);
  });

  it.each(['wheelchair_push_walk', 'WheelchairPushWalk', 'WHEELCHAIR-PUSH-WALK', 'Wheelchair Push Walk'])(
    'resolves explicit %s to the distinct Wheelchair Push Walk type',
    value => {
      expect(ActivityTypesHelper.resolveActivityType(value)).toBe(ActivityTypes.WheelchairPushWalk);
    }
  );

  it.each(['wheelchair_push_run', 'WheelchairPushRun', 'WHEELCHAIR-PUSH-RUN', 'Wheelchair Push Run'])(
    'resolves explicit %s to the distinct Wheelchair Push Run type',
    value => {
      expect(ActivityTypesHelper.resolveActivityType(value)).toBe(ActivityTypes.WheelchairPushRun);
    }
  );

  it('reuses Wheel Chair in Adaptive Mobility without a global generic/hand_cycling alias', () => {
    expect(ActivityTypesHelper.resolveActivityType('Wheelchair')).toBe(ActivityTypes.Wheelchair);
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(type => type === 'Wheel Chair')).toEqual([
      ActivityTypes.Wheelchair
    ]);
    expect(ActivityTypesHelper.getActivityTypesForActivityGroup(ActivityTypeGroups.AdaptiveMobilityGroup)).toEqual([
      ActivityTypes.WheelchairRacing,
      ActivityTypes.Wheelchair,
      ActivityTypes.WheelchairPushWalk,
      ActivityTypes.WheelchairPushRun,
      ActivityTypes.IndoorWheelchairPushWalk,
      ActivityTypes.IndoorWheelchairPushRun
    ]);
    expect(ActivityTypesHelper.resolveActivityType('generic_hand_cycling')).toBeNull();
    expect(ActivityTypes.Wheelchair).not.toBe(ActivityTypes.Handcycle);
  });

  it('exposes Wheelchair Push Walk once and keeps it distinct from generic Wheel Chair', () => {
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(type => type === 'Wheelchair Push Walk')).toEqual(
      [ActivityTypes.WheelchairPushWalk]
    );
    expect(ActivityTypes.WheelchairPushWalk).not.toBe(ActivityTypes.Wheelchair);
    expect(ActivityTypesHelper.resolveActivityType('Wheel Chair')).toBe(ActivityTypes.Wheelchair);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.WheelchairPushWalk)).toBe(false);
  });

  it('exposes Wheelchair Push Run once and keeps all wheelchair modes distinct', () => {
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(type => type === 'Wheelchair Push Run')).toEqual([
      ActivityTypes.WheelchairPushRun
    ]);
    expect(ActivityTypes.WheelchairPushRun).not.toBe(ActivityTypes.Wheelchair);
    expect(ActivityTypes.WheelchairPushRun).not.toBe(ActivityTypes.WheelchairPushWalk);
    expect(ActivityTypes.WheelchairPushRun).not.toBe(ActivityTypes.Running);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.WheelchairPushRun)).toBe(false);
  });

  it.each(['Cyclocross', 'cyclocross', 'cycling_cyclocross', 'CYCLING-CYCLOCROSS'])(
    'resolves %s to canonical Cyclocross',
    value => {
      expect(ActivityTypesHelper.resolveActivityType(value)).toBe(ActivityTypes.Cyclocross);
    }
  );

  it('keeps Cyclocross distinct and unique in the canonical catalog and Cycling group', () => {
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(type => type === 'Cyclocross')).toEqual([
      ActivityTypes.Cyclocross
    ]);
    expect(
      ActivityTypesHelper.getActivityTypesForActivityGroup(ActivityTypeGroups.CyclingGroup).filter(
        type => type === ActivityTypes.Cyclocross
      )
    ).toEqual([ActivityTypes.Cyclocross]);
    expect(ActivityTypesHelper.getActivityTypesForActivityGroup(ActivityTypeGroups.MountainBikingGroup)).not.toContain(
      ActivityTypes.Cyclocross
    );
    expect(ActivityTypesHelper.resolveActivityType('Mountain Biking')).toBe(ActivityTypes.MountainBiking);
  });

  it.each([
    'Gravel Cycling',
    'GravelCycling',
    'gravel_cycling',
    'cycling_gravel_cycling',
    'CYCLING-GRAVEL-CYCLING',
    'GravelRide',
    'gravelride'
  ])('resolves %s to canonical Gravel Cycling', value => {
    expect(ActivityTypesHelper.resolveActivityType(value)).toBe(ActivityTypes.GravelCycling);
  });

  it('keeps Gravel Cycling unique in the Cycling group with cycling movement behavior', () => {
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(type => type === 'Gravel Cycling')).toEqual([
      ActivityTypes.GravelCycling
    ]);
    expect(
      ActivityTypesHelper.getActivityTypesForActivityGroup(ActivityTypeGroups.CyclingGroup).filter(
        type => type === ActivityTypes.GravelCycling
      )
    ).toEqual([ActivityTypes.GravelCycling]);
    expect(new Set([ActivityTypes.Cycling, ActivityTypes.Cyclocross, ActivityTypes.GravelCycling]).size).toBe(3);
    expect(ActivityTypesMoving.getSpeedThreshold(ActivityTypes.GravelCycling)).toBe(
      ActivityTypesMoving.getSpeedThreshold(ActivityTypes.Cycling)
    );
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.GravelCycling)).toBe(false);
    expect(ActivityTypesHelper.resolveActivityType('Ride')).toBe(ActivityTypes.Cycling);
  });

  it.each([
    'E-Mountain Biking',
    'EMountainBiking',
    'e_mountain_biking',
    'e_biking_e_bike_mountain',
    'E-BIKING-E-BIKE-MOUNTAIN',
    'EMountainBikeRide',
    'emountainbikeride',
    'E-MTB',
    'E-mtb'
  ])('resolves %s to canonical E-Mountain Biking', value => {
    expect(ActivityTypesHelper.resolveActivityType(value)).toBe(ActivityTypes.EMountainBiking);
  });

  it('keeps E-Mountain Biking unique in the Mountain Biking group with mountain biking movement behavior', () => {
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(type => type === 'E-Mountain Biking')).toEqual([
      ActivityTypes.EMountainBiking
    ]);
    expect(
      ActivityTypesHelper.getActivityTypesForActivityGroup(ActivityTypeGroups.MountainBikingGroup).filter(
        type => type === ActivityTypes.EMountainBiking
      )
    ).toEqual([ActivityTypes.EMountainBiking]);
    expect(ActivityTypesHelper.getActivityTypesForActivityGroup(ActivityTypeGroups.CyclingGroup)).not.toContain(
      ActivityTypes.EMountainBiking
    );
    expect(new Set([ActivityTypes.EBiking, ActivityTypes.MountainBiking, ActivityTypes.EMountainBiking]).size).toBe(3);
    expect(ActivityTypesMoving.getSpeedThreshold(ActivityTypes.EMountainBiking)).toBe(
      ActivityTypesMoving.getSpeedThreshold(ActivityTypes.MountainBiking)
    );
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.EMountainBiking)).toBe(false);
    expect(ActivityTypesHelper.resolveActivityType('EBikeRide')).toBe(ActivityTypes.EBiking);
    expect(ActivityTypesHelper.resolveActivityType('Mountain Biking')).toBe(ActivityTypes.MountainBiking);
  });

  it.each(['Splitboarding', 'splitboarding', 'snowboarding_backcountry', 'SNOWBOARDING-BACKCOUNTRY'])(
    'resolves %s to canonical Splitboarding',
    value => {
      expect(ActivityTypesHelper.resolveActivityType(value)).toBe(ActivityTypes.Splitboarding);
    }
  );

  it('exposes Splitboarding once in the canonical catalog and Winter Sports group', () => {
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(type => type === 'Splitboarding')).toEqual([
      ActivityTypes.Splitboarding
    ]);
    expect(
      ActivityTypesHelper.getActivityTypesForActivityGroup(ActivityTypeGroups.WinterSportsGroup).filter(
        type => type === ActivityTypes.Splitboarding
      )
    ).toEqual([ActivityTypes.Splitboarding]);
  });

  it.each(['Ski Mountaineering', 'ski_mountaineering', 'mountaineering_backcountry', 'SKI-MOUNTAINEERING'])(
    'resolves %s to canonical Ski Mountaineering',
    value => {
      expect(ActivityTypesHelper.resolveActivityType(value)).toBe(ActivityTypes.SkiMountaineering);
    }
  );

  it('keeps Ski Mountaineering distinct and unique in the canonical catalog and Winter Sports group', () => {
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(type => type === 'Ski Mountaineering')).toEqual([
      ActivityTypes.SkiMountaineering
    ]);
    expect(
      ActivityTypesHelper.getActivityTypesForActivityGroup(ActivityTypeGroups.WinterSportsGroup).filter(
        type => type === ActivityTypes.SkiMountaineering
      )
    ).toEqual([ActivityTypes.SkiMountaineering]);
    expect(
      new Set([ActivityTypes.SkiMountaineering, ActivityTypes.SkiTouring, ActivityTypes.BackcountrySkiing]).size
    ).toBe(3);
    expect(ActivityTypesHelper.resolveActivityType('backcountry')).toBe(ActivityTypes.BackcountrySkiing);
  });

  it.each([
    'Skate Skiing',
    'SkateSkiing',
    'skate_skiing',
    'cross_country_skiing_skate_skiing',
    'CROSS-COUNTRY-SKIING-SKATE-SKIING'
  ])('resolves %s to canonical Skate Skiing', value => {
    expect(ActivityTypesHelper.resolveActivityType(value)).toBe(ActivityTypes.SkateSkiing);
  });

  it('keeps Skate Skiing distinct and unique in the Winter Sports group with cross-country movement behavior', () => {
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(type => type === 'Skate Skiing')).toEqual([
      ActivityTypes.SkateSkiing
    ]);
    expect(
      ActivityTypesHelper.getActivityTypesForActivityGroup(ActivityTypeGroups.WinterSportsGroup).filter(
        type => type === ActivityTypes.SkateSkiing
      )
    ).toEqual([ActivityTypes.SkateSkiing]);
    expect(new Set([ActivityTypes.CrosscountrySkiing, ActivityTypes.NordicSki, ActivityTypes.SkateSkiing]).size).toBe(
      3
    );
    expect(ActivityTypesMoving.getSpeedThreshold(ActivityTypes.SkateSkiing)).toBe(
      ActivityTypesMoving.getSpeedThreshold(ActivityTypes.CrosscountrySkiing)
    );
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.SkateSkiing)).toBe(false);
    expect(ActivityTypesHelper.resolveActivityType('cross_country_skiing')).toBe(ActivityTypes.CrosscountrySkiing);
    expect(ActivityTypesHelper.resolveActivityType('NordicSki')).toBe(ActivityTypes.NordicSki);
  });

  it('should resolve snorkeling and mermaiding aliases to canonical diving activity types', () => {
    expect(ActivityTypes.snorkeling).toBe(ActivityTypes.Snorkeling);
    expect(ActivityTypesHelper.resolveActivityType('snorkeling')).toBe(ActivityTypes.Snorkeling);
    expect(ActivityTypes.mermaiding).toBe(ActivityTypes.Mermaiding);
    expect(ActivityTypesHelper.resolveActivityType('mermaiding')).toBe(ActivityTypes.Mermaiding);
  });

  it('should derive pace and speed for hiking activities', () => {
    expect(ActivityTypesHelper.speedDerivedDataTypesToUseForActivityType(ActivityTypes.Hiking)).toEqual([
      DataPace.type,
      DataSpeed.type
    ]);
    expect(ActivityTypesHelper.averageSpeedDerivedDataTypesToUseForActivityType(ActivityTypes.Hiking)).toEqual([
      DataPaceAvg.type,
      DataSpeedAvg.type
    ]);
  });

  it('should provide default hidden display families for climbing activities', () => {
    expect(ActivityTypesHelper.hiddenDisplayDataTypesToUseForActivityType(ActivityTypes.Climbing)).toEqual([
      DataSpeed.type,
      DataPace.type
    ]);
    expect(ActivityTypesHelper.hiddenDisplayDataTypesToUseForActivityType(ActivityTypes.IndoorClimbing)).toEqual([
      DataSpeed.type,
      DataPace.type
    ]);
    expect(ActivityTypesHelper.hiddenDisplayDataTypesToUseForActivityType(ActivityTypes.Hiking)).toEqual([]);
  });

  describe('shouldExcludeAscent', () => {
    it('should return true for AlpineSkiing', () => {
      expect(ActivityTypesHelper.shouldExcludeAscent(ActivityTypes.AlpineSkiing)).toBe(true);
    });
    it('should return true for Snowboarding', () => {
      expect(ActivityTypesHelper.shouldExcludeAscent(ActivityTypes.Snowboarding)).toBe(true);
    });
    it('should return true for DownhillCycling', () => {
      expect(ActivityTypesHelper.shouldExcludeAscent(ActivityTypes.DownhillCycling)).toBe(true);
    });
    it('should return true for Sailing', () => {
      expect(ActivityTypesHelper.shouldExcludeAscent(ActivityTypes.Sailing)).toBe(true);
    });
    it('should return true for Swimming', () => {
      expect(ActivityTypesHelper.shouldExcludeAscent(ActivityTypes.Swimming)).toBe(true);
    });
    it('should return true for OpenWaterSwimming', () => {
      expect(ActivityTypesHelper.shouldExcludeAscent(ActivityTypes.OpenWaterSwimming)).toBe(true);
    });
    it('should return true for every Diving-group activity', () => {
      [
        ActivityTypes.Diving,
        ActivityTypes.ScubaDiving,
        ActivityTypes.CCRDiving,
        ActivityTypes.FreeDiving,
        ActivityTypes.PoolApnea,
        ActivityTypes.Snorkeling,
        ActivityTypes.Mermaiding
      ].forEach(activityType => {
        expect(ActivityTypesHelper.shouldExcludeAscent(activityType)).toBe(true);
      });
    });
    it('should return false for Kayaking', () => {
      expect(ActivityTypesHelper.shouldExcludeAscent(ActivityTypes.Kayaking)).toBe(false);
    });
    it('should return false for Running', () => {
      expect(ActivityTypesHelper.shouldExcludeAscent(ActivityTypes.Running)).toBe(false);
    });
    it('should return false for BackcountrySkiing', () => {
      expect(ActivityTypesHelper.shouldExcludeAscent(ActivityTypes.BackcountrySkiing)).toBe(false);
    });
    it('should return false for Kitesurfing', () => {
      expect(ActivityTypesHelper.shouldExcludeAscent(ActivityTypes.Kitesurfing)).toBe(false);
    });
  });

  describe('shouldExcludeDescent', () => {
    it('should return false for AlpineSkiing', () => {
      expect(ActivityTypesHelper.shouldExcludeDescent(ActivityTypes.AlpineSkiing)).toBe(false);
    });
    it('should return false for Snowboarding', () => {
      expect(ActivityTypesHelper.shouldExcludeDescent(ActivityTypes.Snowboarding)).toBe(false);
    });
    it('should return false for DownhillCycling', () => {
      expect(ActivityTypesHelper.shouldExcludeDescent(ActivityTypes.DownhillCycling)).toBe(false);
    });
    it('should return true for Sailing', () => {
      expect(ActivityTypesHelper.shouldExcludeDescent(ActivityTypes.Sailing)).toBe(true);
    });
    it('should return true for Swimming', () => {
      expect(ActivityTypesHelper.shouldExcludeDescent(ActivityTypes.Swimming)).toBe(true);
    });
    it('should return true for OpenWaterSwimming', () => {
      expect(ActivityTypesHelper.shouldExcludeDescent(ActivityTypes.OpenWaterSwimming)).toBe(true);
    });
    it('should return true for every Diving-group activity', () => {
      [
        ActivityTypes.Diving,
        ActivityTypes.ScubaDiving,
        ActivityTypes.CCRDiving,
        ActivityTypes.FreeDiving,
        ActivityTypes.PoolApnea,
        ActivityTypes.Snorkeling,
        ActivityTypes.Mermaiding
      ].forEach(activityType => {
        expect(ActivityTypesHelper.shouldExcludeDescent(activityType)).toBe(true);
      });
    });
    it('should return false for Running', () => {
      expect(ActivityTypesHelper.shouldExcludeDescent(ActivityTypes.Running)).toBe(false);
    });
    it('should return false for Kitesurfing', () => {
      expect(ActivityTypesHelper.shouldExcludeDescent(ActivityTypes.Kitesurfing)).toBe(false);
    });
  });

  describe('shouldExcludeTerrainSummaryMetrics', () => {
    it('should return true for every Diving-group activity only', () => {
      [
        ActivityTypes.Diving,
        ActivityTypes.ScubaDiving,
        ActivityTypes.CCRDiving,
        ActivityTypes.FreeDiving,
        ActivityTypes.PoolApnea,
        ActivityTypes.Snorkeling,
        ActivityTypes.Mermaiding
      ].forEach(activityType => {
        expect(ActivityTypesHelper.shouldExcludeTerrainSummaryMetrics(activityType)).toBe(true);
      });

      expect(ActivityTypesHelper.shouldExcludeTerrainSummaryMetrics(ActivityTypes.Swimming)).toBe(false);
      expect(ActivityTypesHelper.shouldExcludeTerrainSummaryMetrics(ActivityTypes.Running)).toBe(false);
    });
  });
});
