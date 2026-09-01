import { DataStore, DynamicDataLoader } from './data.store';
import {
  DataContactTimeToFlightTimeRatio,
  DataContactTimeToFlightTimeRatioAvg,
  DataContactTimeToFlightTimeRatioMax,
  DataContactTimeToFlightTimeRatioMin,
  DataGroundContactTimePercentage,
  DataGroundContactTimePercentageAvg,
  DataGroundContactTimePercentageMax,
  DataGroundContactTimePercentageMin,
  DataRunningFlightTime,
  DataRunningFlightTimeAvg,
  DataRunningFlightTimeMax,
  DataRunningFlightTimeMin
} from './data.running-dynamics';

describe('canonical running-dynamics metrics', () => {
  const families = [
    {
      base: DataGroundContactTimePercentage,
      avg: DataGroundContactTimePercentageAvg,
      min: DataGroundContactTimePercentageMin,
      max: DataGroundContactTimePercentageMax,
      value: 37.11,
      unit: '%',
      display: 37.1
    },
    {
      base: DataRunningFlightTime,
      avg: DataRunningFlightTimeAvg,
      min: DataRunningFlightTimeMin,
      max: DataRunningFlightTimeMax,
      value: 207.086,
      unit: 'ms',
      display: 207
    },
    {
      base: DataContactTimeToFlightTimeRatio,
      avg: DataContactTimeToFlightTimeRatioAvg,
      min: DataContactTimeToFlightTimeRatioMin,
      max: DataContactTimeToFlightTimeRatioMax,
      value: 139,
      unit: '%',
      display: 139
    }
  ];

  it('registers every family for public enumeration and canonical loading', () => {
    families.forEach(({ base, avg, min, max }) => {
      [base, avg, min, max].forEach(DataClass => {
        expect(DataStore[DataClass.name]).toBe(DataClass);
        expect(DynamicDataLoader.getDataClassFromDataType(DataClass.type)).toBe(DataClass);
      });

      expect(DynamicDataLoader.dataTypeAvgDataType[base.type]).toBe(avg.type);
      expect(DynamicDataLoader.dataTypeMinDataType[base.type]).toBe(min.type);
      expect(DynamicDataLoader.dataTypeMaxDataType[base.type]).toBe(max.type);
    });
  });

  it('retains finite numeric values, units, and canonical JSON keys', () => {
    families.forEach(({ base, value, unit, display }) => {
      const instance = new base(value);
      expect(instance.getValue()).toBe(value);
      expect(instance.getUnit()).toBe(unit);
      expect(instance.getDisplayValue()).toBe(display);
      expect(instance.toJSON()).toEqual({ [base.type]: value });
      expect(DynamicDataLoader.getDataInstanceFromDataType(base.type, value).toJSON()).toEqual({
        [base.type]: value
      });
      expect(() => new base(Number.NaN)).toThrow();
      expect(() => new base(Number.POSITIVE_INFINITY)).toThrow();
    });
  });

  it('keeps Suunto contact-to-flight ratio distinct from FIT ground-contact-time percentage', () => {
    expect(DataContactTimeToFlightTimeRatio.type).not.toBe(DataGroundContactTimePercentage.type);
    expect(new DataContactTimeToFlightTimeRatio(139).getValue()).toBe(139);
  });

  it('rejects values outside each canonical metric domain', () => {
    expect(() => new DataGroundContactTimePercentage(-1)).toThrow();
    expect(() => new DataGroundContactTimePercentage(100.01)).toThrow();
    expect(() => new DataRunningFlightTime(-1)).toThrow();
    expect(() => new DataContactTimeToFlightTimeRatio(-1)).toThrow();
    expect(new DataGroundContactTimePercentage(100).getValue()).toBe(100);
    expect(new DataRunningFlightTime(0).getValue()).toBe(0);
    expect(new DataContactTimeToFlightTimeRatio(139).getValue()).toBe(139);
  });
});
