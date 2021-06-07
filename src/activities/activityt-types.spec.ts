import { ActivityTypeGroups, ActivityTypes, ActivityTypesHelper } from './activity.types';

describe('ActivityTypes', () => {
  beforeEach(() => {});

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
});
