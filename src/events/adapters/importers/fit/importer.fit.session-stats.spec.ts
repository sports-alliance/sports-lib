import * as fs from 'fs';
import * as path from 'path';
import { EventImporterFIT } from './importer.fit';
import { DataMovingTime } from '../../../../data/data.moving-time';
import { DataEffortPace } from '../../../../data/data.effort-pace';
import { DataDepthMax } from '../../../../data/data.depth-max';
import { DataAvgStrokeDistance } from '../../../../data/data.avg-stroke-distance';
import { DataAvgStrokeCount } from '../../../../data/data.avg-stroke-count';

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

    const effortPace = activity.getStat(DataEffortPace.type);
    expect(effortPace).toBeDefined();
    expect(effortPace!.getValue()).toBeCloseTo(3.412, 3);
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
});
