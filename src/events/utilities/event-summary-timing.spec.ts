import { Activity } from '../../activities/activity';
import { ActivityTypes } from '../../activities/activity.types';
import { Creator } from '../../creators/creator';
import { DataDistance } from '../../data/data.distance';
import { DataDuration } from '../../data/data.duration';
import { DataElapsedTime } from '../../data/data.elapsed-time';
import { DataTimerTime } from '../../data/data.timer-time';
import { Event } from '../event';
import { FileType } from '../adapters/file-type.enum';
import { EventImporterJSON } from '../adapters/importers/json/importer.json';
import { EventUtilities } from './event.utilities';

function workout() {
  const event = new Event('Synthetic multisport', new Date(0), new Date(100000), FileType.FIT);
  [ActivityTypes.Running, ActivityTypes.Swimming, ActivityTypes.Cycling].forEach((type, index) => {
    const activity = new Activity(new Date(index * 30000), new Date((index + 1) * 30000), type, new Creator('Test'));
    [new DataDistance(0), new DataDuration(20), new DataTimerTime(index * 10), new DataElapsedTime(30)].forEach(stat =>
      activity.addStat(stat)
    );
    event.addActivity(activity);
  });
  return event;
}

describe('complete event timer and elapsed summaries', () => {
  it('preserves independent clocks, including a zero timer, through regeneration and JSON', () => {
    let event = workout();
    for (let pass = 0; pass < 3; pass++) {
      EventUtilities.reGenerateStatsForEvent(event);
      expect(event.getStat(DataTimerTime.type)?.getValue()).toBe(30);
      expect(event.getStat(DataElapsedTime.type)?.getValue()).toBe(90);
      expect(event.getDuration()?.getValue()).toBe(60);
      event = EventImporterJSON.getEventFromJSON(event.toJSON()) as Event;
    }
  });

  it.each([undefined, -1, NaN, Infinity])('does not publish a partial timer for %p', value => {
    const event = workout();
    event.getFirstActivity().removeStat(DataTimerTime.type);
    if (value !== undefined) event.getFirstActivity().addStat(new DataTimerTime(value));
    EventUtilities.reGenerateStatsForEvent(event);
    expect(event.getStat(DataTimerTime.type)).toBeUndefined();
    expect(event.getStat(DataElapsedTime.type)?.getValue()).toBe(90);
  });

  it('does not substitute timer or wall-clock dates for a missing elapsed time', () => {
    const event = workout();
    event.getFirstActivity().removeStat(DataElapsedTime.type);
    EventUtilities.reGenerateStatsForEvent(event);
    expect(event.getStat(DataTimerTime.type)?.getValue()).toBe(30);
    expect(event.getStat(DataElapsedTime.type)).toBeUndefined();
  });

  it('rejects an overflowing total', () => {
    const event = workout();
    event.getActivities().forEach(activity => activity.addStat(new DataTimerTime(Number.MAX_VALUE)));
    EventUtilities.reGenerateStatsForEvent(event);
    expect(event.getStat(DataTimerTime.type)).toBeUndefined();
  });
});
