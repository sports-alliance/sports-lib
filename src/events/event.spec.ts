import { EventInterface } from './event.interface';
import { Event } from './event';
import { Activity } from '../activities/activity';
import { Creator } from '../creators/creator';
import { ActivityTypes } from '../activities/activity.types';
import { FileType } from './adapters/file-type.enum';
import { EventJSONInterface } from './event.json.interface';
import { DataActivityTypes } from '../data/data.activity-types';
import { DataDeviceNames } from '../data/data.device-names';

describe('Event', () => {
  let event: EventInterface;

  beforeEach(() => {
    event = new Event('Test', new Date(0), new Date(200), FileType.FIT);
    event.description = 'Test';
  });

  it('should add an activity', () => {
    expect(event.getActivities().length).toBe(0);
    event.addActivity(
      new Activity(new Date(0), new Date(new Date(0).getTime() + 10), ActivityTypes.Running, new Creator('Test'))
    );
    expect(event.getActivities().length).toBe(1);
  });

  it('should remove an activity', () => {
    const activity = new Activity(
      new Date(0),
      new Date(new Date(0).getTime() + 10),
      ActivityTypes.Running,
      new Creator('Test')
    );
    event.addActivity(activity);
    expect(event.getActivities().length).toBe(1);
    event.removeActivity(activity);
    expect(event.getActivities().length).toBe(0);
  });

  it('should get the first and the last activity', () => {
    const activityA = new Activity(new Date(20), new Date(30), ActivityTypes.Running, new Creator('Test'));
    const activityB = new Activity(new Date(0), new Date(10), ActivityTypes.Running, new Creator('Test'));

    event.addActivity(activityA);
    event.addActivity(activityB);

    // Should get them sorted by date
    expect(event.getFirstActivity()).toEqual(activityB);
    expect(event.getLastActivity()).toEqual(activityA);
  });

  it('should export correctly to JSON', () => {
    const d1 = new Date(0);
    const d2 = new Date(new Date(0).getTime() + 200);
    const activity = new Activity(d1, d2, ActivityTypes.Running, new Creator('Test'));
    event.addActivity(activity);
    event.setID('123');
    expect(event.toJSON()).toEqual({
      name: 'Test',
      description: 'Test',
      isMerge: false,
      powerCurve: null,
      privacy: 'private',
      srcFileType: FileType.FIT,
      stats: {},
      activities: [activity.toJSON()],
      startDate: d1.getTime(),
      endDate: d2.getTime()
    } as EventJSONInterface);
  });

  it('should normalize single activity type aliases when formatting type string', () => {
    event.addStat(new DataActivityTypes(['running_trail']));
    expect(event.getActivityTypesAsString()).toBe(ActivityTypes.TrailRunning);
  });

  it('should preserve unknown single activity type strings when formatting type string', () => {
    event.addStat(new DataActivityTypes(['mystery_sport']));
    expect(event.getActivityTypesAsString()).toBe('mystery_sport');
  });

  it('should format device names with multiplicity', () => {
    event.addStat(new DataDeviceNames(['Edge', 'HRM', 'HRM']));
    expect(event.getDeviceNamesAsString()).toBe('Edge, 2x HRM');
  });

  it('should classify non-merged events with multiple activities as multi-sport', () => {
    event.addActivity(new Activity(new Date(0), new Date(1000), ActivityTypes.Running, new Creator('Run')));
    event.addActivity(new Activity(new Date(1000), new Date(2000), ActivityTypes.Cycling, new Creator('Ride')));

    expect(event.isMultiSport()).toBe(true);
  });
});
