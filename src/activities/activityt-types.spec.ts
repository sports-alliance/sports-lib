import { ActivityTypeGroups, ActivityTypes, ActivityTypesHelper } from './activity.types';

describe('ActivityTypes', () => {
  beforeEach(() => { });

  it('get the correct activity group', () => {
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Running)).toBe(ActivityTypeGroups.Running);
    expect(ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Cycling)).toBe(ActivityTypeGroups.Cycling);
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
  });

  it('should map alpine_skiing_downhill to AlpineSkiing', () => {
    // @ts-ignore
    expect(ActivityTypes.alpine_skiing_downhill as ActivityTypes).toBe(ActivityTypes.AlpineSkiing);
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
    it('should return false for Kayaking', () => {
      expect(ActivityTypesHelper.shouldExcludeAscent(ActivityTypes.Kayaking)).toBe(false);
    });
    it('should return false for Running', () => {
      expect(ActivityTypesHelper.shouldExcludeAscent(ActivityTypes.Running)).toBe(false);
    });
    it('should return false for BackcountrySkiing', () => {
      expect(ActivityTypesHelper.shouldExcludeAscent(ActivityTypes.BackcountrySkiing)).toBe(false);
    });
  });
});
