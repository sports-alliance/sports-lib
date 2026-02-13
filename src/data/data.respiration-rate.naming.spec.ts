import { DataAvgRespirationRate } from './data.avg-respiration-rate';
import { DataMaxRespirationRate } from './data.max-respiration-rate';
import { DataMinRespirationRate } from './data.min-respiration-rate';
import { DynamicDataLoader } from './data.store';

describe('Respiration Rate naming compatibility', () => {
  it('uses canonical respiration rate names', () => {
    expect(DataAvgRespirationRate.type).toBe('Average Respiration Rate');
    expect(DataMaxRespirationRate.type).toBe('Maximum Respiration Rate');
    expect(DataMinRespirationRate.type).toBe('Minimum Respiration Rate');
  });

  it('resolves both canonical and legacy names', () => {
    expect(DynamicDataLoader.getDataClassFromDataType('Average Respiration Rate')).toBe(DataAvgRespirationRate);
    expect(DynamicDataLoader.getDataClassFromDataType('Maximum Respiration Rate')).toBe(DataMaxRespirationRate);
    expect(DynamicDataLoader.getDataClassFromDataType('Minimum Respiration Rate')).toBe(DataMinRespirationRate);

    expect(DynamicDataLoader.getDataClassFromDataType('Avg Respiration Rate')).toBe(DataAvgRespirationRate);
    expect(DynamicDataLoader.getDataClassFromDataType('Max Respiration Rate')).toBe(DataMaxRespirationRate);
    expect(DynamicDataLoader.getDataClassFromDataType('Min Respiration Rate')).toBe(DataMinRespirationRate);
    expect(DynamicDataLoader.getDataClassFromDataType('Respiration Rate Avg')).toBe(DataAvgRespirationRate);
    expect(DynamicDataLoader.getDataClassFromDataType('Respiration Rate Max')).toBe(DataMaxRespirationRate);
    expect(DynamicDataLoader.getDataClassFromDataType('Respiration Rate Min')).toBe(DataMinRespirationRate);
  });

  it('maps Respiration Rate family in DynamicDataLoader', () => {
    expect(DynamicDataLoader.dataTypeAvgDataType['Respiration Rate']).toBe(DataAvgRespirationRate.type);
    expect(DynamicDataLoader.dataTypeMinDataType['Respiration Rate']).toBe(DataMinRespirationRate.type);
    expect(DynamicDataLoader.dataTypeMaxDataType['Respiration Rate']).toBe(DataMaxRespirationRate.type);
  });

  it('creates canonical instances from postfix aliases', () => {
    expect(DynamicDataLoader.getDataInstanceFromDataType('Respiration Rate Avg', 16).getType()).toBe(
      DataAvgRespirationRate.type
    );
    expect(DynamicDataLoader.getDataInstanceFromDataType('Respiration Rate Min', 12).getType()).toBe(
      DataMinRespirationRate.type
    );
    expect(DynamicDataLoader.getDataInstanceFromDataType('Respiration Rate Max', 21).getType()).toBe(
      DataMaxRespirationRate.type
    );
  });
});
