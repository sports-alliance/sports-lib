// import { describe, it, expect, beforeEach } from 'vitest';
import { ActivityUtilities } from './activity.utilities';
import { Activity } from '../../activities/activity';
import { DataPower } from '../../data/data.power';
import { DataPowerCurve, DataPowerCurvePoint } from '../../data/data.power-curve';
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

    it('should use default "Best-in-Class" granularity when no durations are provided', () => {
        // Create a mock activity with enough data for all default durations (max 18000s)
        const longActivity = {
            hasStreamData: jest.fn().mockReturnValue(true),
            getStreamData: jest.fn().mockReturnValue(new Array(20000).fill(200)), // 20000s of data
            getStat: jest.fn().mockReturnValue(null), // Mock getStat to return null (no weight)
            // Add other necessary properties if type checking involves them
        } as unknown as Activity;

        const powerCurve = ActivityUtilities.calculateMeanMaxPower(longActivity);
        const points = powerCurve.getValue();

        // Expect 45 default points as per the "Best-in-Class" set
        expect(points.length).toBe(45);

        // Check a few key durations
        const durations = points.map(p => p.duration.getValue());
        expect(durations).toContain(1);  // 1s
        expect(durations).toContain(10); // 10s
        expect(durations).toContain(60); // 1m
        expect(durations).toContain(300); // 5m
        expect(durations).toContain(1200); // 20m
        expect(durations).toContain(3600); // 1h
        expect(durations).toContain(18000); // 5h
    });

    it('should calculate W/kg if DataWeight is present', () => {
        // Mock activity with weight
        const weightValue = 75; // 75kg
        const powerValue = 300; // 300W
        const expectedWKg = 4;  // 300 / 75 = 4.0 W/kg

        const weightedActivity = {
            hasStreamData: jest.fn().mockReturnValue(true),
            getStreamData: jest.fn().mockReturnValue(new Array(100).fill(powerValue)),
            getStat: jest.fn().mockImplementation((type) => {
                if (type === 'Weight') {
                    // Start of Mock DataWeight
                    return { getValue: () => weightValue };
                }
                return null;
            })
            // Add other necessary properties
        } as unknown as Activity;

        const powerCurve = ActivityUtilities.calculateMeanMaxPower(weightedActivity, [10]);
        const points = powerCurve.getValue();

        expect(points).toHaveLength(1);
        expect(points[0].power.getValue()).toBe(powerValue);
        expect(points[0].wattsPerKg).toBeDefined();
        // @ts-ignore
        expect(points[0].wattsPerKg.getValue()).toBe(expectedWKg);
    });
    it('should calculate Critical Power and W\' correctly', () => {
        // CP = 250, W' = 20000
        // Power @ 180s = 250 + 20000/180 = 361.11
        // Power @ 1200s = 250 + 20000/1200 = 266.66

        const mockPoints: DataPowerCurvePoint[] = [
            { duration: new DataDuration(180), power: new DataPower(361) },
            { duration: new DataDuration(1200), power: new DataPower(267) },
        ];

        const mockActivity = {
            getStat: jest.fn().mockImplementation((type) => {
                if (type === 'PowerCurve') return { getValue: () => mockPoints };
                return null;
            }),
        } as unknown as Activity;

        const result = ActivityUtilities.calculateCriticalPowerAndWPrime(mockActivity);

        expect(result).not.toBeNull();
        if (result) {
            // Allow small margin of error due to integer inputs and rounding
            expect(result.cp.getValue()).toBeGreaterThanOrEqual(245);
            expect(result.cp.getValue()).toBeLessThanOrEqual(260);

            expect(result.wPrime.getValue()).toBeGreaterThanOrEqual(19000);
            expect(result.wPrime.getValue()).toBeLessThanOrEqual(21000);
        }
    });

});
