import { Activity } from '../../activities/activity';
import { ActivityTypes } from '../../activities/activity.types';
import { Creator } from '../../creators/creator';
import { Stream } from '../../streams/stream';
import { DataPower } from '../../data/data.power';
import { DataPowerLeft } from '../../data/data.power-left';
import { DataPowerRight } from '../../data/data.power-right';
import { DataPowerBalanceLeft } from '../../data/data.power-balance-left';
import { DataPowerBalanceRight } from '../../data/data.power-balance-right';
import { EventImporterJSON } from '../adapters/importers/json/importer.json';
import { ActivityUtilities } from './activity.utilities';

const make = (power: (number | null)[], balance: (number | null)[]) => {
  const a = new Activity(new Date(0), new Date((Math.max(power.length, balance.length) - 1) * 1000),
    ActivityTypes.Cycling, new Creator('Synthetic'));
  a.addStream(new Stream(DataPower.type, power));
  a.addStream(new Stream(DataPowerBalanceLeft.type, balance));
  a.addStream(new Stream(DataPowerBalanceRight.type, balance));
  return a;
};

describe('left/right power derived from nullable readings', () => {
  it.each([
    [[200, null, 0, 400, null], [50, 50, 50, null, 50], [100, null, 0, null, null]],
    [[200, 0], [50, 50, 50, 50], [100, 0, null, null]],
    [[200, 0, 300, null], [50], [100, null, null, null]],
    [[200, Infinity, 0], [NaN, 50, 50], [null, null, 0]]
  ])('retains aligned missing values and zeros across JSON: %j', (power, balance, expected) => {
    const a = make(power, balance);
    const originalPower = power.slice(), originalBalance = balance.slice();
    ActivityUtilities.generateMissingStreamsForActivity(a);
    const restored = EventImporterJSON.getActivityFromJSON(JSON.parse(JSON.stringify(a.toJSON())));
    for (const type of [DataPowerLeft.type, DataPowerRight.type]) {
      expect(a.getStreamData(type)).toStrictEqual(expected);
      expect(restored.getStreamData(type)).toStrictEqual(expected);
      expect(restored.getStreamDataByDuration(type)).toStrictEqual(a.getStreamDataByDuration(type));
    }
    expect(power).toStrictEqual(originalPower);
    expect(balance).toStrictEqual(originalBalance);
  });

  it.each([
    (data: (number | null)[]) => data.map(value => value ?? 50),
    (data: (number | null)[]) => data.filter(value => value !== null),
    (data: (number | null)[]) => data.map(value => value === null ? null : value / 2)
  ])('derives side power from original pairs even when both inputs have filters', filterData => {
    const a = make([200, null, 0, 400, null], [50, 40, 50, null, 60]);
    const sources = a.getAllStreams().slice();
    const before = JSON.parse(JSON.stringify(sources.map(stream => stream.toJSON())));
    sources.forEach(stream => stream.useFilter({ filterData }));
    for (let repeat = 0; repeat < 2; repeat++) {
      ActivityUtilities.generateMissingStreamsForActivity(a);
      for (const type of [DataPowerLeft.type, DataPowerRight.type]) {
        expect(a.getStreamData(type)).toEqual([100, null, 0, null, null]);
      }
    }
    const restored = EventImporterJSON.getActivityFromJSON(JSON.parse(JSON.stringify(a.toJSON())));
    for (const type of [DataPowerLeft.type, DataPowerRight.type]) {
      expect(restored.getStreamData(type)).toEqual([100, null, 0, null, null]);
    }
    expect(sources.map(stream => stream.toJSON())).toEqual(before);
    expect(sources.every(stream => stream.hasFilter())).toBe(true);
  });

  it.each([DataPowerBalanceLeft, DataPowerBalanceRight])(
    'derives missing balance summaries from original observations on either side', Balance => {
      const a = make([200, null, 0, 400, null], [0, null, 100, null, null]);
      a.removeStream(Balance === DataPowerBalanceLeft ? DataPowerBalanceRight.type : DataPowerBalanceLeft.type);
      const stream = a.getStream(Balance.type);
      stream.useFilter({ filterData: data => data.map(value => value ?? 80) });
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(a);
      for (const type of [DataPowerBalanceLeft.type, DataPowerBalanceRight.type]) {
        expect(a.getStat(type)?.getValue()).toBe(50);
      }
      expect(stream.toJSON().data).toEqual([0, null, 100, null, null]);
      expect(stream.hasFilter()).toBe(true);
    }
  );

  it('preserves recorded left/right streams during repeated generation', () => {
    const a = make([200, null, 0], [50, 50, 50]);
    const recorded = [new Stream(DataPowerLeft.type, [99, null, 0]), new Stream(DataPowerRight.type, [101, null, 0])];
    recorded.forEach(stream => a.addStream(stream));
    a.getStream(DataPower.type).useFilter({ filterData: data => data.map(value => value ?? 200) });
    for (let repeat = 0; repeat < 2; repeat++) {
      ActivityUtilities.generateMissingStreamsForActivity(a);
      for (const stream of recorded) expect(a.getStream(stream.type)).toBe(stream);
    }
  });
});
