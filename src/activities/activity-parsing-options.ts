export class ActivityParsingOptions {
  public static readonly DEFAULT = new ActivityParsingOptions({
    streams: { altitudeSmooth: true, grade: true, gradeSmooth: true },
    maxActivityDurationDays: 14
  });

  /**
   * Enable/Disable streams calculations
   */
  public streams?: {
    altitudeSmooth?: boolean;
    grade?: boolean;
    gradeSmooth?: boolean;
  };

  public maxActivityDurationDays: number;

  constructor(options: ActivityParsingOptions) {
    this.streams = options.streams;
    this.maxActivityDurationDays = options.maxActivityDurationDays;
  }
}
