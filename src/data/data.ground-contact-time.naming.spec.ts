import { DataGroundContactTime } from './data.ground-contact-time';
import { DataGroundContactTimeAvg } from './data.ground-contact-time-avg';
import { DataGroundContactTimeMin } from './data.ground-contact-time-min';
import { DataGroundContactTimeMax } from './data.ground-contact-time-max';
import { DynamicDataLoader } from './data.store';

describe('Ground Contact Time naming compatibility', () => {
  it('uses canonical Ground Contact Time family names', () => {
    expect(DataGroundContactTimeAvg.type).toBe('Average Ground Contact Time');
    expect(DataGroundContactTimeMin.type).toBe('Minimum Ground Contact Time');
    expect(DataGroundContactTimeMax.type).toBe('Maximum Ground Contact Time');
  });

  it('maps Ground Contact Time family in DynamicDataLoader', () => {
    expect(DynamicDataLoader.dataTypeAvgDataType[DataGroundContactTime.type]).toBe('Average Ground Contact Time');
    expect(DynamicDataLoader.dataTypeMinDataType[DataGroundContactTime.type]).toBe('Minimum Ground Contact Time');
    expect(DynamicDataLoader.dataTypeMaxDataType[DataGroundContactTime.type]).toBe('Maximum Ground Contact Time');
  });

  it('resolves both canonical and legacy names to the same classes', () => {
    expect(DynamicDataLoader.getDataClassFromDataType('Average Ground Contact Time')).toBe(DataGroundContactTimeAvg);
    expect(DynamicDataLoader.getDataClassFromDataType('Minimum Ground Contact Time')).toBe(DataGroundContactTimeMin);
    expect(DynamicDataLoader.getDataClassFromDataType('Maximum Ground Contact Time')).toBe(DataGroundContactTimeMax);

    expect(DynamicDataLoader.getDataClassFromDataType('Ground Contact Time Avg')).toBe(DataGroundContactTimeAvg);
    expect(DynamicDataLoader.getDataClassFromDataType('Ground Contact Time Min')).toBe(DataGroundContactTimeMin);
    expect(DynamicDataLoader.getDataClassFromDataType('Ground Contact Time Max')).toBe(DataGroundContactTimeMax);
  });

  it('creates instances from both canonical and legacy names', () => {
    expect(DynamicDataLoader.getDataInstanceFromDataType('Average Ground Contact Time', 250).getType()).toBe(
      'Average Ground Contact Time'
    );
    expect(DynamicDataLoader.getDataInstanceFromDataType('Minimum Ground Contact Time', 230).getType()).toBe(
      'Minimum Ground Contact Time'
    );
    expect(DynamicDataLoader.getDataInstanceFromDataType('Maximum Ground Contact Time', 290).getType()).toBe(
      'Maximum Ground Contact Time'
    );

    expect(DynamicDataLoader.getDataInstanceFromDataType('Ground Contact Time Avg', 250).getType()).toBe(
      'Average Ground Contact Time'
    );
    expect(DynamicDataLoader.getDataInstanceFromDataType('Ground Contact Time Min', 230).getType()).toBe(
      'Minimum Ground Contact Time'
    );
    expect(DynamicDataLoader.getDataInstanceFromDataType('Ground Contact Time Max', 290).getType()).toBe(
      'Maximum Ground Contact Time'
    );
  });
});
