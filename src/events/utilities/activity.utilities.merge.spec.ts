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
import { DataAltitudeAvg } from '../../data/data.altitude-avg';
import { DataTemperatureMax } from '../../data/data.temperature-max';
import { DataTemperatureMin } from '../../data/data.temperature-min';
import { DataJumpCount } from '../../data/data.jump-count';
import { DataJumpEvent } from '../../data/data.jump-event';
import {
  DataJumpDistanceAvg,
  DataJumpDistanceMax,
  DataJumpDistanceMin,
  DataJumpHangTimeAvg,
  DataJumpHangTimeMax,
  DataJumpHangTimeMin,
  DataJumpHeightAvg,
  DataJumpHeightMax,
  DataJumpHeightMin,
  DataJumpRotationsAvg,
  DataJumpRotationsMax,
  DataJumpRotationsMin,
  DataJumpScoreAvg,
  DataJumpScoreMax,
  DataJumpScoreMin,
  DataJumpSpeedAvg,
  DataJumpSpeedMax,
  DataJumpSpeedMin
} from '../../data/data.jump-stats';
import { DataTotalFlow } from '../../data/data.total-flow';
import { DataAirPowerAvg } from '../../data/data.air-power-avg';
import { DataAirPowerMax } from '../../data/data.air-power-max';
import { DataAirPowerMin } from '../../data/data.air-power-min';
import { DataVerticalSpeedAvg } from '../../data/data.vertical-speed-avg';
import { DataVerticalSpeedMax } from '../../data/data.vertical-speed-max';
import { DataVerticalSpeedMin } from '../../data/data.vertical-speed-min';
import { DataGroundContactTimeAvg } from '../../data/data.ground-contact-time-avg';
import { DataGroundContactTimeMax } from '../../data/data.ground-contact-time-max';
import { DataGroundContactTimeMin } from '../../data/data.ground-contact-time-min';
import { DataVerticalOscillationAvg } from '../../data/data.vertical-oscillation-avg';
import { DataVerticalOscillationMax } from '../../data/data.vertical-oscillation-max';
import { DataVerticalOscillationMin } from '../../data/data.vertical-oscillation-min';
import { DataPaceMax } from '../../data/data.pace-max';
import { DataPaceMin } from '../../data/data.pace-min';
import { DataGradeAdjustedPaceMax } from '../../data/data.grade-adjusted-pace-max';
import { DataGradeAdjustedPaceMin } from '../../data/data.grade-adjusted-pace-min';
import { DataSwimPaceMax } from '../../data/data.swim-pace-max';
import { DataSwimPaceMin } from '../../data/data.swim-pace-min';
import { DataGradeAdjustedSpeedMax } from '../../data/data.grade-adjusted-speed-max';
import { DataGradeAdjustedSpeedMin } from '../../data/data.grade-adjusted-speed-min';
import { DataLegStiffnessAvg } from '../../data/data.leg-stiffness-avg';
import { DataLegStiffnessMax } from '../../data/data.leg-stiffness-max';
import { DataLegStiffnessMin } from '../../data/data.leg-stiffness-min';
import { DataVerticalRatioAvg } from '../../data/data.vertical-ratio-avg';
import { DataVerticalRatioMax } from '../../data/data.vertical-ratio-max';
import { DataVerticalRatioMin } from '../../data/data.vertical-ratio-min';
import { DataEVPEAvg } from '../../data/data.evpe-avg';
import { DataEVPEMax } from '../../data/data.evpe-max';
import { DataEVPEMin } from '../../data/data.evpe-min';
import { DataEHPEAvg } from '../../data/data.ehpe-avg';
import { DataEHPEMax } from '../../data/data.ehpe-max';
import { DataEHPEMin } from '../../data/data.ehpe-min';
import { DataSatellite5BestSNRAvg } from '../../data/data.satellite-5-best-snr-avg';
import { DataSatellite5BestSNRMax } from '../../data/data.satellite-5-best-snr-max';
import { DataSatellite5BestSNRMin } from '../../data/data.satellite-5-best-snr-min';
import { DataNumberOfSatellitesAvg } from '../../data/data.number-of-satellites-avg';
import { DataNumberOfSatellitesMax } from '../../data/data.number-of-satellites-max';
import { DataNumberOfSatellitesMin } from '../../data/data.number-of-satellites-min';

