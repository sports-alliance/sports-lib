import { analyzeRRIntervals, calculateDFAAlpha1, RRIntervalSample } from './rr-analysis';

const samples = (rr: number[], offset = 0): RRIntervalSample[] => {
  let time = offset;
  return rr.map(interval => ({ time: (time += interval), interval }));
};
const signal = (n: number) => {
  let seed = 17;
  return Array.from({ length: n }, () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return 800 + ((seed >>> 16) % 101) - 50;
  });
};
const run = (rr: number[]) => {
  const input = samples(rr);
  return analyzeRRIntervals(input, input[input.length - 1]?.time || 1);
};

describe('activity R-R analysis', () => {
  it('calculates sample SD, RMSSD, strict pNN50 and reciprocal mean HR', () => {
    expect(run([800, 850, 900])!.summary).toMatchObject({
      meanInterval: 850,
      sdnn: 50,
      rmssd: 50,
      pnn50: 0,
      artifactCount: 0
    });
    expect(run([800, 900, 1000])!.summary).toMatchObject({ sdnn: 100, rmssd: 100, pnn50: 100 });
    expect(run([800, 850, 900])!.summary.averageHeartRate).toBeCloseTo(60000 / 850, 10);
  });

  it('retains valid zero HRV and distinguishes missing estimates', () => {
    expect(run([800, 800])!.summary).toMatchObject({ sdnn: 0, rmssd: 0, pnn50: 0, dfaAlpha1Median: null });
    expect(run([800])!.summary).toMatchObject({ sdnn: null, rmssd: null, pnn50: null });
    expect(run([])).toBeNull();
    expect(run([200, 2500])!.summary).toMatchObject({ artifactCount: 2, meanInterval: null, sdnn: null, rmssd: null });
  });

  it.each([
    [799, 'short'],
    [800, 'accepted'],
    [1200, 'accepted'],
    [1201, 'long'],
    [299, 'out-of-range'],
    [2001, 'out-of-range']
  ])('classifies %s with strict deviation boundaries', (value, classification) => {
    const rr = [...Array(12).fill(1000), value as number, ...Array(12).fill(1000)];
    expect(run(rr)!.beats[12].classification).toBe(classification);
  });

  it('classifies suspected pairs separately, with artifact precedence and non-overlap', () => {
    const surround = (...pair: number[]) => [...Array(12).fill(1000), ...pair, ...Array(12).fill(1000)];
    const result = run(surround(850, 1150))!;
    expect(result.summary).toMatchObject({ suspectedEctopicPairCount: 1, artifactCount: 0, rmssd: 0 });
    expect(result.beats.slice(12, 14).map(beat => beat.classification)).toEqual([
      'suspected-ectopic',
      'suspected-ectopic'
    ]);
    expect(run(surround(700, 1300))!.summary).toMatchObject({ suspectedEctopicPairCount: 0, artifactCount: 2 });
    expect(run(surround(801, 1099))!.summary.suspectedEctopicPairCount).toBe(1);
    expect(run(surround(801, 1098))!.summary.suspectedEctopicPairCount).toBe(0);
  });

  it('never joins successive differences or suspected pairs across a recording gap', () => {
    const result = analyzeRRIntervals([...samples([800]), ...samples([900], 5000)], 5900)!;
    expect(result.summary).toMatchObject({ rmssd: null, pnn50: null, gapCount: 1, longestGap: 4.2 });
    const separated = [...samples([...Array(12).fill(1000), 850]), ...samples([1150, ...Array(12).fill(1000)], 20000)];
    expect(analyzeRRIntervals(separated, separated[separated.length - 1].time)!.summary.suspectedEctopicPairCount).toBe(
      0
    );
  });

  it('counts invalid observations separately and uses them as adjacency barriers', () => {
    const result = analyzeRRIntervals(
      [
        { time: 800, interval: 800 },
        { time: NaN, interval: 0 },
        { time: 1700, interval: 900 }
      ],
      1700
    )!;
    expect(result.summary).toMatchObject({
      invalidIntervalCount: 1,
      artifactCount: 0,
      rmssd: null,
      coveragePercentage: 100
    });
  });

  it('clips coverage at activity boundaries without using partial intervals as beats', () => {
    const result = analyzeRRIntervals(samples([800, 800, 800], -100), 2000)!;
    expect(result.summary).toMatchObject({ intervalCount: 1, coveragePercentage: 100, meanInterval: 800 });
    const gap = analyzeRRIntervals([...samples([800]), ...samples([900], 5000)], 10000)!;
    expect(gap.summary.coveragePercentage).toBe(17);
  });

  it('rejects ambiguous ordering, overlap and invalid activity bounds', () => {
    expect(() => analyzeRRIntervals(samples([800]), 0)).toThrow(RangeError);
    expect(() => analyzeRRIntervals(samples([800]), Infinity)).toThrow(RangeError);
    expect(() =>
      analyzeRRIntervals(
        [
          { time: 1000, interval: 800 },
          { time: 1200, interval: 800 }
        ],
        2000
      )
    ).toThrow(RangeError);
  });

  it('tolerates timestamp roundoff while splitting millisecond recording gaps', () => {
    const rounded = analyzeRRIntervals(
      [
        { time: 800, interval: 800 },
        { time: 1699.9999, interval: 900 }
      ],
      2000
    )!;
    expect(rounded.summary.rmssd).toBe(100);
    const separated = analyzeRRIntervals(
      [
        { time: 800, interval: 800 },
        { time: 1701, interval: 900 }
      ],
      2000
    )!;
    expect(separated.summary.rmssd).toBeNull();
    expect(separated.summary.gapCount).toBe(1);
  });

  it('interpolates isolated excluded beats for DFA and rejects excessive corrections', () => {
    const isolated = signal(400);
    isolated[60] = 200;
    const corrected = run(isolated)!;
    expect(corrected.summary.artifactCount).toBe(1);
    expect(Number.isFinite(corrected.windows[23].dfaAlpha1)).toBe(true);
    const excessive = signal(400);
    for (let i = 30; i < 50; i++) excessive[i] = 200;
    expect(run(excessive)!.windows[23].dfaAlpha1).toBeNull();
  });

  it('does not create a final grid point past the activity or initial partial-window warnings', () => {
    const result = analyzeRRIntervals(samples(signal(100)), 78300)!;
    expect(result.windows[result.windows.length - 1].time).toBe(75000);
    expect(
      result.windows.slice(0, 11).every(window => window.rmssd === null && window.artifactPercentage === null)
    ).toBe(true);
  });

  it('waits for complete rolling windows and produces finite DFA summaries', () => {
    const result = run(signal(400))!;
    expect(result.windows[10].rmssd).toBeNull();
    expect(result.windows[11].rmssd).toBeGreaterThan(0);
    expect(result.windows[22].dfaAlpha1).toBeNull();
    expect(Number.isFinite(result.windows[23].dfaAlpha1)).toBe(true);
    expect(result.summary.dfaWindowCount).toBeGreaterThan(0);
    expect(result.summary.dfaAlpha1Min).toBeLessThanOrEqual(result.summary.dfaAlpha1Median!);
    expect(result.summary.dfaAlpha1Max).toBeGreaterThanOrEqual(result.summary.dfaAlpha1Median!);
  });

  it('summarizes the heart-rate range from complete covered ten-second windows', () => {
    const input = samples([...Array(20).fill(800), ...Array(20).fill(1000)]);
    const result = analyzeRRIntervals(input, input[input.length - 1].time)!;
    expect(result.windows[0].heartRate).toBeNull();
    expect(result.summary).toMatchObject({ minimumHeartRate: 60, maximumHeartRate: 75 });
    expect(analyzeRRIntervals(samples([800, 850, 900]), 3000)!.summary).toMatchObject({
      minimumHeartRate: null,
      maximumHeartRate: null
    });
  });

  it('does not publish a rolling heart rate from a sparse or stale recording', () => {
    const result = analyzeRRIntervals([...samples(Array(20).fill(800)), ...samples([800], 35000)], 40000)!;
    expect(result.windows.find(window => window.time === 20000)!.heartRate).toBeNull();
    expect(result.windows.find(window => window.time === 40000)!.heartRate).toBeNull();
    expect(result.summary).toMatchObject({ minimumHeartRate: 75, maximumHeartRate: 75 });
  });

  it('never computes DFA across a gap, even when duration coverage exceeds 90%', () => {
    const input = [...samples(signal(80)), ...samples(signal(90), 65000)];
    const result = analyzeRRIntervals(input, input[input.length - 1].time)!;
    expect(result.windows.find(window => window.time === 120000)!.dfaAlpha1).toBeNull();
  });

  it('omits details on request without changing numerical summaries or mutating input', () => {
    const input = samples(signal(400));
    const before = JSON.stringify(input);
    const full = analyzeRRIntervals(input, input[input.length - 1].time)!;
    const compact = analyzeRRIntervals(input, input[input.length - 1].time, { includeDetails: false })!;
    expect(compact.summary).toEqual(full.summary);
    expect(compact.beats).toEqual([]);
    expect(compact.windows).toEqual([]);
    expect(JSON.stringify(input)).toBe(before);
  });
});

