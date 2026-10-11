import { Activity } from '../../../activities/activity';
import { ActivityTypes } from '../../../activities/activity.types';
import { Creator } from '../../../creators/creator';
import { DataStartEvent } from '../../../data/data.start-event';
import { DataStopEvent } from '../../../data/data.stop-event';
import { captureRecordedPowerEvidence, getRecordedPowerValues } from './recorded-power-evidence';
import { calculateNormalizedPower } from '../normalized-power';

const start = new Date('2026-01-01T10:00:00Z');
const makeActivity = () =>
  new Activity(start, new Date(+start + 3600000), ActivityTypes.Cycling, new Creator('Synthetic'));
const seconds = Array.from({ length: 30 }, (_, second) => second);
const samples = (fields: { power?: unknown; Power?: unknown; RP_Power?: unknown }) =>
  seconds.map(second => ({ timestamp: new Date(+start + second * 1000), ...fields }));
const hasRecordedZeroPowerWindow = (activity: Activity, power: number[], time: number[]) =>
  calculateNormalizedPower(getRecordedPowerValues(activity, power, time), time, activity.getAllEvents()) === 0;

describe('recorded FIT zero-power evidence', () => {
  it.each([
    [{ power: 0, Power: 200 }, true],
    [{ power: null, Power: 0, RP_Power: 200 }, true],
    [{ power: NaN, Power: undefined, RP_Power: 0 }, true],
    [{ power: 200, Power: 0 }, false],
    [{ power: Infinity, Power: 0 }, false],
    [{ Power: -1, RP_Power: 0 }, false],
    [{ power: null, Power: null, RP_Power: null }, false],
    [{ RP_Power: '0' }, false],
    [{}, false]
  ] as const)('matches native and developer field precedence for %j', (fields, expected) => {
    const activity = makeActivity();
    captureRecordedPowerEvidence(activity, samples(fields));
    expect(hasRecordedZeroPowerWindow(activity, Array(30).fill(0), seconds)).toBe(expected);
  });

  it('requires a complete recorded window and respects the final record on each time-grid slot', () => {
    const activity = makeActivity();
    captureRecordedPowerEvidence(activity, samples({ power: 0 }).slice(0, 29));
    expect(hasRecordedZeroPowerWindow(activity, Array(30).fill(0), seconds)).toBe(false);
    captureRecordedPowerEvidence(activity, [...samples({ power: 0 }), { timestamp: new Date(+start + 15000) }]);
    expect(hasRecordedZeroPowerWindow(activity, Array(30).fill(0), seconds)).toBe(false);
  });

  it('revalidates current samples and timers rather than retaining stale eligibility', () => {
    const activity = makeActivity();
    captureRecordedPowerEvidence(activity, samples({ power: 0 }));
    expect(hasRecordedZeroPowerWindow(activity, Array(30).fill(0), seconds)).toBe(true);
    expect(
      hasRecordedZeroPowerWindow(
        activity,
        Array(30).fill(0),
        seconds.map(second => second + 60)
      )
    ).toBe(false);
    expect(hasRecordedZeroPowerWindow(activity, [...Array(15).fill(0), NaN, ...Array(14).fill(0)], seconds)).toBe(
      false
    );
    activity.addEvent(new DataStopEvent(0));
    activity.addEvent(new DataStartEvent(30));
    expect(hasRecordedZeroPowerWindow(activity, Array(30).fill(0), seconds)).toBe(false);
  });

  it('does not impose FIT padding provenance on caller-supplied streams or serialize source evidence', () => {
    const activity = makeActivity();
    expect(hasRecordedZeroPowerWindow(activity, Array(30).fill(0), seconds)).toBe(true);
    const before = activity.toJSON();
    captureRecordedPowerEvidence(activity, samples({ power: 0 }));
    expect(activity.toJSON()).toEqual(before);
  });
});

describe('recorded power values used for NP', () => {
  it.each([
    [{ power: 250, Power: 300 }, 250],
    [{ power: null, Power: 250, RP_Power: 300 }, 250],
    [{ power: NaN, Power: undefined, RP_Power: 250 }, 250],
    [{ power: 0, Power: 250 }, 0]
  ] as const)('keeps finite nonnegative native/developer observations with mapper precedence: %j', (fields, expected) => {
    const activity = makeActivity();
    captureRecordedPowerEvidence(activity, samples(fields));
    expect(getRecordedPowerValues(activity, Array(30).fill(expected), seconds)).toEqual(Array(30).fill(expected));
  });

  it.each([
    { power: Infinity, Power: 250 }, { power: -1, Power: 250 }, { Power: -1, RP_Power: 250 },
    { power: null, Power: null, RP_Power: null }, { RP_Power: '250' }, {}
  ])('does not let a missing/invalid field establish a recorded observation: %j', fields => {
    const activity = makeActivity();
    captureRecordedPowerEvidence(activity, samples(fields));
    expect(getRecordedPowerValues(activity, Array(30).fill(0), seconds).every(Number.isNaN)).toBe(true);
  });

  it('requires current stream values to match the latest observation without modifying the stream', () => {
    const activity = makeActivity();
    captureRecordedPowerEvidence(activity, [...samples({ power: 250 }),
      { timestamp: new Date(+start + 15000), power: 300 },
      { timestamp: new Date(+start + 16400) }]);
    const power = Array(30).fill(250);
    power[15] = 300;
    power[16] = 0; // The compatibility mapper padded the missing final field.
    power[17] = 200; // A later caller edit is not the original observation.
    const before = power.slice(), masked = getRecordedPowerValues(activity, power, seconds);
    expect(masked[15]).toBe(300);
    expect(masked[16]).toBeNaN();
    expect(masked[17]).toBeNaN();
    expect(power).toEqual(before);
    expect(getRecordedPowerValues(activity, power, seconds)).toEqual(masked);
  });

  it('distinguishes an imported file with no observations from a caller-supplied stream', () => {
    const activity = makeActivity(), power = Array(30).fill(250);
    expect(getRecordedPowerValues(activity, power, seconds)).toEqual(power);
    captureRecordedPowerEvidence(activity, []);
    expect(getRecordedPowerValues(activity, power, seconds).every(Number.isNaN)).toBe(true);
  });
});
