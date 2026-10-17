import { RRIntervalSample } from './rr-analysis';

interface RRBatch {
  time: number | null;
  intervals: readonly unknown[];
}

/** Preserve timestamp advances while allowing repeated batch timestamps to share an advancing beat cursor. */
export function collectRRIntervals(batches: readonly RRBatch[]): RRIntervalSample[] {
  const samples: RRIntervalSample[] = [];
  let cursor: number | null = null;
  for (const batch of batches) {
    if (batch.time !== null && Number.isFinite(batch.time)) cursor = Math.max(cursor ?? batch.time, batch.time);
    if (cursor === null || !Array.isArray(batch.intervals)) continue;
    for (const raw of batch.intervals) {
      const interval = typeof raw === 'number' ? raw : NaN;
      if (Number.isFinite(interval) && interval > 0) cursor += interval;
      samples.push({ time: cursor, interval });
    }
  }
  return samples;
}
