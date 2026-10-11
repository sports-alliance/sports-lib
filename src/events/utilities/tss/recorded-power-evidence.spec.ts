import { Activity } from '../../../activities/activity';
import { ActivityTypes } from '../../../activities/activity.types';
import { Creator } from '../../../creators/creator';
import { DataStartEvent } from '../../../data/data.start-event';
import { DataStopEvent } from '../../../data/data.stop-event';
import { captureRecordedPowerEvidence, hasRecordedZeroPowerWindow } from './recorded-power-evidence';

const start = new Date('2026-01-01T10:00:00Z');
const makeActivity = () =>
  new Activity(start, new Date(+start + 3600000), ActivityTypes.Cycling, new Creator('Synthetic'));
const seconds = Array.from({ length: 30 }, (_, second) => second);
const samples = (fields: { power?: unknown; Power?: unknown; RP_Power?: unknown }) =>
  seconds.map(second => ({ timestamp: new Date(+start + second * 1000), ...fields }));

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
