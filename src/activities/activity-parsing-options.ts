export class ActivityParsingOptions {
  public static readonly DEFAULT = new ActivityParsingOptions({
    streams: {
      smooth: { altitudeSmooth: true, grade: true, gradeSmooth: true },
      fixAbnormal: { speed: false }
    },
    maxActivityDurationDays: 14,
    generateUnitStreams: true
  });

  /**
   * Enable/Disable streams calculations
   */
  public streams: {
    smooth: {
      altitudeSmooth?: boolean;
      grade?: boolean;
      gradeSmooth?: boolean;
    };
    fixAbnormal: { speed?: boolean };
  };

  public maxActivityDurationDays: number;
  public generateUnitStreams: boolean;

  constructor(options: Partial<ActivityParsingOptions>) {
    this.streams = options.streams ?? {
      smooth: { altitudeSmooth: true, grade: true, gradeSmooth: true },
      fixAbnormal: { speed: false }
    };
    this.maxActivityDurationDays = options.maxActivityDurationDays ?? 14;
    this.generateUnitStreams = options.generateUnitStreams ?? true;
  }
}
