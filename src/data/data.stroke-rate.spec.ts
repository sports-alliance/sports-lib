import { DynamicDataLoader } from './data.store';
import { DataStrokeRate } from './data.stroke-rate';
import { DataStrokeRateAvg } from './data.stroke-rate-avg';
import { DataStrokeRateMax } from './data.stroke-rate-max';
import { DataStrokeRateMin } from './data.stroke-rate-min';

describe('DataStrokeRate', () => {
  it('uses stroke-rate labels and spm display semantics', () => {
    const strokeRate = new DataStrokeRate(31.6);

    expect(strokeRate.getType()).toBe('Stroke Rate');
    expect(strokeRate.getUnit()).toBe('spm');
    expect(strokeRate.getDisplayValue()).toBe(32);
    expect(strokeRate.toJSON()).toEqual({ 'Stroke Rate': 31.6 });
  });

  it('registers the complete summary family with DynamicDataLoader', () => {
    expect(DynamicDataLoader.getDataClassFromDataType(DataStrokeRate.type)).toBe(DataStrokeRate);
    expect(DynamicDataLoader.getDataClassFromDataType(DataStrokeRateAvg.type)).toBe(DataStrokeRateAvg);
    expect(DynamicDataLoader.getDataClassFromDataType(DataStrokeRateMin.type)).toBe(DataStrokeRateMin);
    expect(DynamicDataLoader.getDataClassFromDataType(DataStrokeRateMax.type)).toBe(DataStrokeRateMax);

    expect(DynamicDataLoader.dataTypeAvgDataType[DataStrokeRate.type]).toBe(DataStrokeRateAvg.type);
    expect(DynamicDataLoader.dataTypeMinDataType[DataStrokeRate.type]).toBe(DataStrokeRateMin.type);
    expect(DynamicDataLoader.dataTypeMaxDataType[DataStrokeRate.type]).toBe(DataStrokeRateMax.type);
  });

  it('hydrates summary instances with finite numeric values', () => {
    const values = [
      DynamicDataLoader.getDataInstanceFromDataType(DataStrokeRateAvg.type, 31),
      DynamicDataLoader.getDataInstanceFromDataType(DataStrokeRateMin.type, 24),
      DynamicDataLoader.getDataInstanceFromDataType(DataStrokeRateMax.type, 42)
    ];

    expect(values.map(value => value.getValue())).toEqual([31, 24, 42]);
    expect(values.every(value => Number.isFinite(value.getValue()))).toBe(true);
  });
});
