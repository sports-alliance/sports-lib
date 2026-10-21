import type { ActivityInterface } from '../../activities/activity.interface';
import { DataTimerTime } from '../../data/data.timer-time';
import { DataPower } from '../../data/data.power';
import type { PowerCoverage } from '../../activities/power-coverage';
import { activeDistanceSegments } from './distance-intervals';

export interface PowerIntervals {
  coverage: PowerCoverage;
  /** Complete one-second bins only, for rolling calculations. Missing and paused bins are NaN. */
  watts: number[];
}

/** A recorded sample supports its own one-second bin only, clipped at timer/lap boundaries.
 * A sample at the activity endpoint has no duration. Never spread sparse observations into gaps.
 */
export function powerIntervals(activity: ActivityInterface, start = 0, end = Infinity): PowerIntervals {
  const stream = activity.getAllStreams().find(stream => stream.type === DataPower.type);
  const raw = stream?.getData() ?? [];
  const length = Math.min(raw.length, Math.max(0, Math.ceil((+activity.endDate - +activity.startDate) / 1000)));
  const offset = Math.max(0, Math.min(length, Math.floor(start)));
  const limit = Math.max(offset, Math.min(length, Math.ceil(end)));
  // Importers now retain unknown values as null. The canonical stream itself is
  // sufficient evidence, including after JSON restoration or explicit caller edits.
  const watts = Array(limit - offset).fill(NaN);
  let duration = 0,
    covered = 0,
    joules = 0;
  for (const segment of activeDistanceSegments(activity)) {
    const from = Math.max(start, segment.start),
      to = Math.min(end, segment.end);
    if (!(to > from)) continue;
    duration += to - from;
    for (let i = Math.max(offset, Math.floor(from)); i < Math.min(limit, Math.ceil(to)); i++) {
      const value = raw[i];
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) continue;
      const support = Math.min(i + 1, to) - Math.max(i, from);
      if (!(support > 0)) continue;
      covered += support;
      joules += value * support;
      if (support >= 1 - 1e-9) watts[i - offset] = value;
    }
  }
  if (start === 0 && end === Infinity) {
    const timer = activity.getStat(DataTimerTime.type)?.getValue();
    if (typeof timer === 'number' && Number.isFinite(timer) && timer > 0) duration = Math.max(duration, timer);
  }
  return {
    watts,
    coverage: {
      durationSeconds: duration,
      coveredDurationSeconds: covered,
      coverageRatio: duration > 0 ? Math.min(1, covered / duration) : 0,
      observedAveragePowerWatts: covered > 0 ? joules / covered : null,
      observedWorkKilojoules: joules / 1000
    }
  };
}

/** Complete contiguous windows, retaining real zeroes. A missing bin invalidates its whole window. */
export function meanMaxPower(watts: number[], duration: number): number | null {
  if (!Number.isSafeInteger(duration) || duration <= 0 || duration > watts.length) return null;
  let sum = 0,
    count = 0,
    best: number | null = null;
  for (let i = 0; i < watts.length; i++) {
    if (!Number.isFinite(watts[i]) || watts[i] < 0) {
      sum = 0;
      count = 0;
      continue;
    }
    sum += watts[i];
    if (++count > duration) sum -= watts[i - duration];
    if (count >= duration) best = Math.max(best ?? 0, Math.max(0, sum) / duration);
  }
  return best;
}
