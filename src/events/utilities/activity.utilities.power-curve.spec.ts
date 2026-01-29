// import { describe, it, expect, beforeEach } from 'vitest';
import { ActivityUtilities } from './activity.utilities';
import { Activity } from '../../activities/activity';
import { DataPower } from '../../data/data.power';
import { DataPowerCurve } from '../../data/data.power-curve';
import { DataDuration } from '../../data/data.duration';
// @ts-ignore
import { ActivityTypes } from '../../activities/activity.types';
// @ts-ignore
import { Creator } from '../../creators/creator';

describe('ActivityUtilities Power Curve', () => {
    let activity: Activity;

    // Mock Activity creation
    const createActivity = (powerValues: number[]): Activity => {
        // Create a mock activity spanning enough time
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + powerValues.length * 1000);
        const mockCreator = { toJSON: () => ({}) } as any;

        const act = new Activity(startDate, endDate, ActivityTypes.Cycling, mockCreator);

        // Add power stream
        const powerStream = act.createStream(DataPower.type);
        powerStream.setData(powerValues);
        act.addStream(powerStream);

        return act;
    };

    it('should return empty curve if no power stream exists', () => {
        const act = new Activity(new Date(), new Date(), ActivityTypes.Cycling, {} as any);
        const curve = ActivityUtilities.calculateMeanMaxPower(act, [1, 5, 10]);
        expect(curve.getValue()).toHaveLength(0);
    });

    it('should calculate correct max average power for specific durations', () => {
        // [100, 100, 200, 200, 200, 100, 100]
        // 3s max avg should be (200+200+200)/3 = 200
        // 5s max avg should be (100+200+200+200+100)/5 = 160
        const powerValues = [100, 100, 200, 200, 200, 100, 100];
        activity = createActivity(powerValues);

        const curve = ActivityUtilities.calculateMeanMaxPower(activity, [3, 5]);
        const values = curve.getValue();

        expect(values).toHaveLength(2);

        // Check 3s
        const p3s = values.find(v => v.duration.getValue() === 3);
        expect(p3s).toBeDefined();
        expect(p3s?.power.getValue()).toBe(200);

        // Check 5s
        const p5s = values.find(v => v.duration.getValue() === 5);
        expect(p5s).toBeDefined();
        expect(p5s?.power.getValue()).toBe(160);
    });

    it('should handle durations longer than activity', () => {
        const powerValues = [100, 200, 300];
        activity = createActivity(powerValues);

        const curve = ActivityUtilities.calculateMeanMaxPower(activity, [1, 10]);
        const values = curve.getValue();

        expect(values).toHaveLength(1);
        expect(values[0].duration.getValue()).toBe(1);
        expect(values[0].power.getValue()).toBe(300);
    });

    it('should handle gaps (nulls) in power stream conservatively', () => {
        // Current implementation treats nulls as whatever arithmetic logic does (likely 0 or NaN depending on impl, let's verify)
        // TypeScript usually enforces number or null. Our impl uses `currentSum += powerData[i]`. 
        // If powerData[i] is null, in JS `number + null = number`. 
        // So nulls are effectively 0.
        const powerValues = [100, null, 100] as any[];
        // If null treated as 0: 100, 0, 100.
        // 3s avg = (100+0+100)/3 = 66.66
        activity = createActivity(powerValues);

        const curve = ActivityUtilities.calculateMeanMaxPower(activity, [3]);
        const values = curve.getValue();

        expect(values).toHaveLength(1);
        expect(Math.round(values[0].power.getValue())).toBe(67);
    });

    it('should correctly serialize toJSON', () => {
        const powerValues = [300, 300, 300];
        activity = createActivity(powerValues);
        const curve = ActivityUtilities.calculateMeanMaxPower(activity, [1]);

        const json = curve.toJSON();
        // Expected: { PowerCurve: [ { duration: { Duration: 1 }, power: { Power: 300 } } ] }
        expect(json).toHaveProperty('PowerCurve');
        const points = json['PowerCurve'] as any[];
        expect(points).toHaveLength(1);
        expect(points[0]).toHaveProperty('duration');
        expect(points[0]).toHaveProperty('power');

        // Check that they are instances of Data classes
        // toJSON returns the raw Value structure. DataPowerCurve's value is DataPowerCurvePoint[], 
        // which contains DataDuration and DataPower instances.
        expect(points[0].duration).toBeInstanceOf(DataDuration);
        expect(points[0].power).toBeInstanceOf(DataPower);
        expect(points[0].duration.getValue()).toBe(1);
        expect(points[0].power.getValue()).toBe(300);
    });
});
