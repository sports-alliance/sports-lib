import { DataDuration } from './data.duration';

describe('DataDuration.getStopwatchDisplayValue', () => {
  it('shows sub-hour durations as m:ss.hh by default', () => {
    expect(new DataDuration(12.85).getStopwatchDisplayValue()).toBe('0:12.85');
    expect(new DataDuration(96.12).getStopwatchDisplayValue()).toBe('1:36.12');
  });

  it('retains trailing fractional zeroes', () => {
    expect(new DataDuration(12.9).getStopwatchDisplayValue()).toBe('0:12.90');
  });

  it('carries rounding into the next minute', () => {
    expect(new DataDuration(59.999).getStopwatchDisplayValue()).toBe('1:00.00');
  });

  it('shows hours when needed', () => {
    expect(new DataDuration(3600.12).getStopwatchDisplayValue()).toBe('1:00:00.12');
  });

  it('allows the fractional precision to be configured', () => {
    expect(new DataDuration(12.85).getStopwatchDisplayValue(1)).toBe('0:12.9');
    expect(new DataDuration(12.85).getStopwatchDisplayValue(0)).toBe('0:13');
  });
});
