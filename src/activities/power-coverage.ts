/** Observed active power support, calculated on demand without adding stored metadata. */
export interface PowerCoverage {
  /** Active duration to cover, in seconds; never less than a valid supplied timer duration. */
  durationSeconds: number;
  /** Seconds supported by nonnegative finite recorded watts, including zero. */
  coveredDurationSeconds: number;
  /** Supported fraction of active duration, from zero to one. */
  coverageRatio: number;
  /** Time-weighted mean over supported seconds only, or null when none are supported. */
  observedAveragePowerWatts: number | null;
  /** Integral of supported watts in kilojoules. Missing intervals contribute unknown work. */
  observedWorkKilojoules: number;
}
