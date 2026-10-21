import type { ActivityInterface } from '../../../activities/activity.interface';
import { isNumber } from '../helpers';

interface RecordedPowerSample {
  timestamp: Date | string | number;
  power?: unknown;
  Power?: unknown;
  RP_Power?: unknown;
}

// Legacy observation mask retained for direct helper consumers. Current calculations
// use canonical null-preserving streams. Importers also preserve their record clock
// independently, so removing zero padding does not alter other sensor streams.
const recordedPowerClock = new WeakMap<ActivityInterface, number[]>();
const recordedPowerValues = new WeakMap<ActivityInterface, Map<number, number>>();

export function captureRecordedPowerEvidence(activity: ActivityInterface, samples: RecordedPowerSample[], preserveClock = false): void {
  const observations = new Map<number, number>();
  for (const sample of samples) {
    const time = activity.getDateIndex(
      sample.timestamp instanceof Date ? sample.timestamp : new Date(sample.timestamp)
    );
    if (!Number.isFinite(time) || time < 0) continue;
    // FIT passes native/developer fields; XML importers pass their unpadded value.
    const value = isNumber(sample.power) ? sample.power : isNumber(sample.Power) ? sample.Power : sample.RP_Power;
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) observations.set(time, value);
    else observations.delete(time); // The last record on the stream grid wins.
  }
  recordedPowerValues.set(activity, observations);
  recordedPowerClock.delete(activity);
  if (preserveClock && observations.size) {
    const length = Math.max(0, Math.round((+activity.endDate - +activity.startDate) / 1000) + 1);
    const clock = new Set<number>();
    for (const sample of samples) {
      const i = activity.getDateIndex(new Date(sample.timestamp));
      if (Number.isSafeInteger(i) && i >= 0 && i < length) clock.add(i);
    }
    recordedPowerClock.set(activity, [...clock]);
  }
}

/** Original parse clock only: keeps unrelated sensor filling independent of missing watts. */
export function getRecordedPowerClock(activity: ActivityInterface): readonly number[] {
  return recordedPowerClock.get(activity) ?? [];
}

/** Mask compatibility padding without changing the displayed/caller-owned stream.
 * Requiring the current value to match its observation also prevents later edits
 * from reusing stale source evidence. Timer and window validation remain in NP. */
export function getRecordedPowerValues(activity: ActivityInterface, power: number[], seconds: number[]): number[] {
  const observations = recordedPowerValues.get(activity);
  if (!observations) return power;
  return power.map((value, index) => observations.has(seconds[index]) && observations.get(seconds[index]) === value
    ? value : NaN);
}
