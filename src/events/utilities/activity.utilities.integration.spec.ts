import * as fs from 'fs';
import * as path from 'path';
import { EventImporterFIT } from '../adapters/importers/fit/importer.fit';
import { ActivityUtilities } from './activity.utilities';
import { Activity } from '../../activities/activity';
import { ActivityTypes } from '../../activities/activity.types';
import { Creator } from '../../creators/creator';
import { Stream } from '../../streams/stream';
import { DataAirPowerAvg } from '../../data/data.air-power-avg';
import { DataAirPowerMax } from '../../data/data.air-power-max';
import { DataAirPowerMin } from '../../data/data.air-power-min';
import { DataVerticalSpeed, DataVerticalSpeedKilometerPerHour } from '../../data/data.vertical-speed';
import { DataVerticalSpeedAvg } from '../../data/data.vertical-speed-avg';
import { DataVerticalSpeedMax } from '../../data/data.vertical-speed-max';
import { DataVerticalSpeedMin } from '../../data/data.vertical-speed-min';
import { DataGroundContactTimeMax } from '../../data/data.ground-contact-time-max';
import { DataGroundContactTimeMin } from '../../data/data.ground-contact-time-min';
import { DataVerticalOscillationMax } from '../../data/data.vertical-oscillation-max';
import { DataVerticalOscillationMin } from '../../data/data.vertical-oscillation-min';
import { DataGradeAdjustedPaceMax } from '../../data/data.grade-adjusted-pace-max';
import { DataGradeAdjustedPaceMin } from '../../data/data.grade-adjusted-pace-min';
import { DataGradeAdjustedSpeedMax } from '../../data/data.grade-adjusted-speed-max';
import { DataGradeAdjustedSpeedMin } from '../../data/data.grade-adjusted-speed-min';
import { DataPaceMax } from '../../data/data.pace-max';
import { DataPaceMin } from '../../data/data.pace-min';
import { DataPace } from '../../data/data.pace';
import { DataSwimPaceMax } from '../../data/data.swim-pace-max';
import { DataSwimPaceMin } from '../../data/data.swim-pace-min';
import { DataTemperatureMin } from '../../data/data.temperature-min';
import { DataAltitudeAvg } from '../../data/data.altitude-avg';
import { DataGradeAdjustedPace } from '../../data/data.grade-adjusted-pace';
import { DataJumpEvent } from '../../data/data.jump-event';
import { DataDuration } from '../../data/data.duration';
import { DataPause } from '../../data/data.pause';
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
  DataJumpSpeedAvgMilesPerHour,
  DataJumpSpeedMaxMilesPerHour,
  DataJumpSpeedMinMilesPerHour,
  DataJumpSpeedMax,
  DataJumpSpeedMin
} from '../../data/data.jump-stats';
import { DataLegStiffnessMin } from '../../data/data.leg-stiffness-min';
import { DataLegStiffnessMax } from '../../data/data.leg-stiffness-max';
import { DataVerticalRatioMin } from '../../data/data.vertical-ratio-min';
import { DataVerticalRatioMax } from '../../data/data.vertical-ratio-max';
import { DataEVPE } from '../../data/data.evpe';
import { DataEVPEMin } from '../../data/data.evpe-min';
import { DataEVPEMax } from '../../data/data.evpe-max';
import { DataEVPEAvg } from '../../data/data.evpe-avg';
import { DataEHPE } from '../../data/data.ehpe';
import { DataEHPEMin } from '../../data/data.ehpe-min';
import { DataEHPEMax } from '../../data/data.ehpe-max';
import { DataEHPEAvg } from '../../data/data.ehpe-avg';
import { DataDistance, DataDistanceMiles } from '../../data/data.distance';
import { DataSatellite5BestSNR } from '../../data/data.satellite-5-best-snr';
import { DataSatellite5BestSNRMin } from '../../data/data.satellite-5-best-snr-min';
import { DataSatellite5BestSNRMax } from '../../data/data.satellite-5-best-snr-max';
import { DataSatellite5BestSNRAvg } from '../../data/data.satellite-5-best-snr-avg';
import { DataNumberOfSatellites } from '../../data/data.number-of-satellites';
import { DataNumberOfSatellitesMin } from '../../data/data.number-of-satellites-min';
import { DataNumberOfSatellitesMax } from '../../data/data.number-of-satellites-max';
import { DataNumberOfSatellitesAvg } from '../../data/data.number-of-satellites-avg';
import { DataPowerNormalized } from '../../data/data.power-normalized';
import { DynamicDataLoader } from '../../data/data.store';
import { convertMetersToMiles, convertSpeedToSpeedInKilometersPerHour, convertSpeedToSpeedInMilesPerHour } from './helpers';
import { DistanceUnits } from '../../users/settings/user.unit.settings.interface';
import { DataSpeedMilesPerHour } from '../../data/data.speed';

