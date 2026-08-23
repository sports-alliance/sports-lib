import * as fs from 'fs';
import * as path from 'path';
import { EventUtilities } from './event.utilities';
import { Event } from '../event';
import { Activity } from '../../activities/activity';
import { DataPower } from '../../data/data.power';
import { DataPowerCurve } from '../../data/data.power-curve';
// @ts-ignore
import { ActivityTypes } from '../../activities/activity.types';
import { ActivityUtilities } from './activity.utilities';
import { EventImporterFIT } from '../adapters/importers/fit/importer.fit';
import { DataAirPowerAvg } from '../../data/data.air-power-avg';
import { DataAirPowerMin } from '../../data/data.air-power-min';
import { DataAirPowerMax } from '../../data/data.air-power-max';
import { DataVerticalSpeedMin } from '../../data/data.vertical-speed-min';
import { DataVerticalSpeedMax } from '../../data/data.vertical-speed-max';
import { DataGroundContactTimeMin } from '../../data/data.ground-contact-time-min';
import { DataGroundContactTimeMax } from '../../data/data.ground-contact-time-max';
import { DataVerticalOscillationMin } from '../../data/data.vertical-oscillation-min';
import { DataVerticalOscillationMax } from '../../data/data.vertical-oscillation-max';
import { DataGradeAdjustedPaceMin } from '../../data/data.grade-adjusted-pace-min';
import { DataGradeAdjustedPaceMax } from '../../data/data.grade-adjusted-pace-max';
import { DataPaceMin } from '../../data/data.pace-min';
import { DataPaceMax } from '../../data/data.pace-max';
import { DataTemperatureMin } from '../../data/data.temperature-min';
import { DataAltitudeAvg } from '../../data/data.altitude-avg';
import { DataGradeAdjustedPace } from '../../data/data.grade-adjusted-pace';
import { DataPace } from '../../data/data.pace';
import { DataDuration } from '../../data/data.duration';
import { DataPause } from '../../data/data.pause';
import { DataDistance } from '../../data/data.distance';
import { DataEffortPaceAvg } from '../../data/data.effort-pace-avg';
import { DataEffortPaceMin } from '../../data/data.effort-pace-min';
import { DataEffortPaceMax } from '../../data/data.effort-pace-max';
import { Creator } from '../../creators/creator';
import { FileType } from '../adapters/file-type.enum';
import { DataAscent } from '../../data/data.ascent';
import { DataDescent } from '../../data/data.descent';
import { DataAltitudeMin } from '../../data/data.altitude-min';
import { DataAltitudeMax } from '../../data/data.altitude-max';
import { DataGradeMin } from '../../data/data.grade-min';
import { DataGradeMax } from '../../data/data.grade-max';
import { DataGradeAvg } from '../../data/data.grade-avg';

