import { collectRRIntervals } from './rr-timing';

describe('R-R batch timing', () => {
  it('keeps a running cursor for repeated and older batch timestamps', () => {
    expect(
      collectRRIntervals([
        { time: 0, intervals: [800, 900] },
        { time: 0, intervals: [1000] },
        { time: 1000, intervals: [850] }
      ]).map(sample => sample.time)
    ).toEqual([800, 1700, 2700, 3550]);
  });
  it('retains an explicit timestamp advance and continues untimed subsequent batches', () => {
    expect(
      collectRRIntervals([
        { time: 0, intervals: [800] },
        { time: 5000, intervals: [900] },
        { time: null, intervals: [800] }
      ]).map(sample => sample.time)
    ).toEqual([800, 5900, 6700]);
  });
  it('does not invent a clock before any timestamp and retains invalid observations after anchoring', () => {
    const samples = collectRRIntervals([
      { time: null, intervals: [800] },
      { time: 1000, intervals: [0, null, 800] }
    ]);
    expect(samples.map(sample => sample.time)).toEqual([1000, 1000, 1800]);
    expect(samples[0].interval).toBe(0);
    expect(samples[1].interval).toBeNaN();
  });
});