const toArrayBuffer = (filePath: string): ArrayBuffer => {
  const fileContent = fs.readFileSync(filePath);
  return fileContent.buffer.slice(fileContent.byteOffset, fileContent.byteOffset + fileContent.byteLength);
};

const loadActivity = async (relativeFixturePath: string) => {
  const fitFilePath = path.join(__dirname, relativeFixturePath);
  const event = await EventImporterFIT.getFromArrayBuffer(toArrayBuffer(fitFilePath));
  const activity = event.getFirstActivity();
  ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
  return activity;
};

const getStatValue = (activity: any, type: string) => {
  const stat = activity.getStat(type);
  if (!stat) throw new Error(`Missing stat for type ${type}`);
  return stat.getValue() as number;
};

const ensureMinStatFromStream = (
  activity: any,
  statType: string,
  streamType: string,
  StatCtor: new (value: number) => any
) => {
  const stat = activity.getStat(statType);
  if (stat && stat.getValue() !== Infinity) return stat;
  const stream = activity.getStreamData(streamType) as Array<number | null | undefined> | undefined;
  if (!stream || stream.length === 0) return null;
  const finiteValues = stream.filter((v): v is number => Number.isFinite(v));
  if (!finiteValues.length) return null;
  const min = Math.min(...finiteValues);
  const newStat = new StatCtor(min);
  activity.addStat(newStat);
  return newStat;
};

const milesDistanceSettings: any = {
  speedUnits: [],
  swimPaceUnits: [],
  paceUnits: [],
  gradeAdjustedSpeedUnits: [],
  gradeAdjustedPaceUnits: [],
  verticalSpeedUnits: [],
  distanceUnits: DistanceUnits.Miles
};

const kilometersDistanceSettings: any = {
  speedUnits: [],
  swimPaceUnits: [],
  paceUnits: [],
  gradeAdjustedSpeedUnits: [],
  gradeAdjustedPaceUnits: [],
  verticalSpeedUnits: [],
  distanceUnits: DistanceUnits.Kilometers
};

const mphSpeedSettings: any = {
  speedUnits: [DataSpeedMilesPerHour.type],
  swimPaceUnits: [],
  paceUnits: [],
  gradeAdjustedSpeedUnits: [],
  gradeAdjustedPaceUnits: [],
  verticalSpeedUnits: [],
  distanceUnits: DistanceUnits.Kilometers
};

