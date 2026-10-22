import { Stream, StreamJSONInterface } from './stream';
import { StreamDataItem } from './stream.interface';

/** Irregular intervals in milliseconds, optionally retaining explicit elapsed end timestamps. */
export class IBIStream extends Stream {
  private sampleTimes?: number[];

  /** Legacy arrays use cumulative timing. Explicit timestamps preserve gaps and activity offsets. */
  constructor(data?: (number | null)[], sampleTimes?: readonly number[]) {
    super('IBI', data);
    if (sampleTimes) {
      if (
        sampleTimes.length !== this.data.length ||
        sampleTimes.some((time, i) => !Number.isFinite(time) || (i > 0 && time < sampleTimes[i - 1]))
      ) {
        throw new RangeError('IBI sample times must be finite, ordered and aligned with intervals');
      }
      this.sampleTimes = [...sampleTimes];
    }
  }

  /** Replacing data invalidates previous explicit timing. */
  override setData(data: (number | null)[]): this {
    this.sampleTimes = undefined;
    return super.setData(data);
  }

  /** Copy of explicit elapsed end timestamps, or null for cumulative arrays. */
  getSampleTimes(): number[] | null {
    return this.sampleTimes ? [...this.sampleTimes] : null;
  }

  override getStreamDataByTime(startDate: Date, onlyNumeric = false, filterInfinity = false): StreamDataItem[] {
    return this.getStreamDataByDuration(startDate.getTime(), onlyNumeric, filterInfinity);
  }

  override getStreamDataByDuration(offset = 0, onlyNumeric = false, filterInfinity = false): StreamDataItem[] {
    if (this.sampleTimes && this.sampleTimes.length !== this.data.length)
      throw new RangeError('IBI data and sample times are no longer aligned');
    let cumulative = 0;
    return this.data.reduce<StreamDataItem[]>((result, value, index) => {
      if (typeof value === 'number' && Number.isFinite(value) && value > 0) cumulative += value;
      const time = (this.sampleTimes?.[index] ?? cumulative) + offset;
      if (onlyNumeric && (value === null || !Number.isFinite(value))) return result;
      if (filterInfinity && (value === Infinity || value === -Infinity)) return result;
      result.push({ time, value });
      return result;
    }, []);
  }

  /** Preserve raw/legacy beat-array JSON and optional elapsed end times, without a regular-sampling label. */
  override toJSON(): StreamJSONInterface {
    return { type: this.type, data: this.data, ...(this.sampleTimes ? { sampleTimes: [...this.sampleTimes] } : {}) };
  }
}
