import { FitBaseType as B, FitEncoder } from 'fit-file-parser/encoder';
import { EventImporterFIT } from './importer.fit';
import { EventImporterJSON } from '../json/importer.json';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { DataPower } from '../../../../data/data.power';
import { DataPowerLeft } from '../../../../data/data.power-left';
import { DataPowerRight } from '../../../../data/data.power-right';
import { DataPowerBalanceLeft } from '../../../../data/data.power-balance-left';
import { DataPowerBalanceRight } from '../../../../data/data.power-balance-right';

function fixture(balances: number[], summary?: number) {
  const start = FitEncoder.toFitTimestamp(new Date('2026-01-01T10:00:00Z'));
  const f = (number: number, value: number, baseType = B.Uint8) => ({
    number,
    value,
    baseType,
    size: baseType === B.Uint32 ? 4 : baseType === B.Uint16 ? 2 : 1
  });
  const encoder = new FitEncoder();
  encoder.writeMessage(0, [f(0, 4, B.Enum), f(1, 1, B.Uint16), f(4, start, B.Uint32)]);
  balances.forEach((balance, i) =>
    encoder.writeMessage(20, [f(253, start + i, B.Uint32), f(7, i === 2 ? 0 : 200, B.Uint16), f(30, balance)], 1)
  );
  const seconds = balances.length - 1;
  encoder.writeMessage(
    18,
    [
      f(254, 0, B.Uint16),
      f(2, start, B.Uint32),
      f(253, start + seconds, B.Uint32),
      f(5, 2, B.Enum),
      f(7, seconds * 1000, B.Uint32),
      f(8, seconds * 1000, B.Uint32),
      ...(summary === undefined ? [] : [f(37, summary, B.Uint16)])
    ],
    2
  );
  return Buffer.from(encoder.close());
}

describe('FIT invalid record balance isolation', () => {
  it.each([undefined, 0x8000 + 4833])(
    'keeps missing side power and preserves total power with summary %s',
    async summary => {
      // 0xE5 and 0xE7 encode 101% and 103% on the right; 0xFF is the FIT missing sentinel.
      let event = await EventImporterFIT.getFromArrayBuffer(
        fixture([178, 229, 231, 128, 228, 255, 178], summary),
        new ActivityParsingOptions({ generateUnitStreams: false })
      );
      const expectedPower = [200, 200, 0, 200, 200, 200, 200];
      const expectedLeft = [50, null, null, 100, 0, null, 50];
      const expectedRight = [50, null, null, 0, 100, null, 50];
      const totalMetrics = () => {
        const activity = event.getFirstActivity();
        return JSON.stringify({
          coverage: ActivityUtilities.getPowerCoverage(activity),
          tss: ActivityUtilities.getTrainingStressScoreEvaluations(activity)
        });
      };
      const originalMetrics = totalMetrics();
      for (let pass = 0; pass < 3; pass++) {
        const activity = event.getFirstActivity();
        expect(activity.getStreamData(DataPower.type)).toEqual(expectedPower);
        expect(activity.getStreamData(DataPowerBalanceLeft.type)).toEqual(expectedLeft);
        expect(activity.getStreamData(DataPowerBalanceRight.type)).toEqual(expectedRight);
        expect(activity.getStreamData(DataPowerLeft.type)).toEqual([100, null, null, 200, 0, null, 100]);
        expect(activity.getStreamData(DataPowerRight.type)).toEqual([100, null, null, 0, 200, null, 100]);
        expect(totalMetrics()).toBe(originalMetrics);
        if (summary !== undefined) {
          expect(activity.getStat(DataPowerBalanceLeft.type)?.getValue()).toBe(51.67);
          expect(activity.getStat(DataPowerBalanceRight.type)?.getValue()).toBe(48.33);
        } else {
          expect(activity.getStat(DataPowerBalanceLeft.type)?.getValue()).toBe(50);
          expect(activity.getStat(DataPowerBalanceRight.type)?.getValue()).toBe(50);
        }
        ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
        event = EventImporterJSON.getEventFromJSON(JSON.parse(JSON.stringify(event.toJSON())));
      }
    }
  );

  it('retains total power when every balance observation is invalid', async () => {
    const event = await EventImporterFIT.getFromArrayBuffer(
      fixture([229, 231, 229]),
      new ActivityParsingOptions({ generateUnitStreams: false })
    );
    const activity = event.getFirstActivity();
    expect(activity.getStreamData(DataPower.type)).toEqual([200, 200, 0]);
    for (const type of [
      DataPowerBalanceLeft.type,
      DataPowerBalanceRight.type,
      DataPowerLeft.type,
      DataPowerRight.type
    ]) {
      expect(activity.hasStreamData(type)).toBe(false);
      expect(activity.getStat(type)).toBeUndefined();
    }
  });
});