describe('EventUtilities Power Curve Aggregation', () => {
  const terrainSummaryTypes = [
    DataAscent.type,
    DataDescent.type,
    DataAltitudeMin.type,
    DataAltitudeMax.type,
    DataAltitudeAvg.type,
    DataGradeMin.type,
    DataGradeMax.type,
    DataGradeAvg.type
  ];

  const addTerrainSummaryStats = (activity: Activity, scale = 1) => {
    [
      new DataAscent(20 * scale),
      new DataDescent(15 * scale),
      new DataAltitudeMin(-5 * scale),
      new DataAltitudeMax(5 * scale),
      new DataAltitudeAvg(scale),
      new DataGradeMin(-10 * scale),
      new DataGradeMax(10 * scale),
      new DataGradeAvg(scale)
    ].forEach(stat => activity.addStat(stat));
  };

  const createDivingActivity = (activityType: ActivityTypes, offsetMilliseconds: number) => {
    const startDate = new Date(offsetMilliseconds);
    const activity = new Activity(
      startDate,
      new Date(offsetMilliseconds + 60_000),
      activityType,
      new Creator('Dive computer')
    );
    [new DataDuration(60), new DataPause(0), new DataDistance(25)].forEach(stat => activity.addStat(stat));
    addTerrainSummaryStats(activity);
    return activity;
  };

  const createMockActivity = (powerValues: number[], weight?: number): Activity => {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + powerValues.length * 1000);
    // @ts-ignore
    const act = new Activity(startDate, endDate, ActivityTypes.Cycling, { toJSON: () => ({}) } as any);

    const powerStream = act.createStream(DataPower.type);
    powerStream.setData(powerValues);
    act.addStream(powerStream);

    if (weight) {
      // Mock getStat for weight
      act.getStat = jest.fn().mockImplementation(type => {
        if (type === 'Weight') return { getValue: () => weight };
        if (type === 'PowerCurve') return curve; // Return the pre-calculated curve AFTER it's calculated
        return null;
      });
    }

    // Setup initial getStat for calculation if needed, but actually verify if calculateMeanMaxPower uses getStat.
    // Yes, it uses act.getStat(DataWeight.type). So we must mock it BEFORE calculation.

    act.getStat = jest.fn().mockImplementation(type => {
      if (type === 'Weight' && weight) return { getValue: () => weight };
      return null;
    });

    // Pre-calculate curve for activity
    // Note: this uses the mocked getStat above to find weight!
    const curve = ActivityUtilities.calculateMeanMaxPower(act, [10]);
    act.addStat(curve as any);

    // Re-mock getStat to include the curve we just calculated
    act.getStat = jest.fn().mockImplementation(type => {
      if (type === 'Weight' && weight) return { getValue: () => weight };
      if (type === 'PowerCurve') return curve;
      return null;
    });

    // Mock getDuration
    act.getDuration = jest.fn().mockReturnValue({ getValue: () => powerValues.length });
    // Mock getPause
    act.getPause = jest.fn().mockReturnValue({ getValue: () => 0 });
    // Mock getDistance
    act.getDistance = jest.fn().mockReturnValue({ getValue: () => 1000 });

    return act;
  };

  it('should aggregate power curves from multiple activities by taking maximums', () => {
    // Activity 1: Constant 200W
    const act1 = createMockActivity(new Array(100).fill(200));
    // Activity 2: Constant 300W
    const act2 = createMockActivity(new Array(100).fill(300));

    // @ts-ignore
    const event = new Event('Test Event', new Date(), new Date(), 'fit', 0, 'desc', true);
    event.addActivities([act1, act2]);

    // Run aggregation logic
    EventUtilities.reGenerateStatsForEvent(event);

    const eventCurveStat = event.getStat(DataPowerCurve.type);
    expect(eventCurveStat).toBeDefined();

    const points = eventCurveStat!.getValue() as any[];
    // defined duration in createMockActivity is [10]
    const point10s = points.find(p => p.duration.getValue() === 10);

    expect(point10s).toBeDefined();
    // Should take the max from Act 2 (300W)
    expect(point10s.power.getValue()).toBe(300);
  });

  it('should aggregate W/kg correctly', () => {
    // Act 1: 300W @ 100kg = 3.0 W/kg
    const act1 = createMockActivity(new Array(100).fill(300), 100);
    // Act 2: 300W @ 75kg = 4.0 W/kg
    const act2 = createMockActivity(new Array(100).fill(300), 75);

    // @ts-ignore
    const event = new Event('Test Event 2', new Date(), new Date(), 'fit', 0, 'desc', true);
    event.addActivities([act1, act2]);

    EventUtilities.reGenerateStatsForEvent(event);
    const points = event.getStat(DataPowerCurve.type)!.getValue() as any[];
    const point10s = points.find(p => p.duration.getValue() === 10);

    expect(point10s.wattsPerKg).toBeDefined();
    expect(point10s.wattsPerKg.getValue()).toBe(4.0); // Should take the higher W/kg
  });

  it('omits terrain summaries when regenerating an event made entirely of Diving-group activities', () => {
    const event = new Event('Two dives', new Date(0), new Date(120_000), FileType.FIT);
    const activities = [
      createDivingActivity(ActivityTypes.ScubaDiving, 0),
      createDivingActivity(ActivityTypes.FreeDiving, 60_000)
    ];
    event.addActivities(activities);

    const summaryStats = ActivityUtilities.getSummaryStatsForActivities(activities);
    terrainSummaryTypes.forEach(type => expect(summaryStats.find(stat => stat.getType() === type)).toBeUndefined());

    EventUtilities.reGenerateStatsForEvent(event);

    terrainSummaryTypes.forEach(type => expect(event.getStat(type)).toBeUndefined());
  });

  it('retains terrain summaries for a mixed regenerated event', () => {
    const event = new Event('Dive and run', new Date(0), new Date(120_000), FileType.FIT);
    const running = new Activity(
      new Date(60_000),
      new Date(120_000),
      ActivityTypes.Running,
      new Creator('Running watch')
    );
    [new DataDuration(60), new DataPause(0), new DataDistance(100)].forEach(stat => running.addStat(stat));
    addTerrainSummaryStats(running, 5);
    event.addActivities([createDivingActivity(ActivityTypes.ScubaDiving, 0), running]);

    EventUtilities.reGenerateStatsForEvent(event);

    terrainSummaryTypes.forEach(type => expect(event.getStat(type)).toBeDefined());
    expect(event.getStat(DataAscent.type)?.getValue()).toBe(100);
    expect(event.getStat(DataDescent.type)?.getValue()).toBe(75);
    expect(event.getStat(DataAltitudeAvg.type)?.getValue()).toBe(5);
    expect(event.getStat(DataGradeAvg.type)?.getValue()).toBe(5);
  });

  describe('mergeEvents summary stats integration', () => {
    const toArrayBuffer = (filePath: string): ArrayBuffer => {
      const fileContent = fs.readFileSync(filePath);
      return fileContent.buffer.slice(fileContent.byteOffset, fileContent.byteOffset + fileContent.byteLength);
    };

    const loadEventFromFixture = async (relativePath: string) => {
      const fitPath = path.join(__dirname, '..', '..', 'specs', 'fixtures', relativePath);
      const event = await EventImporterFIT.getFromArrayBuffer(toArrayBuffer(fitPath));
      // Precompute activity stats so merge logic has them
      event.getActivities().forEach(activity => ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity));
      return event;
    };

    const ensureMinStatFromStream = (
      activity: any,
      statType: string,
      streamType: string,
      StatCtor: new (value: number) => any
    ) => {
      const stat = activity.getStat(statType);
      if (stat && stat.getValue() !== Infinity) return;
      if (!activity.hasStreamData(streamType)) return;
      const stream = activity.getStreamData(streamType) as Array<number | null | undefined> | undefined;
      if (!stream || stream.length === 0) return;
      const finite = stream.filter((v): v is number => Number.isFinite(v));
      if (!finite.length) return;
      activity.addStat(new StatCtor(Math.min(...finite)));
    };

    it('propagates new min/max/avg stats into merged event', async () => {
      // 6860622783.fit carries Air Power, Ground Contact Time, Vertical Oscillation
      const eventA = await loadEventFromFixture(path.join('runs', 'fit', '6860622783.fit'));
      // 6909950168.fit carries Vertical Speed, Pace, Grade Adjusted Pace, Temperature
      const eventB = await loadEventFromFixture(path.join('runs', 'fit', '6909950168.fit'));

      // Ensure min pace and grade-adjusted pace stats exist when not set by importer
      eventA.getActivities().forEach(activity => {
        ensureMinStatFromStream(activity, DataPaceMin.type, DataPace.type, DataPaceMin);
        ensureMinStatFromStream(
          activity,
          DataGradeAdjustedPaceMin.type,
          DataGradeAdjustedPace.type,
          DataGradeAdjustedPaceMin
        );
      });
      eventB.getActivities().forEach(activity => {
        ensureMinStatFromStream(activity, DataPaceMin.type, DataPace.type, DataPaceMin);
        ensureMinStatFromStream(
          activity,
          DataGradeAdjustedPaceMin.type,
          DataGradeAdjustedPace.type,
          DataGradeAdjustedPaceMin
        );
      });

      const merged = EventUtilities.mergeEvents([eventA, eventB]);
      const getStat = (type: string) => merged.getStat(type)!;

      const aActivity = eventA.getFirstActivity();
      const bActivity = eventB.getFirstActivity();

      // Air Power (only present in eventA)
      expect(getStat(DataAirPowerAvg.type).getValue()).toBe(aActivity.getStat(DataAirPowerAvg.type)!.getValue());
      expect(getStat(DataAirPowerMin.type).getValue()).toBe(aActivity.getStat(DataAirPowerMin.type)!.getValue());
      expect(getStat(DataAirPowerMax.type).getValue()).toBe(aActivity.getStat(DataAirPowerMax.type)!.getValue());

      // Vertical Speed (only present in eventB)
      expect(getStat(DataVerticalSpeedMin.type).getValue()).toBe(
        bActivity.getStat(DataVerticalSpeedMin.type)!.getValue()
      );
      expect(getStat(DataVerticalSpeedMax.type).getValue()).toBe(
        bActivity.getStat(DataVerticalSpeedMax.type)!.getValue()
      );

      // Ground Contact Time (present in eventA)
      expect(getStat(DataGroundContactTimeMin.type).getValue()).toBe(
        aActivity.getStat(DataGroundContactTimeMin.type)!.getValue()
      );
      expect(getStat(DataGroundContactTimeMax.type).getValue()).toBe(
        aActivity.getStat(DataGroundContactTimeMax.type)!.getValue()
      );

      // Vertical Oscillation (present in eventA)
      expect(getStat(DataVerticalOscillationMin.type).getValue()).toBe(
        aActivity.getStat(DataVerticalOscillationMin.type)!.getValue()
      );
      expect(getStat(DataVerticalOscillationMax.type).getValue()).toBe(
        aActivity.getStat(DataVerticalOscillationMax.type)!.getValue()
      );

      // Grade Adjusted Pace (present in eventB)
      const gapMinExpected = Math.min(
        Number(aActivity.getStat(DataGradeAdjustedPaceMin.type)?.getValue() ?? Infinity),
        Number(bActivity.getStat(DataGradeAdjustedPaceMin.type)?.getValue() ?? Infinity)
      );
      const gapMaxExpected = Math.max(
        Number(aActivity.getStat(DataGradeAdjustedPaceMax.type)?.getValue() ?? -Infinity),
        Number(bActivity.getStat(DataGradeAdjustedPaceMax.type)?.getValue() ?? -Infinity)
      );
      expect(getStat(DataGradeAdjustedPaceMin.type).getValue()).toBe(gapMinExpected);
      expect(getStat(DataGradeAdjustedPaceMax.type).getValue()).toBe(gapMaxExpected);

      // Pace (present in eventB)
      const paceMinExpected = Math.min(
        Number(aActivity.getStat(DataPaceMin.type)?.getValue() ?? Infinity),
        Number(bActivity.getStat(DataPaceMin.type)?.getValue() ?? Infinity)
      );
      const paceMaxExpected = Math.max(
        Number(aActivity.getStat(DataPaceMax.type)?.getValue() ?? -Infinity),
        Number(bActivity.getStat(DataPaceMax.type)?.getValue() ?? -Infinity)
      );
      expect(getStat(DataPaceMin.type).getValue()).toBe(paceMinExpected);
      expect(getStat(DataPaceMax.type).getValue()).toBe(paceMaxExpected);

      // Temperature min across activities
      const expectedTempMin = Math.min(
        Number(aActivity.getStat(DataTemperatureMin.type)?.getValue() ?? Infinity),
        Number(bActivity.getStat(DataTemperatureMin.type)?.getValue() ?? Infinity)
      );
      expect(getStat(DataTemperatureMin.type).getValue()).toBe(expectedTempMin);

      // Altitude average across activities
      const altitudeVals = [
        Number(aActivity.getStat(DataAltitudeAvg.type)?.getValue()),
        Number(bActivity.getStat(DataAltitudeAvg.type)?.getValue())
      ].filter(v => Number.isFinite(v));
      const expectedAltAvg = altitudeVals.reduce((sum, v) => sum + v, 0) / altitudeVals.length;
      expect(getStat(DataAltitudeAvg.type).getValue()).toBe(expectedAltAvg);
    });

    it('aggregates effort pace min/max/avg into merged events', () => {
      const creator = { toJSON: () => ({}) } as any;
      const createActivity = (
        startDate: Date,
        avgEffortPace: number,
        minEffortPace: number,
        maxEffortPace: number
      ): Activity => {
        // @ts-ignore
        const activity = new Activity(
          startDate,
          new Date(startDate.getTime() + 3600 * 1000),
          ActivityTypes.Running,
          creator
        );
        activity.addStat(new DataDuration(3600));
        activity.addStat(new DataPause(0));
        activity.addStat(new DataDistance(10000));
        activity.addStat(new DataEffortPaceAvg(avgEffortPace));
        activity.addStat(new DataEffortPaceMin(minEffortPace));
        activity.addStat(new DataEffortPaceMax(maxEffortPace));
        return activity;
      };

      const activityA = createActivity(new Date('2026-01-01T10:00:00.000Z'), 300, 270, 340);
      const activityB = createActivity(new Date('2026-01-01T12:00:00.000Z'), 330, 290, 360);

      // @ts-ignore
      const eventA = new Event('Event A', activityA.startDate, activityA.endDate, 'fit', 0, 'a', true);
      // @ts-ignore
      const eventB = new Event('Event B', activityB.startDate, activityB.endDate, 'fit', 0, 'b', true);
      eventA.addActivities([activityA]);
      eventB.addActivities([activityB]);

      const merged = EventUtilities.mergeEvents([eventA, eventB]);

      expect(merged.getStat(DataEffortPaceAvg.type)?.getValue()).toBe(315);
      expect(merged.getStat(DataEffortPaceMin.type)?.getValue()).toBe(270);
      expect(merged.getStat(DataEffortPaceMax.type)?.getValue()).toBe(360);
    });
  });
});
