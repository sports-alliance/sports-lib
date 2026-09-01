import * as fs from 'fs';
import * as path from 'path';
import { DataGroundContactTimeBalanceLeft } from '../../../../data/data-ground-contact-time-balance-left';
import { DataGroundContactTimeBalanceRight } from '../../../../data/data-ground-contact-time-balance-right';
import {
  DataGroundContactTimePercentage,
  DataGroundContactTimePercentageAvg,
  DataGroundContactTimePercentageMax,
  DataGroundContactTimePercentageMin
} from '../../../../data/data.running-dynamics';
import { DataStanceTime } from '../../../../data/data.stance-time';
import { EventImporterFIT } from './importer.fit';

const toArrayBuffer = (filePath: string): ArrayBuffer => {
  const fileContent = fs.readFileSync(filePath);
  return fileContent.buffer.slice(fileContent.byteOffset, fileContent.byteOffset + fileContent.byteLength);
};

describe('EventImporterFIT canonical running dynamics', () => {
  it('maps FIT stance fields to Ground Contact Time metrics without emitting a legacy Stance Time stream', async () => {
    const fitFilePath = path.join(__dirname, '../../../../specs/fixtures/runs/fit/6860622783.fit');
    const event = await EventImporterFIT.getFromArrayBuffer(toArrayBuffer(fitFilePath));
    const activity = event.getFirstActivity();
    const percentageValues = activity
      .getStreamData(DataGroundContactTimePercentage.type)
      .filter((value): value is number => Number.isFinite(value));

    expect(percentageValues).toHaveLength(560);
    expect(percentageValues[0]).toBe(39.5);
    expect(activity.getStat(DataGroundContactTimePercentageAvg.type)?.getValue()).toBe(37.11);
    expect(activity.getStat(DataGroundContactTimePercentageMin.type)?.getValue()).toBe(30.25);
    expect(activity.getStat(DataGroundContactTimePercentageMax.type)?.getValue()).toBe(44);
    expect(activity.getStat(DataGroundContactTimeBalanceLeft.type)?.getValue()).toBe(49.91);
    expect(activity.getStat(DataGroundContactTimeBalanceRight.type)?.getValue()).toBe(50.09);
    expect(activity.hasStreamData(DataStanceTime.type)).toBe(false);

    const lap = activity.getLaps()[0];
    expect(lap.getStat(DataGroundContactTimePercentageAvg.type)?.getValue()).toBe(37.11);
    expect(lap.getStat(DataGroundContactTimeBalanceLeft.type)?.getValue()).toBe(49.91);
    expect(lap.getStat(DataGroundContactTimeBalanceRight.type)?.getValue()).toBe(50.09);
  });
});
