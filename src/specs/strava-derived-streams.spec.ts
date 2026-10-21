import fs from 'fs';
import path from 'path';
import { DOMParser } from '@xmldom/xmldom';
import { SportsLib } from '../index';
import { ActivityInterface } from '../activities/activity.interface';
import { compareStreamAtTimes } from './helpers/stream-reference-comparison';

interface Reference {
  time: number[];
  grade_smooth: number[];
  distance: number[];
  altitude: number[];
  heartrate?: number[];
  pace?: number[];
  grade_adjusted_pace?: number[];
}

const fixtures = path.join(__dirname, 'fixtures');
const readReference = (file: string): Reference =>
  JSON.parse(fs.readFileSync(path.join(fixtures, 'streams/strava', file), 'utf8'));
const stream = (activity: ActivityInterface, type: string) => activity.getStreamData(type);

async function readActivity(file: string): Promise<ActivityInterface> {
  const bytes = fs.readFileSync(path.join(fixtures, file));
  const event = file.endsWith('.fit')
    ? await SportsLib.importFromFit(bytes)
    : file.endsWith('.tcx')
      ? await SportsLib.importFromTCX(new DOMParser().parseFromString(bytes.toString(), 'application/xml'))
      : await SportsLib.importFromGPX(bytes.toString(), DOMParser);
  return event.getFirstActivity();
}

// These are regression ceilings for existing disagreement, NOT Strava accuracy guarantees.
// Preserve the separate, stricter active Grade thresholds in strava-streams-compliance.spec.ts.
// The two known Grade discrepancies are measured here rather than silently excluded.
const cases = [
  {
    name: 'Garmin Edge hilly',
    file: 'rides/fit/7432332116.fit',
    reference: 'rides/5910143591.json',
    missing: 12,
    grade: 1.7,
    smooth: 1.12,
    gradeP95: 2.01,
    smoothP95: 3.4,
    points: 10063
  },
  {
    name: 'Garmin 945 hilly',
    file: 'runs/fit/6782987395.fit',
    reference: 'runs/2451375851.json',
    missing: 1,
    grade: 2.1,
    smooth: 2.54,
    gradeP95: 8.41,
    smoothP95: 8.4,
    points: 4988
  },
  {
    name: 'Suunto flat',
    file: 'runs/fit/6909950168.fit',
    reference: 'runs/3156040843.json',
    missing: 52,
    grade: 1.7,
    smooth: 1.28,
    gradeP95: 2.61,
    smoothP95: 3.4,
    points: 2197
  },
  {
    name: 'Suunto flat without paused records',
    file: 'runs/fit/6909950168-no-pause-records.fit',
    reference: 'runs/3182900697.json',
    missing: 18,
    grade: 1.7,
    smooth: 1.28,
    gradeP95: 2.61,
    smoothP95: 3.4,
    points: 2163
  },
  {
    name: 'COROS road',
    file: 'runs/fit/6916663933.fit',
    reference: 'runs/3183465494.json',
    missing: 11,
    grade: 1.7,
    smooth: 2.09,
    gradeP95: 5.81,
    smoothP95: 5.8,
    points: 2921
  },
  {
    name: 'Garmin ride FIT',
    file: 'rides/fit/828989227.fit',
    reference: 'rides/343080886.json',
    missing: 28,
    grade: 1.7,
    smooth: 1.3,
    gradeP95: 2.71,
    smoothP95: 3.9,
    points: 13134
  },
  {
    name: 'Garmin ride TCX',
    file: 'rides/tcx/828989227.tcx',
    reference: 'rides/3171487458.json',
    missing: 1,
    grade: 1.7,
    smooth: 1.3,
    gradeP95: 2.81,
    smoothP95: 4.0,
    points: 13134
  },
  {
    name: 'Garmin ride GPX',
    file: 'rides/gpx/828989227.gpx',
    reference: 'rides/3171472783.json',
    missing: 1,
    grade: 3.2,
    smooth: 2.62,
    gradeP95: 9.51,
    smoothP95: 9.2,
    points: 13131
  },
  {
    name: 'Suunto uphill — known Grade discrepancy',
    file: 'runs/fit/6910052863.fit',
    reference: 'runs/2709634581.json',
    missing: 28,
    grade: 7.69,
    smooth: 5.69,
    gradeP95: 20.01,
    smoothP95: 15.2,
    points: 9543
  },
  {
    name: 'COROS trail — known Grade discrepancy',
    file: 'runs/fit/6916728382.fit',
    reference: 'runs/3183490558.json',
    missing: 13,
    grade: 2.66,
    smooth: 3.04,
    gradeP95: 8.61,
    smoothP95: 8.0,
    points: 9698
  }
];

