export class ActivityParsingOptions {
  public static readonly DEFAULT = new ActivityParsingOptions({
    streams: {
      smooth: { altitudeSmooth: true, grade: true, gradeSmooth: true },
      fixAbnormal: { speed: false }
    },
    maxActivityDurationDays: 14
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

  constructor(options: ActivityParsingOptions) {
    this.streams = options.streams;
    this.maxActivityDurationDays = options.maxActivityDurationDays;
  }
}
