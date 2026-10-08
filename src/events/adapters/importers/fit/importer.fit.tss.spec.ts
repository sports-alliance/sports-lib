import { FitBaseType, FitEncoder } from 'fit-file-parser/encoder';
import { EventImporterFIT } from './importer.fit';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { ActivityTypes } from '../../../../activities/activity.types';

const field = (number: number, value: number, baseType = FitBaseType.Uint8) => ({ number, value, baseType, size: baseType === FitBaseType.Uint32 ? 4 : baseType === FitBaseType.Uint16 ? 2 : 1 });

describe('FIT walking calibration', () => {
  it.each([true, false])('uses explicit file calibration only (present=%s)', async calibrated => {
    const encoder = new FitEncoder();
    const start = FitEncoder.toFitTimestamp(new Date('2026-01-01T10:00:00Z'));
    encoder.writeMessage(0, [field(0, 4, FitBaseType.Enum), field(1, 1, FitBaseType.Uint16), field(4, start, FitBaseType.Uint32)]);
    for (let second = 0; second <= 3600; second++) {
      encoder.writeMessage(20, [field(253, start + second, FitBaseType.Uint32),
        field(3, second < 1830 ? 78 : second < 3600 ? 86 : 100)], 1);
    }
    encoder.writeMessage(18, [field(254, 0, FitBaseType.Uint16), field(253, start + 3600, FitBaseType.Uint32),
      field(2, start, FitBaseType.Uint32), field(5, 11, FitBaseType.Enum),
      field(7, 3600000, FitBaseType.Uint32), field(8, 3600000, FitBaseType.Uint32), field(17, 100)], 2);
    if (calibrated) encoder.writeMessage(216, [field(0, 18, FitBaseType.Uint16), field(1, 0, FitBaseType.Uint16),
      field(11, 190), field(12, 55), field(13, 165)], 3);
    const encoded = encoder.close();
    const event = await EventImporterFIT.getFromArrayBuffer(
      encoded.buffer.slice(encoded.byteOffset, encoded.byteOffset + encoded.byteLength) as ArrayBuffer);
    const activity = event.getFirstActivity();
    expect(activity.type).toBe(ActivityTypes.Walking);
    const result = ActivityUtilities.getTrainingStressScoreEvaluations(activity);
    expect(result.hr.score).toBe(calibrated ? 7.6 : null);
    expect(result.automatic.method).toBe(calibrated ? 'HR' : null);
  });
});
