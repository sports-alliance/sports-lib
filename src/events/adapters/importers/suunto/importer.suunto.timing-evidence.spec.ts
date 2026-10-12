import { EventImporterSuuntoJSON } from './importer.suunto.json';
import { EventImporterJSON } from '../json/importer.json';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { EventUtilities } from '../../../utilities/event.utilities';
import { DataDuration } from '../../../../data/data.duration';
import { DataTimerTime } from '../../../../data/data.timer-time';
import { DataElapsedTime } from '../../../../data/data.elapsed-time';
import { DataPause } from '../../../../data/data.pause';
import { DataMovingTime } from '../../../../data/data.moving-time';
import { DataDurabilityEvidence } from '../../../../data/data.durability-evidence';
import { DataTrainingStressScore } from '../../../../data/data.training-stress-score';
import {
  analyzeActivityDurability,
  calculateActivityDurabilitySourceFingerprint
} from '../../../utilities/activity-durability';
import { readSuuntoTimingSource, resolveSuuntoTiming } from './suunto-timing';

const origin = Date.parse('2026-01-01T10:00:00Z');
const time = (s: number) => new Date(origin + s * 1000).toISOString();
const sample = (s: number, events: any[]) => ({ TimeISO8601: time(s), Events: events });
const options = new ActivityParsingOptions({ generateUnitStreams: false });
const parse = (data: any) => EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(data), options);
function payload(active: unknown = 480): any {
  return {
    DeviceLog: {
      Device: { Name: 'Synthetic', Info: { SW: '1', HW: '1' } },
      Header: { DateTime: time(0), Duration: 600, PauseDuration: 120, SpeedZones: { Zone5LowerLimit: 3 } },
      Windows: [{ Window: { Type: 'Activity', Duration: active } }],
      Samples: [
        sample(0, [{ Activity: { ActivityType: 3 } }]),
        ...Array.from({ length: 601 }, (_, s) => ({ TimeISO8601: time(s), Speed: 3 })),
        sample(600, [{ Lap: { Type: 'Stop' } }])
      ]
    }
  };
}
const timing = (a: any) =>
  [DataDuration, DataTimerTime, DataElapsedTime, DataPause].map(C => a.getStat(C.type)?.getValue());

