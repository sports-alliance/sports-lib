import * as fs from 'fs';
import * as path from 'path';
import { EventImporterFIT } from './importer.fit';
import { DataMovingTime } from '../../../../data/data.moving-time';
import { DataEffortPaceAvg } from '../../../../data/data.effort-pace-avg';
import { DataEffortPaceMin } from '../../../../data/data.effort-pace-min';
import { DataEffortPaceMax } from '../../../../data/data.effort-pace-max';
import { DataEffortPace } from '../../../../data/data.effort-pace';
import { DataDepthMax } from '../../../../data/data.depth-max';
import { DataAvgStrokeDistance } from '../../../../data/data.avg-stroke-distance';
import { DataAvgStrokeCount } from '../../../../data/data.avg-stroke-count';
import { Activity } from '../../../../activities/activity';
import { ActivityTypes } from '../../../../activities/activity.types';
import { Creator } from '../../../../creators/creator';
import { DataVerticalOscillationAvg } from '../../../../data/data.vertical-oscillation-avg';
import { DataVerticalRatioAvg } from '../../../../data/data.vertical-ratio-avg';
import { DataGroundContactTimeAvg } from '../../../../data/data.ground-contact-time-avg';
import { DataGradeAvg } from '../../../../data/data.grade-avg';
import { DataGradeMin } from '../../../../data/data.grade-min';
import { DataGradeMax } from '../../../../data/data.grade-max';
import { DataRecoveryTime } from '../../../../data/data.recovery-time';
import { DataVO2Max } from '../../../../data/data.vo2-max';
import { convertSpeedToPace } from '../../../utilities/helpers';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';