describe('DFA alpha1', () => {
  it('rejects short, invalid and constant sequences', () => {
    expect(calculateDFAAlpha1(signal(31))).toBeNull();
    expect(calculateDFAAlpha1(Array(100).fill(800))).toBeNull();
    expect(calculateDFAAlpha1([...signal(100), NaN])).toBeNull();
    expect(calculateDFAAlpha1([...signal(100), 0])).toBeNull();
  });

  it.each([800.1, 800.01, 123.456789])('has no DFA estimate for constant fractional intervals %s', interval => {
    expect(calculateDFAAlpha1(Array(150).fill(interval))).toBeNull();
    expect(run(Array(200).fill(interval))!.summary.dfaWindowCount).toBe(0);
  });

  it('retains scale invariance for large finite inputs without overflowing', () => {
    const rr = signal(257);
    expect(calculateDFAAlpha1(rr.map(value => value * 1e300))).toBeCloseTo(calculateDFAAlpha1(rr)!, 10);
  });

  it('is invariant to interval scale and offset', () => {
    const rr = signal(257),
      alpha = calculateDFAAlpha1(rr)!;
    expect(calculateDFAAlpha1(rr.map(value => value * 2))).toBeCloseTo(alpha, 10);
    expect(calculateDFAAlpha1(rr.map(value => value + 100))).toBeCloseTo(alpha, 10);
  });

  it('matches an independent polynomial least-squares reference', () => {
    const rr = signal(257),
      mean = rr.reduce((sum, value) => sum + value) / rr.length;
    let acc = 0;
    const y = rr.map(value => (acc += value - mean)),
      xs: number[] = [],
      ys: number[] = [];
    const slope = (x: number[], v: number[]) => {
      const xm = x.reduce((a, b) => a + b) / x.length,
        vm = v.reduce((a, b) => a + b) / v.length;
      return (
        x.reduce((sum, value, i) => sum + (value - xm) * (v[i] - vm), 0) /
        x.reduce((sum, value) => sum + (value - xm) ** 2, 0)
      );
    };
    for (let scale = 4; scale <= 16; scale++) {
      const x = Array.from({ length: scale }, (_, i) => i),
        residuals: number[] = [];
      for (const reversed of [false, true])
        for (let segment = 0; segment < Math.floor(rr.length / scale); segment++) {
          const offset = reversed ? rr.length - (segment + 1) * scale : segment * scale;
          const values = y.slice(offset, offset + scale),
            b = slope(x, values);
          const a = values.reduce((sum, value) => sum + value) / scale - (b * (scale - 1)) / 2;
          residuals.push(...values.map((value, i) => (value - a - b * i) ** 2));
        }
      xs.push(Math.log(scale));
      ys.push(Math.log(Math.sqrt(residuals.reduce((a, b) => a + b) / residuals.length)));
    }
    expect(calculateDFAAlpha1(rr)).toBeCloseTo(slope(xs, ys), 10);
  });
});
