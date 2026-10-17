/** Version of the activity R–R analysis definitions. */
export const RR_ANALYSIS_VERSION = 1;

/** A recorded interval in milliseconds, with its end on an activity-relative millisecond clock. */
export interface RRIntervalSample {
  time: number;
  interval: number;
}

/** Algorithmic quality classification; suspected pairs are not a rhythm diagnosis. */
export type RRBeatClassification = 'accepted' | 'short' | 'long' | 'out-of-range' | 'suspected-ectopic';

/** Classified observation. Segment boundaries prevent adjacency across missing recordings. */
export interface RRAnalyzedBeat extends RRIntervalSample {
  classification: RRBeatClassification;
  segment: number;
}

/** Trailing-window values. Null means the observation requirements were not met. */
export interface RRWindow {
  time: number;
  heartRate: number | null;
  rmssd: number | null;
  artifactPercentage: number | null;
  dfaAlpha1: number | null;
}

/** Activity-only HRV and recording-quality summaries, calculated from unsmoothed intervals. */
export interface RRSummary {
  intervalCount: number;
  invalidIntervalCount: number;
  artifactCount: number;
  artifactPercentage: number;
  suspectedEctopicPairCount: number;
  suspectedEctopicPairsPerHour: number | null;
  coveragePercentage: number;
  gapCount: number;
  longestGap: number;
  meanInterval: number | null;
  averageHeartRate: number | null;
  sdnn: number | null;
  rmssd: number | null;
  pnn50: number | null;
  dfaAlpha1Median: number | null;
  dfaAlpha1Min: number | null;
  dfaAlpha1Max: number | null;
  dfaWindowCount: number;
}

/** Analysis output. Percentages are 0–100; longestGap is seconds; interval/HRV values are milliseconds. */
export interface RRAnalysis {
  version: typeof RR_ANALYSIS_VERSION;
  summary: RRSummary;
  beats: RRAnalyzedBeat[];
  windows: RRWindow[];
}

/** Control retention of detailed analysis; summary DFA still evaluates its trailing windows. */
export interface RRAnalysisOptions {
  includeDetails?: boolean;
}

// Absolute source timestamps can lose sub-microsecond precision when converted to elapsed time.
const EPSILON_MS = 1e-3;
const median = (values: readonly number[]): number | null => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const inRange = (value: number) => value >= 300 && value <= 2000;

/**
 * First-order DFA on beat intervals, using integer scales 4–16 and forward/reverse segmentation.
 * Returns null for fewer than 32 observations, invalid intervals or a signal with no usable fluctuation.
 * This function accepts a continuous, quality-controlled sequence; it does not filter or join recordings.
 */
export function calculateDFAAlpha1(intervals: readonly number[]): number | null {
  const length = intervals.length;
  if (length < 32 || intervals.some(value => !Number.isFinite(value) || value <= 0)) return null;
  const mean = intervals.reduce((sum, value) => sum + value, 0) / length;
  const integrated = new Float64Array(length);
  let cumulative = 0;
  for (let i = 0; i < length; i++) integrated[i] = cumulative += intervals[i] - mean;
  const points: { x: number; y: number }[] = [];
  for (let scale = 4; scale <= 16; scale++) {
    const segments = Math.floor(length / scale);
    const center = (scale - 1) / 2;
    const denominator = (scale * (scale * scale - 1)) / 12;
    let squaredError = 0;
    // Reverse segments include the tail instead of discarding it at every scale.
    for (const reverse of [false, true]) {
      for (let segment = 0; segment < segments; segment++) {
        const offset = reverse ? length - (segment + 1) * scale : segment * scale;
        let average = 0;
        let covariance = 0;
        for (let i = 0; i < scale; i++) {
          average += integrated[offset + i] / scale;
          covariance += (i - center) * integrated[offset + i];
        }
        const slope = covariance / denominator;
        for (let i = 0; i < scale; i++) {
          const residual = integrated[offset + i] - average - slope * (i - center);
          squaredError += residual * residual;
        }
      }
    }
    const fluctuation = Math.sqrt(squaredError / (2 * segments * scale));
    if (fluctuation > 0 && Number.isFinite(fluctuation)) points.push({ x: Math.log(scale), y: Math.log(fluctuation) });
  }
  if (points.length < 2) return null;
  const meanX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const meanY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  let covariance = 0;
  let variance = 0;
  for (const point of points) {
    covariance += (point.x - meanX) * (point.y - meanY);
    variance += (point.x - meanX) ** 2;
  }
  const result = covariance / variance;
  return Number.isFinite(result) ? result : null;
}

