import { DataPoolLength } from './data.pool-length';
import { DataSwimDistance } from './data.swim-distance';

describe('swim meter distance display', () => {
  it('formats swim distances as grouped meters without converting to kilometers', () => {
    expect(new DataSwimDistance(25).getDisplayValue()).toBe('25');
    expect(new DataSwimDistance(25.5).getDisplayValue()).toBe('25.5');
    expect(new DataSwimDistance(1500).getDisplayValue()).toBe('1.500');
    expect(new DataSwimDistance(1234567.89).getDisplayValue()).toBe('1.234.568');
    expect(new DataSwimDistance(1500).getDisplayUnit()).toBe('m');
  });

  it('uses the same meter display for pool lengths', () => {
    expect(new DataPoolLength(22.86).getDisplayValue()).toBe('22.86');
    expect(new DataPoolLength(1500).getDisplayValue()).toBe('1.500');
    expect(new DataPoolLength(1500).getDisplayUnit()).toBe('m');
  });
});