describe.each(cases)('Strava derived-stream regression: $name', fixture => {
  let activity: ActivityInterface;
  let reference: Reference;
  beforeAll(async () => {
    activity = await readActivity(fixture.file);
    reference = readReference(fixture.reference);
    expect(reference.time).toHaveLength(fixture.points);
  });

  it.each([
    ['Grade', 'grade'],
    ['Grade Smooth', 'smooth']
  ] as const)('bounds %s disagreement and missing observations independently', (type, ceiling) => {
    const comparison = compareStreamAtTimes(stream(activity, type), reference.grade_smooth, reference.time);
    expect(comparison.matchedCount).toBeGreaterThanOrEqual(reference.time.length - fixture.missing);
    expect(comparison.meanAbsoluteError).not.toBeNull();
    expect(comparison.meanAbsoluteError).toBeLessThanOrEqual(fixture[ceiling]);
    // Separately bound the tail, so a few increasingly bad grades cannot hide behind the mean.
    expect(comparison.p95AbsoluteError).toBeLessThanOrEqual(ceiling === 'grade' ? fixture.gradeP95 : fixture.smoothP95);
  });

  if (fixture.name.includes('known Grade discrepancy')) {
    it('bounds the separate source-distance discrepancy and preserves comparison coverage', () => {
      const comparison = compareStreamAtTimes(stream(activity, 'Distance'), reference.distance, reference.time, 0.051);
      const uphill = fixture.name.startsWith('Suunto');
      expect(comparison.missingTimes.length).toBeLessThanOrEqual(uphill ? 13 : 0);
      expect(comparison.meanAbsoluteError).not.toBeNull();
      expect(comparison.meanAbsoluteError).toBeLessThanOrEqual(uphill ? 0.68 : 0.002);
      expect(comparison.pairs.every(pair => pair.error <= (uphill ? 11.71 : 3.91))).toBe(true);
      if (!uphill) {
        expect(comparison.pairs.filter(pair => pair.error > 0.051).map(pair => pair.time)).toEqual([3, 4, 5, 6, 7, 8]);
      }
    });

    it('matches independent altitude and HR timestamps, without choosing an error-minimizing time shift', () => {
      for (const [type, expected] of [
        ['Altitude', reference.altitude],
        ['Heart Rate', reference.heartrate!]
      ] as const) {
        const comparison = compareStreamAtTimes(stream(activity, type), expected, reference.time);
        expect(comparison.missingTimes).toEqual([]);
        expect(comparison.meanAbsoluteError).toBeLessThan(1e-9);
      }
    });
  }
});

describe('Strava GAP adjustment reference', () => {
  it('bounds the existing adjustment-factor discrepancy without confusing pace units or zero-speed samples', async () => {
    const activity = await readActivity('runs/fit/6782987395.fit');
    const reference = readReference('runs/2451375851.json');
    expect(reference.time).toHaveLength(4988);
    expect(reference.pace).toHaveLength(reference.time.length);
    expect(reference.grade_adjusted_pace).toHaveLength(reference.time.length);
    const speed = stream(activity, 'Speed');
    const adjustedSpeed = stream(activity, 'Grade Adjusted Speed');
    const pace = stream(activity, 'Pace');
    const adjustedPace = stream(activity, 'Grade Adjusted Pace');
    const actualFactor = pace.map((value, index) => {
      const adjusted = adjustedPace[index];
      if (
        typeof value !== 'number' ||
        !Number.isFinite(value) ||
        value <= 0 ||
        typeof adjusted !== 'number' ||
        !Number.isFinite(adjusted) ||
        adjusted <= 0
      )
        return null;
      const factor = adjusted / value;
      expect(factor).toBeCloseTo((speed[index] as number) / (adjustedSpeed[index] as number), 12);
      return factor;
    });
    // GAP / pace == speed / adjustedSpeed. The ratio is unitless and isolates the grade adjustment
    // from differences between the file speed and Strava's displayed/smoothed pace.
    const expectedFactor = reference.pace!.map((referencePace, index) => {
      expect(Number.isFinite(referencePace)).toBe(true);
      expect(Number.isFinite(reference.grade_adjusted_pace![index])).toBe(true);
      expect(referencePace).toBeGreaterThan(0);
      expect(reference.grade_adjusted_pace![index]).toBeGreaterThan(0);
      return reference.grade_adjusted_pace![index] / referencePace;
    });
    const comparison = compareStreamAtTimes(actualFactor, expectedFactor, reference.time);
    expect(comparison.matchedCount).toBeGreaterThanOrEqual(4811);
    expect(comparison.missingTimes.filter(time => speed[time] === 0 || adjustedSpeed[time] === 0)).toHaveLength(176);
    // Measured before the sparse-distance change: MAE 0.061169, P95 0.202512. These bounds catch worsening
    // agreement; they do not assert that Sports Lib implements Strava's exact GAP model.
    expect(comparison.meanAbsoluteError).not.toBeNull();
    expect(comparison.meanAbsoluteError).toBeLessThan(0.062);
    expect(comparison.p95AbsoluteError).toBeLessThan(0.203);
  });
});
