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

export interface RouteParsingGPXOptions {
  /**
   * Treat timed GPX tracks as route geometry.
   *
   * Defaults to false because GPX tracks with per-point time values usually represent
   * completed activities. Route upload flows can opt in when the user explicitly wants
   * to turn activity track geometry into a reusable route.
   */
  importTimedTracksAsRoutes?: boolean;
}

export interface RouteParsingOptionsInput {
  streams?: RouteParsingStreamOptions;
  gpx?: RouteParsingGPXOptions;
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

  public gpx: {
    importTimedTracksAsRoutes: boolean;
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

    this.gpx = {
      importTimedTracksAsRoutes: options.gpx?.importTimedTracksAsRoutes ?? false
    };

    this.generateUnitStreams = options.generateUnitStreams ?? true;
  }
}
