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

  it('should set TSS defaults', () => {
    const options = new ActivityParsingOptions();
    const tss = options.tss!;

    expect(tss).toBeDefined();
    expect(tss.preserveImportedTss).toBe(true);
    expect(tss.enableHeuristicFallbacks).toBe(true);
    expect(tss.overrides).toEqual({
      functionalThresholdPower: undefined,
      functionalThresholdPace: undefined,
      lactateThresholdHR: undefined,
      maxHeartRate: undefined,
      restingHeartRate: undefined,
      refSwimSpeed: undefined,
      thresholdSwimSpeed: undefined,
      metScore: undefined,
      thresholdMet: undefined
    });
  });

  it('should accept TSS overrides and flags', () => {
    const options = new ActivityParsingOptions({
      tss: {
        overrides: {
          functionalThresholdPower: 280,
          functionalThresholdPace: 4.2,
          lactateThresholdHR: 172,
          maxHeartRate: 190,
          restingHeartRate: 52,
          refSwimSpeed: 1.25,
          thresholdSwimSpeed: 1.28,
          metScore: 9,
          thresholdMet: 10.5
        },
        preserveImportedTss: false,
        enableHeuristicFallbacks: false
      }
    });
    const tss = options.tss!;

    expect(tss).toEqual({
      overrides: {
        functionalThresholdPower: 280,
        functionalThresholdPace: 4.2,
        lactateThresholdHR: 172,
        maxHeartRate: 190,
        restingHeartRate: 52,
        refSwimSpeed: 1.25,
        thresholdSwimSpeed: 1.28,
        metScore: 9,
        thresholdMet: 10.5
      },
      preserveImportedTss: false,
      enableHeuristicFallbacks: false
    });
  });
});
