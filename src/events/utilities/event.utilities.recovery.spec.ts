import { Activity } from '../../activities/activity';
import { ActivityTypes } from '../../activities/activity.types';
import { Creator } from '../../creators/creator';
import { DataDistance } from '../../data/data.distance';
import { DataDuration } from '../../data/data.duration';
import { DataPause } from '../../data/data.pause';
import { DataRecoveryTime } from '../../data/data.recovery-time';
import { Event } from '../event';
import { FileType } from '../adapters/file-type.enum';
import { EventImporterJSON } from '../adapters/importers/json/importer.json';
import { EventUtilities } from './event.utilities';

describe('EventUtilities recovery aggregation', () => {
  const createActivity = (
    startSeconds: number,
    endSeconds: number,
    type: ActivityTypes,
    recoveryTime?: number
  ): Activity => {
    const activity = new Activity(
      new Date(startSeconds * 1000),
      new Date(endSeconds * 1000),
      type,
      new Creator('Suunto Race S')
    );
    activity.addStat(new DataDuration(endSeconds - startSeconds));
    activity.addStat(new DataPause(0));
    activity.addStat(new DataDistance(1000));
    if (recoveryTime !== undefined) {
      activity.addStat(new DataRecoveryTime(recoveryTime));
    }
    return activity;
  };

  it('uses the final child activity recovery for a multi-activity event', () => {
    const cycling = createActivity(0, 3600, ActivityTypes.Cycling, 38_580);
    const running = createActivity(3600, 5400, ActivityTypes.Running, 46_140);
    const event = new Event('Suunto multisport', cycling.startDate, running.endDate, FileType.FIT);
    event.addActivities([cycling, running]);

    EventUtilities.reGenerateStatsForEvent(event);

    expect(event.getStat(DataRecoveryTime.type)?.getValue()).toBe(46_140);
    const restoredEvent = EventImporterJSON.getEventFromJSON(event.toJSON());
    expect(restoredEvent.getStat(DataRecoveryTime.type)?.getValue()).toBe(46_140);
  });

  it('uses chronological order instead of the maximum or input order', () => {
    const cycling = createActivity(0, 3600, ActivityTypes.Cycling, 7_200);
    const running = createActivity(3600, 5400, ActivityTypes.Running, 3_600);
    const event = new Event('Reverse input', cycling.startDate, running.endDate, FileType.FIT);
    event.addActivities([running, cycling]);

    EventUtilities.reGenerateStatsForEvent(event);

    expect(event.getStat(DataRecoveryTime.type)?.getValue()).toBe(3_600);
  });

  it('does not promote an earlier recovery when the final activity has no recovery observation', () => {
    const cycling = createActivity(0, 3600, ActivityTypes.Cycling, 7_200);
    const running = createActivity(3600, 5400, ActivityTypes.Running);
    const event = new Event('Missing final recovery', cycling.startDate, running.endDate, FileType.FIT);
    event.addActivities([cycling, running]);

    EventUtilities.reGenerateStatsForEvent(event);

    expect(event.getStat(DataRecoveryTime.type)).toBeUndefined();
  });
});
