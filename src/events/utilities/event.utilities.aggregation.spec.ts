
import { EventUtilities } from './event.utilities';
import { Event } from '../event';
import { Activity } from '../../activities/activity';
import { DataPower } from '../../data/data.power';
import { DataPowerCurve } from '../../data/data.power-curve';
import { DataDuration } from '../../data/data.duration';
// @ts-ignore
import { ActivityTypes } from '../../activities/activity.types';
import { ActivityUtilities } from './activity.utilities';
import { DataPowerWattsPerKg } from '../../data/data.power-watts-per-kg';

describe('EventUtilities Power Curve Aggregation', () => {

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
            act.getStat = jest.fn().mockImplementation((type) => {
                if (type === 'Weight') return { getValue: () => weight };
                if (type === 'PowerCurve') return curve; // Return the pre-calculated curve AFTER it's calculated
                return null;
            });
        }

        // Setup initial getStat for calculation if needed, but actually verify if calculateMeanMaxPower uses getStat. 
        // Yes, it uses act.getStat(DataWeight.type). So we must mock it BEFORE calculation.

        act.getStat = jest.fn().mockImplementation((type) => {
            if (type === 'Weight' && weight) return { getValue: () => weight };
            return null;
        });

        // Pre-calculate curve for activity
        // Note: this uses the mocked getStat above to find weight!
        const curve = ActivityUtilities.calculateMeanMaxPower(act, [10]);
        act.addStat(curve as any);

        // Re-mock getStat to include the curve we just calculated
        act.getStat = jest.fn().mockImplementation((type) => {
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

        const points = (eventCurveStat!.getValue() as any[]);
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
        const points = (event.getStat(DataPowerCurve.type)!.getValue() as any[]);
        const point10s = points.find(p => p.duration.getValue() === 10);

        expect(point10s.wattsPerKg).toBeDefined();
        expect(point10s.wattsPerKg.getValue()).toBe(4.0); // Should take the higher W/kg
    });
});
