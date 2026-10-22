import { RRIntervalSample } from './rr-analysis';

interface RRBatch {
  time: number | null;
  intervals: readonly unknown[];
}

/** Preserve timestamp advances while allowing repeated batch timestamps to share an advancing beat cursor. */
export function collectRRIntervals(
  batches: readonly RRBatch[],
  untimedStart: number | null = null
): RRIntervalSample[] {
  const samples: RRIntervalSample[] = [];
  let cursor: number | null = null;
  for (const batch of batches) {
    if (batch.time !== null && Number.isFinite(batch.time)) cursor = Math.max(cursor ?? batch.time, batch.time);
    else if (cursor === null && untimedStart !== null && Number.isFinite(untimedStart)) cursor = untimedStart;
    if (cursor === null || !Array.isArray(batch.intervals)) continue;
    for (const raw of batch.intervals) {
      const interval = typeof raw === 'number' ? raw : NaN;
      if (Number.isFinite(interval) && interval > 0) cursor += interval;
      samples.push({ time: cursor, interval });
    }
  }
  return samples;
}

/** Keep overlapping boundary intervals as coverage evidence; invalid observations own only their timestamp. */
export function isRRIntervalInBounds(sample: RRIntervalSample, start: number, end: number): boolean {
  if (!Number.isFinite(sample.interval) || sample.interval <= 0) return sample.time >= start && sample.time <= end;
  return sample.time > start && sample.time - sample.interval < end;
}
