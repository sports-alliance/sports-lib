import { DataStartEvent } from '../../../data/data.start-event';
import { DataStopEvent } from '../../../data/data.stop-event';
import { DataStopAllEvent } from '../../../data/data.stop-all-event';
import { DataEvent } from '../../../data/data.event';
import { getHeartRateSamplesWithoutPauses } from './hr-tss-samples';

const sample = (duration: number, value = 165) => ({ duration, value });
class OtherEvent extends DataEvent { static type = 'Test non-timer event'; }

describe('HR samples on the active timer clock', () => {
  it('removes paused readings and paused time, including gaps spanning multiple pauses', () => {
    const events = [new DataStartEvent(0), new DataStopEvent(10), new DataStartEvent(20),
      new DataStopAllEvent(25), new DataStartEvent(30), new DataStopAllEvent(40)];
    expect(getHeartRateSamplesWithoutPauses([sample(0), sample(10), sample(15, 190), sample(20),
      sample(25), sample(29, 190), sample(40), sample(50, 190)], events))
      .toEqual([sample(0), sample(10), sample(10), sample(15), sample(25)]);
    expect(getHeartRateSamplesWithoutPauses([sample(0), sample(40)], events)).toEqual([sample(0), sample(25)]);
  });

  it('keeps ordinary recording gaps and ignores non-timer or nonfinite events', () => {
    const samples = [sample(0), sample(60), sample(120)];
    expect(getHeartRateSamplesWithoutPauses(samples, [new OtherEvent(30), new DataStopEvent(NaN),
      new DataStartEvent(Infinity)])).toEqual(samples);
  });

  it('handles unsorted and repeated boundaries without double-subtracting a pause', () => {
    const samples = [sample(40), sample(20), sample(0)];
    const events = [new DataStartEvent(20), new DataStopEvent(10), new DataStopAllEvent(10),
      new DataStopEvent(15), new DataStartEvent(20), new DataStartEvent(0)];
    expect(getHeartRateSamplesWithoutPauses(samples, events)).toEqual([sample(0), sample(10), sample(30)]);
    expect(samples.map(x => x.duration)).toEqual([40, 20, 0]);
    expect(events[0].timestamp).toBe(20);
  });

  it('excludes an initial pause and an unclosed final pause', () => {
    expect(getHeartRateSamplesWithoutPauses([sample(0), sample(5), sample(10), sample(20), sample(30)],
      [new DataStopEvent(0), new DataStartEvent(10), new DataStopAllEvent(20)]))
      .toEqual([sample(0), sample(10)]);
  });

  it('does not manufacture an HR candidate from readings entirely inside a pause', () => {
    expect(getHeartRateSamplesWithoutPauses([sample(11), sample(15), sample(19)],
      [new DataStopEvent(10), new DataStartEvent(20)])).toEqual([]);
  });

  it('rejects invalid readings and applies a timer state preceding the activity start', () => {
    expect(getHeartRateSamplesWithoutPauses([sample(-1), sample(NaN), sample(0), sample(5, 0),
      sample(6, Infinity), sample(7, NaN), sample(10), sample(20)],
      [new DataStopEvent(-10), new DataStartEvent(10)]))
      .toEqual([sample(0), sample(10)]);
  });
});
