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

  it('keeps the established fallback assignments across mixed saved and missing IDs', () => {
    const choices = [undefined, null, 0, 1, 3, Number.MAX_SAFE_INTEGER];
    for (let combination = 0; combination < choices.length ** 4; combination++) {
      let remaining = combination;
      const ids = Array.from({ length: 4 }, () => {
        const id = choices[remaining % choices.length];
        remaining = Math.floor(remaining / choices.length);
        return id;
      });
      // Compatibility oracle: each missing ID takes the first unused ID at or
      // above its one-based array position, with all saved IDs reserved first.
      const reserved = new Set(ids.filter((id): id is number => typeof id === 'number'));
      const expected = ids.map((id, index) => {
        if (typeof id === 'number') return id;
        let fallback = index + 1;
        while (reserved.has(fallback)) fallback++;
        reserved.add(fallback);
        return fallback;
      });
      const restored = EventImporterJSON.getActivityFromJSON(activity(ids) as any);
      expect(restored.getLaps().map(item => item.lapId)).toEqual(expected);
    }
  });

  it('does not repeat occupied-ID scans for a large legacy activity', () => {
    const count = 4000;
    const ids = [...Array(count).fill(undefined), ...Array.from({ length: count }, (_, index) => index + 1)];
    const originalHas = Set.prototype.has;
    let numericLookups = 0;
    Set.prototype.has = function (this: Set<unknown>, value: unknown) {
      if (typeof value === 'number') numericLookups++;
      return originalHas.call(this, value);
    };
    let restored;
    try {
      restored = EventImporterJSON.getActivityFromJSON(activity(ids) as any);
    } finally {
      Set.prototype.has = originalHas;
    }
    const expected = [
      ...Array.from({ length: count }, (_, index) => count + index + 1),
      ...Array.from({ length: count }, (_, index) => index + 1)
    ];
    expect(restored.getLaps().map(item => item.lapId)).toEqual(expected);
    // Count work instead of wall time so the regression check is stable under CI load.
    expect(numericLookups).toBeLessThanOrEqual(ids.length * 2);
    expect(
      EventImporterJSON.getActivityFromJSON(restored.toJSON())
        .getLaps()
        .map(item => item.lapId)
    ).toEqual(expected);
  });
});
