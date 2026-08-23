import { DataPaceAvg } from '../data/data.pace-avg';
import { DataPace } from '../data/data.pace';
import { DataSpeedAvg } from '../data/data.speed-avg';
import { DataSpeed } from '../data/data.speed';
import { ActivityTypeGroups, ActivityTypes, ActivityTypesHelper } from './activity.types';

describe('ActivityTypes', () => {
  beforeEach(() => {});

  it('get the correct activity group', () => {
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Running)).toBe(ActivityTypeGroups.RunningGroup);
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Cycling)).toBe(ActivityTypeGroups.CyclingGroup);
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
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Diving)).toBe(ActivityTypeGroups.DivingGroup);
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Snorkeling)).toBe(ActivityTypeGroups.DivingGroup);
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Mermaiding)).toBe(ActivityTypeGroups.DivingGroup);
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Tennis)).toBe(
      ActivityTypeGroups.TeamRacketGroup
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Workout)).toBe(
      ActivityTypeGroups.UnspecifiedGroup
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.HIIT)).toBe(
      ActivityTypeGroups.UnspecifiedGroup
    );
  });

  it('exposes canonical group ids and members', () => {
    expect(ActivityTypesHelper.getActivityTypeGroupsAsUniqueArray()).toContain(ActivityTypeGroups.WaterSportsGroup);
    expect(ActivityTypeGroups.WaterSportsGroup).toBe('water_sports_group');
    expect(ActivityTypesHelper.getActivityTypesForActivityGroup(ActivityTypeGroups.WaterSportsGroup)).toContain(ActivityTypes.Kayaking);
  });

  it('should identify indoor activity types across indoor labels and indoor-group members', () => {
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.IndoorCycling)).toBe(true);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.IndoorRunning)).toBe(true);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.IndoorTraining)).toBe(true);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.IndoorClimbing)).toBe(true);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.Yoga)).toBe(true);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.Treadmill)).toBe(true);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.Cycling)).toBe(false);
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.Running)).toBe(false);
  });

  it('should map alpine_skiing_downhill to AlpineSkiing', () => {
    // @ts-ignore
    expect(ActivityTypes.alpine_skiing_downhill as ActivityTypes).toBe(ActivityTypes.AlpineSkiing);
  });

  it('should resolve HIIT aliases to canonical HIIT', () => {
    expect(ActivityTypes.hiit).toBe(ActivityTypes.HIIT);
    expect(ActivityTypesHelper.resolveActivityType('HIIT')).toBe(ActivityTypes.HIIT);
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
      ].forEach((activityType) => {
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
      ].forEach((activityType) => {
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
