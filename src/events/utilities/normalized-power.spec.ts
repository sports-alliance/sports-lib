import { calculateNormalizedPower as np } from './normalized-power';
import { DataStartEvent } from '../../data/data.start-event';
import { DataStopEvent } from '../../data/data.stop-event';
import { DataStopAllEvent } from '../../data/data.stop-all-event';
const time = (length: number) => Array.from({ length }, (_, index) => index);

describe('rolling normalized power', () => {
  it('matches an independent exhaustive sliding-window reference for variable power', () => {
    const watts: number[] = time(3600).map(i => Math.floor(i / 30) % 2 ? 0 : 400);
    const means = watts.slice(29).map((_, i) => watts.slice(i, i + 30).reduce((a, b) => a + b, 0) / 30);
    const expected = Math.pow(means.reduce((total, mean) => total + mean ** 4, 0) / means.length, 0.25);
    expect(np(watts, time(watts.length))).toBeCloseTo(expected, 10);
    expect(expected).toBeCloseTo(267.6478756293963, 8);
  });
  it('keeps real zeroes, includes the first complete window and rejects shorter coverage', () => {
    expect(np(Array(30).fill(0), time(30))).toBe(0);
    expect(np(Array(30).fill(250), time(30))).toBe(250);
    expect(np(Array(29).fill(250), time(29))).toBeNaN();
    expect(np([], [])).toBeNaN();
  });
  it.each([NaN, Infinity, -1, null, undefined])('does not interpolate invalid power %s', invalid => {
    expect(np([...Array(20).fill(400), invalid, ...Array(20).fill(0)] as number[], time(41))).toBeNaN();
  });
  it('restarts at timestamp gaps, duplicates, reversals and fractional irregular intervals', () => {
    for (const middle of [20, 18, 10, 19.5]) {
      const seconds = [...time(20), ...time(20).map(i => i + middle + 1)];
      expect(np(Array(40).fill(200), seconds)).toBeNaN();
    }
    expect(np(Array(60).fill(200), time(60).map(i => i * 2))).toBeNaN();
    expect(np(Array(60).fill(200), [...time(30), ...time(30).map(i => i + 500)])).toBe(200);
  });
  it.each([DataStopEvent, DataStopAllEvent])('excludes paused samples and restarts at resume', Stop => {
    const watts = [...Array(30).fill(200), ...Array(100).fill(900), ...Array(30).fill(200)];
    expect(np(watts, time(160), [new DataStartEvent(130), new Stop(30)])).toBe(200);
    expect(np(Array(40).fill(200), time(40), [new Stop(20)])).toBeNaN();
    expect(np(Array(40).fill(200), time(40), [new Stop(20), new DataStartEvent(20)])).toBeNaN();
  });
});