describe('ActivityUtilities summary aggregation integration', () => {
  describe('distance unit conversion integration', () => {
    it('converts parsed total distance stat to miles when distanceUnits is miles', async () => {
      const activity = await loadActivity('../../specs/fixtures/runs/fit/6860622783.fit');
      const distance = activity.getStat(DataDistance.type) as DataDistance;

      expect(distance).toBeDefined();

      const converted = DynamicDataLoader.getUnitBasedDataFromDataInstance(distance, milesDistanceSettings);
      expect(converted).toHaveLength(1);
      expect(converted[0].getType()).toBe(DataDistanceMiles.type);
      expect(converted[0].getValue()).toBeCloseTo(convertMetersToMiles(distance.getValue()), 10);
      expect(converted[0].getDisplayUnit()).toBe('mi');
    });

    it('converts jump distance summary stats to miles only in miles mode', () => {
      const activityA = new Activity(new Date(0), new Date(10_000), ActivityTypes.MountainBiking, new Creator('test'));
      const activityB = new Activity(
        new Date(20_000),
        new Date(30_000),
        ActivityTypes.MountainBiking,
        new Creator('test')
      );

      activityA.addEvent(
        new DataJumpEvent(1, { distance: 2, height: 0.5, score: 10, hang_time: 0.2, speed: 5, rotations: 0 })
      );
      activityA.addEvent(
        new DataJumpEvent(2, { distance: 4, height: 0.7, score: 12, hang_time: 0.3, speed: 6, rotations: 1 })
      );
      activityB.addEvent(
        new DataJumpEvent(3, { distance: 6, height: 0.8, score: 14, hang_time: 0.4, speed: 7, rotations: 1 })
      );
      activityB.addEvent(
        new DataJumpEvent(4, { distance: 8, height: 1.0, score: 16, hang_time: 0.5, speed: 8, rotations: 2 })
      );

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activityA);
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activityB);

      const summaryStats = ActivityUtilities.getSummaryStatsForActivities([activityA, activityB]);
      const jumpDistanceAvg = summaryStats.find(s => s.getType() === DataJumpDistanceAvg.type) as DataJumpDistanceAvg;

      expect(jumpDistanceAvg).toBeDefined();

      const milesConverted = DynamicDataLoader.getUnitBasedDataFromDataInstance(
        jumpDistanceAvg,
        milesDistanceSettings
      );
      expect(milesConverted).toHaveLength(1);
      expect(milesConverted[0].getType()).toBe(DataDistanceMiles.type);
      expect(milesConverted[0].getValue()).toBeCloseTo(convertMetersToMiles(jumpDistanceAvg.getValue()), 10);

      const kilometersConverted = DynamicDataLoader.getUnitBasedDataFromDataInstance(
        jumpDistanceAvg,
        kilometersDistanceSettings
      );
      expect(kilometersConverted).toHaveLength(1);
      expect(kilometersConverted[0].getType()).toBe(DataJumpDistanceAvg.type);
    });

    it('converts jump speed summary stats to selected speed unit display variants', () => {
      const activityA = new Activity(new Date(0), new Date(10_000), ActivityTypes.MountainBiking, new Creator('test'));
      const activityB = new Activity(
        new Date(20_000),
        new Date(30_000),
        ActivityTypes.MountainBiking,
        new Creator('test')
      );

      activityA.addEvent(
        new DataJumpEvent(1, { distance: 2, height: 0.5, score: 10, hang_time: 0.2, speed: 5, rotations: 0 })
      );
      activityA.addEvent(
        new DataJumpEvent(2, { distance: 4, height: 0.7, score: 12, hang_time: 0.3, speed: 6, rotations: 1 })
      );
      activityB.addEvent(
        new DataJumpEvent(3, { distance: 6, height: 0.8, score: 14, hang_time: 0.4, speed: 7, rotations: 1 })
      );
      activityB.addEvent(
        new DataJumpEvent(4, { distance: 8, height: 1.0, score: 16, hang_time: 0.5, speed: 8, rotations: 2 })
      );

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activityA);
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activityB);

      const summaryStats = ActivityUtilities.getSummaryStatsForActivities([activityA, activityB]);
      const jumpSpeedAvg = summaryStats.find(s => s.getType() === DataJumpSpeedAvg.type) as DataJumpSpeedAvg;

      expect(jumpSpeedAvg).toBeDefined();

      const converted = DynamicDataLoader.getUnitBasedDataFromDataInstance(jumpSpeedAvg, mphSpeedSettings);
      expect(converted).toHaveLength(1);
      expect(converted[0].getType()).toBe(DataJumpSpeedAvgMilesPerHour.type);
      expect(converted[0].getDisplayUnit()).toBe('mph');
      expect(converted[0].getValue()).toBeCloseTo(convertSpeedToSpeedInMilesPerHour(jumpSpeedAvg.getValue()), 10);
    });

    it('converts jump speed min and max summary stats to jump-specific speed unit variants', () => {
      const activityA = new Activity(new Date(0), new Date(10_000), ActivityTypes.MountainBiking, new Creator('test'));
      const activityB = new Activity(
        new Date(20_000),
        new Date(30_000),
        ActivityTypes.MountainBiking,
        new Creator('test')
      );

      activityA.addEvent(
        new DataJumpEvent(1, { distance: 2, height: 0.5, score: 10, hang_time: 0.2, speed: 5, rotations: 0 })
      );
      activityA.addEvent(
        new DataJumpEvent(2, { distance: 4, height: 0.7, score: 12, hang_time: 0.3, speed: 6, rotations: 1 })
      );
      activityB.addEvent(
        new DataJumpEvent(3, { distance: 6, height: 0.8, score: 14, hang_time: 0.4, speed: 7, rotations: 1 })
      );
      activityB.addEvent(
        new DataJumpEvent(4, { distance: 8, height: 1.0, score: 16, hang_time: 0.5, speed: 8, rotations: 2 })
      );

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activityA);
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activityB);

      const summaryStats = ActivityUtilities.getSummaryStatsForActivities([activityA, activityB]);
      const jumpSpeedMin = summaryStats.find(s => s.getType() === DataJumpSpeedMin.type) as DataJumpSpeedMin;
      const jumpSpeedMax = summaryStats.find(s => s.getType() === DataJumpSpeedMax.type) as DataJumpSpeedMax;

      expect(jumpSpeedMin).toBeDefined();
      expect(jumpSpeedMax).toBeDefined();

      const convertedMin = DynamicDataLoader.getUnitBasedDataFromDataInstance(jumpSpeedMin, mphSpeedSettings);
      const convertedMax = DynamicDataLoader.getUnitBasedDataFromDataInstance(jumpSpeedMax, mphSpeedSettings);

      expect(convertedMin).toHaveLength(1);
      expect(convertedMin[0].getType()).toBe(DataJumpSpeedMinMilesPerHour.type);
      expect(convertedMin[0].getDisplayUnit()).toBe('mph');
      expect(convertedMin[0].getValue()).toBeCloseTo(convertSpeedToSpeedInMilesPerHour(jumpSpeedMin.getValue()), 10);

      expect(convertedMax).toHaveLength(1);
      expect(convertedMax[0].getType()).toBe(DataJumpSpeedMaxMilesPerHour.type);
      expect(convertedMax[0].getDisplayUnit()).toBe('mph');
      expect(convertedMax[0].getValue()).toBeCloseTo(convertSpeedToSpeedInMilesPerHour(jumpSpeedMax.getValue()), 10);
    });
  });

  describe('getSummaryStatsForActivities', () => {
    it('aggregates Power Normalized across selected activities', () => {
      const a1 = new Activity(new Date(0), new Date(10_000), ActivityTypes.Cycling, new Creator('test'));
      a1.addStat(new DataDuration(10_000));
      a1.addStat(new DataPause(0));
      a1.addStat(new DataDistance(1000));
      a1.addStat(new DataPowerNormalized(210));

      const a2 = new Activity(new Date(0), new Date(15_000), ActivityTypes.Cycling, new Creator('test'));
      a2.addStat(new DataDuration(15_000));
      a2.addStat(new DataPause(0));
      a2.addStat(new DataDistance(1500));
      a2.addStat(new DataPowerNormalized(190));

      const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
      const normalizedPower = stats.find(s => s.getType() === DataPowerNormalized.type) as DataPowerNormalized;

      expect(normalizedPower).toBeDefined();
      expect(normalizedPower.getValue()).toBe(200);
    });

    it('aggregates Air Power stats when only one activity has the stream', async () => {
      const activityWithAir = await loadActivity('../../specs/fixtures/runs/fit/6860622783.fit');
      const activityWithoutAir = await loadActivity('../../specs/fixtures/runs/fit/2067489619.fit');

      const stats = ActivityUtilities.getSummaryStatsForActivities([activityWithAir, activityWithoutAir]);

      const avg = stats.find(s => s.getType() === DataAirPowerAvg.type) as DataAirPowerAvg;
      const min = stats.find(s => s.getType() === DataAirPowerMin.type) as DataAirPowerMin;
      const max = stats.find(s => s.getType() === DataAirPowerMax.type) as DataAirPowerMax;

      expect(avg).toBeDefined();
      expect(min).toBeDefined();
      expect(max).toBeDefined();

      const expectedAvg = getStatValue(activityWithAir, DataAirPowerAvg.type);
      const expectedMin = getStatValue(activityWithAir, DataAirPowerMin.type);
      const expectedMax = getStatValue(activityWithAir, DataAirPowerMax.type);

      expect(avg.getValue()).toBe(expectedAvg);
      expect(min.getValue()).toBe(expectedMin);
      expect(max.getValue()).toBe(expectedMax);
    });

    it('generates and aggregates EVPE, Satellite 5 Best SNR and Number of Satellites min/max/avg', () => {
      const a1 = new Activity(new Date(0), new Date(10_000), ActivityTypes.Running, new Creator('test'));
      a1.addStream(new Stream(DataEVPE.type, [4.0, 4.5, 5.0]));
      a1.addStream(new Stream(DataEHPE.type, [3.0, 3.6, 4.2]));
      a1.addStream(new Stream(DataSatellite5BestSNR.type, [30, 32, 31]));
      a1.addStream(new Stream(DataNumberOfSatellites.type, [8, 9, 10]));
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(a1);

      const a2 = new Activity(new Date(0), new Date(10_000), ActivityTypes.Running, new Creator('test'));
      a2.addStream(new Stream(DataEVPE.type, [3.5, 4.2, 4.8]));
      a2.addStream(new Stream(DataEHPE.type, [2.8, 3.2, 3.8]));
      a2.addStream(new Stream(DataSatellite5BestSNR.type, [33, 34, 35]));
      a2.addStream(new Stream(DataNumberOfSatellites.type, [10, 11, 12]));
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(a2);

      const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
      const getSummary = (type: string) => stats.find(s => s.getType() === type);

      expect(getSummary(DataEVPEMin.type)?.getValue()).toBe(Math.min(4.0, 3.5));
      expect(getSummary(DataEVPEMax.type)?.getValue()).toBe(Math.max(5.0, 4.8));
      expect(getSummary(DataEVPEAvg.type)?.getValue()).toBeCloseTo((4.5 + 4.1666666667) / 2, 10);
      expect(getSummary(DataEHPEMin.type)?.getValue()).toBe(Math.min(3.0, 2.8));
      expect(getSummary(DataEHPEMax.type)?.getValue()).toBe(Math.max(4.2, 3.8));
      expect(getSummary(DataEHPEAvg.type)?.getValue()).toBeCloseTo((3.6 + 3.2666666667) / 2, 10);

      expect(getSummary(DataSatellite5BestSNRMin.type)?.getValue()).toBe(Math.min(30, 33));
      expect(getSummary(DataSatellite5BestSNRMax.type)?.getValue()).toBe(Math.max(32, 35));
      expect(getSummary(DataSatellite5BestSNRAvg.type)?.getValue()).toBeCloseTo((31 + 34) / 2, 10);

      expect(getSummary(DataNumberOfSatellitesMin.type)?.getValue()).toBe(Math.min(8, 10));
      expect(getSummary(DataNumberOfSatellitesMax.type)?.getValue()).toBe(Math.max(10, 12));
      expect(getSummary(DataNumberOfSatellitesAvg.type)?.getValue()).toBeCloseTo((9 + 11) / 2, 10);
    });

    it('aggregates Vertical Speed min/max across activities', async () => {
      const a1 = await loadActivity('../../specs/fixtures/runs/fit/6909950168.fit');
      const a2 = await loadActivity('../../specs/fixtures/runs/fit/6910052863.fit');

      const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
      const min = stats.find(s => s.getType() === DataVerticalSpeedMin.type) as DataVerticalSpeedMin;
      const max = stats.find(s => s.getType() === DataVerticalSpeedMax.type) as DataVerticalSpeedMax;

      expect(min).toBeDefined();
      expect(max).toBeDefined();
      expect(min.getValue()).toBe(
        Math.min(getStatValue(a1, DataVerticalSpeedMin.type), getStatValue(a2, DataVerticalSpeedMin.type))
      );
      expect(max.getValue()).toBe(
        Math.max(getStatValue(a1, DataVerticalSpeedMax.type), getStatValue(a2, DataVerticalSpeedMax.type))
      );
    });

    it('creates base vertical-speed unit stats from average vertical speed', async () => {
      const activity = await loadActivity('../../specs/fixtures/runs/fit/6909950168.fit');
      const avg = activity.getStat(DataVerticalSpeedAvg.type) as DataVerticalSpeedAvg;
      const base = activity.getStat(DataVerticalSpeed.type) as DataVerticalSpeed;
      const kph = activity.getStat(DataVerticalSpeedKilometerPerHour.type) as DataVerticalSpeedKilometerPerHour;

      expect(avg).toBeDefined();
      expect(base).toBeDefined();
      expect(kph).toBeDefined();
      expect(base.getValue()).toBeCloseTo(avg.getValue(), 10);
      expect(kph.getValue()).toBeCloseTo(convertSpeedToSpeedInKilometersPerHour(avg.getValue() as number), 10);
    });

    it('aggregates Ground Contact Time min/max across activities', async () => {
      const a1 = await loadActivity('../../specs/fixtures/runs/fit/6782987395.fit');
      const a2 = await loadActivity('../../specs/fixtures/runs/fit/6860622783.fit');

      const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
      const min = stats.find(s => s.getType() === DataGroundContactTimeMin.type) as DataGroundContactTimeMin;
      const max = stats.find(s => s.getType() === DataGroundContactTimeMax.type) as DataGroundContactTimeMax;

      expect(min).toBeDefined();
      expect(max).toBeDefined();
      expect(min.getValue()).toBe(
        Math.min(getStatValue(a1, DataGroundContactTimeMin.type), getStatValue(a2, DataGroundContactTimeMin.type))
      );
      expect(max.getValue()).toBe(
        Math.max(getStatValue(a1, DataGroundContactTimeMax.type), getStatValue(a2, DataGroundContactTimeMax.type))
      );
    });

    it('aggregates Vertical Oscillation min/max across activities', async () => {
      const a1 = await loadActivity('../../specs/fixtures/runs/fit/6860622783.fit');
      const a2 = await loadActivity('../../specs/fixtures/runs/fit/6916663933.fit');

      const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
      const min = stats.find(s => s.getType() === DataVerticalOscillationMin.type) as DataVerticalOscillationMin;
      const max = stats.find(s => s.getType() === DataVerticalOscillationMax.type) as DataVerticalOscillationMax;

      expect(min).toBeDefined();
      expect(max).toBeDefined();
      expect(min.getValue()).toBe(
        Math.min(getStatValue(a1, DataVerticalOscillationMin.type), getStatValue(a2, DataVerticalOscillationMin.type))
      );
      expect(max.getValue()).toBe(
        Math.max(getStatValue(a1, DataVerticalOscillationMax.type), getStatValue(a2, DataVerticalOscillationMax.type))
      );
    });

    it('aggregates Leg Stiffness min/max across activities', async () => {
      const a1 = await loadActivity('../../specs/fixtures/runs/fit/6782987395.fit');
      const a2 = await loadActivity('../../specs/fixtures/runs/fit/6860622783.fit');

      const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
      const min = stats.find(s => s.getType() === DataLegStiffnessMin.type) as DataLegStiffnessMin;
      const max = stats.find(s => s.getType() === DataLegStiffnessMax.type) as DataLegStiffnessMax;

      expect(min).toBeDefined();
      expect(max).toBeDefined();
      expect(min.getValue()).toBe(
        Math.min(getStatValue(a1, DataLegStiffnessMin.type), getStatValue(a2, DataLegStiffnessMin.type))
      );
      expect(max.getValue()).toBe(
        Math.max(getStatValue(a1, DataLegStiffnessMax.type), getStatValue(a2, DataLegStiffnessMax.type))
      );
    });

    it('aggregates Vertical Ratio min/max across activities', async () => {
      const a1 = await loadActivity('../../specs/fixtures/runs/fit/6860622783.fit');
      const a2 = await loadActivity('../../specs/fixtures/runs/fit/6916663933.fit');

      const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
      const min = stats.find(s => s.getType() === DataVerticalRatioMin.type) as DataVerticalRatioMin;
      const max = stats.find(s => s.getType() === DataVerticalRatioMax.type) as DataVerticalRatioMax;

      expect(min).toBeDefined();
      expect(max).toBeDefined();
      expect(min.getValue()).toBe(
        Math.min(getStatValue(a1, DataVerticalRatioMin.type), getStatValue(a2, DataVerticalRatioMin.type))
      );
      expect(max.getValue()).toBe(
        Math.max(getStatValue(a1, DataVerticalRatioMax.type), getStatValue(a2, DataVerticalRatioMax.type))
      );
    });

    it('aggregates Grade Adjusted Pace min/max across activities', async () => {
      const a1 = await loadActivity('../../specs/fixtures/runs/fit/2067489619.fit');
      const a2 = await loadActivity('../../specs/fixtures/runs/fit/6910052863.fit');

      ensureMinStatFromStream(a1, DataGradeAdjustedPaceMin.type, DataGradeAdjustedPace.type, DataGradeAdjustedPaceMin);
      ensureMinStatFromStream(a2, DataGradeAdjustedPaceMin.type, DataGradeAdjustedPace.type, DataGradeAdjustedPaceMin);

      const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
      const min = stats.find(s => s.getType() === DataGradeAdjustedPaceMin.type) as DataGradeAdjustedPaceMin;
      const max = stats.find(s => s.getType() === DataGradeAdjustedPaceMax.type) as DataGradeAdjustedPaceMax;

      expect(min).toBeDefined();
      expect(max).toBeDefined();
      expect(min.getValue()).toBe(
        Math.min(getStatValue(a1, DataGradeAdjustedPaceMin.type), getStatValue(a2, DataGradeAdjustedPaceMin.type))
      );
      expect(max.getValue()).toBe(
        Math.max(getStatValue(a1, DataGradeAdjustedPaceMax.type), getStatValue(a2, DataGradeAdjustedPaceMax.type))
      );
    });

    it('aggregates Grade Adjusted Speed min/max across activities', async () => {
      const a1 = await loadActivity('../../specs/fixtures/runs/fit/2067489619.fit');
      const a2 = await loadActivity('../../specs/fixtures/runs/fit/6916663933.fit');

      const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
      const min = stats.find(s => s.getType() === DataGradeAdjustedSpeedMin.type) as DataGradeAdjustedSpeedMin;
      const max = stats.find(s => s.getType() === DataGradeAdjustedSpeedMax.type) as DataGradeAdjustedSpeedMax;

      expect(min).toBeDefined();
      expect(max).toBeDefined();
      expect(min.getValue()).toBe(
        Math.min(getStatValue(a1, DataGradeAdjustedSpeedMin.type), getStatValue(a2, DataGradeAdjustedSpeedMin.type))
      );
      expect(max.getValue()).toBe(
        Math.max(getStatValue(a1, DataGradeAdjustedSpeedMax.type), getStatValue(a2, DataGradeAdjustedSpeedMax.type))
      );
    });

    it('aggregates Pace min/max across activities', async () => {
      const a1 = await loadActivity('../../specs/fixtures/runs/fit/6909950168.fit');
      const a2 = await loadActivity('../../specs/fixtures/runs/fit/6916728382.fit');

      ensureMinStatFromStream(a1, DataPaceMin.type, DataPace.type, DataPaceMin);
      ensureMinStatFromStream(a2, DataPaceMin.type, DataPace.type, DataPaceMin);

      const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
      const min = stats.find(s => s.getType() === DataPaceMin.type) as DataPaceMin;
      const max = stats.find(s => s.getType() === DataPaceMax.type) as DataPaceMax;

      expect(min).toBeDefined();
      expect(max).toBeDefined();
      expect(min.getValue()).toBe(Math.min(getStatValue(a1, DataPaceMin.type), getStatValue(a2, DataPaceMin.type)));
      expect(max.getValue()).toBe(Math.max(getStatValue(a1, DataPaceMax.type), getStatValue(a2, DataPaceMax.type)));
    });

    it('aggregates Swim Pace min/max across activities', async () => {
      const a1 = await loadActivity('../../specs/fixtures/swim/fit/6021532030.fit');
      const a2 = await loadActivity('../../specs/fixtures/swim/fit/6688025408.fit');

      const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
      const min = stats.find(s => s.getType() === DataSwimPaceMin.type) as DataSwimPaceMin;
      const max = stats.find(s => s.getType() === DataSwimPaceMax.type) as DataSwimPaceMax;

      expect(min).toBeDefined();
      expect(max).toBeDefined();
      expect(min.getValue()).toBe(
        Math.min(getStatValue(a1, DataSwimPaceMin.type), getStatValue(a2, DataSwimPaceMin.type))
      );
      expect(max.getValue()).toBe(
        Math.max(getStatValue(a1, DataSwimPaceMax.type), getStatValue(a2, DataSwimPaceMax.type))
      );
    });

    it('aggregates Temperature min across activities', async () => {
      const a1 = await loadActivity('../../specs/fixtures/runs/fit/6782987395.fit');
      const a2 = await loadActivity('../../specs/fixtures/runs/fit/6909950168.fit');

      const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
      const min = stats.find(s => s.getType() === DataTemperatureMin.type) as DataTemperatureMin;

      expect(min).toBeDefined();
      expect(min.getValue()).toBe(
        Math.min(getStatValue(a1, DataTemperatureMin.type), getStatValue(a2, DataTemperatureMin.type))
      );
    });

    it('aggregates Altitude average across activities', async () => {
      const a1 = await loadActivity('../../specs/fixtures/runs/fit/6782987395.fit');
      const a2 = await loadActivity('../../specs/fixtures/runs/fit/6916728382.fit');

      const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
      const avg = stats.find(s => s.getType() === DataAltitudeAvg.type) as DataAltitudeAvg;

      expect(avg).toBeDefined();
      const expectedAvg = (getStatValue(a1, DataAltitudeAvg.type) + getStatValue(a2, DataAltitudeAvg.type)) / 2;
      expect(avg.getValue()).toBe(expectedAvg);
    });
  });

  describe('generateMissingStreamsAndStatsForActivity', () => {
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

    it('derives missing jump min/max/avg stats from jump events', () => {
      const activity = new Activity(new Date(0), new Date(10_000), ActivityTypes.MountainBiking, new Creator('test'));
      activity.addEvent(
        createJumpEvent(1, { distance: 2, hang_time: 0.4, speed: 6, rotations: 1, score: 50, height: 0.8 })
      );
      activity.addEvent(
        createJumpEvent(2, { distance: 4, hang_time: 0.6, speed: 8, rotations: 0, score: 70, height: 1.2 })
      );

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      expect((activity.getStat(DataJumpDistanceMin.type) as DataJumpDistanceMin).getValue()).toBe(2);
      expect((activity.getStat(DataJumpDistanceMax.type) as DataJumpDistanceMax).getValue()).toBe(4);
      expect((activity.getStat(DataJumpDistanceAvg.type) as DataJumpDistanceAvg).getValue()).toBeCloseTo(3, 10);

      expect((activity.getStat(DataJumpHangTimeMin.type) as DataJumpHangTimeMin).getValue()).toBeCloseTo(0.4, 10);
      expect((activity.getStat(DataJumpHangTimeMax.type) as DataJumpHangTimeMax).getValue()).toBeCloseTo(0.6, 10);
      expect((activity.getStat(DataJumpHangTimeAvg.type) as DataJumpHangTimeAvg).getValue()).toBeCloseTo(0.5, 10);

      expect((activity.getStat(DataJumpSpeedMin.type) as DataJumpSpeedMin).getValue()).toBe(6);
      expect((activity.getStat(DataJumpSpeedMax.type) as DataJumpSpeedMax).getValue()).toBe(8);
      expect((activity.getStat(DataJumpSpeedAvg.type) as DataJumpSpeedAvg).getValue()).toBeCloseTo(7, 10);

      expect((activity.getStat(DataJumpRotationsMin.type) as DataJumpRotationsMin).getValue()).toBe(0);
      expect((activity.getStat(DataJumpRotationsMax.type) as DataJumpRotationsMax).getValue()).toBe(1);
      expect((activity.getStat(DataJumpRotationsAvg.type) as DataJumpRotationsAvg).getValue()).toBeCloseTo(0.5, 10);

      expect((activity.getStat(DataJumpScoreMin.type) as DataJumpScoreMin).getValue()).toBe(50);
      expect((activity.getStat(DataJumpScoreMax.type) as DataJumpScoreMax).getValue()).toBe(70);
      expect((activity.getStat(DataJumpScoreAvg.type) as DataJumpScoreAvg).getValue()).toBeCloseTo(60, 10);

      expect((activity.getStat(DataJumpHeightMin.type) as DataJumpHeightMin).getValue()).toBeCloseTo(0.8, 10);
      expect((activity.getStat(DataJumpHeightMax.type) as DataJumpHeightMax).getValue()).toBeCloseTo(1.2, 10);
      expect((activity.getStat(DataJumpHeightAvg.type) as DataJumpHeightAvg).getValue()).toBeCloseTo(1, 10);
    });

    it('emits jump averages with zero values when count is greater than zero', () => {
      const activity = new Activity(new Date(0), new Date(10_000), ActivityTypes.MountainBiking, new Creator('test'));
      activity.addEvent(createJumpEvent(1, { distance: 0, hang_time: 0, speed: 0, rotations: 0, score: 0, height: 0 }));

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      expect((activity.getStat(DataJumpDistanceAvg.type) as DataJumpDistanceAvg).getValue()).toBe(0);
      expect((activity.getStat(DataJumpHangTimeAvg.type) as DataJumpHangTimeAvg).getValue()).toBe(0);
      expect((activity.getStat(DataJumpSpeedAvg.type) as DataJumpSpeedAvg).getValue()).toBe(0);
      expect((activity.getStat(DataJumpRotationsAvg.type) as DataJumpRotationsAvg).getValue()).toBe(0);
      expect((activity.getStat(DataJumpScoreAvg.type) as DataJumpScoreAvg).getValue()).toBe(0);
      expect((activity.getStat(DataJumpHeightAvg.type) as DataJumpHeightAvg).getValue()).toBe(0);
    });
  });
});
