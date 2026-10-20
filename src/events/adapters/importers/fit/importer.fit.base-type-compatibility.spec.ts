import { FitEncoder } from 'fit-file-parser/encoder';
import { EventImporterFIT } from './importer.fit';
import { EventImporterJSON } from '../json/importer.json';
import { ActivityTypes } from '../../../../activities/activity.types';
import { DataEnergy } from '../../../../data/data.energy';
import { DataHeartRate } from '../../../../data/data.heart-rate';
import { DataPower } from '../../../../data/data.power';
import { ActivityUtilities } from '../../../utilities/activity.utilities';

const startDate = new Date('2026-01-02T10:00:00Z');
const timestamp = FitEncoder.toFitTimestamp(startDate);

// Synthetic FIT data only; no production payloads or identifying source values.
function walkingFile(littleEndian: boolean, endianFlag: boolean, equalSummaryDates: boolean): ArrayBuffer {
  const unsigned = (value: number, size: number): number[] => {
    const bytes = new Uint8Array(size);
    const view = new DataView(bytes.buffer);
    if (size === 4) view.setUint32(0, value, littleEndian);
    else if (size === 2) view.setUint16(0, value, littleEndian);
    else bytes[0] = value;
    return Array.from(bytes);
  };
  const field = (number: number, value: number, size = 4) => ({
    number,
    baseType: size === 1 ? 2 : (size === 2 ? 4 : 6) | (endianFlag ? 0x80 : 0),
    bytes: unsigned(value, size)
  });
  const message = (number: number, fields: ReturnType<typeof field>[]) => [
    0x40,
    0,
    littleEndian ? 0 : 1,
    ...unsigned(number, 2),
    fields.length,
    ...fields.flatMap(value => [value.number, value.bytes.length, value.baseType]),
    0,
    ...fields.flatMap(value => value.bytes)
  ];
  const summary = [
    field(2, timestamp),
    field(253, timestamp + (equalSummaryDates ? 0 : 60)),
    field(7, 60000),
    field(8, 60000),
    field(9, 100000),
    field(11, 7, 2)
  ];
  const messages = [
    ...[0, 30, 60].flatMap((second, index) =>
      message(20, [
        field(253, timestamp + second),
        field(5, (second * 100000) / 60),
        field(3, 140 + index, 1),
        field(7, 257 + index, 2)
      ])
    ),
    ...message(19, summary),
    ...message(18, [...summary, { ...field(5, 11, 1), baseType: 0 }, field(35, 423, 2)])
  ];
  const bytes = new Uint8Array(12 + messages.length + 2);
  const view = new DataView(bytes.buffer);
  bytes.set([12, 0x20, 1, 0]);
  view.setUint32(4, messages.length, true);
  bytes.set([0x2e, 0x46, 0x49, 0x54], 8);
  bytes.set(messages, 12);
  view.setUint16(bytes.length - 2, FitEncoder.calculateCRC(bytes.subarray(0, -2)), true);
  return bytes.buffer;
}

describe('FIT numeric base types without endian flags', () => {
  it.each([
    [false, false],
    [true, false],
    [false, true],
    [true, true]
  ])(
    'recovers activity dates and measurements (little endian: %s, equal summary dates: %s)',
    async (littleEndian, equalSummaryDates) => {
      const event = await EventImporterFIT.getFromArrayBuffer(walkingFile(littleEndian, false, equalSummaryDates));
      const expected = (
        await EventImporterFIT.getFromArrayBuffer(walkingFile(littleEndian, true, equalSummaryDates))
      ).getFirstActivity();
      const activity = event.getFirstActivity();
      expect(event.getActivities()).toHaveLength(1);
      expect(activity.type).toBe(ActivityTypes.Walking);
      expect([activity.startDate, activity.endDate]).toEqual([startDate, new Date(+startDate + 60000)]);
      expect(activity.getDuration()!.getValue()).toBe(60);
      expect(activity.getDistance().getValue()).toBe(1000);
      expect(activity.getStat(DataEnergy.type)?.getValue()).toBe(7);
      for (const type of [DataHeartRate.type, DataPower.type]) {
        expect(activity.getStreamData(type)).toEqual(expected.getStreamData(type));
      }
      expect(activity.getStream(DataHeartRate.type).getData(true, true)).toEqual([140, 141, 142]);
      expect(activity.getStream(DataPower.type).getData(true, true)).toEqual([257, 258, 259]);
      expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity)).toEqual(
        ActivityUtilities.getTrainingStressScoreEvaluations(expected)
      );
      expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic).toMatchObject({
        method: 'IMPORTED',
        score: 42.3
      });
      const restored = EventImporterJSON.getEventFromJSON(event.toJSON()).getFirstActivity();
      expect([restored.startDate, restored.endDate]).toEqual([activity.startDate, activity.endDate]);
      expect(restored.getDistance().getValue()).toBe(1000);
    }
  );
});