function timeDomain(beats: readonly RRAnalyzedBeat[]) {
  let count = 0;
  let mean = 0;
  let m2 = 0;
  let differences = 0;
  let squaredDifferences = 0;
  let over50 = 0;
  for (let i = 0; i < beats.length; i++) {
    const beat = beats[i];
    if (beat.classification !== 'accepted') continue;
    count++;
    const delta = beat.interval - mean;
    mean += delta / count;
    m2 += delta * (beat.interval - mean);
    const previous = beats[i - 1];
    if (previous?.classification === 'accepted' && previous.segment === beat.segment) {
      const difference = beat.interval - previous.interval;
      differences++;
      squaredDifferences += difference * difference;
      if (Math.abs(difference) > 50) over50++;
    }
  }
  return {
    meanInterval: count ? mean : null,
    sdnn: count > 1 ? Math.sqrt(Math.max(0, m2) / (count - 1)) : null,
    rmssd: differences ? Math.sqrt(squaredDifferences / differences) : null,
    pnn50: differences ? (100 * over50) / differences : null
  };
}

function classify(beats: RRAnalyzedBeat[]): number {
  const references = beats.map((beat, index) => {
    const neighbors: number[] = [];
    for (let i = Math.max(0, index - 5); i < Math.min(beats.length, index + 6); i++) {
      if (i !== index && beats[i].segment === beat.segment && inRange(beats[i].interval))
        neighbors.push(beats[i].interval);
    }
    return median(neighbors);
  });
  beats.forEach((beat, index) => {
    const reference = references[index];
    beat.classification = !inRange(beat.interval)
      ? 'out-of-range'
      : reference !== null && beat.interval < reference * 0.8
        ? 'short'
        : reference !== null && beat.interval > reference * 1.2
          ? 'long'
          : 'accepted';
  });
  let pairs = 0;
  for (let i = 0; i + 1 < beats.length; i++) {
    const first = beats[i];
    const second = beats[i + 1];
    const reference = references[i];
    if (
      reference === null ||
      first.segment !== second.segment ||
      first.classification !== 'accepted' ||
      second.classification !== 'accepted'
    )
      continue;
    if (
      first.interval < reference * 0.9 &&
      second.interval > reference * 1.05 &&
      Math.abs(first.interval + second.interval - 2 * reference) <= reference * 0.1
    ) {
      first.classification = second.classification = 'suspected-ectopic';
      pairs++;
      i++;
    }
  }
  return pairs;
}

function correctedDFA(beats: readonly RRAnalyzedBeat[]): number | null {
  const accepted = beats.filter(beat => beat.classification === 'accepted').length;
  if (
    accepted < 50 ||
    (beats.length - accepted) / beats.length > 0.05 ||
    beats[0].segment !== beats[beats.length - 1].segment
  )
    return null;
  if (beats[0].classification !== 'accepted' || beats[beats.length - 1].classification !== 'accepted') return null;
  const corrected = beats.map(beat => beat.interval);
  let left = 0;
  while (left < beats.length - 1) {
    let right = left + 1;
    while (beats[right].classification !== 'accepted') right++;
    for (let i = left + 1; i < right; i++) {
      const fraction = (beats[i].time - beats[left].time) / (beats[right].time - beats[left].time);
      corrected[i] = beats[left].interval + fraction * (beats[right].interval - beats[left].interval);
    }
    left = right;
  }
  return calculateDFAAlpha1(corrected);
}

/**
 * Analyze unsmoothed R–R samples on an elapsed millisecond clock within [0, durationMs].
 * Input intervals must not overlap or move backward. Invalid observations break adjacency and are counted separately.
 * Boundary-crossing intervals contribute clipped recording coverage but not beat statistics. Missing source timing
 * cannot be inferred from an untimed array; callers must preserve independently recorded timestamps when available.
 * No physiological thresholds, recovery classifications or rhythm diagnoses are inferred.
 */
