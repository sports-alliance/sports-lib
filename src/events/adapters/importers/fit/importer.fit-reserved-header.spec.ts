import { FitBaseType, FitEncoder } from 'fit-file-parser/encoder';
import { EventImporterFIT } from './importer.fit';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { DataHeartRate } from '../../../../data/data.heart-rate';

function cyclingFile(): Uint8Array<ArrayBuffer> {
  const start = FitEncoder.toFitTimestamp(new Date('2026-01-01T10:00:00Z'));
  const encoder = new FitEncoder();
  const uint32 = (number: number, value: number) => ({ number, value, size: 4, baseType: FitBaseType.Uint32 });
  const uint16 = (number: number, value: number) => ({ number, value, size: 2, baseType: FitBaseType.Uint16 });
  encoder.writeMessage(0, [{ number: 0, value: 4, size: 1, baseType: FitBaseType.Enum }, uint32(4, start)]);
  for (let second = 0; second <= 60; second++) {
    encoder.writeMessage(
      20,
      [uint32(253, start + second), { number: 3, value: 100, size: 1, baseType: FitBaseType.Uint8 }],
      1
    );
  }
  encoder.writeMessage(
    18,
    [
      uint32(253, start + 60),
      uint32(2, start),
      { number: 5, value: 2, size: 1, baseType: FitBaseType.Enum },
      uint32(7, 60000),
      uint32(8, 60000),
      uint32(9, 100000),
      uint16(35, 423)
    ],
    2
  );
  return new Uint8Array(encoder.close());
}

// Synthetic fixtures only: change record headers while preserving declared
// fields, message boundaries and valid checksums.
function withReservedHeaders(source: Uint8Array<ArrayBuffer>, mask: number): Uint8Array<ArrayBuffer> {
  const bytes = source.slice();
  const sizes = new Map<number, number>();
  const end = bytes.length - 2;
  for (let offset = bytes[0]; offset < end;) {
    const header = bytes[offset];
    const local = header & 15;
    if (header & 0x40) {
      const fields = bytes[offset + 5];
      let size = 0;
      for (let index = 0; index < fields; index++) size += bytes[offset + 7 + index * 3];
      sizes.set(local, size);
      bytes[offset] |= 0x10;
      offset += 6 + fields * 3;
    } else {
      bytes[offset] |= mask;
      offset += 1 + sizes.get(local)!;
    }
  }
  new DataView(bytes.buffer).setUint16(end, FitEncoder.calculateCRC(bytes.subarray(0, end)), true);
  return bytes;
}

describe('FIT reserved-header compatibility through the activity importer', () => {
  it('recovers complete activities while preserving imported TSS, measurements and evaluations', async () => {
    const source = cyclingFile();
    const expected = (await EventImporterFIT.getFromArrayBuffer(source.buffer)).getActivities()[0];
    const activity = (
      await EventImporterFIT.getFromArrayBuffer(withReservedHeaders(source, 0x10).buffer)
    ).getActivities()[0];
    expect(activity.type).toBe(expected.type);
    expect(activity.getDuration().getValue()).toBe(60);
    expect(activity.getDistance().getValue()).toBe(1000);
    expect(activity.getStreamData(DataHeartRate.type)).toEqual(expected.getStreamData(DataHeartRate.type));
    const evaluations = ActivityUtilities.getTrainingStressScoreEvaluations(activity);
    expect(evaluations).toEqual(ActivityUtilities.getTrainingStressScoreEvaluations(expected));
    expect(evaluations?.automatic).toMatchObject({ method: 'IMPORTED', score: 42.3 });
  });

  it('keeps rejecting the other reserved data-header bit', async () => {
    await expect(
      EventImporterFIT.getFromArrayBuffer(withReservedHeaders(cyclingFile(), 0x20).buffer)
    ).rejects.toThrow();
  });
});
