import {
  DataEHPE,
  DataEHPEAvg,
  DataEHPEMax,
  DataEHPEMin,
  DataEVPE,
  DataEVPEAvg,
  DataEVPEMax,
  DataEVPEMin,
  DataStore,
  DynamicDataLoader
} from '../index';

describe('position error metric display and persistence', () => {
  const metrics = [
    { DataClass: DataEHPE, type: 'EHPE' },
    { DataClass: DataEHPEAvg, type: 'Average EHPE' },
    { DataClass: DataEHPEMin, type: 'Minimum EHPE' },
    { DataClass: DataEHPEMax, type: 'Maximum EHPE' },
    { DataClass: DataEVPE, type: 'EVPE' },
    { DataClass: DataEVPEAvg, type: 'Average EVPE' },
    { DataClass: DataEVPEMin, type: 'Minimum EVPE' },
    { DataClass: DataEVPEMax, type: 'Maximum EVPE' }
  ];

  describe.each(metrics)('$type', ({ DataClass, type }) => {
    it.each<[number, string]>([
      [3.897331154684096, '3.9'],
      [5.74822695035461, '5.7'],
      [8.704248366013072, '8.7'],
      [8.21631205673759, '8.2'],
      [0, '0.0'],
      [0.04, '0.0'],
      [1000.123, '1000.1']
    ])('displays %s to one decimal place in meters', (value, display) => {
      const stat = new DataClass(value);
      expect(stat.getDisplayValue()).toBe(display);
      expect(stat.getDisplayUnit()).toBe('m');
      expect(stat.getValue()).toBe(value);
    });

    it('preserves public discovery, canonical type and full-precision numeric JSON', () => {
      const value = 3.897331154684096;
      const stat = new DataClass(value);
      expect(DataStore[DataClass.name]).toBe(DataClass);
      expect(DynamicDataLoader.getDataClassFromDataType(type)).toBe(DataClass);
      expect(stat.getType()).toBe(type);
      expect(stat.getUnit()).toBe('m');
      expect(stat.isValueTypeValid(value)).toBe(true);
      expect(stat.toJSON()).toEqual({ [type]: value });

      const stored = JSON.parse(JSON.stringify(stat.toJSON()));
      const restored = DynamicDataLoader.getDataInstanceFromDataType(type, stored[type]);
      expect(restored).toBeInstanceOf(DataClass);
      expect(restored.getValue()).toBe(value);
      expect(typeof restored.getValue()).toBe('number');
      expect(restored.toJSON()).toEqual({ [type]: value });
      expect(restored.getDisplayValue()).toBe('3.9');
      expect(restored.getDisplayUnit()).toBe('m');
    });
  });
});
