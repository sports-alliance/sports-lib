export interface ActivityParsingStreamOptions {
  smooth?: {
    altitudeSmooth?: boolean;
    grade?: boolean;
    gradeSmooth?: boolean;
  };
  fixAbnormal?: { speed?: boolean };
  /**
   * Optional allowlist of stream types to include in final activity output.
   *
   * This is currently enforced for FIT/TCX/GPX importers.
   */
  includeTypes?: string[];
}

export interface ActivityParsingOptionsInput {
  streams?: ActivityParsingStreamOptions;
  maxActivityDurationDays?: number;
  generateUnitStreams?: boolean;
  deviceInfoMode?: 'raw' | 'changes';
}

export class ActivityParsingOptions {
  public static readonly DEFAULT = new ActivityParsingOptions();

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
    includeTypes?: string[];
  };

  public maxActivityDurationDays: number;
  public generateUnitStreams: boolean;
  /**
   * Controls how FIT `device_info` records are exposed on `activity.creator.devices`.
   *
   * Some FIT files emit the same device identity every second with only `timestamp` changing,
   * which can generate very large payloads.
   *
   * - `raw`: Keep all parsed `device_info` rows (backwards-compatible default).
   * - `changes`: Keep only state transitions by collapsing contiguous rows that differ by timestamp only.
   *
   * `summary` is intentionally not exposed for now to avoid changing payload semantics beyond
   * run-compaction and to keep this release backwards-safe.
   */
  public deviceInfoMode: 'raw' | 'changes';

  constructor(options: ActivityParsingOptionsInput = {}) {
    this.streams = {
      smooth: {
        altitudeSmooth: options.streams?.smooth?.altitudeSmooth ?? true,
        grade: options.streams?.smooth?.grade ?? true,
        gradeSmooth: options.streams?.smooth?.gradeSmooth ?? true
      },
      fixAbnormal: {
        speed: options.streams?.fixAbnormal?.speed ?? false
      }
    };

    if (options.streams?.includeTypes) {
      this.streams.includeTypes = [...options.streams.includeTypes];
    }

    this.maxActivityDurationDays = options.maxActivityDurationDays ?? 14;
    this.generateUnitStreams = options.generateUnitStreams ?? true;
    this.deviceInfoMode = options.deviceInfoMode ?? 'raw';
  }
}
