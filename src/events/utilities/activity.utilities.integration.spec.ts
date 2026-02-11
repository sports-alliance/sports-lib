import * as fs from 'fs';
import * as path from 'path';
import { EventImporterFIT } from '../adapters/importers/fit/importer.fit';
import { ActivityUtilities } from './activity.utilities';
import { DataAirPowerAvg } from '../../data/data.air-power-avg';
import { DataAirPowerMax } from '../../data/data.air-power-max';
import { DataAirPowerMin } from '../../data/data.air-power-min';
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
import { DataLegStiffnessMin } from '../../data/data.leg-stiffness-min';
import { DataLegStiffnessMax } from '../../data/data.leg-stiffness-max';
import { DataVerticalRatioMin } from '../../data/data.vertical-ratio-min';
import { DataVerticalRatioMax } from '../../data/data.vertical-ratio-max';

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

describe('ActivityUtilities summary aggregation integration', () => {
  describe('getSummaryStatsForActivities', () => {
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

    it('aggregates Vertical Speed min/max across activities', async () => {
      const a1 = await loadActivity('../../specs/fixtures/runs/fit/6909950168.fit');
      const a2 = await loadActivity('../../specs/fixtures/runs/fit/6910052863.fit');

      const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
      const min = stats.find(s => s.getType() === DataVerticalSpeedMin.type) as DataVerticalSpeedMin;
      const max = stats.find(s => s.getType() === DataVerticalSpeedMax.type) as DataVerticalSpeedMax;

      expect(min).toBeDefined();
      expect(max).toBeDefined();
      expect(min.getValue()).toBe(Math.min(getStatValue(a1, DataVerticalSpeedMin.type), getStatValue(a2, DataVerticalSpeedMin.type)));
      expect(max.getValue()).toBe(Math.max(getStatValue(a1, DataVerticalSpeedMax.type), getStatValue(a2, DataVerticalSpeedMax.type)));
    });

    it('aggregates Ground Contact Time min/max across activities', async () => {
      const a1 = await loadActivity('../../specs/fixtures/runs/fit/6782987395.fit');
      const a2 = await loadActivity('../../specs/fixtures/runs/fit/6860622783.fit');

      const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
      const min = stats.find(s => s.getType() === DataGroundContactTimeMin.type) as DataGroundContactTimeMin;
      const max = stats.find(s => s.getType() === DataGroundContactTimeMax.type) as DataGroundContactTimeMax;

      expect(min).toBeDefined();
      expect(max).toBeDefined();
      expect(min.getValue()).toBe(Math.min(getStatValue(a1, DataGroundContactTimeMin.type), getStatValue(a2, DataGroundContactTimeMin.type)));
      expect(max.getValue()).toBe(Math.max(getStatValue(a1, DataGroundContactTimeMax.type), getStatValue(a2, DataGroundContactTimeMax.type)));
    });

    it('aggregates Vertical Oscillation min/max across activities', async () => {
      const a1 = await loadActivity('../../specs/fixtures/runs/fit/6860622783.fit');
      const a2 = await loadActivity('../../specs/fixtures/runs/fit/6916663933.fit');

      const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
      const min = stats.find(s => s.getType() === DataVerticalOscillationMin.type) as DataVerticalOscillationMin;
      const max = stats.find(s => s.getType() === DataVerticalOscillationMax.type) as DataVerticalOscillationMax;

      expect(min).toBeDefined();
      expect(max).toBeDefined();
      expect(min.getValue()).toBe(Math.min(getStatValue(a1, DataVerticalOscillationMin.type), getStatValue(a2, DataVerticalOscillationMin.type)));
      expect(max.getValue()).toBe(Math.max(getStatValue(a1, DataVerticalOscillationMax.type), getStatValue(a2, DataVerticalOscillationMax.type)));
    });

    it('aggregates Leg Stiffness min/max across activities', async () => {
      const a1 = await loadActivity('../../specs/fixtures/runs/fit/6782987395.fit');
      const a2 = await loadActivity('../../specs/fixtures/runs/fit/6860622783.fit');

      const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
      const min = stats.find(s => s.getType() === DataLegStiffnessMin.type) as DataLegStiffnessMin;
      const max = stats.find(s => s.getType() === DataLegStiffnessMax.type) as DataLegStiffnessMax;

      expect(min).toBeDefined();
      expect(max).toBeDefined();
      expect(min.getValue()).toBe(Math.min(getStatValue(a1, DataLegStiffnessMin.type), getStatValue(a2, DataLegStiffnessMin.type)));
      expect(max.getValue()).toBe(Math.max(getStatValue(a1, DataLegStiffnessMax.type), getStatValue(a2, DataLegStiffnessMax.type)));
    });

    it('aggregates Vertical Ratio min/max across activities', async () => {
      const a1 = await loadActivity('../../specs/fixtures/runs/fit/6860622783.fit');
      const a2 = await loadActivity('../../specs/fixtures/runs/fit/6916663933.fit');

      const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
      const min = stats.find(s => s.getType() === DataVerticalRatioMin.type) as DataVerticalRatioMin;
      const max = stats.find(s => s.getType() === DataVerticalRatioMax.type) as DataVerticalRatioMax;

      expect(min).toBeDefined();
      expect(max).toBeDefined();
      expect(min.getValue()).toBe(Math.min(getStatValue(a1, DataVerticalRatioMin.type), getStatValue(a2, DataVerticalRatioMin.type)));
      expect(max.getValue()).toBe(Math.max(getStatValue(a1, DataVerticalRatioMax.type), getStatValue(a2, DataVerticalRatioMax.type)));
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
      expect(min.getValue()).toBe(Math.min(getStatValue(a1, DataGradeAdjustedPaceMin.type), getStatValue(a2, DataGradeAdjustedPaceMin.type)));
      expect(max.getValue()).toBe(Math.max(getStatValue(a1, DataGradeAdjustedPaceMax.type), getStatValue(a2, DataGradeAdjustedPaceMax.type)));
    });

    it('aggregates Grade Adjusted Speed min/max across activities', async () => {
      const a1 = await loadActivity('../../specs/fixtures/runs/fit/2067489619.fit');
      const a2 = await loadActivity('../../specs/fixtures/runs/fit/6916663933.fit');

      const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
      const min = stats.find(s => s.getType() === DataGradeAdjustedSpeedMin.type) as DataGradeAdjustedSpeedMin;
      const max = stats.find(s => s.getType() === DataGradeAdjustedSpeedMax.type) as DataGradeAdjustedSpeedMax;

      expect(min).toBeDefined();
      expect(max).toBeDefined();
      expect(min.getValue()).toBe(Math.min(getStatValue(a1, DataGradeAdjustedSpeedMin.type), getStatValue(a2, DataGradeAdjustedSpeedMin.type)));
      expect(max.getValue()).toBe(Math.max(getStatValue(a1, DataGradeAdjustedSpeedMax.type), getStatValue(a2, DataGradeAdjustedSpeedMax.type)));
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
      expect(min.getValue()).toBe(Math.min(getStatValue(a1, DataSwimPaceMin.type), getStatValue(a2, DataSwimPaceMin.type)));
      expect(max.getValue()).toBe(Math.max(getStatValue(a1, DataSwimPaceMax.type), getStatValue(a2, DataSwimPaceMax.type)));
    });

    it('aggregates Temperature min across activities', async () => {
      const a1 = await loadActivity('../../specs/fixtures/runs/fit/6782987395.fit');
      const a2 = await loadActivity('../../specs/fixtures/runs/fit/6909950168.fit');

      const stats = ActivityUtilities.getSummaryStatsForActivities([a1, a2]);
      const min = stats.find(s => s.getType() === DataTemperatureMin.type) as DataTemperatureMin;

      expect(min).toBeDefined();
      expect(min.getValue()).toBe(Math.min(getStatValue(a1, DataTemperatureMin.type), getStatValue(a2, DataTemperatureMin.type)));
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
});
