import * as fs from 'fs';
import * as path from 'path';
import { EventImporterFIT } from './importer.fit';
import { DataGroundTime } from '../../../../data/data.ground-time';
import { DataGroundContactTime } from '../../../../data/data.ground-contact-time';

const toArrayBuffer = (filePath: string): ArrayBuffer => {
  const fileContent = fs.readFileSync(filePath);
  return fileContent.buffer.slice(fileContent.byteOffset, fileContent.byteOffset + fileContent.byteLength);
};

const getFiniteValues = (values: Array<number | null | undefined>): number[] => {
  return values.filter((value): value is number => Number.isFinite(value));
};

describe('EventImporterFIT Ground Time integration', () => {
  it('should fallback Ground Contact Time to Ground Time when stance_time is missing', async () => {
    const fitFilePath = path.join(__dirname, '../../../../specs/fixtures/runs/fit/6782987395.fit');
    const event = await EventImporterFIT.getFromArrayBuffer(toArrayBuffer(fitFilePath));
    const activity = event.getFirstActivity();

    expect(activity.hasStreamData(DataGroundTime.type)).toBe(true);
    expect(activity.hasStreamData(DataGroundContactTime.type)).toBe(true);

    const groundTimeValues = getFiniteValues(activity.getStreamData(DataGroundTime.type));
    const groundContactTimeValues = getFiniteValues(activity.getStreamData(DataGroundContactTime.type));

    expect(groundTimeValues.length).toBeGreaterThan(0);
    expect(groundContactTimeValues.length).toBeGreaterThan(0);
    expect(groundTimeValues[0]).toBe(1216);
    expect(groundContactTimeValues[0]).toBe(1216);
  });

  it('should keep Ground Time and Ground Contact Time separated when stance_time exists', async () => {
    const fitFilePath = path.join(__dirname, '../../../../specs/fixtures/runs/fit/6860622783.fit');
    const event = await EventImporterFIT.getFromArrayBuffer(toArrayBuffer(fitFilePath));
    const activity = event.getFirstActivity();

    const groundTimeValues = getFiniteValues(activity.getStreamData(DataGroundTime.type));
    const groundContactTimeValues = getFiniteValues(activity.getStreamData(DataGroundContactTime.type));

    expect(groundTimeValues.length).toBeGreaterThan(0);
    expect(groundContactTimeValues.length).toBeGreaterThan(0);
    expect(groundTimeValues[0]).toBe(0);
    expect(groundContactTimeValues[0]).toBe(296);
    expect(groundContactTimeValues[0]).not.toBe(groundTimeValues[0]);
  });
});
