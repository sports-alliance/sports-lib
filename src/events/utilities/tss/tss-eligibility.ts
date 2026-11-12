import { ActivityTypeGroups, ActivityTypes, ActivityTypesHelper } from '../../../activities/activity.types';

/** Existing running-pace TSS eligibility; shared with consumers offering the explicit preference. */
export function supportsRunningPaceTrainingStressScore(type: ActivityTypes): boolean {
  const group = ActivityTypesHelper.getActivityGroupForActivityType(type);
  return group === ActivityTypeGroups.RunningGroup || group === ActivityTypeGroups.TrailRunningGroup ||
    type === ActivityTypes.TrackAndField;
}

/** Shared eligibility for calculated load and its independently calibrated threshold-HR fallback. */
export function supportsCalculatedTrainingStressScore(type: ActivityTypes): boolean {
  const group = ActivityTypesHelper.getActivityGroupForActivityType(type);
  return (
    group !== ActivityTypeGroups.MotorizedGroup &&
    group !== ActivityTypeGroups.AdaptiveMobilityGroup &&
    type !== ActivityTypes.VideoGaming &&
    type !== ActivityTypes.Paramotoring &&
    type !== ActivityTypes.RCDroneFlying
  );
}
