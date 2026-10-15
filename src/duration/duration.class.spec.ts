import { DurationClassAbstract } from './duration.class.abstract';
import { DurationClassInterface } from './duration.class.interface';
import { DataDuration } from '../data/data.duration';
import { DataTimerTime } from '../data/data.timer-time';
import { DataMovingTime } from '../data/data.moving-time';
import { DataPause } from '../data/data.pause';

class Timed extends DurationClassAbstract {
  constructor() {
    super(new Date(0), new Date(60000));
  }
}

const getters = ['getDuration', 'getTimer', 'getMovingTime', 'getPause'] as const;
type Getter = (typeof getters)[number];

describe('optional duration statistics', () => {
  it('declares missing values on both the public interface and concrete inherited getters', () => {
    const missing: { [K in Getter]: ReturnType<DurationClassInterface[K]> } = {
      getDuration: undefined,
      getTimer: undefined,
      getMovingTime: undefined,
      getPause: undefined
    };
    const concrete: { [K in Getter]: ReturnType<Timed[K]> } = missing;
    expect(Object.values(concrete)).toEqual([undefined, undefined, undefined, undefined]);
  });

  it.each(getters)('%s returns undefined without inventing time from dates', getter => {
    const target = new Timed();
    expect(target[getter]()).toBeUndefined();
    expect(target[getter]()?.getValue()).toBeUndefined();
    expect(target.getStats().size).toBe(0);
  });

  it.each([0, 12.5])('preserves explicit %s seconds and returns undefined after removal', value => {
    const target = new Timed();
    const values = [new DataDuration(value), new DataTimerTime(value), new DataMovingTime(value), new DataPause(value)];
    target.setDuration(values[0]);
    target.setTimer(values[1]);
    target.setMovingTime(values[2]);
    target.setPause(values[3]);
    getters.forEach((getter, index) => {
      expect(target[getter]()).toBe(values[index]);
      expect(target[getter]()?.getValue()).toBe(value);
      target.removeStat(values[index].getType());
      expect(target[getter]()).toBeUndefined();
    });
  });
});