describe('EventImporterFIT session stats mapping', () => {
  const toArrayBuffer = (filePath: string): ArrayBuffer => {
    const fileContent = fs.readFileSync(filePath);
    return fileContent.buffer.slice(fileContent.byteOffset, fileContent.byteOffset + fileContent.byteLength);
  };

  it('should use session total_moving_time when available', async () => {
    const fitFilePath = path.join(__dirname, '../../../../specs/fixtures/rides/fit/971150603.fit');
    const event = await EventImporterFIT.getFromArrayBuffer(toArrayBuffer(fitFilePath));
    const activity = event.getFirstActivity();

    const movingTime = activity.getStat(DataMovingTime.type);
    expect(movingTime).toBeDefined();
    expect(movingTime!.getValue()).toBe(3802);
  });

  it('should map session Effort Pace summary stat', async () => {
    const fitFilePath = path.join(__dirname, '../../../../../samples/coros/step-effort.fit');
    if (!fs.existsSync(fitFilePath)) {
      console.warn(`Sample file not found at ${fitFilePath}. Skipping test.`);
      return;
    }

    const event = await EventImporterFIT.getFromArrayBuffer(toArrayBuffer(fitFilePath));
    const activity = event.getFirstActivity();

    const effortPace = activity.getStat(DataEffortPaceAvg.type);
    expect(effortPace).toBeDefined();
    expect(effortPace!.getValue()).toBeCloseTo(convertSpeedToPace(3.412), 3);
  });

  it('should parse Effort Pace stream and stats for 2026-01-31_10-51_2.fit', async () => {
    const fitFilePath = path.join(__dirname, '../../../../../samples/fit/2026-01-31_10-51_2.fit');
    if (!fs.existsSync(fitFilePath)) {
      console.warn(`Sample file not found at ${fitFilePath}. Skipping test.`);
      return;
    }

    const event = await EventImporterFIT.getFromArrayBuffer(toArrayBuffer(fitFilePath));
    const activity = event.getFirstActivity();

    const effortPaceStream = activity
      .getStreamData(DataEffortPace.type)
      .filter((value): value is number => Number.isFinite(value));

    const effortPaceAvg = activity.getStat(DataEffortPaceAvg.type);
    const effortPaceMin = activity.getStat(DataEffortPaceMin.type);
    const effortPaceMax = activity.getStat(DataEffortPaceMax.type);

    expect(effortPaceStream.length).toBeGreaterThan(3000);
    expect(effortPaceAvg).toBeDefined();
    expect(effortPaceMin).toBeDefined();
    expect(effortPaceMax).toBeDefined();

    const minValue = Number(effortPaceMin!.getValue());
    const avgValue = Number(effortPaceAvg!.getValue());
    const maxValue = Number(effortPaceMax!.getValue());

    expect(Number.isFinite(minValue)).toBe(true);
    expect(Number.isFinite(avgValue)).toBe(true);
    expect(Number.isFinite(maxValue)).toBe(true);
    expect(minValue).toBeLessThanOrEqual(avgValue);
    expect(avgValue).toBeLessThanOrEqual(maxValue);
  });

  it('should map session max_depth to Maximum Depth stat', async () => {
    const fitFilePath = path.join(__dirname, '../../../../../samples/fit/2025-08-27_10-52.fit');
    if (!fs.existsSync(fitFilePath)) {
      console.warn(`Sample file not found at ${fitFilePath}. Skipping test.`);
      return;
    }

    const event = await EventImporterFIT.getFromArrayBuffer(toArrayBuffer(fitFilePath));
    const activity = event.getFirstActivity();

    const maxDepth = activity.getStat(DataDepthMax.type);
    expect(maxDepth).toBeDefined();
    expect(maxDepth!.getValue()).toBeCloseTo(3.86, 2);
  });

  it('should ignore zero VO2 max and recovery time activity metrics', async () => {
    const fitFilePath = path.join(__dirname, '../../../../../samples/fit/2025-10-17_12-26.fit');
    if (!fs.existsSync(fitFilePath)) {
      console.warn(`Sample file not found at ${fitFilePath}. Skipping test.`);
      return;
    }

    const event = await EventImporterFIT.getFromArrayBuffer(toArrayBuffer(fitFilePath));
    const activity = event.getFirstActivity();

    const vo2Max = activity.getStat(DataVO2Max.type);
    const recoveryTime = activity.getStat(DataRecoveryTime.type);

    expect(vo2Max).toBeUndefined();
    expect(recoveryTime).toBeUndefined();
  });

  it('should prefer Garmin activity metrics VO2 max over user metrics VO2 max', async () => {
    const fitFilePath = path.join(__dirname, '../../../../../samples/fit/2026-05-04_16-22.fit');
    if (!fs.existsSync(fitFilePath)) {
      console.warn(`Sample file not found at ${fitFilePath}. Skipping test.`);
      return;
    }

    const event = await EventImporterFIT.getFromArrayBuffer(toArrayBuffer(fitFilePath));
    const activity = event.getFirstActivity();

    const vo2Max = activity.getStat(DataVO2Max.type);

    expect(vo2Max).toBeDefined();
    expect(vo2Max!.getValue()).toBeCloseTo(56.58073425292969, 6);
  });

  it('should fall back to Garmin user metrics VO2 max when activity metrics VO2 max is invalid', () => {
    const startTime = new Date('2026-05-04T13:22:31.000Z');
    const endTime = new Date('2026-05-04T13:32:31.000Z');
    const activity = (EventImporterFIT as any).getActivityFromSessionObject(
      {
        start_time: startTime,
        timestamp: endTime,
        total_elapsed_time: 600,
        total_timer_time: 600,
        sport: 'cycling',
        laps: []
      },
      {
        file_ids: [{ manufacturer: 'garmin', product: 4655 }],
        records: [],
        events: [],
        laps: [],
        activity_metrics: [{ sport: 'cycling', vo2_max: 114688, first_vo2_max: 0, recovery_time: 0 }],
        user_metrics: [{ start_of_activity: startTime, vo2_max: 53.18017578125, first_vo2_max: 53.18 }]
      },
      ActivityParsingOptions.DEFAULT
    );

    const vo2Max = activity.getStat(DataVO2Max.type);

    expect(vo2Max).toBeDefined();
    expect(vo2Max!.getValue()).toBeCloseTo(53.18017578125, 6);
  });

  it('should ignore irrational Garmin VO2 max values', () => {
    const startTime = new Date('2026-05-04T13:22:31.000Z');
    const endTime = new Date('2026-05-04T13:32:31.000Z');
    const activity = (EventImporterFIT as any).getActivityFromSessionObject(
      {
        start_time: startTime,
        timestamp: endTime,
        total_elapsed_time: 600,
        total_timer_time: 600,
        sport: 'cycling',
        laps: []
      },
      {
        file_ids: [{ manufacturer: 'garmin', product: 4655 }],
        records: [],
        events: [],
        laps: [],
        activity_metrics: [{ sport: 'cycling', vo2_max: 114688, first_vo2_max: 0, recovery_time: 0 }],
        user_metrics: [{ start_of_activity: startTime, vo2_max: 500, first_vo2_max: -1 }]
      },
      ActivityParsingOptions.DEFAULT
    );

    expect(activity.getStat(DataVO2Max.type)).toBeUndefined();
  });

  it('should map swim session stroke summary stats', async () => {
    const fitFilePath = path.join(__dirname, '../../../../specs/fixtures/swim/fit/7617306288.fit');
    const event = await EventImporterFIT.getFromArrayBuffer(toArrayBuffer(fitFilePath));
    const activity = event.getFirstActivity();

    const avgStrokeDistance = activity.getStat(DataAvgStrokeDistance.type);
    const avgStrokeCount = activity.getStat(DataAvgStrokeCount.type);

    expect(avgStrokeDistance).toBeDefined();
    expect(avgStrokeDistance!.getValue()).toBeCloseTo(2.11, 2);

    expect(avgStrokeCount).toBeDefined();
    expect(avgStrokeCount!.getValue()).toBeCloseTo(11.8, 1);
  });

  it('should map running dynamics and grade summary from session fields when available', () => {
    const activity = new Activity(new Date(0), new Date(10_000), ActivityTypes.Running, new Creator('test'));
    const stats = EventImporterFIT.getStatsFromObject(
      {
        total_elapsed_time: 10,
        total_timer_time: 10,
        avg_stance_time: 271.3,
        avg_vertical_oscillation: 97.2,
        avg_vertical_ratio: 9.57,
        avg_grade: 0.13,
        max_pos_grade: 4.47,
        max_neg_grade: -3.84
      },
      activity,
      false
    );

    const getStat = (type: string) => stats.find(stat => stat.getType() === type);

    expect(getStat(DataGroundContactTimeAvg.type)?.getValue()).toBe(271.3);

    expect(getStat(DataVerticalOscillationAvg.type)?.getValue()).toBe(97.2);

    expect(getStat(DataVerticalRatioAvg.type)?.getValue()).toBe(9.57);

    expect(getStat(DataGradeAvg.type)?.getValue()).toBe(0.13);
    expect(getStat(DataGradeMin.type)?.getValue()).toBe(-3.84);
    expect(getStat(DataGradeMax.type)?.getValue()).toBe(4.47);
  });

  it('should map grade min/max/avg from FIT session summary when fields exist', async () => {
    const fitFilePath = path.join(__dirname, '../../../../specs/fixtures/rides/fit/7739869618.fit');
    const event = await EventImporterFIT.getFromArrayBuffer(toArrayBuffer(fitFilePath));
    const activity = event.getFirstActivity();

    const avgGrade = activity.getStat(DataGradeAvg.type);
    const minGrade = activity.getStat(DataGradeMin.type);
    const maxGrade = activity.getStat(DataGradeMax.type);

    expect(avgGrade).toBeDefined();
    expect(minGrade).toBeDefined();
    expect(maxGrade).toBeDefined();
    expect(avgGrade!.getValue()).toBeCloseTo(0.13, 2);
    expect(minGrade!.getValue()).toBeCloseTo(-3.84, 2);
    expect(maxGrade!.getValue()).toBeCloseTo(4.47, 2);
  });
});
