import { DataElapsedTime } from '../data/data.elapsed-time';
import { resolveSwimTimingSeconds, normalizeTimingValidity } from '../duration/timing-validity';
import { EventImporterJSON } from '../events/adapters/importers/json/importer.json';
import { DataStrokeRate } from '../data/data.stroke-rate';
import { DataDistance } from '../data/data.distance';
import { DataDuration } from '../data/data.duration';
import { DataEnergy } from '../data/data.energy';
import { DataHeartRate } from '../data/data.heart-rate';
import { DataSpeed } from '../data/data.speed';
import { SwimLength } from './swim-length';

describe('SwimLength', () => {
  it('preserves rejected timing across JSON without converting it to elapsed time or zero', () => {
    const timingValidity = { version: 1, reason: 'exceeds-workout-envelope', timerTime: 4000000 } as const;
    const length = SwimLength.fromJSON({
      index: 1,
      startDate: 0,
      endDate: 30000,
      type: 'active',
      distance: 25,
      elapsedTime: 30,
      timerTime: 4000000,
      timingValidity
    } as any);
    expect(length.timerTime).toBeNull();
    expect(length.elapsedTime?.getValue()).toBe(30);
    expect(resolveSwimTimingSeconds(length)).toBeNull();
    expect(SwimLength.fromJSON(length.toJSON()).toJSON()).toEqual(length.toJSON());
    expect(length.toJSON().timingValidity).toEqual(timingValidity);
    const lap = EventImporterJSON.getLapFromJSON(
      {
        startDate: 0,
        endDate: 30000,
        type: 'Manual',
        stats: { [DataDuration.type]: 4000000, [DataElapsedTime.type]: 30, [DataDistance.type]: 25 },
        timingValidity
      } as any,
      0
    );
    expect(lap.getDuration()).toBeUndefined();
    expect(lap.getDistance().getValue()).toBe(25);
    expect(EventImporterJSON.getLapFromJSON(lap.toJSON(), 0).toJSON()).toEqual(lap.toJSON());
  });
  it('keeps legacy missing and zero timing and ignores unsupported validity metadata', () => {
    const row = { index: 1, startDate: 0, endDate: 30000, type: 'idle', elapsedTime: 30, timerTime: 0 };
    const zero = SwimLength.fromJSON(row as any);
    expect(resolveSwimTimingSeconds(zero)).toBe(0);
    expect(resolveSwimTimingSeconds(SwimLength.fromJSON({ ...row, timerTime: null } as any))).toBe(30);
    expect(zero.toJSON()).not.toHaveProperty('timingValidity');
    for (const invalid of [
      null,
      [],
      {},
      { version: 2, reason: 'exceeds-workout-envelope', timerTime: 4 },
      { version: 1, reason: 'exceeds-workout-envelope', timerTime: -1 }
    ])
      expect(normalizeTimingValidity(invalid)).toBeUndefined();
    expect(
      normalizeTimingValidity({ version: 1, reason: 'exceeds-workout-envelope', timerTime: 4, private: 'discard' })
    ).toEqual({ version: 1, reason: 'exceeds-workout-envelope', timerTime: 4 });
  });
  it('hydrates nullable measured fields defensively from partial JSON rows', () => {
    const swimLength = SwimLength.fromJSON({
      index: 1,
      startDate: 1778945229000,
      endDate: 1778945254000,
      type: 'active'
    } as any);

    expect(swimLength.lapIndex).toBeNull();
    expect(swimLength.stroke).toBeNull();
    expect(swimLength.strokes).toBeNull();
    expect(swimLength.elapsedTime).toBeNull();
    expect(swimLength.timerTime).toBeNull();
    expect(swimLength.distance).toBeNull();
    expect(swimLength.poolLength).toBeNull();
    expect(swimLength.avgSpeed).toBeNull();
    expect(swimLength.avgCadence).toBeNull();
    expect(swimLength.avgHeartRate).toBeNull();
    expect(swimLength.maxHeartRate).toBeNull();
    expect(swimLength.swolf).toBeNull();
    expect(swimLength.calories).toBeNull();
    expect(swimLength.toJSON()).toEqual(expect.objectContaining({
      lapIndex: null,
      stroke: null,
      strokes: null,
      elapsedTime: null,
      timerTime: null,
      distance: null,
      poolLength: null,
      avgSpeed: null,
      avgCadence: null,
      avgHeartRate: null,
      maxHeartRate: null,
      swolf: null,
      calories: null
    }));
  });

  it('hydrates numeric measured fields as sports-lib data objects', () => {
    const swimLength = SwimLength.fromJSON({
      index: 1,
      lapIndex: 1,
      startDate: 1778945229000,
      endDate: 1778945254000,
      type: 'active',
      stroke: 'freestyle',
      strokes: 8,
      elapsedTime: 25,
      timerTime: 24,
      distance: 25,
      poolLength: 25,
      avgSpeed: 1,
      avgCadence: 20,
      avgHeartRate: 140,
      maxHeartRate: 150,
      swolf: 39,
      calories: 4
    });

    expect(swimLength.elapsedTime).toBeInstanceOf(DataDuration);
    expect(swimLength.timerTime).toBeInstanceOf(DataDuration);
    expect(swimLength.distance).toBeInstanceOf(DataDistance);
    expect(swimLength.poolLength).toBeInstanceOf(DataDistance);
    expect(swimLength.avgSpeed).toBeInstanceOf(DataSpeed);
    expect(swimLength.avgCadence).toBeInstanceOf(DataStrokeRate);
    expect(swimLength.avgCadence?.getUnit()).toBe('spm');
    expect(swimLength.avgHeartRate).toBeInstanceOf(DataHeartRate);
    expect(swimLength.maxHeartRate).toBeInstanceOf(DataHeartRate);
    expect(swimLength.calories).toBeInstanceOf(DataEnergy);
    expect(swimLength.toJSON()).toEqual(expect.objectContaining({
      elapsedTime: 25,
      distance: 25
    }));
  });
});
