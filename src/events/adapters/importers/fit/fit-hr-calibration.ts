import { ActivityTypes } from '../../../../activities/activity.types';
import { ActivityTypesHelper } from '../../../../activities/activity.types';
import { ActivityTypeGroups } from '../../../../activities/activity.types';
import type { FileHeartRateCalibration } from '../../../utilities/tss/tss-evaluation';

type RecordValue = Record<string, unknown>;
const indexValue = (value: unknown): unknown => typeof value === 'object' && value !== null
  ? (value as RecordValue).value : value;

/** Resolve only explicit FIT settings; a session's measured maximum is never calibration. */
export function resolveFitHeartRateCalibration(
  file: any, session: any, sessionIndex: number, type: ActivityTypes
): FileHeartRateCalibration {
  const sessionId = indexValue(session.message_index) ?? sessionIndex;
  const sessions = file.sessions ?? [];
  const duplicateSessionId = sessions.filter((entry: any, index: number) =>
    (indexValue(entry.message_index) ?? index) === sessionId).length > 1;
  const matches = (file.time_in_zone ?? []).filter((row: any) =>
    (row.reference_mesg === 'session' || row.reference_mesg === 18) &&
    (indexValue(row.reference_index) === sessionId ||
      (row.reference_index === undefined && sessions.length === 1)));
  if (duplicateSessionId || matches.length > 1) {
    return { reason: 'ambiguous-hr-calibration' };
  }
  const records = (name: string): RecordValue[] => {
    const all = file.messages?.[name];
    return Array.isArray(all) && all.length ? all : file[name] ? [file[name]] : [];
  };
  const group = ActivityTypesHelper.getActivityGroupForActivityType(type);
  const sportMax = group === ActivityTypeGroups.RunningGroup || group === ActivityTypeGroups.TrailRunningGroup
    ? 'default_max_running_heart_rate' : group === ActivityTypeGroups.CyclingGroup
      ? 'default_max_biking_heart_rate' : 'default_max_heart_rate';
  let reason: FileHeartRateCalibration['reason'];
  const unique = (rows: RecordValue[], key: string): number | undefined => {
    const values = rows.map(row => row[key]).filter(value => value !== undefined && value !== null);
    if (new Set(values).size > 1) { reason = 'ambiguous-hr-calibration'; return undefined; }
    if (!values.length) { return undefined; }
    const value = values[0];
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      reason = reason ?? 'invalid-hr-calibration'; return undefined;
    }
    return value;
  };
  const zones = records('zones_target');
  const profiles = records('user_profile');
  // Evaluate every applicable source even when a higher-priority value exists, so
  // conflicting repeated settings are not hidden by the parser's last-record view.
  const sessionMax = unique(matches, 'max_heart_rate');
  const sessionRest = unique(matches, 'resting_heart_rate');
  const sessionThreshold = unique(matches, 'threshold_heart_rate');
  const zonesMax = unique(zones, 'max_heart_rate');
  const zonesThreshold = unique(zones, 'threshold_heart_rate');
  const profileMax = unique(profiles, sportMax);
  const generalMax = sportMax === 'default_max_heart_rate' ? profileMax : unique(profiles, 'default_max_heart_rate');
  const profileRest = unique(profiles, 'resting_heart_rate');
  const calibration: FileHeartRateCalibration = {
    maxHeartRate: sessionMax ?? zonesMax ?? profileMax ?? generalMax,
    restingHeartRate: sessionRest ?? profileRest,
    lactateThresholdHR: sessionThreshold ?? zonesThreshold
  };
  const { maxHeartRate: max, restingHeartRate: rest, lactateThresholdHR: threshold } = calibration;
  if (rest !== undefined && threshold !== undefined && max !== undefined && !(rest < threshold && threshold < max)) {
    reason = reason ?? 'invalid-hr-calibration';
  }
  return reason ? { reason } : calibration;
}
