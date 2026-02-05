import { DataPowerCurve } from './data.power-curve';
import { DataDuration } from './data.duration';
import { DataPower } from './data.power';

describe('DataPowerCurve', () => {
  it('should hydrate from raw JSON objects', () => {
    const rawData = [
      { duration: 1, power: 100 },
      { duration: 5, power: 200 }
    ];

    const powerCurve = new DataPowerCurve(rawData as any);

    const values = powerCurve.getValue();
    expect(values[0].duration).toBeInstanceOf(DataDuration);
    expect(values[0].duration.getValue()).toBe(1);
    expect(values[0].power).toBeInstanceOf(DataPower);
    expect(values[0].power.getValue()).toBe(100);

    expect(values[1].duration).toBeInstanceOf(DataDuration);
    expect(values[1].duration.getValue()).toBe(5);
    expect(values[1].power).toBeInstanceOf(DataPower);
    expect(values[1].power.getValue()).toBe(200);
  });

  it('should hydrate from already hydrated objects (idempotency)', () => {
    const hydratedData = [{ duration: new DataDuration(1), power: new DataPower(100) }];

    const powerCurve = new DataPowerCurve(hydratedData);

    const values = powerCurve.getValue();
    expect(values[0].duration).toBeInstanceOf(DataDuration);
    expect(values[0].duration.getValue()).toBe(1);
  });

  it('should serialize correctly to JSON', () => {
    const rawData = [{ duration: 1, power: 100 }];
    const powerCurve = new DataPowerCurve(rawData as any);

    const json = powerCurve.toJSON();
    expect(json).toEqual({
      [DataPowerCurve.type]: [{ duration: 1, power: 100 }]
    });
  });
});
