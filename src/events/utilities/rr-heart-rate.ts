import { RRIntervalSample } from './rr-analysis';

const HISTORY_SIZE = 40;
const MIN_INTERVAL_MS = 250;
const MAX_INTERVAL_MS = 2000;
const GAP_TOLERANCE_MS = 1e-3;

// Integer corrections use symmetric rounding, including negative half-way values.
const divideRound = (numerator: number, denominator: number) =>
  Math.sign(numerator) * Math.floor(Math.abs(numerator) / denominator + 0.5);

/**
 * Stateful, causal heart-rate estimate from raw R–R intervals, using a 40-interval consistency history,
 * missed-beat protection and two-stage smoothing. This estimates HR, not HRV or recording quality.
 * Instances represent one continuous recording; call reset after a disconnect or use filterRRHeartRate for timed data.
 */
export class RRHeartRateFilter {
  private readonly history = new Array<number>(HISTORY_SIZE).fill(771);
  private nextIndex = 0;
  private historyCount = 0;
  private reliable = false;
  private candidate = 0;
  private filtered = 0;
  private smooth = 0;
  private heldMs = 0;
  private output: number | null = null;

  /** Reset history, reliability, smoothing and elapsed hold time to their startup state. */
  reset(): void {
    this.history.fill(771);
    this.nextIndex = this.historyCount = this.candidate = this.filtered = this.smooth = this.heldMs = 0;
    this.reliable = false;
    this.output = null;
  }

  /**
   * Process an interval in milliseconds and return integer bpm, or null until initialized.
   * Positive finite intervals are rounded to integer milliseconds before filtering. Positive out-of-range intervals
   * enter history and advance the hold timer, but hold the previous output; 250–2,000 ms are accepted inclusively.
   * Nonpositive/nonfinite values and values that cannot round to a positive safe integer reset the filter and return
   * null. The unavailable output is null, never a numeric 0 or 255 sentinel.
   */
  update(intervalMs: number): number | null {
    const interval = Number.isFinite(intervalMs) ? Math.round(intervalMs) : NaN;
    if (!Number.isSafeInteger(interval) || interval <= 0) {
      this.reset();
      return null;
    }
    this.history[this.nextIndex] = interval;
    this.nextIndex = (this.nextIndex + 1) % HISTORY_SIZE;
    this.historyCount = Math.min(this.historyCount + 1, HISTORY_SIZE - 1);
    this.heldMs = Math.min(60000, this.heldMs + interval);
    if (interval < MIN_INTERVAL_MS || interval > MAX_INTERVAL_MS) return this.output;

    const measured = divideRound(600000, interval);
    const newest = divideRound(60000, interval);
    const comparisons = this.reliable ? 2 : HISTORY_SIZE;
    const requiredMatches = this.reliable ? 1 : 1 + Math.floor(this.historyCount / 3);
    let reference = newest;
    let matches = 0;
    for (let age = 1; age < comparisons; age++) {
      const previous = this.history[(this.nextIndex + HISTORY_SIZE - 1 - age) % HISTORY_SIZE];
      const rate = divideRound(60000, previous);
      if (Math.abs(reference - rate) < 7) {
        matches++;
        reference = rate;
      }
    }
    this.reliable = false;
    const possibleMissedBeat =
      this.candidate > 1200 && Math.abs(Math.trunc(this.candidate / 20) - newest) < 10 && this.heldMs < 60000;
    let target = this.filtered;
    if (matches >= requiredMatches && !possibleMissedBeat) {
      target = measured;
      this.heldMs = 0;
    }
    this.candidate = target;
    if (this.filtered === 0) this.filtered = this.smooth = target;
    if (Math.abs(this.candidate - measured) < 100) {
      this.candidate = measured;
      this.heldMs = 0;
      this.reliable = true;
    }
    this.filtered += divideRound((this.candidate - this.filtered) * 3, 10);
    const smoothTarget = Math.abs(this.candidate - this.filtered) < 50 ? this.candidate : this.filtered;
    this.smooth += divideRound((smoothTarget - this.smooth) * 3, 10);
    if (this.smooth > 0) this.output = divideRound(this.smooth, 10);
    return this.output;
  }
}

/** A complete, in-bounds positive raw interval and its filtered HR; null denotes filter startup. */
export interface RRHeartRateSample extends RRIntervalSample {
  /** Integer beats per minute; unavailable estimates are null rather than 0/255. */
  heartRate: number | null;
}

/**
 * Filter raw R–R intervals with activity-relative end timestamps in milliseconds, within [0, durationMs].
 * Preserves original intervals and end times (clamping sub-microsecond boundary rounding), without mutating input.
 * Invalid observations, source gaps and boundary-crossing intervals reset the state; positive out-of-range intervals
 * remain in the filter history. Rejects overlapping/backward intervals with the same 0.001 ms tolerance as R–R analysis.
 * Returns one result per complete positive interval; does not interpolate missing recordings or apply HRV artifact flags.
 */
export function filterRRHeartRate(samples: readonly RRIntervalSample[], durationMs: number): RRHeartRateSample[] {
  if (!Number.isFinite(durationMs) || durationMs <= 0)
    throw new RangeError('R-R heart-rate filtering requires a positive finite duration');
  const filter = new RRHeartRateFilter();
  const result: RRHeartRateSample[] = [];
  let previousEnd: number | null = null;
  for (const sample of samples) {
    if (!Number.isFinite(sample?.time) || !Number.isFinite(sample?.interval) || sample.interval <= 0) {
      filter.reset();
      continue;
    }
    const start = sample.time - sample.interval;
    if (!Number.isFinite(start)) throw new RangeError('R-R interval time is outside the finite range');
    if (previousEnd !== null) {
      if (start < previousEnd - GAP_TOLERANCE_MS)
        throw new RangeError('R-R intervals must be ordered and non-overlapping');
      if (start > previousEnd + GAP_TOLERANCE_MS) filter.reset();
    }
    previousEnd = sample.time;
    if (start < -GAP_TOLERANCE_MS || sample.time > durationMs + GAP_TOLERANCE_MS) {
      filter.reset();
      continue;
    }
    result.push({
      time: Math.max(0, Math.min(durationMs, sample.time)),
      interval: sample.interval,
      heartRate: filter.update(sample.interval)
    });
  }
  return result;
}
