import { EventImporterSuuntoJSON } from './importer.suunto.json';
import { EventImporterJSON } from '../json/importer.json';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { DataDuration } from '../../../../data/data.duration';
import { DataDistance } from '../../../../data/data.distance';
import { DataHeartRateAvg } from '../../../../data/data.heart-rate-avg';
import { DataCadenceAvg } from '../../../../data/data.cadence-avg';
import { DataStrokeRateAvg } from '../../../../data/data.stroke-rate-avg';
import { ActivityUtilities } from '../../../utilities/activity.utilities';

const origin = Date.parse('2026-01-01T00:00:00Z');
const time = (s: number) => new Date(origin + s * 1000).toISOString();
const marker = (s: number, event: object) => ({ TimeISO8601: time(s), Events: [event] });
const window = (s: number, type: string, sport: number | undefined, duration: number, distance: number) => ({
  TimeISO8601: time(s),
  Window: { Type: type, ActivityId: sport, Duration: duration, Distance: distance }
});
function fixture() {
  return {
    DeviceLog: {
      Device: { Name: 'Synthetic', Info: { HW: '1', SW: '1' } },
      Header: { DateTime: time(0), Duration: 800 },
      Samples: [
        marker(0, { Lap: { Type: 'Start' } }),
        marker(0, { Activity: { ActivityType: 83 } }),
        marker(100, { Activity: { ActivityType: 3 } }),
        marker(250, { Lap: { Type: 'Distance' } }),
        marker(400, { Activity: { ActivityType: 83 } }),
        marker(500, { Activity: { ActivityType: 3 } }),
        marker(650, { Lap: { Type: 'Distance' } }),
        marker(800, { Lap: { Type: 'Stop' } })
      ],
      Windows: [
        window(100, 'Activity', 83, 100, 100),
        window(250, 'Autolap', 3, 150, 1000),
        window(400, 'Autolap', 3, 150, 649),
        window(400, 'Activity', 3, 300, 1649),
        window(500, 'Activity', 83, 100, 100),
        window(650, 'Autolap', 3, 150, 1000),
        window(800, 'Autolap', 3, 150, 662),
        window(800, 'Activity', 3, 300, 1662)
      ]
    }
  };
}
const parse = (data: object) =>
  EventImporterSuuntoJSON.getFromJSONString(
    JSON.stringify(data),
    new ActivityParsingOptions({ generateUnitStreams: false })
  );
const laps = (event: Awaited<ReturnType<typeof parse>>) =>
  event
    .getActivities()
    .map(a =>
      a
        .getLaps()
        .map(l => [
          (+l.startDate - origin) / 1000,
          (+l.endDate - origin) / 1000,
          l.getStat(DataDuration.type)?.getValue(),
          l.getStat(DataDistance.type)?.getValue()
        ])
    );

