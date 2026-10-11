import type { ActivityInterface } from '../../../activities/activity.interface';
import { calculateNormalizedPower } from '../normalized-power';
import { isNumber } from '../helpers';

interface RecordedPowerSample {
  timestamp: Date | string | number;
  power?: unknown;
  Power?: unknown;
  RP_Power?: unknown;
}

// File compatibility mappers pad missing record power with zero. Keep only their
// actual zero observations privately so that padding cannot prove zero load.
// Generic caller-supplied streams have no such padding provenance and remain valid.
const recordedZeroPowerSeconds = new WeakMap<ActivityInterface, Set<number>>();

export function captureRecordedPowerEvidence(activity: ActivityInterface, samples: RecordedPowerSample[]): void {
  const zeroSeconds = new Set<number>();
  for (const sample of samples) {
    const time = activity.getDateIndex(
      sample.timestamp instanceof Date ? sample.timestamp : new Date(sample.timestamp)
    );
    if (!Number.isFinite(time) || time < 0) continue;
    // FIT passes native/developer fields; XML importers pass their unpadded value.
    const value = isNumber(sample.power) ? sample.power : isNumber(sample.Power) ? sample.Power : sample.RP_Power;
    if (value === 0) zeroSeconds.add(time);
    else zeroSeconds.delete(time); // The last record on the stream grid wins.
  }
  recordedZeroPowerSeconds.set(activity, zeroSeconds);
}

export function hasRecordedZeroPowerWindow(activity: ActivityInterface, power: number[], seconds: number[]): boolean {
  const zeroSeconds = recordedZeroPowerSeconds.get(activity);
  if (!zeroSeconds) return true;
  // Recheck current samples and timer boundaries rather than caching eligibility:
  // regeneration or later stream/event edits must not reuse stale window evidence.
  const recordedPower = power.map((value, index) => (value === 0 && zeroSeconds.has(seconds[index]) ? 0 : NaN));
  return calculateNormalizedPower(recordedPower, seconds, activity.getAllEvents()) === 0;
}
