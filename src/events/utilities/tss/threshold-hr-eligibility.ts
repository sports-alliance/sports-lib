import { ActivityTypeGroups, ActivityTypes, ActivityTypesHelper } from '../../../activities/activity.types';

/** Threshold-only fallback for running/cycling families and the explicitly supported walking/hiking types. */
export function supportsThresholdHeartRateTss(type: ActivityTypes): boolean {
  const group = ActivityTypesHelper.getActivityGroupForActivityType(type);
  return (
    group === ActivityTypeGroups.RunningGroup ||
    group === ActivityTypeGroups.TrailRunningGroup ||
    group === ActivityTypeGroups.CyclingGroup ||
    group === ActivityTypeGroups.MountainBikingGroup ||
    type === ActivityTypes.Walking ||
    type === ActivityTypes.NordicWalking ||
    type === ActivityTypes.Hiking ||
    type === ActivityTypes.Trekking
  );
}
