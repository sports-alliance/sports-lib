import { DataGroundTime } from './data.ground-time';

describe('DataGroundTime', () => {
  it('should keep value unchanged and expressed in milliseconds', () => {
    const data = new DataGroundTime(1216);

    expect(data.getUnit()).toBe('ms');
    expect(data.getValue()).toBe(1216);
  });
});
