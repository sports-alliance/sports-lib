import { FitBaseType as B, FitEncoder } from 'fit-file-parser/encoder';
import { getFitSummaryPowerBalance } from './fit-power-balance';
import { EventImporterFIT } from './importer.fit';
import { EventImporterJSON } from '../json/importer.json';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { DataPowerBalanceLeft } from '../../../../data/data.power-balance-left';
import { DataPowerBalanceRight } from '../../../../data/data.power-balance-right';
import { DynamicDataLoader } from '../../../../data/data.store';
import * as DataStore from '../../../../data';

const record = (value: number, right = false) => ({ left_right_balance: { value, right } });

describe('FIT summary power balance', () => {
  it.each([undefined, null, {}, { value: -1, right: false }, { value: 10001, right: false },
    { value: NaN, right: false }, { value: Infinity, right: false }, { value: '5000', right: false },
    { value: 5000.5, right: false }, { value: 5000, right: 0 }])('rejects invalid summary %j', left_right_balance => {
    expect(getFitSummaryPowerBalance({ left_right_balance })).toBeNull();
  });

  it('keeps genuine fractional balances and rejects evidenced unit ambiguity without rescaling', () => {
    expect(getFitSummaryPowerBalance({ ...record(50), records: [record(0), record(1)] })).toEqual({ left: 0.5, right: 99.5 });
    expect(getFitSummaryPowerBalance(record(50))).toEqual({ left: 0.5, right: 99.5 });
    expect(getFitSummaryPowerBalance({ ...record(50), records: [record(50)] })).toBeNull();
    expect(getFitSummaryPowerBalance({ ...record(49), laps: [{ records: [record(47), record(53)] }] })).toBeNull();
    expect(getFitSummaryPowerBalance({ ...record(49, true), records: [record(47, true), record(53, true)] })).toBeNull();
    expect(getFitSummaryPowerBalance({ ...record(0x80 | 47), records: [record(48), record(55)] })).toBeNull();
    expect(getFitSummaryPowerBalance({ ...record(0x80 | 49), records: [record(48), record(55)] })).toBeNull();
    expect(getFitSummaryPowerBalance({ ...record(175), records: [record(1), record(2)] })).toEqual({ left: 1.75, right: 98.25 });
    // A properly scaled supplied mean need not equal the mean of the available records.
    expect(getFitSummaryPowerBalance({ ...record(4000), records: [record(50)] })).toEqual({ left: 40, right: 60 });
  });

  it.each([[0, 0], [10000, 100], [4833, 48.33], [0x8000, 100], [0x8000 + 10000, 0], [0x8000 + 6000, 40]])(
    'preserves supplied session/lap balance %i through FIT parsing and JSON', async (encoded, left) => {
      const start = FitEncoder.toFitTimestamp(new Date('2026-01-01T10:00:00Z'));
      const f = (number: number, value: number, baseType = B.Uint8) => ({
        number, value, baseType, size: baseType === B.Uint32 ? 4 : baseType === B.Uint16 ? 2 : 1
      });
      const e = new FitEncoder();
      e.writeMessage(0, [f(0, 4, B.Enum), f(1, 1, B.Uint16), f(4, start, B.Uint32)]);
      for (let i = 0; i <= 3; i++) e.writeMessage(20, [f(253, start + i, B.Uint32), f(7, 200, B.Uint16), f(30, 50)], 1);
      e.writeMessage(19, [f(254, 0, B.Uint16), f(2, start, B.Uint32), f(253, start + 3, B.Uint32),
        f(7, 3000, B.Uint32), f(8, 3000, B.Uint32), f(34, encoded, B.Uint16)], 2);
      e.writeMessage(18, [f(254, 0, B.Uint16), f(2, start, B.Uint32), f(253, start + 3, B.Uint32),
        f(5, 2, B.Enum), f(7, 3000, B.Uint32), f(8, 3000, B.Uint32), f(25, 0, B.Uint16), f(26, 1, B.Uint16),
        f(37, encoded, B.Uint16)], 3);
      let event = await EventImporterFIT.getFromArrayBuffer(Buffer.from(e.close()), new ActivityParsingOptions({ generateUnitStreams: false }));
      for (let pass = 0; pass < 3; pass++) {
        const activity = event.getFirstActivity();
        for (const stats of [event, activity, activity.getLaps()[0]]) {
          expect(stats.getStat(DataPowerBalanceLeft.type)?.getValue()).toBe(left);
          expect(stats.getStat(DataPowerBalanceRight.type)?.getValue()).toBeCloseTo(100 - left, 10);
        }
        expect(activity.getStreamData(DataPowerBalanceLeft.type)).toEqual([50, 50, 50, 50]);
        expect(activity.getStreamData('Power Left')).toEqual([100, 100, 100, 100]);
        ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
        event = EventImporterJSON.getEventFromJSON(JSON.parse(JSON.stringify(event.toJSON())));
      }
    }
  );

  it('retains the public numeric metric catalog, aliases, units and precision', () => {
    for (const Class of [DataStore.DataPowerBalanceLeft, DataStore.DataPowerBalanceRight]) {
      const data = DynamicDataLoader.getDataInstanceFromDataType(Class.type, 48.33);
      expect(data.getValue()).toBe(48.33);
      expect(data.getUnit()).toBe('%');
      expect(data.toJSON()).toEqual({ [Class.type]: 48.33 });
      expect(DynamicDataLoader.getDataInstanceFromDataType(Class.aliases[0], 48.33).toJSON()).toEqual({ [Class.type]: 48.33 });
    }
  });
});
