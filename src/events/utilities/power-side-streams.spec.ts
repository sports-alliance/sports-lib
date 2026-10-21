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

  it('preserves recorded left/right streams during repeated generation', () => {
    const a = make([200, null, 0], [50, 50, 50]);
    const recorded = [new Stream(DataPowerLeft.type, [99, null, 0]), new Stream(DataPowerRight.type, [101, null, 0])];
    recorded.forEach(stream => a.addStream(stream));
    for (let repeat = 0; repeat < 2; repeat++) {
      ActivityUtilities.generateMissingStreamsForActivity(a);
      for (const stream of recorded) expect(a.getStream(stream.type)).toBe(stream);
    }
  });
});
