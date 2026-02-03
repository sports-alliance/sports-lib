import * as fs from 'fs';
import * as path from 'path';
import { EventImporterFIT } from './importer.fit';
import { DataStepLength } from '../../../../data/data.step-length';
import { DataEffortPace } from '../../../../data/data.effort-pace';
import { DataAvgStrideLength } from '../../../../data/data.avg-stride-length';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';

describe('EventImporterFIT COROS Running', () => {
  const fitFilePath = path.join(__dirname, '../../../../../samples/coros/step-effort.fit');

  it('should parse step-effort.fit and extract step length stream from records', async () => {
    const fileContent = fs.readFileSync(fitFilePath);
    const arrayBuffer = fileContent.buffer.slice(
      fileContent.byteOffset,
      fileContent.byteOffset + fileContent.byteLength
    );

    const options = new ActivityParsingOptions({ generateUnitStreams: false });
    const event = await EventImporterFIT.getFromArrayBuffer(arrayBuffer, options, 'COROS Step Effort Activity');
    const activity = event.getFirstActivity();

    // Check for Step Length stream (from records)
    const stepLengthStream = activity.getStreamData(DataStepLength.type);
    expect(stepLengthStream).toBeDefined();
    expect(stepLengthStream.length).toBeGreaterThan(3000); // File has ~3883 records

    // Step length values should be in meters (converted from mm)
    // Typical running step length is 0.5-1.5 meters
    const validValues = stepLengthStream.filter((val: number | null) => val !== null && val > 0.3 && val < 2.0);
    expect(validValues.length).toBeGreaterThan(3000); // Most values should be valid

    // Check first valid value is around expected range (0.86m from debug output)
    const firstValid = stepLengthStream.find((val: number | null) => val !== null);
    expect(firstValid).toBeGreaterThan(0.5);
    expect(firstValid).toBeLessThan(1.5);
  });

  it('should parse step-effort.fit and extract Effort Pace stream from records', async () => {
    const fileContent = fs.readFileSync(fitFilePath);
    const arrayBuffer = fileContent.buffer.slice(
      fileContent.byteOffset,
      fileContent.byteOffset + fileContent.byteLength
    );

    const options = new ActivityParsingOptions({ generateUnitStreams: false });
    const event = await EventImporterFIT.getFromArrayBuffer(arrayBuffer, options, 'COROS Step Effort Activity');
    const activity = event.getFirstActivity();

    // Check for Effort Pace stream (from records - COROS developer field)
    const effortPaceStream = activity.getStreamData(DataEffortPace.type);
    expect(effortPaceStream).toBeDefined();
    expect(effortPaceStream.length).toBeGreaterThan(0);
    // Effort Pace values should be in m/s (typical running speed 2-5 m/s)
    const validValues = effortPaceStream.filter((val: number | null) => val !== null && val > 1.0 && val < 6.0);
    expect(validValues.length).toBeGreaterThan(0);
  });

  it('should parse step-effort.fit and extract avg stride length stat from session', async () => {
    const fileContent = fs.readFileSync(fitFilePath);
    const arrayBuffer = fileContent.buffer.slice(
      fileContent.byteOffset,
      fileContent.byteOffset + fileContent.byteLength
    );

    const options = new ActivityParsingOptions({ generateUnitStreams: false });
    const event = await EventImporterFIT.getFromArrayBuffer(arrayBuffer, options, 'COROS Step Effort Activity');
    const activity = event.getFirstActivity();

    // Check for Avg Stride Length stat (from session)
    const avgStrideLengthStat = activity.getStat(DataAvgStrideLength.type);
    expect(avgStrideLengthStat).toBeDefined();
    if (avgStrideLengthStat) {
      // Avg stride length should be in meters (0.5-1.5m typical)
      expect(avgStrideLengthStat.getValue()).toBeGreaterThan(0.3);
      expect(avgStrideLengthStat.getValue()).toBeLessThan(2.0);
    }
  });
});
