export class ActivityParsingOptions {
  public static readonly DEFAULT = new ActivityParsingOptions({
    streams: { altitudeSmooth: true, grade: true, gradeSmooth: true }
  });

  /**
   * Enable/Disable streams calculations
   */
  public readonly streams?: {
    altitudeSmooth?: boolean;
    grade?: boolean;
    gradeSmooth?: boolean;
  };

  constructor(options: ActivityParsingOptions) {
    this.streams = options.streams;
  }
}
