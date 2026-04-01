import { Activity } from '../../activities/activity';
import { ActivityParsingOptions } from '../../activities/activity-parsing-options';
import { ActivityTypes } from '../../activities/activity.types';
import { Creator } from '../../creators/creator';
import { DataEnergy } from '../../data/data.energy';
import { DataFTP } from '../../data/data.ftp';
import { DataGradeSmooth } from '../../data/data.grade-smooth';
import { DataHeartRate } from '../../data/data.heart-rate';
import { DataPower } from '../../data/data.power';
import { DataPowerIntensityFactor } from '../../data/data.power-intensity-factor';
import { DataPowerNormalized } from '../../data/data.power-normalized';
import { DataTrainingStressScore } from '../../data/data.training-stress-score';
import { DataSpeed } from '../../data/data.speed';
import { DataSwimPace } from '../../data/data.swim-pace';
import {
  DataTrainingStressScoreMethod,
  TrainingStressScoreMethod
} from '../../data/data.training-stress-score-method';
import { DataVerticalSpeed } from '../../data/data.vertical-speed';
import { DataWeight } from '../../data/data.weight';
import { IntensityZones } from '../../intensity-zones/intensity-zones';
import { ActivityUtilities } from './activity.utilities';
import * as fs from 'fs';
import * as path from 'path';
import { EventImporterFIT } from '../adapters/importers/fit/importer.fit';

const creator = new Creator('test');

function createActivity(type: ActivityTypes, durationSeconds: number, options?: ActivityParsingOptions): Activity {
  const start = new Date('2026-01-01T00:00:00.000Z');
  const end = new Date(start.getTime() + durationSeconds * 1000);
  return new Activity(start, end, type, creator, options);
}

function addNumericStream(activity: Activity, type: string, data: number[]): void {
  const stream = activity.createStream(type);
  stream.setData(data);
  activity.addStream(stream);
}

function addZoneFiveThreshold(activity: Activity, type: string, zone5LowerLimit: number): void {
  const zones = new IntensityZones(type);
  zones.zone1Duration = 0;
  zones.zone2Duration = 0;
  zones.zone3Duration = 0;
  zones.zone4Duration = 0;
  zones.zone5Duration = 0;
  zones.zone5LowerLimit = zone5LowerLimit;
  activity.intensityZones.push(zones);
}

function computeLegacyPowerTssFromSamples(samples: Array<{ duration: number; power: number }>, ftp: number): number | null {
  if (!Number.isFinite(ftp) || ftp <= 0) {
    return null;
  }

  const orderedSamples = samples
    .filter(sample => Number.isFinite(sample.duration) && Number.isFinite(sample.power))
    .sort((left, right) => left.duration - right.duration);
  if (!orderedSamples.length) {
    return null;
  }

  const power30sList = orderedSamples.map((sample, index) => {
    if (sample.duration < 30) {
      return null;
    }

    const index30SecAgo = Math.max(
      0,
      orderedSamples.slice(0, index).findIndex(previous => sample.duration - previous.duration < 30)
    );
    const window = orderedSamples.slice(index30SecAgo, index + 1).map(item => item.power);
    const mean = window.reduce((sum, value) => sum + value, 0) / window.length;
    return Number.isNaN(mean) ? null : mean;
  });

  let tss = 0;
  let intensityFactor = 0;
  let normalizedPower = 0;
  let rollPower4Sum = 0;
  let rollPower4Count = 0;

  orderedSamples.forEach((sample, index) => {
    const power30s = power30sList[index];
    if (power30s !== null) {
      rollPower4Sum += Math.pow(power30s, 4);
      rollPower4Count += 1;
    }

    if (rollPower4Count > 0) {
      normalizedPower = Math.pow(rollPower4Sum / rollPower4Count, 0.25);
    }

    intensityFactor = normalizedPower / ftp;
    tss = (100 * (sample.duration - 29) * normalizedPower * intensityFactor) / (ftp * 3600);
  });

  return Number.isFinite(tss) ? tss : null;
}

