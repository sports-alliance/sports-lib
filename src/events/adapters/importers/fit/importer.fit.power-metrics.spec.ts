import { FitBaseType as B, FitEncoder } from 'fit-file-parser/encoder';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { EventImporterFIT } from './importer.fit';
import { EventImporterJSON } from '../json/importer.json';
import { ActivityUtilities } from '../../../utilities/activity.utilities';

const start = FitEncoder.toFitTimestamp(new Date('2026-01-01T10:00:00Z'));
const field = (number: number, value: number, baseType = B.Uint8) => ({
  number, value, baseType,
  size: baseType === B.Uint32 ? 4 : baseType === B.Uint16 ? 2 : 1
});

async function ride(rightEncoded: boolean, suppliedSummaries: boolean) {
  const encoder = new FitEncoder();
  const zones = Buffer.alloc(32);
  [0, 1000, 2000, 3000, 0, 0, 0, 0].forEach((value, i) => zones.writeUInt32LE(value, i * 4));
  encoder.writeMessage(0, [field(0, 4, B.Enum), field(1, 1, B.Uint16), field(4, start, B.Uint32)]);
  const power = [200, 0, null, 300, 200, null, 220];
  const leftBalance = [0, 100, 51, 49, null, 52, 60];
  power.forEach((watts, second) => encoder.writeMessage(20, [
    field(253, start + second, B.Uint32), field(3, 120),
    ...(watts === null ? [] : [field(7, watts, B.Uint16)]),
    field(29, second * 100, B.Uint32), // Accumulated power is an independent recorded field.
    ...(leftBalance[second] === null ? [] : [field(30,
      rightEncoded ? 0x80 | (100 - leftBalance[second]!) : leftBalance[second]!)]),
    // Percentage fields use scale 2. Zero is a real reading, not missing.
    ...(second === 2 ? [] : [field(43, 0), field(44, 160), field(45, 0), field(46, 50)])
  ], 1));
  for (let lap = 0; lap < 2; lap++) encoder.writeMessage(19, [
    field(254, lap, B.Uint16), field(2, start + lap * 3, B.Uint32),
    field(253, start + (lap + 1) * 3, B.Uint32),
    field(7, 3000, B.Uint32), field(8, 3000, B.Uint32),
    ...(suppliedSummaries ? [
      field(19, 111 + lap, B.Uint16), field(20, 333, B.Uint16), field(33, 234, B.Uint16),
      field(41, 40000 + lap * 1000, B.Uint32),
      field(91, 120), field(92, 140), field(93, 40), field(94, 60)
    ] : [])
  ], 2);
  encoder.writeMessage(18, [
    field(254, 0, B.Uint16), field(253, start + 6, B.Uint32), field(2, start, B.Uint32),
    field(5, 2, B.Enum), field(7, 6000, B.Uint32), field(8, 6000, B.Uint32),
    field(25, 0, B.Uint16), field(26, 2, B.Uint16),
    ...(suppliedSummaries ? [
      field(20, 123, B.Uint16), field(21, 333, B.Uint16), field(34, 234, B.Uint16),
      field(35, 123, B.Uint16), field(36, 936, B.Uint16), field(45, 250, B.Uint16),
      field(48, 456000, B.Uint32), { number: 68, value: zones, size: zones.length, baseType: B.Uint32 },
      field(101, 120), field(102, 140), field(103, 40), field(104, 60)
    ] : [])
  ], 3);
  return EventImporterFIT.getFromArrayBuffer(Buffer.from(encoder.close()), new ActivityParsingOptions({ generateUnitStreams: false }));
}

describe('FIT power-related metrics', () => {
  it.each([false, true])('preserves balance, pedal readings and side watts with right-encoded balance=%s', async right => {
    const original = await ride(right, false);
    let event = original;
    for (let cycle = 0; cycle < 3; cycle++) {
      const activity = event.getFirstActivity();
      expect(activity.getStreamData('Power')).toEqual([200, 0, null, 300, 200, null, 220]);
      expect(activity.getStreamData('Power Balance Left')).toEqual([0, 100, 51, 49, null, 52, 60]);
      expect(activity.getStreamData('Power Balance Right')).toEqual([100, 0, 49, 51, null, 48, 40]);
      expect(activity.getStreamData('Power Left')).toEqual([0, 0, null, 147, null, null, 132]);
      expect(activity.getStreamData('Power Right')).toEqual([200, 0, null, 153, null, null, 88]);
      expect(activity.getStreamData('Accumulated Power')).toEqual([0, 100, 200, 300, 400, 500, 600]);
      for (const [type, value] of [
        ['Left Torque Effectiveness', 0], ['Right Torque Effectiveness', 80],
        ['Left Pedal Smoothness', 0], ['Right Pedal Smoothness', 25]
      ] as const) expect(activity.getStreamData(type)).toEqual([value, value, null, value, value, value, value]);
      expect(activity.getStat('Power Balance Left')?.getValue()).toBe(52);
      expect(activity.getStat('Power Balance Right')?.getValue()).toBe(48);
      // Power averages use supported active seconds; balance is independently recorded.
      expect(activity.getStat('Average Power')?.getValue()).toBe(175);
      expect(activity.getStat('Power Work')).toBeUndefined();
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
      event = EventImporterJSON.getEventFromJSON(JSON.parse(JSON.stringify(event.toJSON())));
    }
  });

  it('preserves supplied activity and lap power summaries through repeated JSON restoration', async () => {
    let event = await ride(true, true);
    const shared = {
      'Maximum Power': 333, 'Power Normalized': 234,
      'Power Torque Effectiveness Left': 60, 'Power Torque Effectiveness Right': 70,
      'Power Pedal Smoothness Left': 20, 'Power Pedal Smoothness Right': 30
    };
    for (let cycle = 0; cycle < 3; cycle++) {
      const activity = event.getFirstActivity();
      for (const [type, value] of Object.entries({
        ...shared, 'Average Power': 123, 'Power Work': 456, FTP: 250,
        'Power Intensity Factor': 0.936, 'Training Stress Score': 12.3,
        'Power Zone One Duration': 1, 'Power Zone Two Duration': 2, 'Power Zone Three Duration': 3
      })) expect(activity.getStat(type)?.getValue()).toBe(value);
      expect(activity.getLaps()).toHaveLength(2);
      activity.getLaps().forEach((lap, i) => {
        for (const [type, value] of Object.entries({ ...shared, 'Average Power': 111 + i, 'Power Work': 40 + i })) {
          expect(lap.getStat(type)?.getValue()).toBe(value);
        }
      });
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
      event = EventImporterJSON.getEventFromJSON(JSON.parse(JSON.stringify(event.toJSON())));
    }
  });
});
