import { EventImporterJSON } from './importer.json';
import { ActivityTypes } from '../../../../activities/activity.types';
import { LapTypes } from '../../../../laps/lap.types';

const lap = (lapId: unknown) => ({
  lapId,
  startDate: 0,
  endDate: 10000,
  type: LapTypes.Manual,
  stats: { Duration: 5 }
});
const activity = (ids: unknown[]) => ({
  startDate: 0,
  endDate: 10000,
  type: ActivityTypes.Swimming,
  creator: { name: 'Test' },
  stats: {},
  streams: [],
  intensityZones: [],
  laps: ids.map(lap)
});

describe('native JSON lap identifiers', () => {
  it('preserves nonconsecutive, zero and repeated source IDs independently on each leg', () => {
    let event = EventImporterJSON.getEventFromJSON({
      name: 'Test',
      startDate: 0,
      endDate: 10000,
      activities: [activity([7, 9, 0, 9]), { ...activity([7, 0]), startDate: 10000, endDate: 20000 }]
    } as any);
    const before = event.getActivities().map(item => item.getLaps().map(item => item.toJSON()));
    for (let pass = 0; pass < 3; pass++) {
      event = EventImporterJSON.getEventFromJSON(event.toJSON());
      expect(event.getActivities().map(item => item.getLaps().map(item => item.toJSON()))).toEqual(before);
    }
    expect(
      event
        .getFirstActivity()
        .getLaps()
        .map(item => item.lapId)
    ).toEqual([7, 9, 0, 9]);
  });

  it.each([undefined, null, '7', -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    'assigns an array-position fallback for invalid standalone ID %p',
    id => {
      expect(EventImporterJSON.getLapFromJSON(lap(id) as any, 3).lapId).toBe(4);
    }
  );

  it('reserves valid IDs before allocating legacy fallbacks, without changing row order or timing', () => {
    const restored = EventImporterJSON.getActivityFromJSON(activity([undefined, 1, null, 3, 0, undefined]) as any);
    expect(restored.getLaps().map(item => item.lapId)).toEqual([2, 1, 4, 3, 0, 6]);
    expect(restored.getLaps().map(item => item.getDuration()?.getValue())).toEqual([5, 5, 5, 5, 5, 5]);
    expect(
      EventImporterJSON.getActivityFromJSON(restored.toJSON())
        .getLaps()
        .map(item => item.lapId)
    ).toEqual([2, 1, 4, 3, 0, 6]);
  });
});
