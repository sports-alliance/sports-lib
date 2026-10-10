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

export interface ActivityParsingTssOverridesOptions {
  functionalThresholdPower?: number;
  functionalThresholdPace?: number;
  lactateThresholdHR?: number;
  maxHeartRate?: number;
  restingHeartRate?: number;
  refSwimSpeed?: number;
  thresholdSwimSpeed?: number;
  metScore?: number;
  thresholdMet?: number;
}

export interface ActivityParsingTssOptions {
  overrides?: ActivityParsingTssOverridesOptions;
  /**
   * Preserve finite imported TSS for every sport, including zero and legacy scores without a method.
   * Defaults to true. False discards existing TSS and recalculates where supported; otherwise TSS stays unset.
   */
  preserveImportedTss?: boolean;
  enableHeuristicFallbacks?: boolean;
}

export interface ActivityParsingOptionsInput {
  streams?: ActivityParsingStreamOptions;
  tss?: ActivityParsingTssOptions;
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
  public tss?: {
    overrides: ActivityParsingTssOverridesOptions;
    /** True (default) preserves imported TSS; false replaces it with a calculation or leaves it unset. */
    preserveImportedTss: boolean;
    enableHeuristicFallbacks: boolean;
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
   * - `changes`: Keep the first and last row of each unchanged run per device index, even when other devices are
   *   interleaved. Identity and state changes start new runs; retained rows keep their original order. An untimestamped
   *   row explicitly marked as the creator or local device is retained as activity-wide identity data.
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

    this.tss = {
      overrides: {
        functionalThresholdPower: options.tss?.overrides?.functionalThresholdPower,
        functionalThresholdPace: options.tss?.overrides?.functionalThresholdPace,
        lactateThresholdHR: options.tss?.overrides?.lactateThresholdHR,
        maxHeartRate: options.tss?.overrides?.maxHeartRate,
        restingHeartRate: options.tss?.overrides?.restingHeartRate,
        refSwimSpeed: options.tss?.overrides?.refSwimSpeed,
        thresholdSwimSpeed: options.tss?.overrides?.thresholdSwimSpeed,
        metScore: options.tss?.overrides?.metScore,
        thresholdMet: options.tss?.overrides?.thresholdMet
      },
      preserveImportedTss: options.tss?.preserveImportedTss ?? true,
      enableHeuristicFallbacks: options.tss?.enableHeuristicFallbacks ?? true
    };

    this.maxActivityDurationDays = options.maxActivityDurationDays ?? 14;
    this.generateUnitStreams = options.generateUnitStreams ?? true;
    this.deviceInfoMode = options.deviceInfoMode ?? 'raw';
  }
}
