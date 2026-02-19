import { ActivityParsingOptions } from './activity-parsing-options';

describe('ActivityParsingOptions', () => {
  it('should keep includeTypes undefined by default', () => {
    const options = new ActivityParsingOptions();
    expect(options.streams.includeTypes).toBeUndefined();
  });

  it('should allow includeTypes without overriding stream defaults', () => {
    const options = new ActivityParsingOptions({
      streams: { includeTypes: ['Distance', 'Heart Rate'] }
    });

    expect(options.streams.includeTypes).toEqual(['Distance', 'Heart Rate']);
    expect(options.streams.smooth.altitudeSmooth).toBe(true);
    expect(options.streams.smooth.grade).toBe(true);
    expect(options.streams.smooth.gradeSmooth).toBe(true);
    expect(options.streams.fixAbnormal.speed).toBe(false);
  });

  it('should copy includeTypes values', () => {
    const includeTypes = ['Distance'];
    const options = new ActivityParsingOptions({
      streams: { includeTypes }
    });

    includeTypes.push('Heart Rate');
    expect(options.streams.includeTypes).toEqual(['Distance']);
  });
});