describe('Training Stress Score integration', () => {
  it('preserves imported TSS by default and sets method to IMPORTED', () => {
    const activity = createActivity(ActivityTypes.Cycling, 1200);
    activity.addStat(new DataTrainingStressScore(42.5));

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(activity.getStat(DataTrainingStressScore.type)?.getValue()).toBe(42.5);
    expect(activity.getStat(DataTrainingStressScoreMethod.type)?.getValue()).toBe(TrainingStressScoreMethod.IMPORTED);
  });

  it('recomputes imported TSS when preserveImportedTss is disabled', () => {
    const activity = createActivity(
      ActivityTypes.Cycling,
      3600,
      new ActivityParsingOptions({
        tss: {
          preserveImportedTss: false,
          overrides: {
            functionalThresholdPower: 250
          }
        }
      })
    );
    activity.addStat(new DataTrainingStressScore(42.5));
    addNumericStream(activity, DataPower.type, new Array(3600).fill(250));

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(activity.getStat(DataTrainingStressScoreMethod.type)?.getValue()).toBe(TrainingStressScoreMethod.POWER);
    expect(activity.getStat(DataTrainingStressScore.type)?.getValue()).not.toBe(42.5);
  });

  it('uses POWER first when all methods could be computed', () => {
    const activity = createActivity(
      ActivityTypes.Running,
      600,
      new ActivityParsingOptions({
        tss: {
          overrides: {
            functionalThresholdPower: 200
          }
        }
      })
    );

    addNumericStream(activity, DataPower.type, new Array(600).fill(200));
    addNumericStream(activity, DataHeartRate.type, new Array(600).fill(160));
    addNumericStream(activity, DataSpeed.type, new Array(600).fill(3));
    addNumericStream(activity, DataVerticalSpeed.type, new Array(600).fill(0.1));
    addZoneFiveThreshold(activity, DataHeartRate.type, 170);
    addZoneFiveThreshold(activity, DataSpeed.type, 3);
    activity.addStat(new DataEnergy(200));
    activity.addStat(new DataWeight(70));

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(activity.getStat(DataTrainingStressScoreMethod.type)?.getValue()).toBe(TrainingStressScoreMethod.POWER);
  });

  it('keeps POWER IF and TSS aligned to the same NP/FTP source', () => {
    const ftpOverride = 280;
    const activity = createActivity(
      ActivityTypes.Cycling,
      3600,
      new ActivityParsingOptions({
        tss: {
          overrides: {
            functionalThresholdPower: ftpOverride
          }
        }
      })
    );
    addNumericStream(activity, DataPower.type, new Array(3600).fill(300));

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    const method = activity.getStat(DataTrainingStressScoreMethod.type)?.getValue();
    const normalizedPower = activity.getStat(DataPowerNormalized.type)?.getValue() as number;
    const intensityFactor = activity.getStat(DataPowerIntensityFactor.type)?.getValue() as number;
    const tss = activity.getStat(DataTrainingStressScore.type)?.getValue() as number;
    const derivedFtp = activity.getStat(DataFTP.type)?.getValue() as number;

    const expectedIf = Math.round((normalizedPower / ftpOverride) * 1000) / 1000;
    const expectedTss =
      Math.round(
        ((100 * Math.max(3600 - 29, 0) * normalizedPower * (normalizedPower / ftpOverride)) / (ftpOverride * 3600)) *
        10
      ) / 10;

    expect(method).toBe(TrainingStressScoreMethod.POWER);
    expect(derivedFtp).toBe(ftpOverride);
    expect(intensityFactor).toBeCloseTo(expectedIf, 3);
    expect(tss).toBeCloseTo(expectedTss, 1);
    expect(intensityFactor).toBeCloseTo(normalizedPower / derivedFtp, 3);
  });

  it('falls back to HR when POWER is unavailable', () => {
    const activity = createActivity(ActivityTypes.Running, 300);
    addNumericStream(activity, DataHeartRate.type, new Array(300).fill(160));
    addZoneFiveThreshold(activity, DataHeartRate.type, 170);

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(activity.getStat(DataTrainingStressScoreMethod.type)?.getValue()).toBe(TrainingStressScoreMethod.HR);
    expect(activity.getStat(DataTrainingStressScore.type)?.getValue()).toBeGreaterThan(0);
  });

  it('uses Banister when resting HR is provided and Edwards when it is missing', () => {
    const banisterActivity = createActivity(
      ActivityTypes.Running,
      3600,
      new ActivityParsingOptions({
        tss: {
          overrides: {
            maxHeartRate: 190,
            restingHeartRate: 50,
            lactateThresholdHR: 170
          }
        }
      })
    );
    addNumericStream(banisterActivity, DataHeartRate.type, new Array(3600).fill(160));
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(banisterActivity);

    const edwardsActivity = createActivity(
      ActivityTypes.Running,
      3600,
      new ActivityParsingOptions({
        tss: {
          overrides: {
            maxHeartRate: 190,
            lactateThresholdHR: 170
          }
        }
      })
    );
    addNumericStream(edwardsActivity, DataHeartRate.type, new Array(3600).fill(160));
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(edwardsActivity);

    const banisterTss = banisterActivity.getStat(DataTrainingStressScore.type)?.getValue();
    const edwardsTss = edwardsActivity.getStat(DataTrainingStressScore.type)?.getValue();

    expect(banisterActivity.getStat(DataTrainingStressScoreMethod.type)?.getValue()).toBe(TrainingStressScoreMethod.HR);
    expect(edwardsActivity.getStat(DataTrainingStressScoreMethod.type)?.getValue()).toBe(TrainingStressScoreMethod.HR);
    expect(banisterTss).toBeDefined();
    expect(edwardsTss).toBeDefined();
    expect(banisterTss).not.toBe(edwardsTss);
  });

  it('falls back to PACE for pace-enabled activities when HR is unavailable', () => {
    const activity = createActivity(ActivityTypes.Running, 300);
    addNumericStream(activity, DataSpeed.type, new Array(300).fill(3));
    addNumericStream(activity, DataVerticalSpeed.type, new Array(300).fill(0.1));
    addZoneFiveThreshold(activity, DataSpeed.type, 3.2);

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(activity.getStat(DataTrainingStressScoreMethod.type)?.getValue()).toBe(TrainingStressScoreMethod.PACE);
    expect(activity.getStat(DataTrainingStressScore.type)?.getValue()).toBeGreaterThan(0);
  });

  it('treats grade stream values as percent for PACE TSS inputs', () => {
    const runningWithPercentGrade = createActivity(ActivityTypes.Running, 1200);
    addNumericStream(runningWithPercentGrade, DataSpeed.type, new Array(1200).fill(3));
    addNumericStream(runningWithPercentGrade, DataGradeSmooth.type, new Array(1200).fill(10));
    addZoneFiveThreshold(runningWithPercentGrade, DataSpeed.type, 3);

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(runningWithPercentGrade);

    const runningWithDerivedDecimalGrade = createActivity(ActivityTypes.Running, 1200);
    addNumericStream(runningWithDerivedDecimalGrade, DataSpeed.type, new Array(1200).fill(3));
    addNumericStream(runningWithDerivedDecimalGrade, DataVerticalSpeed.type, new Array(1200).fill(0.3));
    addZoneFiveThreshold(runningWithDerivedDecimalGrade, DataSpeed.type, 3);

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(runningWithDerivedDecimalGrade);

    const percentMethod = runningWithPercentGrade.getStat(DataTrainingStressScoreMethod.type)?.getValue();
    const decimalMethod = runningWithDerivedDecimalGrade.getStat(DataTrainingStressScoreMethod.type)?.getValue();
    const percentTss = runningWithPercentGrade.getStat(DataTrainingStressScore.type)?.getValue() as number;
    const decimalTss = runningWithDerivedDecimalGrade.getStat(DataTrainingStressScore.type)?.getValue() as number;

    expect(percentMethod).toBe(TrainingStressScoreMethod.PACE);
    expect(decimalMethod).toBe(TrainingStressScoreMethod.PACE);
    expect(Math.abs(percentTss - decimalTss)).toBeLessThanOrEqual(0.2);
  });

  it('uses PACE for Track and Field (TSS pace-enabled)', () => {
    const activity = createActivity(ActivityTypes.TrackAndField, 300);
    addNumericStream(activity, DataSpeed.type, new Array(300).fill(3));
    addNumericStream(activity, DataVerticalSpeed.type, new Array(300).fill(0.1));
    addZoneFiveThreshold(activity, DataSpeed.type, 3.2);

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(activity.getStat(DataTrainingStressScoreMethod.type)?.getValue()).toBe(TrainingStressScoreMethod.PACE);
  });

  it('skips PACE for non-pace sports and falls back to MET', () => {
    const activity = createActivity(ActivityTypes.Cycling, 1200);
    addNumericStream(activity, DataSpeed.type, new Array(1200).fill(8));
    addNumericStream(activity, DataVerticalSpeed.type, new Array(1200).fill(0.2));
    addZoneFiveThreshold(activity, DataSpeed.type, 8.5);
    activity.addStat(new DataEnergy(220));
    activity.addStat(new DataWeight(70));

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(activity.getStat(DataTrainingStressScoreMethod.type)?.getValue()).toBe(TrainingStressScoreMethod.MET);
  });

  it('uses SWIM_PACE for swimming activities before MET', () => {
    const activity = createActivity(ActivityTypes.Swimming, 1800);
    addNumericStream(activity, DataSpeed.type, new Array(1800).fill(1.05));

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(activity.getStat(DataTrainingStressScoreMethod.type)?.getValue()).toBe(TrainingStressScoreMethod.SWIM_PACE);
    expect(activity.getStat(DataTrainingStressScore.type)?.getValue()).toBeGreaterThan(0);
  });

  it('converts swim-pace zone threshold (sec/100m) to speed for SWIM_PACE TSS', () => {
    const activity = createActivity(ActivityTypes.Swimming, 1800);
    addNumericStream(activity, DataSpeed.type, new Array(1800).fill(1));
    addZoneFiveThreshold(activity, DataSwimPace.type, 100);

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(activity.getStat(DataTrainingStressScoreMethod.type)?.getValue()).toBe(TrainingStressScoreMethod.SWIM_PACE);
    expect(activity.getStat(DataTrainingStressScore.type)?.getValue()).toBeCloseTo(50, 1);
  });

  it('continues SWIM_PACE fallback chain when swim-pace zone threshold is invalid', () => {
    const activity = createActivity(ActivityTypes.Swimming, 1800);
    addNumericStream(activity, DataSpeed.type, new Array(1800).fill(1));
    addZoneFiveThreshold(activity, DataSwimPace.type, 0);
    addZoneFiveThreshold(activity, DataSpeed.type, 1.25);

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(activity.getStat(DataTrainingStressScoreMethod.type)?.getValue()).toBe(TrainingStressScoreMethod.SWIM_PACE);
    expect(activity.getStat(DataTrainingStressScore.type)?.getValue()).toBeCloseTo(25.6, 1);
  });

  it('falls back to MET as last resort', () => {
    const activity = createActivity(ActivityTypes.Running, 1800);
    activity.addStat(new DataEnergy(320));
    activity.addStat(new DataWeight(70));

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(activity.getStat(DataTrainingStressScoreMethod.type)?.getValue()).toBe(TrainingStressScoreMethod.MET);
    expect(activity.getStat(DataTrainingStressScore.type)?.getValue()).toBeGreaterThan(0);
  });

  it('skips pace when vertical speed is missing and heuristic fallbacks are disabled', () => {
    const activity = createActivity(
      ActivityTypes.Running,
      1200,
      new ActivityParsingOptions({
        tss: {
          enableHeuristicFallbacks: false
        }
      })
    );
    addNumericStream(activity, DataSpeed.type, new Array(1200).fill(3));
    addZoneFiveThreshold(activity, DataSpeed.type, 3.2);
    activity.addStat(new DataEnergy(220));
    activity.addStat(new DataWeight(70));

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(activity.getStat(DataTrainingStressScoreMethod.type)?.getValue()).toBe(TrainingStressScoreMethod.MET);
  });

  it('keeps imported fixture TSS untouched and marks it as IMPORTED', async () => {
    const fixturePath = path.join(__dirname, '../../specs/fixtures/rides/fit/7386755164.fit');
    const buffer = fs.readFileSync(fixturePath);
    const event = await EventImporterFIT.getFromArrayBuffer(
      buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
    );
    const activity = event.getFirstActivity();

    expect(activity.getStat(DataTrainingStressScore.type)?.getValue()).toBe(105.4);

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(activity.getStat(DataTrainingStressScore.type)?.getValue()).toBe(105.4);
    expect(activity.getStat(DataTrainingStressScoreMethod.type)?.getValue()).toBe(TrainingStressScoreMethod.IMPORTED);
  });

  it.each(['2026-03-30_11-20.fit', 'laps-issue.fit'])(
    'improves POWER delta vs legacy rolling baseline for %s',
    async fixtureName => {
      const fixturePath = path.join(__dirname, '../../../samples/fit', fixtureName);
      const fixtureBuffer = fs.readFileSync(fixturePath);
      const fixtureArrayBuffer = fixtureBuffer.buffer.slice(
        fixtureBuffer.byteOffset,
        fixtureBuffer.byteOffset + fixtureBuffer.byteLength
      );

      const importedEvent = await EventImporterFIT.getFromArrayBuffer(fixtureArrayBuffer);
      const importedActivity = importedEvent.getFirstActivity();
      const reportedTss = importedActivity.getStat(DataTrainingStressScore.type)?.getValue() as number;
      expect(reportedTss).toBeGreaterThan(0);

      const recomputedEvent = await EventImporterFIT.getFromArrayBuffer(
        fixtureArrayBuffer,
        new ActivityParsingOptions({
          tss: {
            preserveImportedTss: false
          }
        }),
        fixtureName
      );
      const recomputedActivity = recomputedEvent.getFirstActivity();
      const method = recomputedActivity.getStat(DataTrainingStressScoreMethod.type)?.getValue();
      const computedTss = recomputedActivity.getStat(DataTrainingStressScore.type)?.getValue() as number;
      const ftp = recomputedActivity.getStat(DataFTP.type)?.getValue() as number;
      const powerSamples = recomputedActivity
        .getStreamDataByDuration(DataPower.type, true, true)
        .map(sample => ({ duration: sample.time / 1000, power: sample.value as number }));
      const baselineLegacyTssRaw = computeLegacyPowerTssFromSamples(powerSamples, ftp);
      const baselineLegacyTss = baselineLegacyTssRaw === null ? null : Math.round(baselineLegacyTssRaw * 10) / 10;
      const deltaCurrent = Math.abs(computedTss - reportedTss);
      const deltaLegacy = baselineLegacyTss === null ? Infinity : Math.abs(baselineLegacyTss - reportedTss);

      expect(method).toBe(TrainingStressScoreMethod.POWER);
      expect(deltaCurrent).toBeLessThan(deltaLegacy);
    }
  );

  it('keeps TSS unset when no method inputs are available', () => {
    const activity = createActivity(ActivityTypes.Cycling, 1200);

    expect(activity.getStat(DataTrainingStressScore.type)).toBeUndefined();

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(activity.getStat(DataTrainingStressScore.type)).toBeUndefined();
    expect(activity.getStat(DataTrainingStressScoreMethod.type)).toBeUndefined();
  });
});
