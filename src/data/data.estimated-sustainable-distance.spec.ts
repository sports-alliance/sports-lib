import {
  DataEstimatedSustainableDistance,
  DataEstimatedSustainableDistanceMin,
  DataEstimatedSustainableDistanceMiles,
  DataEstimatedSustainableDistanceMinMiles,
  DataStore,
  DistanceUnits,
  DynamicDataLoader
} from '../index';

describe('estimated sustainable distance', () => {
  const canonical = [DataEstimatedSustainableDistance, DataEstimatedSustainableDistanceMin];

  it.each(canonical)('enumerates and restores the canonical class %p without duplicate aliases', DataClass => {
    expect(
      Object.values(DataStore as Record<string, { type: string }>).filter(
        candidate => candidate.type === DataClass.type
      )
    ).toEqual([DataClass]);
    for (const value of [0, 4200.25]) {
      const data = new DataClass(value);
      const json = JSON.parse(JSON.stringify(data.toJSON()));
      expect(DataClass.fromJSON(json).toJSON()).toEqual(json);
      expect(DynamicDataLoader.getDataInstanceFromDataType(DataClass.type, value).toJSON()).toEqual(json);
      expect(data.getUnit()).toBe('m');
    }
  });

  it.each([null, undefined, '', '0', -1, NaN, Infinity, -Infinity])('rejects invalid values %p', value => {
    for (const DataClass of canonical) {
      expect(() => new DataClass(value as number)).toThrow();
    }
  });

  it('converts display units without colliding with travelled distance or mutating canonical JSON', () => {
    for (const [DataClass, MilesClass] of [
      [DataEstimatedSustainableDistance, DataEstimatedSustainableDistanceMiles],
      [DataEstimatedSustainableDistanceMin, DataEstimatedSustainableDistanceMinMiles]
    ]) {
      const data = new DataClass(1609.344);
      const [imperial] = DynamicDataLoader.getUnitBasedDataFromDataInstance(data, {
        distanceUnits: DistanceUnits.Miles
      } as any);
      expect(imperial.getType()).toBe(MilesClass.type);
      expect(imperial.getValue()).toBeCloseTo(1, 3);
      expect(imperial.getDisplayValue()).toBe('1.00');
      expect(imperial.getDisplayUnit()).toBe('mi');
      expect(data.toJSON()).toEqual({ [DataClass.type]: 1609.344 });
      expect(
        DynamicDataLoader.getUnitBasedDataTypesFromDataType(DataClass.type, {
          distanceUnits: DistanceUnits.Miles
        } as any)
      ).toEqual([MilesClass.type]);
    }
  });
});
