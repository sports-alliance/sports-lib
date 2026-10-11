import { coalesceFitRecords } from './fit-records';

describe('FIT record coalescing', () => {
  it('combines non-adjacent complementary fields without mutating input', () => {
    const records = [
      Object.freeze({ timestamp: new Date(0), power: 250 }),
      Object.freeze({ timestamp: new Date(1000), power: 200 }),
      Object.freeze({ timestamp: new Date(0), heart_rate: 100, power: undefined })
    ];
    expect(coalesceFitRecords(records)).toEqual([{ timestamp: new Date(0), power: 250, heart_rate: 100 }, records[1]]);
    expect(records[0]).not.toHaveProperty('heart_rate');
  });

  it.each([0, -1, null, NaN, Infinity])('retains explicit power %s for downstream validation', power => {
    expect(
      coalesceFitRecords([
        { timestamp: 0, power: 250 },
        { timestamp: 0, power },
        { timestamp: 0, heart_rate: 100 }
      ])
    ).toEqual([{ timestamp: 0, power, heart_rate: 100 }]);
  });

  it.each([{ Power: 300 }, { RP_Power: -1 }, { power: null }, { Power: NaN }])(
    'does not mask a later explicit power observation with an older alias: %j',
    fields => {
      expect(
        coalesceFitRecords([
          { timestamp: 0, power: 250, Power: 200, RP_Power: 150 },
          { timestamp: 0, ...fields },
          { timestamp: 0, heart_rate: 100 }
        ])
      ).toEqual([{ timestamp: 0, ...fields, heart_rate: 100 }]);
    }
  );

  it('keeps distinct timestamps and untimed records separate', () => {
    const records = [
      { timestamp: 0, power: 250 },
      { timestamp: 400, heart_rate: 100 },
      { timestamp: null, power: 100 },
      { power: 200 },
      { timestamp: 'invalid', power: 300 }
    ];
    expect(coalesceFitRecords(records)).toEqual(records);
  });
});
