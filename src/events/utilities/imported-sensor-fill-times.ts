import type { ActivityInterface } from '../../activities/activity.interface';

// Import-only timestamps for the existing HR/altitude/cadence fill step.
// Never used as power evidence, exposed in Time, or persisted in JSON.
const importedSensorFillTimes = new WeakMap<ActivityInterface, number[]>();

export function captureImportedSensorFillTimes(activity: ActivityInterface, timestamps: Date[]): void {
  const length = Math.max(0, Math.round((+activity.endDate - +activity.startDate) / 1000) + 1);
  const indices = new Set<number>();
  for (const timestamp of timestamps) {
    const index = activity.getDateIndex(timestamp);
    if (Number.isSafeInteger(index) && index >= 0 && index < length) indices.add(index);
  }
  importedSensorFillTimes.set(activity, [...indices]);
}

/** Consume once during import: later edits and regeneration use the current streams. */
export function takeImportedSensorFillTimes(activity: ActivityInterface): readonly number[] {
  const indices = importedSensorFillTimes.get(activity) ?? [];
  importedSensorFillTimes.delete(activity);
  return indices;
}