export function analyzeRRIntervals(
  samples: readonly RRIntervalSample[],
  durationMs: number,
  options: RRAnalysisOptions = {}
): RRAnalysis | null {
  if (!Number.isFinite(durationMs) || durationMs <= 0)
    throw new RangeError('R-R analysis requires a positive finite duration');
  const beats: RRAnalyzedBeat[] = [];
  let invalidIntervalCount = 0;
  let segment = 0;
  let previousEnd: number | null = null;
  let coveredMs = 0;
  let gapCount = 0;
  let longestGapMs = 0;
  for (const sample of samples) {
    if (!Number.isFinite(sample?.time) || !Number.isFinite(sample?.interval) || sample.interval <= 0) {
      invalidIntervalCount++;
      segment++;
      continue;
    }
    const start = sample.time - sample.interval;
    if (!Number.isFinite(start)) throw new RangeError('R-R interval time is outside the finite range');
    if (previousEnd !== null) {
      if (start < previousEnd - EPSILON_MS) throw new RangeError('R-R intervals must be ordered and non-overlapping');
      if (start > previousEnd + EPSILON_MS) {
        segment++;
        const gap = Math.min(durationMs, start) - Math.max(0, previousEnd);
        if (gap > EPSILON_MS) {
          gapCount++;
          longestGapMs = Math.max(longestGapMs, gap);
        }
      }
    }
    previousEnd = sample.time;
    coveredMs += Math.max(0, Math.min(durationMs, sample.time) - Math.max(0, start));
    if (start < -EPSILON_MS || sample.time > durationMs + EPSILON_MS) {
      segment++;
      continue;
    }
    beats.push({ time: sample.time, interval: sample.interval, segment, classification: 'accepted' });
  }
  if (!beats.length) return null;
  const pairCount = classify(beats);
  const artifactCount = beats.filter(
    beat => beat.classification !== 'accepted' && beat.classification !== 'suspected-ectopic'
  ).length;
  const td = timeDomain(beats);
  const windows: RRWindow[] = [];
  const alphas: number[] = [];
  const positions = { hr: 0, rmssd: 0, dfa: 0 };
  let end = 0;
  for (let time = 5000; time <= durationMs; time += 5000) {
    while (end < beats.length && beats[end].time <= time + EPSILON_MS) end++;
    const window = (key: keyof typeof positions, span: number) => {
      const start = time - span;
      while (positions[key] < end && beats[positions[key]].time <= start + EPSILON_MS) positions[key]++;
      const selected = beats.slice(positions[key], end);
      const covered = selected.reduce(
        (sum, beat) => sum + Math.max(0, beat.time - Math.max(start, beat.time - beat.interval)),
        0
      );
      return { selected, full: start >= 0 && covered >= span * 0.9 };
    };
    const hr = timeDomain(window('hr', 10000).selected);
    const rm = window('rmssd', 60000);
    const dfa = window('dfa', 120000);
    const alpha = dfa.full ? correctedDFA(dfa.selected) : null;
    if (alpha !== null) alphas.push(alpha);
    if (options.includeDetails !== false)
      windows.push({
        time,
        heartRate: hr.meanInterval === null ? null : 60000 / hr.meanInterval,
        rmssd: rm.full ? timeDomain(rm.selected).rmssd : null,
        artifactPercentage:
          rm.full && rm.selected.length
            ? (100 *
                rm.selected.filter(
                  beat => beat.classification !== 'accepted' && beat.classification !== 'suspected-ectopic'
                ).length) /
              rm.selected.length
            : null,
        dfaAlpha1: alpha
      });
  }
  return {
    version: RR_ANALYSIS_VERSION,
    summary: {
      intervalCount: beats.length,
      invalidIntervalCount,
      artifactCount,
      artifactPercentage: (100 * artifactCount) / beats.length,
      suspectedEctopicPairCount: pairCount,
      suspectedEctopicPairsPerHour: coveredMs > 0 ? (pairCount * 3600000) / coveredMs : null,
      coveragePercentage: Math.max(0, Math.min(100, (100 * coveredMs) / durationMs)),
      gapCount,
      longestGap: longestGapMs / 1000,
      ...td,
      averageHeartRate: td.meanInterval === null ? null : 60000 / td.meanInterval,
      dfaAlpha1Median: median(alphas),
      dfaAlpha1Min: alphas.length ? alphas.reduce((min, value) => Math.min(min, value)) : null,
      dfaAlpha1Max: alphas.length ? alphas.reduce((max, value) => Math.max(max, value)) : null,
      dfaWindowCount: alphas.length
    },
    beats: options.includeDetails === false ? [] : beats,
    windows
  };
}
