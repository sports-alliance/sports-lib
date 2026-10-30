import { RRHeartRateFilter, filterRRHeartRate } from './rr-heart-rate';
import { RRIntervalSample } from './rr-analysis';
import goldenCases from './rr-heart-rate.fixtures.json';
import { createHash } from 'node:crypto';

const samples = (intervals: number[], offset = 0): RRIntervalSample[] => {
  let time = offset;
  return intervals.map(interval => ({ time: (time += interval), interval }));
};

describe('RRHeartRateFilter', () => {
  // Synthetic vectors from the independently exercised integer reference implementation.
  it.each(goldenCases)('matches the engineering reference: $name', ({ intervals, expected }) => {
    const filter = new RRHeartRateFilter();
    expect(intervals.map(rr => filter.update(rr))).toEqual(expected);
  });

  it('matches an independent integer-reference digest across 100,000 deterministic synthetic intervals', () => {
    const filter = new RRHeartRateFilter();
    const output = new Uint8Array(100000);
    let state = 20261030;
    for (let i = 0; i < output.length; i++) {
      state = (Math.imul(1664525, state) + 1013904223) >>> 0;
      const phase = i % 1500;
      const interval = phase < 200 ? 500 : phase < 500 ? 333 : phase < 900 ? 800 : 1 + (state % 3000);
      output[i] = filter.update(interval) ?? 0;
    }
    // Reference encodes unavailable as zero; valid filtered HR is always between 30 and 240 bpm.
    expect(createHash('sha256').update(output).digest('hex')).toBe(
      '1b51a42edb0a4733cc82b678f2d72fc762339ffd87e66bba6acb857a6300001b'
    );
  });

  it.each([250, 2000])('accepts the inclusive %i ms boundary after consistency is established', rr => {
    const filter = new RRHeartRateFilter();
    expect(filter.update(rr)).toBeNull();
    expect(filter.update(rr)).toBe(Math.round(60000 / rr));
  });

  it('uses the padded 771 ms history at startup', () => {
    expect(new RRHeartRateFilter().update(771)).toBe(78);
    expect(new RRHeartRateFilter().update(500)).toBeNull();
  });

  it('holds a missed-beat halving until exactly 60 seconds of interval time have elapsed', () => {
    const filter = new RRHeartRateFilter();
    Array.from({ length: 40 }, () => filter.update(400));
    expect(Array.from({ length: 74 }, () => filter.update(800))).toEqual(Array(74).fill(150));
    expect(filter.update(800)).toBe(143);
  });

  it.each([249, 2001, 60000, Number.MAX_SAFE_INTEGER])('holds initialized HR for positive out-of-range %i ms', rr => {
    const filter = new RRHeartRateFilter();
    filter.update(500);
    expect(filter.update(500)).toBe(120);
    expect(filter.update(rr)).toBe(120);
  });

  it.each([0, -500, NaN, Infinity, -Infinity, 0.1, Number.MAX_VALUE])('resets on unusable input %s', rr => {
    const filter = new RRHeartRateFilter();
    filter.update(500);
    filter.update(500);
    expect(filter.update(rr)).toBeNull();
    expect(filter.update(500)).toBeNull();
    expect(filter.update(500)).toBe(120);
  });

  it('rounds milliseconds before filtering and keeps instances and explicit resets independent', () => {
    const first = new RRHeartRateFilter(),
      second = new RRHeartRateFilter();
    expect(first.update(499.6)).toBeNull();
    expect(first.update(500.4)).toBe(120);
    expect(second.update(1000)).toBeNull();
    expect(second.update(1000)).toBe(60);
    first.reset();
    expect(first.update(500)).toBeNull();
    expect(second.update(1000)).toBe(60);
  });
});

describe('filterRRHeartRate', () => {
  it('retains raw positive intervals, elapsed end times and null startup without mutating input', () => {
    const input = samples([500, 500, 2500, 500]);
    input.forEach(Object.freeze);
    Object.freeze(input);
    expect(filterRRHeartRate(input, 5000)).toEqual([
      { time: 500, interval: 500, heartRate: null },
      { time: 1000, interval: 500, heartRate: 120 },
      { time: 3500, interval: 2500, heartRate: 120 },
      { time: 4000, interval: 500, heartRate: 120 }
    ]);
  });

  it('resets after a real source gap instead of carrying HR into a disconnected recording', () => {
    const input = [...samples([500, 500]), ...samples([1000, 1000], 10000)];
    expect(filterRRHeartRate(input, 12000).map(s => s.heartRate)).toEqual([null, 120, null, 60]);
  });

  it.each([0, -1, NaN, Infinity])('treats invalid interval %s as a recording barrier', interval => {
    const input = [...samples([500, 500]), { time: 1000, interval }, ...samples([500, 500], 1000)];
    expect(filterRRHeartRate(input, 2000).map(s => s.heartRate)).toEqual([null, 120, null, 120]);
  });

  it('does not generate partial beats at activity boundaries or extend HR beyond activity end', () => {
    const input = samples([500, 500, 500, 500, 500], -250);
    expect(filterRRHeartRate(input, 2000)).toEqual([
      { time: 750, interval: 500, heartRate: null },
      { time: 1250, interval: 500, heartRate: 120 },
      { time: 1750, interval: 500, heartRate: 120 }
    ]);
  });

  it('tolerates sub-microsecond source rounding but clamps the final sample to the activity end', () => {
    expect(
      filterRRHeartRate(
        [
          { time: 500, interval: 500 },
          { time: 1000.0002, interval: 500 }
        ],
        1000
      )
    ).toEqual([
      { time: 500, interval: 500, heartRate: null },
      { time: 1000, interval: 500, heartRate: 120 }
    ]);
  });

  it.each([0, -1, NaN, Infinity])('rejects invalid duration %s', duration => {
    expect(() => filterRRHeartRate([], duration)).toThrow(RangeError);
  });

  it.each([
    {
      input: [
        { time: 500, interval: 500 },
        { time: 900, interval: 500 }
      ]
    },
    {
      input: [
        { time: 1000, interval: 500 },
        { time: 500, interval: 500 }
      ]
    }
  ])('rejects overlapping/backward intervals', ({ input }) => {
    expect(() => filterRRHeartRate(input, 2000)).toThrow(RangeError);
  });
});
