
import { EventImporterFIT } from './importer.fit';
import { Activity } from '../../../../activities/activity';
import { ActivityTypes } from '../../../../activities/activity.types';
import { Creator } from '../../../../creators/creator';
import { DataAvgRespirationRate } from '../../../../data/data.avg-respiration-rate';
import { DataMaxRespirationRate } from '../../../../data/data.max-respiration-rate';
import { DataMinRespirationRate } from '../../../../data/data.min-respiration-rate';

describe('EventImporterFIT Zero Handling', () => {
    let mockActivity: Activity;

    beforeEach(() => {
        mockActivity = new Activity(new Date(), new Date(), ActivityTypes.Running, new Creator('Initial'));
    });

    describe('getStatsFromObject', () => {
        it('should correctly handle 0 values for respiration rates', () => {
            const fitObject = {
                enhanced_avg_respiration_rate: 0,
                enhanced_max_respiration_rate: 0,
                enhanced_min_respiration_rate: 0,
            };

            const stats = EventImporterFIT.getStatsFromObject(fitObject, mockActivity, false);

            const avgResp = stats.find(s => s.getType() === DataAvgRespirationRate.type);
            const maxResp = stats.find(s => s.getType() === DataMaxRespirationRate.type);
            const minResp = stats.find(s => s.getType() === DataMinRespirationRate.type);

            expect(avgResp).toBeDefined();
            expect(avgResp?.getValue()).toBe(0);

            expect(maxResp).toBeDefined();
            expect(maxResp?.getValue()).toBe(0);

            expect(minResp).toBeDefined();
            expect(minResp?.getValue()).toBe(0);
        });

        it('should correctly handle 0 values for respiration rates (fallback fields)', () => {
            // mixed case where enhanced is undefined but standard is 0
            const fitObject = {
                avg_respiration_rate: 0,
                max_respiration_rate: 0,
                min_respiration_rate: 0,
            };

            const stats = EventImporterFIT.getStatsFromObject(fitObject, mockActivity, false);

            const avgResp = stats.find(s => s.getType() === DataAvgRespirationRate.type);
            const maxResp = stats.find(s => s.getType() === DataMaxRespirationRate.type);
            const minResp = stats.find(s => s.getType() === DataMinRespirationRate.type);

            expect(avgResp).toBeDefined();
            expect(avgResp?.getValue()).toBe(0);

            expect(maxResp).toBeDefined();
            expect(maxResp?.getValue()).toBe(0);

            expect(minResp).toBeDefined();
            expect(minResp?.getValue()).toBe(0);
        });
    });
});
