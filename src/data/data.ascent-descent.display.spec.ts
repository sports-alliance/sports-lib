import { DataAscent } from './data.ascent';
import { DataDescent } from './data.descent';

describe('Ascent and descent display formatting', () => {
  it('formats values with dot grouping by default', () => {
    expect(new DataAscent(12345).getDisplayValue()).toBe('12.345');
    expect(new DataDescent(12345).getDisplayValue()).toBe('12.345');
  });

  it('formats values with locale-aware grouping when locale is provided', () => {
    expect(new DataAscent(12345).getDisplayValue({ locale: 'en-US' })).toBe('12,345');
    expect(new DataDescent(12345).getDisplayValue({ locale: 'de-DE' })).toBe('12.345');
  });

  it('formats values in compact mode when requested', () => {
    expect(new DataAscent(12345).getDisplayValue({ compact: true })).toBe('12.3k');
    expect(new DataDescent(12345).getDisplayValue({ compact: true, locale: 'en-US' })).toBe('12.3K');
  });
});
