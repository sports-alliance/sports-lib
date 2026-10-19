import { ActivityTypeGroups, ActivityTypes, ActivityTypesHelper } from '../../../activities/activity.types';

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
