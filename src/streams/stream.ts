import { StreamDataItem, StreamInterface } from './stream.interface';
import { isNumber } from '../events/utilities/helpers';
import { DynamicDataLoader } from '../data/data.store';
import { StreamFilterInterface } from './stream.filter.interface';

export class Stream implements StreamInterface {
  public readonly type: string;
  protected data: (number | null)[] = [];
  private intervalSupport?: StreamIntervalSupport;

  protected filter: StreamFilterInterface | null = null;

  /** Optional interval evidence belongs only to calculated rates, never to filled sensor readings. */
  constructor(type: string, data?: (number | null)[], intervalSupport?: StreamIntervalSupport) {
    this.type = type;
    if (data) {
      this.data = data;
    }
    this.intervalSupport = validateIntervalSupport(this.data, intervalSupport);
  }

  clearFilters(): this {
    this.filter = null;
    return this;
  }

  useFilter(filter: StreamFilterInterface): this {
    this.filter = filter;
    return this;
  }

  hasFilter(): boolean {
    return !!this.filter;
  }

  getData(onlyNumeric = false, filterInfinity = false): (number | null)[] {
    const data = this.filter ? this.filter.filterData(this.data) : this.data;
    if (!onlyNumeric && !filterInfinity) {
      return data;
    }
    return <number[]>data.filter(dataItem => !this.shouldDataBeFiltered(dataItem, onlyNumeric, filterInfinity));
  }

  setData(data: (number | null)[]): this {
    this.data = data;
    this.intervalSupport = undefined;
    return this;
  }

  /** Duration represented by each calculated sample. Filters cannot reuse the original weights. */
  getIntervalSupport(): StreamIntervalSupport | undefined {
    return this.filter ? undefined : this.intervalSupport;
  }

  getStreamDataByTime(startDate: Date, onlyNumeric = false, filterInfinity = false): StreamDataItem[] {
    return this.getData().reduce(
      (accu, dataItem, index) => {
        if (this.shouldDataBeFiltered(dataItem, onlyNumeric, filterInfinity)) {
          return accu;
        }
        accu.push({
          time: startDate.getTime() + index * 1000,
          value: dataItem
        });
        return accu;
      },
      <StreamDataItem[]>[]
    );
  }

  getStreamDataByDuration(offset = 0, onlyNumeric = false, filterInfinity = false): StreamDataItem[] {
    return this.getData().reduce(
      (accu, dataItem, index) => {
        if (this.shouldDataBeFiltered(dataItem, onlyNumeric, filterInfinity)) {
          return accu;
        }
        accu.push({
          time: index * 1000 + (offset || 0),
          value: dataItem
        });
        return accu;
      },
      <StreamDataItem[]>[]
    );
  }

  isExportable(): boolean {
    return (
      !DynamicDataLoader.isUnitDerivedDataType(this.type) &&
      !DynamicDataLoader.isSpeedDerivedDataType(this.type) &&
      !DynamicDataLoader.isBlackListedStream(this.type)
    );
  }

  toJSON(): StreamJSONInterface {
    return {
      type: this.type,
      data: this.data, // Exporting does/ should not use a filter
      ...(this.intervalSupport ? { intervalSupport: this.intervalSupport } : {})
    };
  }

  private shouldDataBeFiltered(data: any, onlyNumeric: boolean, filterInfinity: boolean): boolean {
    return (onlyNumeric && !isNumber(data)) || (filterInfinity && (data === Infinity || data === -Infinity));
  }
}

export interface StreamJSONInterface {
  /** IBI only: interval end times in milliseconds relative to activity start. */
  sampleTimes?: number[];
  type: string;
  data: (number | null)[];
  /** Optional calculation evidence; retain it when persisting generated streams. */
  intervalSupport?: StreamIntervalSupport;
}

/** Nonoverlapping elapsed-clock intervals represented by generated rate samples.
 * `ending` places the rate at the right endpoint; `starting` places it at the left.
 * A null duration means no calculated interval at that index. No missing sensor values are filled.
 */
export interface StreamIntervalSupport {
  direction: 'starting' | 'ending';
  durations: (number | null)[];
}

function validateIntervalSupport(
  data: (number | null)[],
  evidence?: StreamIntervalSupport
): StreamIntervalSupport | undefined {
  if (
    !evidence ||
    !['starting', 'ending'].includes(evidence.direction) ||
    !Array.isArray(evidence.durations) ||
    evidence.durations.length !== data.length
  )
    return undefined;
  let previousEnd = 0;
  for (let i = 0; i < data.length; i++) {
    const duration = evidence.durations[i];
    if (duration === null) continue;
    if (
      typeof duration !== 'number' ||
      !Number.isInteger(duration) ||
      duration <= 0 ||
      typeof data[i] !== 'number' ||
      !Number.isFinite(data[i])
    )
      return undefined;
    const start = evidence.direction === 'starting' ? i : i - duration;
    const end = start + duration;
    if (start < previousEnd || end >= data.length) return undefined;
    previousEnd = end;
  }
  return { direction: evidence.direction, durations: evidence.durations.slice() };
}