describe('ActivityUtilities', () => {
  describe('getSummaryStatsForActivities', () => {
    // Helper to create a mock activity
    const createMockActivity = (stats: any, events: DataJumpEvent[] = []): ActivityInterface => {
      return {
        getDuration: () => ({ getValue: () => 100 }),
        getPause: () => ({ getValue: () => 0 }),
        getDistance: () => ({ getValue: () => 1000 }),
        getAllEvents: () => events,
        getStatsAsArray: () => [],
        getStat: (type: string) => {
          if (stats[type]) return stats[type];
          return null;
        }
      } as unknown as ActivityInterface;
    };

    const createJumpEvent = (
      timestamp: number,
      values: {
        distance?: number;
        height?: number;
        score?: number;
        hang_time?: number;
        speed?: number;
        rotations?: number;
      }
    ): DataJumpEvent => {
      return new DataJumpEvent(timestamp, {
        distance: values.distance ?? 0,
        height: values.height,
        score: values.score ?? 0,
        hang_time: values.hang_time,
        speed: values.speed,
        rotations: values.rotations
      });
    };

    const getSummaryValue = (stats: any[], type: string): number => {
      return (stats.find(s => s.getType() === type) as any).getValue();
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

    describe('Jump Aggregations', () => {
      it('recomputes jump min/max/avg from raw jump events for all families', () => {
        const a1 = createMockActivity(
          {
            [DataJumpCount.type]: new DataJumpCount(10),
            [DataJumpDistanceAvg.type]: new DataJumpDistanceAvg(999)
          },
          [
            createJumpEvent(1, { distance: 2, hang_time: 0.4, speed: 6, rotations: 1, score: 50, height: 0.8 }),
            createJumpEvent(2, { distance: 4, hang_time: 0.6, speed: 8, rotations: 0, score: 70, height: 1.2 })
          ]
        );
        const a2 = createMockActivity(
          {
            [DataJumpCount.type]: new DataJumpCount(1),
            [DataJumpDistanceAvg.type]: new DataJumpDistanceAvg(123)
          },
          [createJumpEvent(3, { distance: 3, hang_time: 0.5, speed: 7, rotations: 2, score: 80, height: 1 })]
        );

        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);

        expect(getSummaryValue(stats, DataJumpDistanceMin.type)).toBe(2);
        expect(getSummaryValue(stats, DataJumpDistanceMax.type)).toBe(4);
        expect(getSummaryValue(stats, DataJumpDistanceAvg.type)).toBeCloseTo(3, 10);

        expect(getSummaryValue(stats, DataJumpHangTimeMin.type)).toBeCloseTo(0.4, 10);
        expect(getSummaryValue(stats, DataJumpHangTimeMax.type)).toBeCloseTo(0.6, 10);
        expect(getSummaryValue(stats, DataJumpHangTimeAvg.type)).toBeCloseTo(0.5, 10);

        expect(getSummaryValue(stats, DataJumpSpeedMin.type)).toBe(6);
        expect(getSummaryValue(stats, DataJumpSpeedMax.type)).toBe(8);
        expect(getSummaryValue(stats, DataJumpSpeedAvg.type)).toBeCloseTo(7, 10);

        expect(getSummaryValue(stats, DataJumpRotationsMin.type)).toBe(0);
        expect(getSummaryValue(stats, DataJumpRotationsMax.type)).toBe(2);
        expect(getSummaryValue(stats, DataJumpRotationsAvg.type)).toBeCloseTo(1, 10);

        expect(getSummaryValue(stats, DataJumpScoreMin.type)).toBe(50);
        expect(getSummaryValue(stats, DataJumpScoreMax.type)).toBe(80);
        expect(getSummaryValue(stats, DataJumpScoreAvg.type)).toBeCloseTo(200 / 3, 10);

        expect(getSummaryValue(stats, DataJumpHeightMin.type)).toBeCloseTo(0.8, 10);
        expect(getSummaryValue(stats, DataJumpHeightMax.type)).toBeCloseTo(1.2, 10);
        expect(getSummaryValue(stats, DataJumpHeightAvg.type)).toBeCloseTo(1, 10);
      });

      it('falls back to activity jump stats and weights averages by jump count', () => {
        const a1 = createMockActivity({
          [DataJumpCount.type]: new DataJumpCount(2),
          [DataJumpDistanceMin.type]: new DataJumpDistanceMin(2),
          [DataJumpDistanceMax.type]: new DataJumpDistanceMax(4),
          [DataJumpDistanceAvg.type]: new DataJumpDistanceAvg(3),
          [DataJumpHangTimeMin.type]: new DataJumpHangTimeMin(0.3),
          [DataJumpHangTimeMax.type]: new DataJumpHangTimeMax(0.5),
          [DataJumpHangTimeAvg.type]: new DataJumpHangTimeAvg(0.4),
          [DataJumpSpeedMin.type]: new DataJumpSpeedMin(5),
          [DataJumpSpeedMax.type]: new DataJumpSpeedMax(9),
          [DataJumpSpeedAvg.type]: new DataJumpSpeedAvg(7),
          [DataJumpRotationsMin.type]: new DataJumpRotationsMin(0),
          [DataJumpRotationsMax.type]: new DataJumpRotationsMax(2),
          [DataJumpRotationsAvg.type]: new DataJumpRotationsAvg(1),
          [DataJumpScoreMin.type]: new DataJumpScoreMin(40),
          [DataJumpScoreMax.type]: new DataJumpScoreMax(80),
          [DataJumpScoreAvg.type]: new DataJumpScoreAvg(60),
          [DataJumpHeightMin.type]: new DataJumpHeightMin(0.8),
          [DataJumpHeightMax.type]: new DataJumpHeightMax(1.2),
          [DataJumpHeightAvg.type]: new DataJumpHeightAvg(1)
        });

        const a2 = createMockActivity({
          [DataJumpCount.type]: new DataJumpCount(1),
          [DataJumpDistanceMin.type]: new DataJumpDistanceMin(1),
          [DataJumpDistanceMax.type]: new DataJumpDistanceMax(1),
          [DataJumpDistanceAvg.type]: new DataJumpDistanceAvg(1),
          [DataJumpHangTimeMin.type]: new DataJumpHangTimeMin(0.6),
          [DataJumpHangTimeMax.type]: new DataJumpHangTimeMax(0.6),
          [DataJumpHangTimeAvg.type]: new DataJumpHangTimeAvg(0.6),
          [DataJumpSpeedMin.type]: new DataJumpSpeedMin(4),
          [DataJumpSpeedMax.type]: new DataJumpSpeedMax(4),
          [DataJumpSpeedAvg.type]: new DataJumpSpeedAvg(4),
          [DataJumpRotationsMin.type]: new DataJumpRotationsMin(3),
          [DataJumpRotationsMax.type]: new DataJumpRotationsMax(3),
          [DataJumpRotationsAvg.type]: new DataJumpRotationsAvg(3),
          [DataJumpScoreMin.type]: new DataJumpScoreMin(30),
          [DataJumpScoreMax.type]: new DataJumpScoreMax(30),
          [DataJumpScoreAvg.type]: new DataJumpScoreAvg(30),
          [DataJumpHeightMin.type]: new DataJumpHeightMin(0.5),
          [DataJumpHeightMax.type]: new DataJumpHeightMax(0.5),
          [DataJumpHeightAvg.type]: new DataJumpHeightAvg(0.5)
        });

        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);

        expect(getSummaryValue(stats, DataJumpDistanceMin.type)).toBe(1);
        expect(getSummaryValue(stats, DataJumpDistanceMax.type)).toBe(4);
        expect(getSummaryValue(stats, DataJumpDistanceAvg.type)).toBeCloseTo((3 * 2 + 1 * 1) / 3, 10);

        expect(getSummaryValue(stats, DataJumpHangTimeMin.type)).toBeCloseTo(0.3, 10);
        expect(getSummaryValue(stats, DataJumpHangTimeMax.type)).toBeCloseTo(0.6, 10);
        expect(getSummaryValue(stats, DataJumpHangTimeAvg.type)).toBeCloseTo((0.4 * 2 + 0.6 * 1) / 3, 10);

        expect(getSummaryValue(stats, DataJumpSpeedMin.type)).toBe(4);
        expect(getSummaryValue(stats, DataJumpSpeedMax.type)).toBe(9);
        expect(getSummaryValue(stats, DataJumpSpeedAvg.type)).toBeCloseTo((7 * 2 + 4 * 1) / 3, 10);

        expect(getSummaryValue(stats, DataJumpRotationsMin.type)).toBe(0);
        expect(getSummaryValue(stats, DataJumpRotationsMax.type)).toBe(3);
        expect(getSummaryValue(stats, DataJumpRotationsAvg.type)).toBeCloseTo((1 * 2 + 3 * 1) / 3, 10);

        expect(getSummaryValue(stats, DataJumpScoreMin.type)).toBe(30);
        expect(getSummaryValue(stats, DataJumpScoreMax.type)).toBe(80);
        expect(getSummaryValue(stats, DataJumpScoreAvg.type)).toBeCloseTo((60 * 2 + 30 * 1) / 3, 10);

        expect(getSummaryValue(stats, DataJumpHeightMin.type)).toBeCloseTo(0.5, 10);
        expect(getSummaryValue(stats, DataJumpHeightMax.type)).toBeCloseTo(1.2, 10);
        expect(getSummaryValue(stats, DataJumpHeightAvg.type)).toBeCloseTo((1 * 2 + 0.5 * 1) / 3, 10);
      });

      it('emits zero jump averages when effective sample count is greater than zero', () => {
        const a1 = createMockActivity({}, [createJumpEvent(1, { distance: 2, score: 40, rotations: 0, hang_time: 0 })]);
        const a2 = createMockActivity({}, [createJumpEvent(2, { distance: 3, score: 50, rotations: 0, hang_time: 0 })]);

        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);

        expect(getSummaryValue(stats, DataJumpRotationsAvg.type)).toBe(0);
        expect(getSummaryValue(stats, DataJumpHangTimeAvg.type)).toBe(0);
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

      it('should find Max Air Power', () => {
        const a1 = createMockActivity({ [DataAirPowerMax.type]: new DataAirPowerMax(120) });
        const a2 = createMockActivity({ [DataAirPowerMax.type]: new DataAirPowerMax(140) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataAirPowerMax.type) as DataAirPowerMax).getValue()).toBe(140);
      });

      it('should find Max Vertical Speed', () => {
        const a1 = createMockActivity({ [DataVerticalSpeedMax.type]: new DataVerticalSpeedMax(2.8) });
        const a2 = createMockActivity({ [DataVerticalSpeedMax.type]: new DataVerticalSpeedMax(3.1) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataVerticalSpeedMax.type) as DataVerticalSpeedMax).getValue()).toBe(
          3.1
        );
      });

      it('should find Max Ground Contact Time', () => {
        const a1 = createMockActivity({ [DataGroundContactTimeMax.type]: new DataGroundContactTimeMax(280) });
        const a2 = createMockActivity({ [DataGroundContactTimeMax.type]: new DataGroundContactTimeMax(320) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect(
          (stats.find(s => s.getType() === DataGroundContactTimeMax.type) as DataGroundContactTimeMax).getValue()
        ).toBe(320);
      });

      it('should find Max Vertical Oscillation', () => {
        const a1 = createMockActivity({ [DataVerticalOscillationMax.type]: new DataVerticalOscillationMax(8) });
        const a2 = createMockActivity({ [DataVerticalOscillationMax.type]: new DataVerticalOscillationMax(10) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect(
          (stats.find(s => s.getType() === DataVerticalOscillationMax.type) as DataVerticalOscillationMax).getValue()
        ).toBe(10);
      });

      it('should find Max Pace', () => {
        const a1 = createMockActivity({ [DataPaceMax.type]: new DataPaceMax(250) });
        const a2 = createMockActivity({ [DataPaceMax.type]: new DataPaceMax(260) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataPaceMax.type) as DataPaceMax).getValue()).toBe(260);
      });

      it('should find Max Grade Adjusted Pace', () => {
        const a1 = createMockActivity({ [DataGradeAdjustedPaceMax.type]: new DataGradeAdjustedPaceMax(240) });
        const a2 = createMockActivity({ [DataGradeAdjustedPaceMax.type]: new DataGradeAdjustedPaceMax(265) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect(
          (stats.find(s => s.getType() === DataGradeAdjustedPaceMax.type) as DataGradeAdjustedPaceMax).getValue()
        ).toBe(265);
      });

      it('should find Max Swim Pace', () => {
        const a1 = createMockActivity({ [DataSwimPaceMax.type]: new DataSwimPaceMax(130) });
        const a2 = createMockActivity({ [DataSwimPaceMax.type]: new DataSwimPaceMax(145) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataSwimPaceMax.type) as DataSwimPaceMax).getValue()).toBe(145);
      });

      it('should find Max Grade Adjusted Speed', () => {
        const a1 = createMockActivity({ [DataGradeAdjustedSpeedMax.type]: new DataGradeAdjustedSpeedMax(4.5) });
        const a2 = createMockActivity({ [DataGradeAdjustedSpeedMax.type]: new DataGradeAdjustedSpeedMax(5.1) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect(
          (stats.find(s => s.getType() === DataGradeAdjustedSpeedMax.type) as DataGradeAdjustedSpeedMax).getValue()
        ).toBe(5.1);
      });

      it('should find Max Leg Stiffness', () => {
        const a1 = createMockActivity({ [DataLegStiffnessMax.type]: new DataLegStiffnessMax(8.8) });
        const a2 = createMockActivity({ [DataLegStiffnessMax.type]: new DataLegStiffnessMax(9.2) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataLegStiffnessMax.type) as DataLegStiffnessMax).getValue()).toBe(9.2);
      });

      it('should find Max Vertical Ratio', () => {
        const a1 = createMockActivity({ [DataVerticalRatioMax.type]: new DataVerticalRatioMax(8.2) });
        const a2 = createMockActivity({ [DataVerticalRatioMax.type]: new DataVerticalRatioMax(9.1) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataVerticalRatioMax.type) as DataVerticalRatioMax).getValue()).toBe(9.1);
      });

      it('should find Max EVPE', () => {
        const a1 = createMockActivity({ [DataEVPEMax.type]: new DataEVPEMax(4.1) });
        const a2 = createMockActivity({ [DataEVPEMax.type]: new DataEVPEMax(5.4) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataEVPEMax.type) as DataEVPEMax).getValue()).toBe(5.4);
      });

      it('should find Max EHPE', () => {
        const a1 = createMockActivity({ [DataEHPEMax.type]: new DataEHPEMax(3.7) });
        const a2 = createMockActivity({ [DataEHPEMax.type]: new DataEHPEMax(4.2) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataEHPEMax.type) as DataEHPEMax).getValue()).toBe(4.2);
      });

      it('should find Max Satellite 5 Best SNR', () => {
        const a1 = createMockActivity({ [DataSatellite5BestSNRMax.type]: new DataSatellite5BestSNRMax(32.5) });
        const a2 = createMockActivity({ [DataSatellite5BestSNRMax.type]: new DataSatellite5BestSNRMax(34.2) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataSatellite5BestSNRMax.type) as DataSatellite5BestSNRMax).getValue()).toBe(
          34.2
        );
      });

      it('should find Max Number of Satellites', () => {
        const a1 = createMockActivity({ [DataNumberOfSatellitesMax.type]: new DataNumberOfSatellitesMax(9) });
        const a2 = createMockActivity({ [DataNumberOfSatellitesMax.type]: new DataNumberOfSatellitesMax(11) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataNumberOfSatellitesMax.type) as DataNumberOfSatellitesMax).getValue()).toBe(
          11
        );
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

      it('should find Min Temperature', () => {
        const a1 = createMockActivity({ [DataTemperatureMin.type]: new DataTemperatureMin(14) });
        const a2 = createMockActivity({ [DataTemperatureMin.type]: new DataTemperatureMin(10) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataTemperatureMin.type) as DataTemperatureMin).getValue()).toBe(10);
      });

      it('should find Min Air Power', () => {
        const a1 = createMockActivity({ [DataAirPowerMin.type]: new DataAirPowerMin(80) });
        const a2 = createMockActivity({ [DataAirPowerMin.type]: new DataAirPowerMin(72) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataAirPowerMin.type) as DataAirPowerMin).getValue()).toBe(72);
      });

      it('should find Min Vertical Speed', () => {
        const a1 = createMockActivity({ [DataVerticalSpeedMin.type]: new DataVerticalSpeedMin(-1.8) });
        const a2 = createMockActivity({ [DataVerticalSpeedMin.type]: new DataVerticalSpeedMin(-2.4) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataVerticalSpeedMin.type) as DataVerticalSpeedMin).getValue()).toBe(
          -2.4
        );
      });

      it('should find Min Ground Contact Time', () => {
        const a1 = createMockActivity({ [DataGroundContactTimeMin.type]: new DataGroundContactTimeMin(260) });
        const a2 = createMockActivity({ [DataGroundContactTimeMin.type]: new DataGroundContactTimeMin(240) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect(
          (stats.find(s => s.getType() === DataGroundContactTimeMin.type) as DataGroundContactTimeMin).getValue()
        ).toBe(240);
      });

      it('should find Min Vertical Oscillation', () => {
        const a1 = createMockActivity({ [DataVerticalOscillationMin.type]: new DataVerticalOscillationMin(6) });
        const a2 = createMockActivity({ [DataVerticalOscillationMin.type]: new DataVerticalOscillationMin(5) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect(
          (stats.find(s => s.getType() === DataVerticalOscillationMin.type) as DataVerticalOscillationMin).getValue()
        ).toBe(5);
      });

      it('should find Min Pace', () => {
        const a1 = createMockActivity({ [DataPaceMin.type]: new DataPaceMin(320) });
        const a2 = createMockActivity({ [DataPaceMin.type]: new DataPaceMin(305) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataPaceMin.type) as DataPaceMin).getValue()).toBe(305);
      });

      it('should find Min Grade Adjusted Pace', () => {
        const a1 = createMockActivity({ [DataGradeAdjustedPaceMin.type]: new DataGradeAdjustedPaceMin(315) });
        const a2 = createMockActivity({ [DataGradeAdjustedPaceMin.type]: new DataGradeAdjustedPaceMin(298) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect(
          (stats.find(s => s.getType() === DataGradeAdjustedPaceMin.type) as DataGradeAdjustedPaceMin).getValue()
        ).toBe(298);
      });

      it('should find Min Swim Pace', () => {
        const a1 = createMockActivity({ [DataSwimPaceMin.type]: new DataSwimPaceMin(125) });
        const a2 = createMockActivity({ [DataSwimPaceMin.type]: new DataSwimPaceMin(118) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataSwimPaceMin.type) as DataSwimPaceMin).getValue()).toBe(118);
      });

      it('should find Min Grade Adjusted Speed', () => {
        const a1 = createMockActivity({ [DataGradeAdjustedSpeedMin.type]: new DataGradeAdjustedSpeedMin(2.7) });
        const a2 = createMockActivity({ [DataGradeAdjustedSpeedMin.type]: new DataGradeAdjustedSpeedMin(2.4) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect(
          (stats.find(s => s.getType() === DataGradeAdjustedSpeedMin.type) as DataGradeAdjustedSpeedMin).getValue()
        ).toBe(2.4);
      });

      it('should find Min Leg Stiffness', () => {
        const a1 = createMockActivity({ [DataLegStiffnessMin.type]: new DataLegStiffnessMin(7.5) });
        const a2 = createMockActivity({ [DataLegStiffnessMin.type]: new DataLegStiffnessMin(7.1) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataLegStiffnessMin.type) as DataLegStiffnessMin).getValue()).toBe(7.1);
      });

      it('should find Min Vertical Ratio', () => {
        const a1 = createMockActivity({ [DataVerticalRatioMin.type]: new DataVerticalRatioMin(7.8) });
        const a2 = createMockActivity({ [DataVerticalRatioMin.type]: new DataVerticalRatioMin(7.3) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataVerticalRatioMin.type) as DataVerticalRatioMin).getValue()).toBe(7.3);
      });

      it('should find Min EVPE', () => {
        const a1 = createMockActivity({ [DataEVPEMin.type]: new DataEVPEMin(4.2) });
        const a2 = createMockActivity({ [DataEVPEMin.type]: new DataEVPEMin(3.9) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataEVPEMin.type) as DataEVPEMin).getValue()).toBe(3.9);
      });

      it('should find Min EHPE', () => {
        const a1 = createMockActivity({ [DataEHPEMin.type]: new DataEHPEMin(3.1) });
        const a2 = createMockActivity({ [DataEHPEMin.type]: new DataEHPEMin(3.4) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataEHPEMin.type) as DataEHPEMin).getValue()).toBe(3.1);
      });

      it('should find Min Satellite 5 Best SNR', () => {
        const a1 = createMockActivity({ [DataSatellite5BestSNRMin.type]: new DataSatellite5BestSNRMin(30.4) });
        const a2 = createMockActivity({ [DataSatellite5BestSNRMin.type]: new DataSatellite5BestSNRMin(31.8) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataSatellite5BestSNRMin.type) as DataSatellite5BestSNRMin).getValue()).toBe(
          30.4
        );
      });

      it('should find Min Number of Satellites', () => {
        const a1 = createMockActivity({ [DataNumberOfSatellitesMin.type]: new DataNumberOfSatellitesMin(9) });
        const a2 = createMockActivity({ [DataNumberOfSatellitesMin.type]: new DataNumberOfSatellitesMin(8) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataNumberOfSatellitesMin.type) as DataNumberOfSatellitesMin).getValue()).toBe(
          8
        );
      });
    });

    describe('Average Aggregations', () => {
      it('should average Air Power', () => {
        const a1 = createMockActivity({ [DataAirPowerAvg.type]: new DataAirPowerAvg(90) });
        const a2 = createMockActivity({ [DataAirPowerAvg.type]: new DataAirPowerAvg(110) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataAirPowerAvg.type) as DataAirPowerAvg).getValue()).toBe(100);
      });

      it('should average Vertical Speed', () => {
        const a1 = createMockActivity({ [DataVerticalSpeedAvg.type]: new DataVerticalSpeedAvg(0.4) });
        const a2 = createMockActivity({ [DataVerticalSpeedAvg.type]: new DataVerticalSpeedAvg(0.8) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect(
          (stats.find(s => s.getType() === DataVerticalSpeedAvg.type) as DataVerticalSpeedAvg).getValue()
        ).toBeCloseTo(0.6, 5);
      });

      it('should average Altitude', () => {
        const a1 = createMockActivity({ [DataAltitudeAvg.type]: new DataAltitudeAvg(1000) });
        const a2 = createMockActivity({ [DataAltitudeAvg.type]: new DataAltitudeAvg(1200) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataAltitudeAvg.type) as DataAltitudeAvg).getValue()).toBe(1100);
      });

      it('should average Leg Stiffness', () => {
        const a1 = createMockActivity({ [DataLegStiffnessAvg.type]: new DataLegStiffnessAvg(8.2) });
        const a2 = createMockActivity({ [DataLegStiffnessAvg.type]: new DataLegStiffnessAvg(8.8) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataLegStiffnessAvg.type) as DataLegStiffnessAvg).getValue()).toBe(8.5);
      });

      it('should average Vertical Ratio', () => {
        const a1 = createMockActivity({ [DataVerticalRatioAvg.type]: new DataVerticalRatioAvg(8.1) });
        const a2 = createMockActivity({ [DataVerticalRatioAvg.type]: new DataVerticalRatioAvg(8.5) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataVerticalRatioAvg.type) as DataVerticalRatioAvg).getValue()).toBe(8.3);
      });

      it('should average EVPE', () => {
        const a1 = createMockActivity({ [DataEVPEAvg.type]: new DataEVPEAvg(4.4) });
        const a2 = createMockActivity({ [DataEVPEAvg.type]: new DataEVPEAvg(4.8) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataEVPEAvg.type) as DataEVPEAvg).getValue()).toBe(4.6);
      });

      it('should average EHPE', () => {
        const a1 = createMockActivity({ [DataEHPEAvg.type]: new DataEHPEAvg(3.5) });
        const a2 = createMockActivity({ [DataEHPEAvg.type]: new DataEHPEAvg(4.1) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataEHPEAvg.type) as DataEHPEAvg).getValue()).toBe(3.8);
      });

      it('should average Satellite 5 Best SNR', () => {
        const a1 = createMockActivity({ [DataSatellite5BestSNRAvg.type]: new DataSatellite5BestSNRAvg(31.2) });
        const a2 = createMockActivity({ [DataSatellite5BestSNRAvg.type]: new DataSatellite5BestSNRAvg(33.2) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataSatellite5BestSNRAvg.type) as DataSatellite5BestSNRAvg).getValue()).toBe(
          32.2
        );
      });

      it('should average Number of Satellites', () => {
        const a1 = createMockActivity({ [DataNumberOfSatellitesAvg.type]: new DataNumberOfSatellitesAvg(9) });
        const a2 = createMockActivity({ [DataNumberOfSatellitesAvg.type]: new DataNumberOfSatellitesAvg(11) });
        const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
        expect((stats.find(s => s.getType() === DataNumberOfSatellitesAvg.type) as DataNumberOfSatellitesAvg).getValue()).toBe(
          10
        );
      });

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
