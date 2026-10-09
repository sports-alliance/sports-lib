import { DataPaceAvg } from '../data/data.pace-avg';
import { DataPace } from '../data/data.pace';
import { DataSpeedAvg } from '../data/data.speed-avg';
import { DataSpeed } from '../data/data.speed';
import { DataVerticalSpeed } from '../data/data.vertical-speed';
import { ActivityTypeGroups, ActivityTypes, ActivityTypesHelper, ActivityTypesMoving } from './activity.types';

const proposedGroupAssignments = [
  [ActivityTypes.Aerobics, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.Boxing, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.CardioTraining, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.Cheerleading, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes['Circuit Training'], ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.Combat, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.EllipticalTrainer, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.FitnessEquipment, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.HIIT, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.IndoorTraining, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.Meditation, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.Pilates, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes.StairStepper, ActivityTypeGroups.IndoorSportsGroup],
  [ActivityTypes['Adventure Racing'], ActivityTypeGroups.PerformanceGroup],
  [ActivityTypes.Aquathlon, ActivityTypeGroups.PerformanceGroup],
  [ActivityTypes.Duathlon, ActivityTypeGroups.PerformanceGroup],
  [ActivityTypes.Swimrun, ActivityTypeGroups.PerformanceGroup],
  [ActivityTypes.Fishing, ActivityTypeGroups.OutdoorAdventuresGroup],
  [ActivityTypes.FloorClimbing, ActivityTypeGroups.OutdoorAdventuresGroup],
  [ActivityTypes.Hunting, ActivityTypeGroups.OutdoorAdventuresGroup],
  [ActivityTypes.Mountaineering, ActivityTypeGroups.OutdoorAdventuresGroup],
  [ActivityTypes.Trekking, ActivityTypeGroups.OutdoorAdventuresGroup],
  [ActivityTypes.Cyclocross, ActivityTypeGroups.CyclingGroup],
  [ActivityTypes.GravelCycling, ActivityTypeGroups.CyclingGroup],
  [ActivityTypes.EMountainBiking, ActivityTypeGroups.MountainBikingGroup],
  [ActivityTypes.Handcycle, ActivityTypeGroups.CyclingGroup],
  [ActivityTypes.Velomobile, ActivityTypeGroups.CyclingGroup],
  [ActivityTypes.Rafting, ActivityTypeGroups.WaterSportsGroup],
  [ActivityTypes.WaterSkiing, ActivityTypeGroups.WaterSportsGroup],
  [ActivityTypes.Windsurfing, ActivityTypeGroups.WaterSportsGroup],
  [ActivityTypes.Cricket, ActivityTypeGroups.TeamRacketGroup],
  [ActivityTypes.FieldHockey, ActivityTypeGroups.TeamRacketGroup],
  [ActivityTypes.Frisbee, ActivityTypeGroups.TeamRacketGroup],
  [ActivityTypes.Padel, ActivityTypeGroups.TeamRacketGroup],
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
  [ActivityTypes.Chores, ActivityTypeGroups.UnspecifiedGroup]
] as const;

const intentionalUnspecifiedActivityTypes = [
  ActivityTypes.Chores,
  ActivityTypes.Generic,
  ActivityTypes.Match,
  ActivityTypes.Other,
  ActivityTypes.Route,
  ActivityTypes.Tactical,
  ActivityTypes.Transition,
  ActivityTypes.UnknownSport,
  ActivityTypes.Workout
].sort();

describe('ActivityTypes', () => {
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
      ActivityTypes.InlineSkating,
      ActivityTypes.Skating
    ]);
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
      ActivityTypes.Wheelchair
    ].forEach(activityType => {
      expect(ActivityTypesMoving.getSpeedThreshold(activityType)).toBe(0.3);
    });

    [ActivityTypes.InlineSkating, ActivityTypes.Driving, ActivityTypes.Wheelchair].forEach(activityType => {
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

  it.each(['Hand Cycle', 'Handcycle', 'cycling_hand_cycling', 'CYCLING-HAND-CYCLING'])(
    'resolves %s to canonical Hand Cycle',
    value => {
      expect(ActivityTypesHelper.resolveActivityType(value)).toBe(ActivityTypes.Handcycle);
    }
  );

  it.each(['Field Hockey', 'FieldHockey', 'field_hockey', 'FIELD_HOCKEY', 'FIELD-HOCKEY'])(
    'resolves %s to canonical Field Hockey',
    value => {
      expect(ActivityTypesHelper.resolveActivityType(value)).toBe(ActivityTypes.FieldHockey);
    }
  );

  it.each(['Chores', 'chores', 'CHORES'])('resolves %s to canonical Chores', value => {
    expect(ActivityTypesHelper.resolveActivityType(value)).toBe(ActivityTypes.Chores);
  });

  it('exposes Chores once under Unspecified while retaining the generic exercise alias', () => {
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(type => type === 'Chores')).toEqual([
      ActivityTypes.Chores
    ]);
    expect(ActivityTypesHelper.getActivityTypesForActivityGroup(ActivityTypeGroups.UnspecifiedGroup)).toEqual([
      ActivityTypes.Chores
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

  it('reuses the existing Wheel Chair catalog value and Adaptive Mobility group without a global FIT alias', () => {
    expect(ActivityTypesHelper.resolveActivityType('Wheelchair')).toBe(ActivityTypes.Wheelchair);
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(type => type === 'Wheel Chair')).toEqual([
      ActivityTypes.Wheelchair
    ]);
    expect(ActivityTypesHelper.getActivityTypesForActivityGroup(ActivityTypeGroups.AdaptiveMobilityGroup)).toEqual([
      ActivityTypes.Wheelchair
    ]);
    expect(ActivityTypesHelper.resolveActivityType('generic_hand_cycling')).toBeNull();
    expect(ActivityTypes.Wheelchair).not.toBe(ActivityTypes.Handcycle);
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
        ActivityTypes.FreeDiving,
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
        ActivityTypes.FreeDiving,
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
        ActivityTypes.FreeDiving,
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
