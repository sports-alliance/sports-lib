import { FitBaseType, FitEncoder } from 'fit-file-parser/encoder';
import { EventImporterFIT } from './importer.fit';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { DataPower } from '../../../../data/data.power';
import { DataPowerNormalized } from '../../../../data/data.power-normalized';
import { DataHeartRate } from '../../../../data/data.heart-rate';

const field = (number: number, value: number, baseType = FitBaseType.Uint8) => ({
  number,
  value,
  baseType,
  size: baseType === FitBaseType.Uint32 ? 4 : baseType === FitBaseType.Uint16 ? 2 : 1
});

async function ride(order: ('hr' | 'power' | 'zero' | 'missing')[], imported?: number) {
  const encoder = new FitEncoder(),
    start = FitEncoder.toFitTimestamp(new Date('2026-01-01T10:00:00Z'));
  encoder.writeMessage(0, [
    field(0, 4, FitBaseType.Enum),
    field(1, 1, FitBaseType.Uint16),
    field(4, start, FitBaseType.Uint32)
  ]);
  for (let second = 0; second <= 3600; second++)
    for (const kind of order) {
      encoder.writeMessage(
        20,
        [
          field(253, start + second, FitBaseType.Uint32),
          ...(kind === 'hr'
            ? [field(3, 100)]
            : kind === 'missing'
              ? []
              : [field(7, kind === 'zero' ? 0 : 250, FitBaseType.Uint16)])
        ],
        kind === 'hr' ? 1 : 2
      );
    }
  encoder.writeMessage(
    18,
    [
      field(254, 0, FitBaseType.Uint16),
      field(253, start + 3600, FitBaseType.Uint32),
      field(2, start, FitBaseType.Uint32),
      field(5, 2, FitBaseType.Enum),
      field(7, 3600000, FitBaseType.Uint32),
      field(8, 3600000, FitBaseType.Uint32),
      field(45, 250, FitBaseType.Uint16),
      ...(imported === undefined ? [] : [field(35, imported * 10, FitBaseType.Uint16)])
    ],
    3
  );
  encoder.writeMessage(
    216,
    [field(0, 18, FitBaseType.Uint16), field(1, 0, FitBaseType.Uint16), field(11, 190), field(12, 55), field(13, 165)],
    4
  );
  return (
    await EventImporterFIT.getFromArrayBuffer(
      new Uint8Array(encoder.close()).buffer,
      new ActivityParsingOptions({ generateUnitStreams: false })
    )
  ).getFirstActivity();
}

const evaluate = ActivityUtilities.getTrainingStressScoreEvaluations;
describe('FIT complementary sensor records', () => {
  it.each([
    ['power', 'hr'],
    ['hr', 'power'],
    ['power', 'missing', 'hr']
  ] as const)('retains power and HR regardless of record order: %j', async (...order) => {
    const activity = await ride(order);
    for (let repeat = 0; repeat < 2; repeat++) {
      expect(new Set(activity.getStreamData(DataPower.type))).toEqual(new Set([250]));
      expect(new Set(activity.getStreamData(DataHeartRate.type))).toEqual(new Set([100]));
      expect(activity.getStat(DataPowerNormalized.type)?.getValue()).toBe(250);
      expect(evaluate(activity).automatic).toMatchObject({ method: 'POWER', score: 100 });
      expect(evaluate(activity).hr).toMatchObject({ method: 'HR', score: 16.2 });
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    }
  });

  it.each([
    { order: ['power', 'zero', 'hr'], watts: 0, score: 0 },
    { order: ['zero', 'hr', 'power'], watts: 250, score: 100 }
  ] as const)('honors the last explicit power observation: $order', async ({ order, watts, score }) => {
    const activity = await ride([...order]);
    expect(new Set(activity.getStreamData(DataPower.type))).toEqual(new Set([watts]));
    expect(evaluate(activity).automatic).toMatchObject({ method: 'POWER', score });
  });

  it('does not invent power when every record omits it', async () => {
    const activity = await ride(['hr', 'missing']);
    expect(activity.hasStreamData(DataPower.type)).toBe(false);
    expect(evaluate(activity).automatic).toMatchObject({ method: 'HR', score: 16.2 });
  });

  it.each([0, 42.5])('preserves imported TSS %s', async imported => {
    const activity = await ride(['power', 'hr'], imported);
    expect(evaluate(activity).automatic).toMatchObject({ method: 'IMPORTED', score: imported });
    expect(activity.getStat(DataPowerNormalized.type)?.getValue()).toBe(250);
  });
});
