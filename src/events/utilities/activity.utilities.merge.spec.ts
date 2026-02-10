import { ActivityUtilities } from './activity.utilities';
import { ActivityInterface } from '../../activities/activity.interface';
import { DataVO2Max } from '../../data/data.vo2-max';
import { DataMovingTime } from '../../data/data.moving-time';
import { DataTotalGrit } from '../../data/data.total-grit';
import { DataHeartRateMax } from '../../data/data.heart-rate-max';
import { DataHeartRateMin } from '../../data/data.heart-rate-min';
import { DataRPE } from '../../data/data.rpe';

import { DataPowerMax } from '../../data/data.power-max';
import { DataPowerMin } from '../../data/data.power-min';
import { DataSpeedMax } from '../../data/data.speed-max';
import { DataSpeedMin } from '../../data/data.speed-min';
import { DataCadenceMax } from '../../data/data.cadence-max';
import { DataCadenceMin } from '../../data/data.cadence-min';
import { DataAltitudeMax } from '../../data/data.altitude-max';
import { DataAltitudeMin } from '../../data/data.altitude-min';
import { DataTemperatureMax } from '../../data/data.temperature-max';
import { DataJumpCount } from '../../data/data.jump-count';
import { DataTotalFlow } from '../../data/data.total-flow';
import { DataGroundContactTimeAvg } from '../../data/data.ground-contact-time-avg';
import { DataVerticalOscillationAvg } from '../../data/data.vertical-oscillation-avg';

