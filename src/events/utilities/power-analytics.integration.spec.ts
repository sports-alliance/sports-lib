import { ActivityUtilities } from './activity.utilities';
import { Activity } from '../../activities/activity';
import { DataPower } from '../../data/data.power';
import { DataPowerCurve } from '../../data/data.power-curve';
import { DataCriticalPower } from '../../data/data.critical-power';
import { DataWPrime } from '../../data/data.w-prime';
import { DataFTP } from '../../data/data.ftp';
import { ActivityTypes } from '../../activities/activity.types';
import { Event } from '../event';
import { EventUtilities } from './event.utilities';
import { FileType } from '../adapters/file-type.enum';

describe('Power Analytics Integration', () => {
  it("should automatically generate Power Curve, FTP, Critical Power and W' when generating stats", () => {
    // Create an activity with ~20 mins of power data
    // 360W for 3 mins (180s)
    // 260W for remaining 17 mins (1020s)
    // Total 1200s
    // CP should be around ~245-250W

    const powerValues = new Array(1200).fill(260);
    for (let i = 0; i < 180; i++) {
      powerValues[i] = 360;
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + powerValues.length * 1000);

    // @ts-ignore
    const activity = new Activity(startDate, endDate, ActivityTypes.Cycling, { toJSON: () => ({}) } as any);
    const powerStream = activity.createStream(DataPower.type);
    powerStream.setData(powerValues);
    activity.addStream(powerStream);

    // Verify stats are missing initially
    expect(activity.getStat(DataPowerCurve.type)).toBeFalsy();
    expect(activity.getStat(DataCriticalPower.type)).toBeFalsy();
    expect(activity.getStat(DataWPrime.type)).toBeFalsy();

    // Run the pipeline
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    // Verify Power Curve
    const curveStat = activity.getStat(DataPowerCurve.type);
    expect(curveStat).not.toBeNull();
    // @ts-ignore
    const points = curveStat.getValue() as any[];
    expect(points.length).toBeGreaterThan(0);

    // Verify CP & W'
    const ftpStat = activity.getStat(DataFTP.type);
    const cpStat = activity.getStat(DataCriticalPower.type);
    const wPrimeStat = activity.getStat(DataWPrime.type);

    expect(ftpStat).not.toBeNull();
    expect(cpStat).not.toBeNull();
    expect(wPrimeStat).not.toBeNull();

    if (ftpStat && cpStat && wPrimeStat) {
      console.log(`Calculated FTP: ${ftpStat.getValue()}, CP: ${cpStat.getValue()}, W': ${wPrimeStat.getValue()}`);
      expect(ftpStat.getValue()).toBe(261);
      expect(cpStat.getValue()).toBeGreaterThan(200);
      expect(wPrimeStat.getValue()).toBeGreaterThan(10000);
    }
  });

  it("should serialize Power Curve, FTP, Critical Power and W' correctly in toJSON", () => {
    const powerValues = new Array(1200).fill(260); // 1200 points
    for (let i = 0; i < 180; i++) {
      powerValues[i] = 360;
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + powerValues.length * 1000);
    // @ts-ignore
    const activity = new Activity(startDate, endDate, ActivityTypes.Cycling, { toJSON: () => ({}) } as any);
    const powerStream = activity.createStream(DataPower.type);
    powerStream.setData(powerValues);
    activity.addStream(powerStream);

    // Generate stats
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    const json = activity.toJSON();

    // Check PowerCurve property serialization
    expect(json.powerCurve).toBeDefined();
    // @ts-ignore
    expect(json.powerCurve![DataPowerCurve.type]).toBeDefined();
    // @ts-ignore
    expect(Array.isArray(json.powerCurve![DataPowerCurve.type])).toBeTruthy();

    // Check structure of first point
    // @ts-ignore
    const firstPoint = json.powerCurve![DataPowerCurve.type][0];
    expect(firstPoint.duration).toBeDefined();
    expect(firstPoint.power).toBeDefined();

    // Check CP and W' in stats
    expect(json.stats).toBeDefined();
    expect(json.stats![DataFTP.type]).toBeDefined();
    expect(json.stats![DataCriticalPower.type]).toBeDefined();
    expect(json.stats![DataWPrime.type]).toBeDefined();

    expect(typeof json.stats![DataFTP.type]).toBe('number');
    expect(json.stats![DataFTP.type]).toBe(261);

    expect(typeof json.stats![DataCriticalPower.type]).toBe('number');
    expect(json.stats![DataCriticalPower.type]).toBeGreaterThan(200);

    expect(typeof json.stats![DataWPrime.type]).toBe('number');
    expect(json.stats![DataWPrime.type]).toBeGreaterThan(0);
  });

  it("should aggregate Power Curve and calculate CP/W' correctly for Events", () => {
    // Activity 1: Constant 360W for 180s, then 260W for 420s (Total 600s)
    const p1 = new Array(600).fill(260);
    for (let i = 0; i < 180; i++) p1[i] = 360;

    const start1 = new Date();
    const end1 = new Date(start1.getTime() + 600000);
    // @ts-ignore
    const a1 = new Activity(start1, end1, ActivityTypes.Cycling, { toJSON: () => ({}) } as any);
    const s1 = a1.createStream(DataPower.type);
    s1.setData(p1);
    a1.addStream(s1);

    // Activity 2: Constant 250W for 10 mins (will be ignored by max power mostly)
    const p2 = new Array(600).fill(250);
    const start2 = new Date(end1.getTime() + 1000);
    const end2 = new Date(start2.getTime() + 600000);
    // @ts-ignore
    const a2 = new Activity(start2, end2, ActivityTypes.Cycling, { toJSON: () => ({}) } as any);
    const s2 = a2.createStream(DataPower.type);
    s2.setData(p2);
    a2.addStream(s2);

    const event = new Event('Test Event', start1, end2, FileType.FIT);
    event.addActivity(a1);
    event.addActivity(a2);

    // Process event
    EventUtilities.generateStatsForAll(event);

    // Check Event level stats
    expect(event.getStat(DataPowerCurve.type)).toBeDefined();
    expect(event.getStat(DataCriticalPower.type)).toBeDefined();
    expect(event.getStat(DataWPrime.type)).toBeDefined();

    const json = event.toJSON();
    expect(json.powerCurve).toBeDefined();
    expect(json.stats[DataCriticalPower.type]).toBeDefined();
    expect(json.stats[DataWPrime.type]).toBeDefined();

    console.log(`Event Aggregated CP: ${json.stats[DataCriticalPower.type]}, W': ${json.stats[DataWPrime.type]}`);
  });

  it('should not throw and handle activities with no power data', () => {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 60000); // 1 min
    // @ts-ignore
    const activity = new Activity(startDate, endDate, ActivityTypes.Cycling, { toJSON: () => ({}) } as any);

    expect(() => {
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    }).not.toThrow();

    expect(activity.getStat(DataPowerCurve.type)).toBeFalsy();
    expect(activity.getStat(DataFTP.type)).toBeFalsy();
    expect(activity.getStat(DataCriticalPower.type)).toBeFalsy();
    expect(activity.getStat(DataWPrime.type)).toBeFalsy();
  });

  it("should not calculate FTP/CP/W' if activity is too short", () => {
    const powerValues = new Array(120).fill(300); // 2 mins
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 120000);
    // @ts-ignore
    const activity = new Activity(startDate, endDate, ActivityTypes.Cycling, { toJSON: () => ({}) } as any);
    const powerStream = activity.createStream(DataPower.type);
    powerStream.setData(powerValues);
    activity.addStream(powerStream);

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    // Power Curve should still be generated (MMP for 1s, 2s etc)
    expect(activity.getStat(DataPowerCurve.type)).toBeDefined();
    // FTP should NOT be generated because 20-min duration point is missing
    expect(activity.getStat(DataFTP.type)).toBeFalsy();
    // CP/W' should NOT be generated because min duration for CP is 180s
    expect(activity.getStat(DataCriticalPower.type)).toBeFalsy();
    expect(activity.getStat(DataWPrime.type)).toBeFalsy();
  });

  it('should handle activities with all null power values', () => {
    const powerValues = new Array(600).fill(null);
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 600000);
    // @ts-ignore
    const activity = new Activity(startDate, endDate, ActivityTypes.Cycling, { toJSON: () => ({}) } as any);
    const powerStream = activity.createStream(DataPower.type);
    powerStream.setData(powerValues);
    activity.addStream(powerStream);

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    // MMP will be all zeros, CP/W' calculation will likely result in null or 0 slope/intercept
    expect(activity.getStat(DataFTP.type)).toBeFalsy();
    expect(activity.getStat(DataCriticalPower.type)).toBeFalsy();
    expect(activity.getStat(DataWPrime.type)).toBeFalsy();
  });

  it('should calculate FTP from existing power curve when power stream is missing', () => {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 1200000);
    // @ts-ignore
    const activity = new Activity(startDate, endDate, ActivityTypes.Cycling, { toJSON: () => ({}) } as any);

    activity.addStat(new DataPowerCurve([{ duration: 1200, power: 300 }] as any) as any);

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    const ftpStat = activity.getStat(DataFTP.type);
    expect(ftpStat).toBeDefined();
    expect(ftpStat!.getValue()).toBe(285);
  });
});
