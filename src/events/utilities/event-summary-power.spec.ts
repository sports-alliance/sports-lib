import { Activity } from '../../activities/activity';
import { ActivityTypes } from '../../activities/activity.types';
import { Creator } from '../../creators/creator';
import { DataDistance } from '../../data/data.distance';
import { DataDuration } from '../../data/data.duration';
import { DataTimerTime } from '../../data/data.timer-time';
import { DataPowerAvg } from '../../data/data.power-avg';
import { DataPowerMax } from '../../data/data.power-max';
import { ActivityUtilities } from './activity.utilities';
import { EventImporterJSON } from '../adapters/importers/json/importer.json';
import { Event } from '../event';
import { FileType } from '../adapters/file-type.enum';
import { EventUtilities } from './event.utilities';

function leg(watts: number | null, seconds = 10) {
  const a = new Activity(new Date(0), new Date(100000), ActivityTypes.Cycling, new Creator('Synthetic'));
  a.addStat(new DataDistance(0));
  a.addStat(new DataDuration(99));
  a.addStat(new DataTimerTime(seconds));
  if (watts !== null) {
    a.addStat(new DataPowerAvg(watts));
    a.addStat(new DataPowerMax(watts));
  }
  return a;
}
const summary = (legs: Activity[]) => Object.assign({}, ...ActivityUtilities.getSummaryStatsForActivities(legs).map(s => s.toJSON()));

describe('multisport power summaries', () => {
  it('weights leg means by timer duration, independently of leg order and JSON restoration', () => {
    const legs = [leg(100, 10), leg(200, 20), leg(300, 30)];
    const before = JSON.stringify(legs.map(a => a.toJSON()));
    for (const ordered of [legs, [...legs].reverse(), [legs[1], legs[0], legs[2]]]) {
      expect(summary(ordered)['Average Power']).toBeCloseTo(14000 / 60);
      const restored = ordered.map(a => EventImporterJSON.getActivityFromJSON(JSON.parse(JSON.stringify(a.toJSON()))) as Activity);
      expect(summary(restored)['Average Power']).toBeCloseTo(14000 / 60);
    }
    expect(JSON.stringify(legs.map(a => a.toJSON()))).toBe(before);
    expect(summary([leg(100), leg(200), leg(300)])['Average Power']).toBe(200);
  });

  it('retains zero, skips absent power and ignores zero-duration means', () => {
    expect(summary([leg(0), leg(0)])).toMatchObject({ 'Average Power': 0, 'Maximum Power': 0 });
    expect(summary([leg(0), leg(200)])['Average Power']).toBe(100);
    expect(summary([leg(null), leg(200), leg(900, 0)])['Average Power']).toBe(200);
    expect(summary([leg(null), leg(null)])['Average Power']).toBeUndefined();
    expect(summary([leg(100, 0), leg(200, 0)])['Average Power']).toBeUndefined();
  });

  it('uses legacy active Duration only when no explicit timer exists', () => {
    const a = leg(100);
    a.removeStat(DataTimerTime.type);
    a.addStat(new DataDuration(30));
    expect(summary([a, leg(200, 10)])['Average Power']).toBe(125);
    a.removeStat(DataDuration.type);
    expect(summary([a, leg(200, 10)])['Average Power']).toBeUndefined();
  });

  it.each([-1, NaN, Infinity])('does not substitute dates or Duration for invalid timer %p', seconds => {
    expect(summary([leg(100, seconds), leg(200)])['Average Power']).toBeUndefined();
  });

  it('omits non-finite totals and ignores invalid power summaries', () => {
    expect(summary([leg(Number.MAX_VALUE), leg(Number.MAX_VALUE)])['Average Power']).toBeUndefined();
    expect(summary([leg(NaN), leg(-1), leg(0)])).toMatchObject({ 'Average Power': 0, 'Maximum Power': 0 });
  });

  it('refreshes a saved event summary without reparsing or changing its legs', () => {
    let event = new Event('Synthetic', new Date(0), new Date(100000), FileType.FIT);
    event.addActivities([leg(100), leg(200), leg(300)]);
    event.addStat(new DataPowerAvg(225));
    const legs = JSON.stringify(event.getActivities().map(a => a.toJSON()));
    for (let pass = 0; pass < 3; pass++) {
      event = EventImporterJSON.getEventFromJSON(JSON.parse(JSON.stringify(event.toJSON()))) as Event;
      EventUtilities.reGenerateStatsForEvent(event);
      expect(event.getStat(DataPowerAvg.type)?.getValue()).toBe(200);
      expect(event.getStat(DataPowerMax.type)?.getValue()).toBe(300);
      expect(JSON.stringify(event.getActivities().map(a => a.toJSON()))).toBe(legs);
    }
  });
});