describe('ActivityUtilities', () => {
  describe('getSummaryStatsForActivities', () => {
    // Helper to create a mock activity
    const createMockActivity = (stats: any): ActivityInterface => {
      return {
        getDuration: () => ({ getValue: () => 100 }),
        getPause: () => ({ getValue: () => 0 }),
        getDistance: () => ({ getValue: () => 1000 }),
        getStatsAsArray: () => [],
        getStat: (type: string) => {
          if (stats[type]) return stats[type];
          return null;
        }
      } as unknown as ActivityInterface;
    };

    describe('Sum Aggregations', () => {
      it('should sum Moving Time', () => {
        const a1 = createMockActivity({ [DataMovingTime.type]: new DataMovingTime(100) });
        const a2 = createMockActivity({ [DataMovingTime.type]: new DataMovingTime(200) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataMovingTime.type) as DataMovingTime).getValue()).toBe(300);
      });

      it('should sum Total Grit', () => {
        const a1 = createMockActivity({ [DataTotalGrit.type]: new DataTotalGrit(50) });
        const a2 = createMockActivity({ [DataTotalGrit.type]: new DataTotalGrit(60) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataTotalGrit.type) as DataTotalGrit).getValue()).toBe(110);
      });

      it('should sum Total Flow', () => {
        const a1 = createMockActivity({ [DataTotalFlow.type]: new DataTotalFlow(10) });
        const a2 = createMockActivity({ [DataTotalFlow.type]: new DataTotalFlow(20) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataTotalFlow.type) as DataTotalFlow).getValue()).toBe(30);
      });

      it('should sum Jump Count', () => {
        const a1 = createMockActivity({ [DataJumpCount.type]: new DataJumpCount(5) });
        const a2 = createMockActivity({ [DataJumpCount.type]: new DataJumpCount(3) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataJumpCount.type) as DataJumpCount).getValue()).toBe(8);
      });

      it('should handle missing values in sum', () => {
        const a1 = createMockActivity({ [DataMovingTime.type]: new DataMovingTime(100) });
        const a2 = createMockActivity({}); // Missing
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataMovingTime.type) as DataMovingTime).getValue()).toBe(100);
      });
    });

    describe('Max Aggregations', () => {
      it('should find Max Heart Rate', () => {
        const a1 = createMockActivity({ [DataHeartRateMax.type]: new DataHeartRateMax(180) });
        const a2 = createMockActivity({ [DataHeartRateMax.type]: new DataHeartRateMax(190) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataHeartRateMax.type) as DataHeartRateMax).getValue()).toBe(190);
      });

      it('should find Max Power', () => {
        const a1 = createMockActivity({ [DataPowerMax.type]: new DataPowerMax(300) });
        const a2 = createMockActivity({ [DataPowerMax.type]: new DataPowerMax(400) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataPowerMax.type) as DataPowerMax).getValue()).toBe(400);
      });

      it('should find Max Speed', () => {
        const a1 = createMockActivity({ [DataSpeedMax.type]: new DataSpeedMax(30) });
        const a2 = createMockActivity({ [DataSpeedMax.type]: new DataSpeedMax(40) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataSpeedMax.type) as DataSpeedMax).getValue()).toBe(40);
      });

      it('should find Max Cadence', () => {
        const a1 = createMockActivity({ [DataCadenceMax.type]: new DataCadenceMax(90) });
        const a2 = createMockActivity({ [DataCadenceMax.type]: new DataCadenceMax(100) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataCadenceMax.type) as DataCadenceMax).getValue()).toBe(100);
      });

      it('should find Max Altitude', () => {
        const a1 = createMockActivity({ [DataAltitudeMax.type]: new DataAltitudeMax(1000) });
        const a2 = createMockActivity({ [DataAltitudeMax.type]: new DataAltitudeMax(1500) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataAltitudeMax.type) as DataAltitudeMax).getValue()).toBe(1500);
      });

      it('should find Max Temperature', () => {
        const a1 = createMockActivity({ [DataTemperatureMax.type]: new DataTemperatureMax(25) });
        const a2 = createMockActivity({ [DataTemperatureMax.type]: new DataTemperatureMax(30) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataTemperatureMax.type) as DataTemperatureMax).getValue()).toBe(30);
      });

      it('should handle missing values in max', () => {
        const a1 = createMockActivity({ [DataHeartRateMax.type]: new DataHeartRateMax(180) });
        const a2 = createMockActivity({});
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataHeartRateMax.type) as DataHeartRateMax).getValue()).toBe(180);
      });

      it('should handle missing values in max VO2', () => {
        const a1 = createMockActivity({ [DataVO2Max.type]: new DataVO2Max(50) });
        const a2 = createMockActivity({});
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataVO2Max.type) as DataVO2Max).getValue()).toBe(50);
      });
      it('should find Max VO2 Max', () => {
        const a1 = createMockActivity({ [DataVO2Max.type]: new DataVO2Max(50) });
        const a2 = createMockActivity({ [DataVO2Max.type]: new DataVO2Max(60) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataVO2Max.type) as DataVO2Max).getValue()).toBe(60);
      });
    });

    describe('Min Aggregations', () => {
      it('should find Min Heart Rate', () => {
        const a1 = createMockActivity({ [DataHeartRateMin.type]: new DataHeartRateMin(50) });
        const a2 = createMockActivity({ [DataHeartRateMin.type]: new DataHeartRateMin(45) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataHeartRateMin.type) as DataHeartRateMin).getValue()).toBe(45);
      });

      it('should find Min Power', () => {
        const a1 = createMockActivity({ [DataPowerMin.type]: new DataPowerMin(100) });
        const a2 = createMockActivity({ [DataPowerMin.type]: new DataPowerMin(0) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataPowerMin.type) as DataPowerMin).getValue()).toBe(0);
      });

      it('should find Min Speed', () => {
        const a1 = createMockActivity({ [DataSpeedMin.type]: new DataSpeedMin(10) });
        const a2 = createMockActivity({ [DataSpeedMin.type]: new DataSpeedMin(5) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataSpeedMin.type) as DataSpeedMin).getValue()).toBe(5);
      });

      it('should find Min Cadence', () => {
        const a1 = createMockActivity({ [DataCadenceMin.type]: new DataCadenceMin(60) });
        const a2 = createMockActivity({ [DataCadenceMin.type]: new DataCadenceMin(50) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataCadenceMin.type) as DataCadenceMin).getValue()).toBe(50);
      });

      it('should find Min Altitude', () => {
        const a1 = createMockActivity({ [DataAltitudeMin.type]: new DataAltitudeMin(100) });
        const a2 = createMockActivity({ [DataAltitudeMin.type]: new DataAltitudeMin(-10) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataAltitudeMin.type) as DataAltitudeMin).getValue()).toBe(-10);
      });

      it('should handle missing values in min', () => {
        const a1 = createMockActivity({ [DataHeartRateMin.type]: new DataHeartRateMin(50) });
        const a2 = createMockActivity({});
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataHeartRateMin.type) as DataHeartRateMin).getValue()).toBe(50);
      });
    });

    describe('Average Aggregations', () => {
      it('should average Ground Contact Time', () => {
        const a1 = createMockActivity({ [DataGroundContactTimeAvg.type]: new DataGroundContactTimeAvg(250) });
        const a2 = createMockActivity({ [DataGroundContactTimeAvg.type]: new DataGroundContactTimeAvg(300) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect(
          (stats.find(s => s.getType() === DataGroundContactTimeAvg.type) as DataGroundContactTimeAvg).getValue()
        ).toBe(275);
      });

      it('should average Vertical Oscillation', () => {
        const a1 = createMockActivity({ [DataVerticalOscillationAvg.type]: new DataVerticalOscillationAvg(10) });
        const a2 = createMockActivity({ [DataVerticalOscillationAvg.type]: new DataVerticalOscillationAvg(12) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect(
          (stats.find(s => s.getType() === DataVerticalOscillationAvg.type) as DataVerticalOscillationAvg).getValue()
        ).toBe(11);
      });

      it('should correctly aggregate RPE (Subjective)', () => {
        const a1 = createMockActivity({ [DataRPE.type]: new DataRPE(5) });
        const a2 = createMockActivity({ [DataRPE.type]: new DataRPE(7) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        // (5 + 7) / 2 = 6, ceil(6) = 6
        expect((stats.find(s => s.getType() === DataRPE.type) as DataRPE).getValue()).toBe(6);
      });

      it('should handle missing values in average', () => {});
    });
  });
});
