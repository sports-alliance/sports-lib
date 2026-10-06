import { DataPoolLength } from './data.pool-length';
import { DataSwimDistance, SwimDistanceUnits } from './data.swim-distance';
import { DataDistance } from './data.distance';
import { DataStore, DynamicDataLoader } from './data.store';

describe('swim distance display', () => {
  it('formats swim distances as grouped meters without converting to kilometers', () => {
    expect(new DataSwimDistance(25).getDisplayValue()).toBe('25');
    expect(new DataSwimDistance(25.5).getDisplayValue()).toBe('25.5');
    expect(new DataSwimDistance(1500).getDisplayValue()).toBe('1.500');
    expect(new DataSwimDistance(1234567.89).getDisplayValue()).toBe('1.234.568');
    expect(new DataSwimDistance(1500).getDisplayUnit()).toBe('m');
  });

  it('displays canonical meters in yards, including fractional and long distances', () => {
    expect(new DataSwimDistance(22.86, SwimDistanceUnits.Yards).getDisplayValue()).toBe('25');
    expect(new DataSwimDistance(91.44, SwimDistanceUnits.Yards).getDisplayValue()).toBe('100');
    expect(new DataSwimDistance(1508.76, SwimDistanceUnits.Yards).getDisplayValue()).toBe('1.650');
    expect(new DataSwimDistance(25, SwimDistanceUnits.Yards).getDisplayValue()).toBe('27.34');
    expect(new DataSwimDistance(0, SwimDistanceUnits.Yards).getDisplayValue()).toBe('0');
    expect(new DataSwimDistance(91.44, SwimDistanceUnits.Yards).getDisplayUnit()).toBe('yd');
  });

  it('preserves canonical discovery, numeric values and JSON for yard displays', () => {
    const distance = new DataSwimDistance(91.44, SwimDistanceUnits.Yards);
    expect(Object.values(DataStore)).toContain(DataSwimDistance);
    expect(distance.getType()).toBe(DataDistance.type);
    expect(distance.getUnit()).toBe('m');
    expect(distance.getValue()).toBe(91.44);
    expect(distance.toJSON()).toEqual({ Distance: 91.44 });
    expect(DataSwimDistance.fromJSON(JSON.parse(JSON.stringify(distance))).getValue()).toBe(91.44);
    expect(DynamicDataLoader.getDataInstanceFromDataType(distance.getType(), 91.44).getValue()).toBe(91.44);
    expect(DynamicDataLoader.getUnitBasedDataFromDataInstance(distance)[0]).toBe(distance);
  });

  it('uses the same meter display for pool lengths', () => {
    expect(new DataPoolLength(22.86).getDisplayValue()).toBe('22.86');
    expect(new DataPoolLength(1500).getDisplayValue()).toBe('1.500');
    expect(new DataPoolLength(1500).getDisplayUnit()).toBe('m');
  });
});