describe('Suunto scoped elapsed and active timing', () => {
  it('keeps window active time separate from elapsed in activity, event and native JSON', async () => {
    const event = await parse(payload());
    const activity = event.getFirstActivity();
    expect(timing(activity)).toEqual([480, 480, 600, 120]);
    expect(timing(event)).toEqual([480, 480, 600, 120]);
    const score = ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic;
    expect(score).toMatchObject({ method: 'PACE', score: 13.3 });
    for (let i = 0; i < 2; i++) {
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
      EventUtilities.reGenerateStatsForEvent(event);
      expect(timing(activity)).toEqual([480, 480, 600, 120]);
      expect(ActivityUtilities.evaluateTrainingStressScore(activity).automatic).toEqual(score);
      expect(timing(EventImporterJSON.getEventFromJSON(JSON.parse(JSON.stringify(event.toJSON()))))).toEqual([
        480, 480, 600, 120
      ]);
    }
  });

  it('recovers an impossible summary from explicit start/pause/stop evidence', async () => {
    const data = payload(6000);
    data.DeviceLog.Header.Duration = 6000;
    data.DeviceLog.Header.PauseDuration = 0;
    data.DeviceLog.Samples.push(sample(590, [{ Pause: { State: true } }]));
    const event = await parse(data),
      activity = event.getFirstActivity();
    expect(timing(activity)).toEqual([590, 590, 600, 10]);
    expect(timing(event)).toEqual([590, 590, 600, 10]);
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic).toMatchObject({
      method: 'PACE',
      score: 16.4
    });
  });

  it.each([601, 6000, -1, 'bad', null])(
    'withholds unrecoverable active timing instead of inventing elapsed duration (%s)',
    async active => {
      const event = await parse(payload(active)),
        activity = event.getFirstActivity();
      for (let i = 0; i < 2; i++) {
        ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
        EventUtilities.reGenerateStatsForEvent(event);
        expect(timing(activity)).toEqual([undefined, undefined, 600, undefined]);
        expect(activity.getStat(DataMovingTime.type)).toBeUndefined();
        expect(timing(event)).toEqual([undefined, undefined, 600, undefined]);
        expect(ActivityUtilities.evaluateTrainingStressScore(activity).automatic.score).toBeNull();
        const restored = EventImporterJSON.getEventFromJSON(JSON.parse(JSON.stringify(event.toJSON())));
        expect(timing(restored)).toEqual(timing(event));
        expect(timing(restored.getFirstActivity())).toEqual(timing(activity));
      }
    }
  );

  it('does not use conflicting pause states to recover invalid timing', async () => {
    const data = payload(6000);
    data.DeviceLog.Samples.push(sample(300, [{ Pause: { State: true } }, { Pause: { State: false } }]));
    expect(timing((await parse(data)).getFirstActivity())).toEqual([undefined, undefined, 600, undefined]);
  });

  it('requires resolved active timing even when HR calibration and samples are valid', async () => {
    const data = payload();
    data.DeviceLog.Samples.forEach((s: any) => {
      if (s.Speed !== undefined) s.HR = 2.5;
    });
    const calibrated = new ActivityParsingOptions({
      generateUnitStreams: false,
      tss: { overrides: { maxHeartRate: 190, restingHeartRate: 55, lactateThresholdHR: 165 } }
    });
    const valid = (
      await EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(data), calibrated)
    ).getFirstActivity();
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(valid).automatic.method).toBe('HR');
    data.DeviceLog.Windows[0].Window.Duration = 6000;
    const activity = (
      await EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(data), calibrated)
    ).getFirstActivity();
    const score = ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic;
    expect(score.method).toBeNull();
    expect(score.score).toBeNull();
    expect(score.reasons).toContain('calculation-unavailable');
    expect(score.reasons).not.toContain('missing-hr-samples');
    expect(score.reasons).not.toContain('missing-hr-calibration');
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    expect(ActivityUtilities.evaluateTrainingStressScore(activity).automatic).toEqual(score);
    expect(timing(activity)).toEqual([undefined, undefined, 600, undefined]);
  });

  it.each([0, 25.4])('preserves imported TSS %s despite unresolved summary timing', async score => {
    const activity = (await parse(payload(6000))).getFirstActivity();
    activity.addStat(new DataTrainingStressScore(score));
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic).toMatchObject({
      method: 'IMPORTED',
      score,
      provenance: 'imported'
    });
    expect(timing(activity)).toEqual([undefined, undefined, 600, undefined]);
  });

  it('cannot qualify durability using elapsed time when source active timing is unresolved', async () => {
    const data = payload(3600);
    data.DeviceLog.Header.Duration = 3600;
    data.DeviceLog.Header.PauseDuration = 0;
    data.DeviceLog.Samples = [
      sample(0, [{ Activity: { ActivityType: 4 } }]),
      ...Array.from({ length: 3601 }, (_, s) => ({ TimeISO8601: time(s), Power: 200, HR: 2.5 })),
      sample(3600, [{ Lap: { Type: 'Stop' } }])
    ];
    const valid = (await parse(data)).getFirstActivity();
    const evidence = analyzeActivityDurability(valid).summary!;
    expect(evidence.eligibility.eligible).toBe(true);
    data.DeviceLog.Windows[0].Window.Duration = 9999;
    const unresolved = (await parse(data)).getFirstActivity();
    expect(analyzeActivityDurability(unresolved)).toEqual({ timeline: [], summary: null });
    expect(unresolved.getStat(DataDurabilityEvidence.type)).toBeUndefined();
    unresolved.addStat(
      new DataDurabilityEvidence({
        ...evidence,
        sourceFingerprint: calculateActivityDurabilitySourceFingerprint(unresolved)
      })
    );
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(unresolved);
    expect(unresolved.getStat(DataDurabilityEvidence.type)).toBeUndefined();
  });

  it('keeps header active and pause time when no explicit activity marker is present', async () => {
    const data = payload();
    data.DeviceLog.Samples.shift();
    const event = await parse(data);
    expect(timing(event.getFirstActivity())).toEqual([480, 480, 600, 120]);
    expect(timing(event)).toEqual([480, 480, 600, 120]);
  });

  it('does not borrow timing from a window with a conflicting sport identifier', async () => {
    const data = payload();
    data.DeviceLog.Windows[0].Window.ActivityId = 2;
    expect(timing((await parse(data)).getFirstActivity())).toEqual([undefined, undefined, 600, undefined]);
  });

  it('does not assign one whole-workout window to two legs of the same sport', async () => {
    const data = payload(480);
    data.DeviceLog.Samples.splice(301, 0, sample(300, [{ Activity: { ActivityType: 3 } }]));
    data.DeviceLog.Samples.push(sample(200, [{ Pause: { State: true } }]), sample(320, [{ Pause: { State: false } }]));
    const event = await parse(data);
    expect(event.getActivities().map(timing)).toEqual([
      [200, 200, 300, 100],
      [280, 280, 300, 20]
    ]);
    expect(timing(event)).toEqual([480, 480, 600, 120]);
  });

  it('withholds parent active/pause totals when a leg is unresolved', async () => {
    const data = payload(6000);
    data.DeviceLog.Windows.push({ Window: { Type: 'Activity', Duration: 250 } });
    data.DeviceLog.Samples.splice(301, 0, sample(300, [{ Activity: { ActivityType: 3 } }]));
    const event = await parse(data);
    expect(event.getActivities().map(timing)).toEqual([
      [undefined, undefined, 300, undefined],
      [250, 250, 300, 50]
    ]);
    expect(timing(event)).toEqual([undefined, undefined, 600, undefined]);
    EventUtilities.reGenerateStatsForEvent(event);
    expect(event.getDuration()).toBeUndefined();
    expect(event.getPause()).toBeUndefined();
    expect(event.getMovingTime()).toBeUndefined();
  });

  it('uses a start-anchored timer timeline for earlier legs before the first recorded pause', async () => {
    const data = payload(300.1);
    data.DeviceLog.Windows.push({ Window: { Type: 'Activity', Duration: 300.1 } });
    data.DeviceLog.Samples.splice(301, 0, sample(300, [{ Activity: { ActivityType: 3 } }]));
    data.DeviceLog.Samples.push(sample(599, [{ Pause: { State: true } }]));
    const event = await parse(data);
    expect(event.getActivities().map(timing)).toEqual([
      [300, 300, 300, 0],
      [299, 299, 300, 1]
    ]);
    expect(timing(event)).toEqual([599, 599, 600, 1]);
  });

  it('resolves lap windows independently without borrowing the whole activity duration', async () => {
    const data = payload();
    data.DeviceLog.Samples.push(sample(300, [{ Lap: { Type: 'Manual' } }]));
    // Lap markers are chronological even if sensor/timer observations are separate arrays.
    data.DeviceLog.Samples.sort((a: any, b: any) => +new Date(a.TimeISO8601) - +new Date(b.TimeISO8601));
    data.DeviceLog.Windows.push({ Window: { Type: 'Lap', Duration: 240 } }, { Window: { Type: 'Lap', Duration: 240 } });
    const activity = (await parse(data)).getFirstActivity();
    expect(activity.getLaps().map(timing)).toEqual([
      [240, 240, 300, 60],
      [240, 240, 300, 60]
    ]);
  });

  it('uses corroborated single-leg header precision without extending the record timeline', () => {
    const source = readSuuntoTimingSource([sample(0, [{ Activity: {} }]), sample(700, [])]);
    expect(
      resolveSuuntoTiming(origin, origin + 600000, { Duration: Math.fround(600.125) }, source, {
        DateTime: time(0),
        Duration: 600.125,
        PauseDuration: 0
      })
    ).toEqual({ elapsed: 600.125, active: 600.125, pause: 0 });
    expect(
      resolveSuuntoTiming(origin, origin + 600000, { Duration: 6000 }, source, {
        DateTime: time(0),
        Duration: 6000,
        PauseDuration: 0
      }).active
    ).toBeNull();
  });

  it('accepts only float32-equivalent timestamp/summary quantization', () => {
    const source = readSuuntoTimingSource([sample(0, [{ Activity: {} }]), sample(600, [])]);
    expect(resolveSuuntoTiming(origin, origin + 600000, { Duration: 600.00001 }, source)).toEqual({
      elapsed: 600.00001,
      active: 600.00001,
      pause: 0
    });
    expect(resolveSuuntoTiming(origin, origin + 600000, { Duration: 600.1 }, source).active).toBeNull();
  });
});
