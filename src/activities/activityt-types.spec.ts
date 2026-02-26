import { ActivityTypeGroups, ActivityTypes, ActivityTypesHelper } from './activity.types';

describe('ActivityTypes', () => {
  beforeEach(() => {});

  it('get the correct activity group', () => {
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Running)).toBe(ActivityTypeGroups.Running);
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Cycling)).toBe(ActivityTypeGroups.Cycling);
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.MountainBiking)).toBe(
      ActivityTypeGroups.MountainBiking
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes['Enduro MTB'])).toBe(
      ActivityTypeGroups.MountainBiking
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.DownhillCycling)).toBe(
      ActivityTypeGroups.MountainBiking
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Crossfit)).toBe(
      ActivityTypeGroups.Performance
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.IndoorRowing)).toBe(
      ActivityTypeGroups.IndoorSports
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Climbing)).toBe(
      ActivityTypeGroups.OutdoorAdventures
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.AlpineSkiing)).toBe(
      ActivityTypeGroups.WinterSports
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Wakeboarding)).toBe(
      ActivityTypeGroups.WaterSports
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Diving)).toBe(ActivityTypeGroups.Diving);
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Tennis)).toBe(
      ActivityTypeGroups.TeamRacket
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Workout)).toBe(
      ActivityTypeGroups.Unspecified
    );
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.HIIT)).toBe(
      ActivityTypeGroups.Unspecified
    );
  });

  it('should map alpine_skiing_downhill to AlpineSkiing', () => {
    // @ts-ignore
    expect(ActivityTypes.alpine_skiing_downhill as ActivityTypes).toBe(ActivityTypes.AlpineSkiing);
  });

  it('should resolve HIIT aliases to canonical HIIT', () => {
    expect(ActivityTypes.hiit).toBe(ActivityTypes.HIIT);
    expect(ActivityTypesHelper.resolveActivityType('HIIT')).toBe(ActivityTypes.HIIT);
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
    it('should return true for ScubaDiving', () => {
      expect(ActivityTypesHelper.shouldExcludeAscent(ActivityTypes.ScubaDiving)).toBe(true);
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
    it('should return false for ScubaDiving', () => {
      expect(ActivityTypesHelper.shouldExcludeDescent(ActivityTypes.ScubaDiving)).toBe(false);
    });
    it('should return false for Running', () => {
      expect(ActivityTypesHelper.shouldExcludeDescent(ActivityTypes.Running)).toBe(false);
    });
    it('should return false for Kitesurfing', () => {
      expect(ActivityTypesHelper.shouldExcludeDescent(ActivityTypes.Kitesurfing)).toBe(false);
    });
  });
});
