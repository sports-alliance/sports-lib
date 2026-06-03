export interface RouteParsingStreamOptions {
  smooth?: {
    altitudeSmooth?: boolean;
    grade?: boolean;
    gradeSmooth?: boolean;
  };
  /**
   * Optional allowlist of point-indexed stream types to include in final route output.
   */
  includeTypes?: string[];
}

export interface RouteParsingOptionsInput {
  streams?: RouteParsingStreamOptions;
  generateUnitStreams?: boolean;
}

export class RouteParsingOptions {
  public static readonly DEFAULT = new RouteParsingOptions();

  public streams: {
    smooth: {
      altitudeSmooth?: boolean;
      grade?: boolean;
      gradeSmooth?: boolean;
    };
    includeTypes?: string[];
  };

  public generateUnitStreams: boolean;

  constructor(options: RouteParsingOptionsInput = {}) {
    this.streams = {
      smooth: {
        altitudeSmooth: options.streams?.smooth?.altitudeSmooth ?? true,
        grade: options.streams?.smooth?.grade ?? true,
        gradeSmooth: options.streams?.smooth?.gradeSmooth ?? true
      }
    };

    if (options.streams?.includeTypes) {
      this.streams.includeTypes = [...options.streams.includeTypes];
    }

    this.generateUnitStreams = options.generateUnitStreams ?? true;
  }
}
