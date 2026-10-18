import { ActivityTypeGroups, ActivityTypes, ActivityTypesHelper } from '../../../activities/activity.types';

/** The threshold-only fallback is currently validated for running and cycling families. */
export function supportsThresholdHeartRateTss(type: ActivityTypes): boolean {
  const group = ActivityTypesHelper.getActivityGroupForActivityType(type);
  return (
    group === ActivityTypeGroups.RunningGroup ||
    group === ActivityTypeGroups.TrailRunningGroup ||
    group === ActivityTypeGroups.CyclingGroup ||
    group === ActivityTypeGroups.MountainBikingGroup
  );
}