describe('Suunto multisport lap source matching', () => {
  it('does not turn a global lap into the ending sport or derive whole-lap averages from one leg', async () => {
    const data = fixture();
    data.DeviceLog.Samples = [
      marker(0, { Activity: { ActivityType: 3 } }),
      marker(100, { Activity: { ActivityType: 83 } }),
      marker(300, { Lap: { Type: 'Manual' } }),
      marker(800, { Lap: { Type: 'Stop' } })
    ];
    data.DeviceLog.Samples.forEach(s => Object.assign(s, { HR: 2 }));
    const global = window(300, 'Lap', undefined, 300, 500);
    Object.assign(global.Window, { Cadence: [{ Avg: 1.2 }] });
    data.DeviceLog.Windows = [
      window(100, 'Activity', 3, 100, 100),
      window(800, 'Activity', 83, 700, 2000),
      global,
      window(800, 'Lap', undefined, 500, 1600)
    ];
    const event = await parse(data);
    for (const e of [event, EventImporterJSON.getEventFromJSON(JSON.parse(JSON.stringify(event.toJSON())))]) {
      const lap = e.getActivities()[1].getLaps()[0];
      expect(lap.getStat(DataHeartRateAvg.type)).toBeUndefined();
      expect(lap.getStat(DataCadenceAvg.type)?.getValue()).toBe(72);
      expect(lap.getStat(DataStrokeRateAvg.type)).toBeUndefined();
    }
  });
  it('matches summary timestamps and sports, retaining boundary remainders without shifting later laps', async () => {
    const event = await parse(fixture());
    expect(laps(event)).toEqual([
      [],
      [
        [100, 250, 150, 1000],
        [250, 400, 150, 649]
      ],
      [],
      [
        [500, 650, 150, 1000],
        [650, 800, 150, 662]
      ]
    ]);
    expect(laps(EventImporterJSON.getEventFromJSON(JSON.parse(JSON.stringify(event.toJSON()))))).toEqual(laps(event));
    expect(event.getDistance().getValue()).toBe(3511);
  });

  it('uses source timestamp ownership even when window records are reordered', async () => {
    const data = fixture();
    // Activity summaries retain their independent existing order.
    const activity = data.DeviceLog.Windows.filter(w => w.Window.Type === 'Activity');
    data.DeviceLog.Windows = [
      ...data.DeviceLog.Windows.filter(w => w.Window.Type !== 'Activity').reverse(),
      ...activity
    ];
    expect(laps(await parse(data))).toEqual(laps(await parse(fixture())));
  });

  it.each([799.98, 805])('recognizes a terminal summary batch at %s without extending the activity', async flush => {
    const data = fixture();
    data.DeviceLog.Windows.slice(-2).forEach(w => (w.TimeISO8601 = time(flush)));
    data.DeviceLog.Windows.push(window(flush, 'Move', 2, 800, 3511));
    const event = await parse(data);
    expect(+event.endDate).toBe(origin + 800000);
    expect(laps(event)[3]).toEqual([
      [500, 650, 150, 1000],
      [650, 800, 150, 662]
    ]);
  });

  it.each([800, 799.98, 805])('keeps an earlier same-sport batch separate from the final batch at %s', async flush => {
    const data = fixture();
    data.DeviceLog.Windows.slice(-2).forEach(w => (w.TimeISO8601 = time(flush)));
    data.DeviceLog.Windows.push(window(flush, 'Move', 2, 800, 3511));
    data.DeviceLog.Windows.push(window(400, 'Move', 2, 400, 1749));
    expect((await parse(data)).toJSON()).toEqual((await parse(fixture())).toJSON());
  });

  it('does not promote an earlier-leg batch when later activity summaries are missing', async () => {
    const control = fixture();
    control.DeviceLog.Windows = control.DeviceLog.Windows.filter(
      w => w.Window.Type !== 'Activity' || w.TimeISO8601 <= time(400)
    );
    const data = structuredClone(control);
    data.DeviceLog.Windows.push(window(400, 'Move', 2, 400, 1749));
    expect((await parse(data)).toJSON()).toEqual((await parse(control)).toJSON());
  });

  it('keeps an independently recorded lap endpoint when the final activity summary is missing', async () => {
    const control = fixture();
    control.DeviceLog.Samples.splice(6, 0, marker(600, { Lap: { Type: 'Manual' } }));
    control.DeviceLog.Windows = control.DeviceLog.Windows.filter(
      w => !(w.Window.Type === 'Activity' && w.TimeISO8601 === time(800))
    );
    control.DeviceLog.Windows.push(window(600, 'Activity', 3, 100, 800), window(600, 'Lap', 3, 100, 800));
    const data = structuredClone(control);
    data.DeviceLog.Windows.push(window(600, 'Move', 2, 600, 2549));
    expect((await parse(data)).toJSON()).toEqual((await parse(control)).toJSON());
  });

  it('does not promote an intermediate batch within the final leg over a later activity summary', async () => {
    const control = fixture();
    control.DeviceLog.Windows.push(window(600, 'Activity', 3, 100, 800), window(600, 'Autolap', 3, 100, 800));
    control.DeviceLog.Windows.find(w => w.Window.Type === 'Autolap' && w.TimeISO8601 === time(650))!.Window.Duration =
      50;
    const data = structuredClone(control);
    data.DeviceLog.Windows.push(window(600, 'Move', 2, 600, 2549));
    // Array order cannot turn an intermediate timestamp into the final summary.
    const activity = (await parse(data)).getActivities()[3];
    expect(laps(await parse(data))).toEqual(laps(await parse(control)));
    expect(activity.getLaps().map(l => [(+l.startDate - origin) / 1000, (+l.endDate - origin) / 1000])).toEqual([
      [500, 600],
      [600, 650],
      [650, 800]
    ]);
    const restored = EventImporterJSON.getActivityFromJSON(JSON.parse(JSON.stringify(activity.toJSON())));
    for (const candidate of [activity, restored]) {
      const before = candidate.getLaps().map(l => l.toJSON());
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(candidate);
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(candidate);
      expect(candidate.getLaps().map(l => l.toJSON())).toEqual(before);
    }
  });

  it('preserves a corroborated whole-workout lap across sports once, on its ending leg', async () => {
    const data = fixture();
    data.DeviceLog.Samples = [
      marker(0, { Lap: { Type: 'Start' } }),
      marker(0, { Activity: { ActivityType: 83 } }),
      marker(100, { Activity: { ActivityType: 3 } }),
      marker(300, { Lap: { Type: 'Manual' } }),
      marker(800, { Lap: { Type: 'Stop' } })
    ];
    data.DeviceLog.Windows = [
      window(100, 'Activity', 83, 100, 100),
      window(800, 'Activity', 3, 700, 2000),
      window(300, 'Lap', undefined, 300, 500),
      window(800, 'Lap', undefined, 500, 1600)
    ];
    expect(laps(await parse(data))).toEqual([
      [],
      [
        [0, 300, 300, 500],
        [300, 800, 500, 1600]
      ]
    ]);
  });

  it('does not select a summary or recover global active time from conflicting same-time windows', async () => {
    const data = fixture();
    data.DeviceLog.Windows.push(window(250, 'Autolap', 3, 80, 123));
    const event = await parse(data);
    const at250 = event
      .getActivities()
      .flatMap(a => a.getLaps())
      .filter(l => +l.endDate === origin + 250000);
    expect(at250).toHaveLength(1);
    expect(at250[0].getStat(DataDistance.type)).toBeUndefined();
    expect(at250[0].getStat(DataDuration.type)).toBeUndefined();
  });

  it('does not borrow a timestamp-matched summary with a conflicting sport', async () => {
    const data = fixture();
    data.DeviceLog.Windows[1].Window.ActivityId = 83;
    const event = await parse(data);
    const at250 = event
      .getActivities()
      .flatMap(a => a.getLaps())
      .filter(l => +l.endDate === origin + 250000);
    expect(at250).toHaveLength(1);
    expect(at250[0].getStat(DataDistance.type)).toBeUndefined();
    expect(at250[0].getStat(DataDuration.type)).toBeUndefined();
    expect(laps(event)[1].find(l => l[1] === 400)).toEqual([250, 400, 150, 649]);
  });

  it('retains independent manual and automatic remainders at the same Stop', async () => {
    const data = fixture();
    data.DeviceLog.Samples.splice(6, 0, marker(600, { Lap: { Type: 'Manual' } }));
    data.DeviceLog.Windows.push(window(600, 'Lap', 3, 100, 800), window(800, 'Lap', 3, 200, 800));
    const event = await parse(data);
    const terminal = event
      .getActivities()[3]
      .getLaps()
      .filter(l => +l.endDate === origin + 800000);
    expect(terminal.map(l => [l.type, (+l.startDate - origin) / 1000, l.getDuration()?.getValue()])).toEqual([
      ['Manual', 600, 200],
      ['Distance', 650, 150]
    ]);
  });

  it('keeps the manual counter start when only its summary flushes at Stop after an automatic marker', async () => {
    const data = fixture();
    data.DeviceLog.Samples.splice(6, 0, marker(600, { Lap: { Type: 'Manual' } }));
    data.DeviceLog.Windows = data.DeviceLog.Windows.filter(
      w => !(w.Window.Type === 'Autolap' && w.TimeISO8601 === time(800))
    );
    data.DeviceLog.Windows.push(window(600, 'Lap', 3, 100, 800), window(800, 'Lap', 3, 200, 800));
    const event = await parse(data);
    const terminal = event
      .getActivities()[3]
      .getLaps()
      .filter(l => +l.endDate === origin + 800000);
    expect(terminal.map(l => [l.type, (+l.startDate - origin) / 1000, l.getDuration()?.getValue()])).toEqual([
      ['Stop', 600, 200]
    ]);
  });

  it.each(['Lap', 'Autolap'])('keeps the %s final counter independent of other markers and pauses', async kind => {
    const data = fixture();
    const other = kind === 'Lap' ? 'Autolap' : 'Lap';
    const type = (name: string) => (name === 'Lap' ? 'Manual' : 'Distance');
    data.DeviceLog.Samples = [
      marker(0, { Activity: { ActivityType: 83 } }),
      marker(100, { Activity: { ActivityType: 3 } }),
      marker(600, { Lap: { Type: type(kind) } }),
      marker(650, { Lap: { Type: type(other) } }),
      marker(650, { Pause: { State: true } }),
      marker(700, { Pause: { State: false } }),
      marker(800, { Lap: { Type: 'Stop' } })
    ];
    data.DeviceLog.Windows = [
      window(100, 'Activity', 83, 100, 100),
      window(800, 'Activity', 3, 650, 2000),
      window(600, kind, 3, 500, 1000),
      window(650, other, 3, 550, 1200),
      window(800, kind, 3, 150, 1000)
    ];
    const event = await parse(data);
    for (const candidate of [event, EventImporterJSON.getEventFromJSON(JSON.parse(JSON.stringify(event.toJSON())))]) {
      const leg = candidate.getActivities()[1];
      for (let repeat = 0; repeat < 2; repeat++) {
        const terminal = leg.getLaps().filter(l => +l.endDate === origin + 800000);
        expect(terminal).toHaveLength(1);
        expect(+terminal[0].startDate).toBe(origin + 600000);
        expect(terminal[0].getDuration()?.getValue()).toBe(150);
        expect(terminal[0].getPause()?.getValue()).toBe(50);
        expect(terminal[0].getDistance().getValue()).toBe(1000);
        ActivityUtilities.generateMissingStreamsAndStatsForActivity(leg);
      }
    }
  });

  it('retains an unmatched Stop without borrowing a summary when two automatic counters are possible', async () => {
    const data = fixture();
    data.DeviceLog.Samples.splice(6, 0, marker(600, { Lap: { Type: 'Interval' } }));
    const terminal = (await parse(data))
      .getActivities()[3]
      .getLaps()
      .filter(l => +l.endDate === origin + 800000);
    expect(terminal).toHaveLength(1);
    expect(terminal[0].type).toBe('Stop');
    expect(terminal[0].getDuration()).toBeUndefined();
    expect(terminal[0].getStat(DataDistance.type)).toBeUndefined();
  });

  it.each([false, true])(
    'does not invent an automatic counter alongside a manual Stop summary (reverse windows: %s)',
    async reverse => {
      const data = fixture();
      data.DeviceLog.Samples.splice(
        6,
        0,
        marker(550, { Lap: { Type: 'Interval' } }),
        marker(600, { Lap: { Type: 'Manual' } })
      );
      data.DeviceLog.Windows.push(window(600, 'Lap', 3, 100, 800), window(800, 'Lap', 3, 200, 800));
      if (reverse) {
        data.DeviceLog.Windows = [
          ...data.DeviceLog.Windows.filter(w => w.Window.Type === 'Activity'),
          ...data.DeviceLog.Windows.filter(w => w.Window.Type !== 'Activity').reverse()
        ];
      }
      const event = await parse(data);
      expect(event.getDistance().getValue()).toBe(3511);
      expect(event.getDuration()?.getValue()).toBe(800);
      for (const candidate of [event, EventImporterJSON.getEventFromJSON(JSON.parse(JSON.stringify(event.toJSON())))]) {
        const leg = candidate.getActivities()[3];
        for (let repeat = 0; repeat < 2; repeat++) {
          const terminal = leg.getLaps().filter(l => +l.endDate === origin + 800000);
          expect(terminal.map(l => [l.type, (+l.startDate - origin) / 1000, l.getDuration()?.getValue()])).toEqual([
            ['Manual', 600, 200]
          ]);
          expect(terminal[0].getDistance().getValue()).toBe(800);
          ActivityUtilities.generateMissingStreamsAndStatsForActivity(leg);
        }
      }
    }
  );

  it('does not invent an automatic counter for an unmarked sport-change remainder', async () => {
    const data = fixture();
    data.DeviceLog.Samples.splice(3, 0, marker(200, { Lap: { Type: 'Interval' } }));
    const event = await parse(data);
    const leg = event.getActivities()[1];
    expect(leg.getLaps().some(l => +l.endDate === origin + 400000)).toBe(false);
    const recorded = leg.getLaps().find(l => +l.endDate === origin + 250000)!;
    expect(recorded.type).toBe('Distance');
    expect(recorded.getDuration()?.getValue()).toBe(150);
    expect(recorded.getDistance().getValue()).toBe(1000);
    expect(event.getDistance().getValue()).toBe(3511);
    expect(event.getDuration()?.getValue()).toBe(800);
  });

  it.each([3, 2, undefined])('checks automatic ambiguity across the full scope owned by sport id %s', async sport => {
    const data = fixture();
    data.DeviceLog.Samples.splice(3, 0, marker(200, { Lap: { Type: 'Interval' } }));
    data.DeviceLog.Samples.splice(7, 0, marker(600, { Lap: { Type: 'Manual' } }));
    data.DeviceLog.Windows.push(window(600, 'Lap', sport, 100, 800), window(800, 'Lap', sport, 200, 800));
    data.DeviceLog.Windows.find(w => w.Window.Type === 'Autolap' && w.TimeISO8601 === time(800))!.Window.ActivityId =
      sport;
    const event = await parse(data);
    const terminal = event
      .getActivities()[3]
      .getLaps()
      .filter(l => +l.endDate === origin + 800000);
    expect(terminal.map(l => [l.type, (+l.startDate - origin) / 1000, l.getDuration()?.getValue()])).toEqual(
      sport === 3
        ? [
            ['Manual', 600, 200],
            ['Distance', 650, 150]
          ]
        : [['Manual', 600, 200]]
    );
  });

  it('keeps independent global automatic lap types overlapping instead of joining their cursors', async () => {
    const data = fixture();
    data.DeviceLog.Samples = [
      marker(0, { Activity: { ActivityType: 83 } }),
      marker(100, { Activity: { ActivityType: 3 } }),
      marker(300, { Lap: { Type: 'Interval' } }),
      marker(350, { Lap: { Type: 'Distance' } }),
      marker(800, { Lap: { Type: 'Stop' } })
    ];
    data.DeviceLog.Windows = [
      window(100, 'Activity', 83, 100, 100),
      window(800, 'Activity', 3, 700, 2000),
      window(300, 'Autolap', undefined, 300, 500),
      window(350, 'Autolap', undefined, 350, 600)
    ];
    expect(laps(await parse(data))[1].slice(0, 2)).toEqual([
      [0, 300, 300, 500],
      [0, 350, 350, 600]
    ]);
  });
});
