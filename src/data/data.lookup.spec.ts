import { DataStore, DynamicDataLoader } from './data.store';
import { DataGroundContactTime } from './data.ground-contact-time';
import { DataStanceTime } from './data.stance-time';

describe('indexed metric lookup compatibility', () => {
  const classes = (Object.values(DataStore) as Array<{ type: string; aliases?: string[] }>).filter(
    constructor => constructor?.type
  );
  const tokens = [...new Set(classes.flatMap(constructor => [constructor.type, ...(constructor.aliases || [])]))];

  it.each(tokens)('resolves %s with the original catalog precedence', type => {
    const expected = classes.find(constructor => constructor.type === type || constructor.aliases?.includes(type));
    const healthAliases: Record<string, string> = {
      // These explicit IDs take precedence over ordinary aliases in the loader.
      distance: 'Distance',
      altitude: 'Altitude',
      heart_rate: 'Heart Rate'
    };
    const redirected =
      healthAliases[type] ||
      (
        {
          'Ground Contact Time Avg': 'Average Ground Contact Time',
          'Ground Contact Time Min': 'Minimum Ground Contact Time',
          'Ground Contact Time Max': 'Maximum Ground Contact Time'
        } as Record<string, string>
      )[type];
    const resolved = redirected
      ? classes.find(constructor => constructor.type === redirected || constructor.aliases?.includes(redirected))
      : expected;
    expect(DynamicDataLoader.getDataClassFromDataType(type)).toBe(resolved);
  });

  it('retains the distinct legacy Stance Time class and instance redirection', () => {
    expect(DynamicDataLoader.getDataClassFromDataType(DataStanceTime.type)).toBe(DataStanceTime);
    const value = DynamicDataLoader.getDataInstanceFromDataType(DataStanceTime.type, 250);
    expect(value).toBeInstanceOf(DataGroundContactTime);
    expect(value.toJSON()).toEqual({ [DataGroundContactTime.type]: 250 });
  });

  it.each(['not a metric', 'constructor', '__proto__', 'toString'])('preserves unknown-type errors for %s', type => {
    const originalRedirects: Record<string, string> = {
      altitude: 'Altitude',
      distance: 'Distance',
      heart_rate: 'Heart Rate'
    };
    const message = `Class type of '${originalRedirects[type] || type}' is not in the store`;
    expect(() => DynamicDataLoader.getDataClassFromDataType(type)).toThrow(message);
    expect(() => DynamicDataLoader.getDataInstanceFromDataType(type, 1)).toThrow(message);
  });

  it('preserves constructor validation errors', () => {
    expect(() => DynamicDataLoader.getDataInstanceFromDataType('Distance', {})).toThrow(
      'Value is not boolean or number or string or Date or position'
    );
  });

  it('retains detached static-method calls used by callbacks and wrappers', () => {
    const { getDataClassFromDataType, getDataInstanceFromDataType } = DynamicDataLoader;
    expect(['Distance', 'Heart Rate'].map(getDataClassFromDataType)).toEqual([
      DataStore.DataDistance,
      DataStore.DataHeartRate
    ]);
    expect(getDataInstanceFromDataType('Distance', 100).getValue()).toBe(100);
  });
});
