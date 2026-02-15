export class ActivityParsingOptions {
  public static readonly DEFAULT = new ActivityParsingOptions({
    streams: {
      smooth: { altitudeSmooth: true, grade: true, gradeSmooth: true },
      fixAbnormal: { speed: false }
    },
    maxActivityDurationDays: 14,
    generateUnitStreams: true,
    deviceInfoMode: 'raw'
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

  constructor(options: Partial<ActivityParsingOptions>) {
    this.streams = options.streams ?? {
      smooth: { altitudeSmooth: true, grade: true, gradeSmooth: true },
      fixAbnormal: { speed: false }
    };
    this.maxActivityDurationDays = options.maxActivityDurationDays ?? 14;
    this.generateUnitStreams = options.generateUnitStreams ?? true;
    this.deviceInfoMode = options.deviceInfoMode ?? 'raw';
  }
}
