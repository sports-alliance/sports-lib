import { DataAvgVAM } from './data.avg-vam';

describe('DataAvgVAM display', () => {
  it('formats VAM as an integer m/h string', () => {
    expect(new DataAvgVAM(1250.4).getDisplayValue()).toBe('1250');
    expect(new DataAvgVAM(1250.5).getDisplayValue()).toBe('1251');
  });
});
