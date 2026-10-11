import type { ActivityInterface } from '../../../activities/activity.interface';
import type { StreamInterface } from '../../../streams/stream.interface';
import { DataHeartRate } from '../../../data/data.heart-rate';

interface Coverage {
  stream: StreamInterface;
  data: (number | null)[];
  first: number;
  last: number;
  invalid: Set<number>;
}
// Display backfill remains compatible, but must not extend observed HR coverage.
// Interior smart-recording gaps keep their existing fill policy; explicit invalid
// readings still break integration even if display filling replaces them.
const coverage = new WeakMap<ActivityInterface, Coverage>();

export function captureHeartRateCoverageBeforeFill(activity: ActivityInterface): void {
  if (!activity.hasStreamData(DataHeartRate.type)) return;
  const stream = activity.getStream(DataHeartRate.type), data = stream.getData();
  const prior = coverage.get(activity);
  if (prior?.stream === stream && prior.data === data) return;
  let first = Infinity, last = -1;
  const invalid = new Set<number>();
  data.forEach((value, index) => {
    if (typeof value !== 'number') return;
    first = Math.min(first, index); last = index;
    if (!Number.isFinite(value) || value <= 0) invalid.add(index);
  });
  coverage.set(activity, { stream, data, first, last, invalid });
}

export function retainHeartRateCoverageAfterFill(activity: ActivityInterface): void {
  const entry = coverage.get(activity);
  if (entry && activity.hasStreamData(DataHeartRate.type) && activity.getStream(DataHeartRate.type) === entry.stream) {
    entry.data = entry.stream.getData();
  }
}

export function getHeartRateSamplesWithCoverage(activity: ActivityInterface): Array<{ duration: number; value: number }> {
  if (!activity.hasStreamData(DataHeartRate.type)) return [];
  const stream = activity.getStream(DataHeartRate.type), data = stream.getData();
  const candidate = coverage.get(activity);
  const bounds = candidate?.stream === stream && candidate.data === data ? candidate : undefined;
  return data.flatMap((value, duration) => {
    if (typeof value !== 'number' || bounds && (duration < bounds.first || duration > bounds.last)) return [];
    return [{ duration, value: bounds?.invalid.has(duration) ? NaN : value }];
  });
}
