import { ActivityUtilities } from './activity.utilities';
import { ActivityInterface } from '../../activities/activity.interface';
import { DataVO2Max } from '../../data/data.vo2-max';

describe('ActivityUtilities', () => {
    describe('getSummaryStatsForActivities', () => {
        it('should calculate average VO2 Max from multiple activities', () => {
            // Mock Activities
            const activity1 = {
                getDuration: () => ({ getValue: () => 100 }),
                getPause: () => ({ getValue: () => 0 }),
                getDistance: () => ({ getValue: () => 1000 }),
                getStatsAsArray: () => [],
                getStat: (type: string) => {
                    if (type === DataVO2Max.type) return new DataVO2Max(50);
                    return null;
                }
            } as unknown as ActivityInterface;

            const activity2 = {
                getDuration: () => ({ getValue: () => 100 }),
                getPause: () => ({ getValue: () => 0 }),
                getDistance: () => ({ getValue: () => 1000 }),
                getStatsAsArray: () => [],
                getStat: (type: string) => {
                    if (type === DataVO2Max.type) return new DataVO2Max(60);
                    return null;
                }
            } as unknown as ActivityInterface;

            const activities = [activity1, activity2];

            const summaryStats = ActivityUtilities.getSummaryStatsForActivities(activities);

            const vo2MaxStat = summaryStats.find(stat => stat.getType() === DataVO2Max.type);
            expect(vo2MaxStat).toBeDefined();
            expect((vo2MaxStat as DataVO2Max).getValue()).toBe(55); // Average of 50 and 60
        });

        it('should handle activities without VO2 Max', () => {
            // Mock Activities
            const activity1 = {
                getDuration: () => ({ getValue: () => 100 }),
                getPause: () => ({ getValue: () => 0 }),
                getDistance: () => ({ getValue: () => 1000 }),
                getStatsAsArray: () => [],
                getStat: (type: string) => {
                    if (type === DataVO2Max.type) return new DataVO2Max(50);
                    return null;
                }
            } as unknown as ActivityInterface;

            const activity2 = {
                getDuration: () => ({ getValue: () => 100 }),
                getPause: () => ({ getValue: () => 0 }),
                getDistance: () => ({ getValue: () => 1000 }),
                getStatsAsArray: () => [],
                getStat: (type: string) => null // No VO2 Max
            } as unknown as ActivityInterface;

            const activities = [activity1, activity2];

            const summaryStats = ActivityUtilities.getSummaryStatsForActivities(activities);

            const vo2MaxStat = summaryStats.find(stat => stat.getType() === DataVO2Max.type);
            expect(vo2MaxStat).toBeDefined();
            // Logic is: avg = avg ? (avg + val) / 2 : val
            // First iteration: avg = 50
            // Second iteration: skipped
            // Result: 50
            expect((vo2MaxStat as DataVO2Max).getValue()).toBe(50);
        });

        it('should not include VO2 Max if no activity has it', () => {
            const activity1 = {
                getDuration: () => ({ getValue: () => 100 }),
                getPause: () => ({ getValue: () => 0 }),
                getDistance: () => ({ getValue: () => 1000 }),
                getStatsAsArray: () => [],
                getStat: (type: string) => null
            } as unknown as ActivityInterface;
            const activities = [activity1];
            const summaryStats = ActivityUtilities.getSummaryStatsForActivities(activities);
            const vo2MaxStat = summaryStats.find(stat => stat.getType() === DataVO2Max.type);
            expect(vo2MaxStat).toBeUndefined();
        });
    });
});
