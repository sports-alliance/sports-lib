import type { ActivityInterface } from '../../../activities/activity.interface';
import { isNumber } from '../helpers';

interface RecordedPowerSample {
  timestamp: Date | string | number;
  power?: unknown;
  Power?: unknown;
  RP_Power?: unknown;
}

// File compatibility mappers pad missing record power with zero. Keep their
// actual observations privately so that padding cannot establish an NP window.
// Generic caller-supplied streams have no such padding provenance and remain valid.
const recordedPowerValues = new WeakMap<ActivityInterface, Map<number, number>>();

export function captureRecordedPowerEvidence(activity: ActivityInterface, samples: RecordedPowerSample[]): void {
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
