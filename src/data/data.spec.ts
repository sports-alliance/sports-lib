import { DataInterface, UnitSystem } from './data.interface';
import { DataTemperature } from './data.temperature';
import { DataStore, DynamicDataLoader } from './data.store';

describe('Canonical unit-system metadata', () => {
  const imperialUnits = new Set(['ft', 'ft/s', 'ft/min', 'ft/h', 'mph', 'mi', 'min/m', 'min/100yd']);
  const metricUnits = new Set(['m', 'm/s', 'm/min', 'm/h', 'km/h', 'min/km', 'min/100m']);
  const classes = Object.values(DataStore as Record<string, { readonly type: string; readonly unit: string }>);
  const classified = classes.filter(DataClass => imperialUnits.has(DataClass.unit) || metricUnits.has(DataClass.unit));

  it.each(classified.map(DataClass => [DataClass.type, DataClass.unit]))(
    'classifies %s without changing its %s data',
    (type, unit) => {
      const stat = DynamicDataLoader.getDataInstanceFromDataType(type, 5);
      expect(stat.getUnit()).toBe(unit);
      expect(stat.getUnitSystem()).toBe(imperialUnits.has(unit) ? UnitSystem.Imperial : UnitSystem.Metric);
      expect(stat.getValue()).toBe(5);
      expect(stat.toJSON()).toEqual({ [type]: 5 });
    }
  );
});

describe('Data', () => {
  let data: DataInterface;

  beforeEach(() => {
    data = new DataTemperature(60);
  });

  it('should get the type correctly', () => {
    expect(data.getType()).toBe('Temperature');
  });

  it('should get the value correctly', () => {
    expect(data.getValue()).toBe(60);
  });

  it('should get the unit correctly', () => {
    expect(data.getUnit()).toBe('°C');
  });

  it('should get the unit system correctly', () => {
    expect(data.getUnitSystem()).toBe(UnitSystem.Metric);
  });

  it('should export correctly to JSON', () => {
    expect(data.toJSON()).toEqual({
      Temperature: 60
    });
  });
});
