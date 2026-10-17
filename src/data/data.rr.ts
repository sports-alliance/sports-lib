import { DataNumber } from './data.number';

abstract class RRNumber extends DataNumber {
  static unit = '';
  override isValueTypeValid(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0;
  }
  override getDisplayValue(): string {
    return this.getValue().toFixed(1);
  }
}
abstract class RRCount extends RRNumber {
  static override unit = 'count';
  override isValueTypeValid(value: unknown): boolean {
    return super.isValueTypeValid(value) && Number.isSafeInteger(value);
  }
  override getDisplayValue(): string {
    return this.getValue().toFixed(0);
  }
  override getDisplayUnit(): string {
    return '';
  }
}
abstract class RRPercentage extends RRNumber {
  static override unit = '%';
  override isValueTypeValid(value: unknown): boolean {
    return super.isValueTypeValid(value) && (value as number) <= 100;
  }
}
abstract class RRMilliseconds extends RRNumber {
  static override unit = 'ms';
}
abstract class RRAlpha extends DataNumber {
  static unit = '';
  override isValueTypeValid(value: unknown): boolean {
    return typeof value === 'number' && Number.isFinite(value);
  }
  override getDisplayValue(): string {
    return this.getValue().toFixed(2);
  }
}

/** Number of complete positive finite intervals within activity bounds. */
export class DataRRIntervalCount extends RRCount {
  static type = 'R-R Interval Count';
}

/** Invalid observations, counted separately from artifacts. */
export class DataRRInvalidIntervalCount extends RRCount {
  static type = 'R-R Invalid Interval Count';
}

/** Recording-quality heuristic exclusions, without suspected pairs. */
export class DataRRArtifactCount extends RRCount {
  static type = 'R-R Artifact Count';
}

/** Percentage (0–100) of complete intervals classified as artifacts. */
export class DataRRArtifactPercentage extends RRPercentage {
  static type = 'R-R Artifact Percentage';
}

/** Algorithmically suspected short/long pairs; not a rhythm diagnosis. */
export class DataRRSuspectedEctopicPairCount extends RRCount {
  static type = 'R-R Suspected Ectopic Pair Count';
}

/** Suspected pairs per hour of recorded interval coverage. */
export class DataRRSuspectedEctopicPairRate extends RRNumber {
  static type = 'R-R Suspected Ectopic Pair Rate';
  static override unit = 'pairs/h';
}

/** Percentage (0–100) of elapsed time covered by recorded intervals. */
export class DataRRCoverage extends RRPercentage {
  static type = 'R-R Coverage';
}

/** Internal gaps evidenced by timestamps; untimed arrays cannot prove continuity. */
export class DataRRGapCount extends RRCount {
  static type = 'R-R Gap Count';
}

/** Longest internal recording gap, in seconds. */
export class DataRRLongestGap extends RRNumber {
  static type = 'R-R Longest Gap';
  static override unit = 's';
}

/** Arithmetic mean of accepted raw intervals, in milliseconds. */
export class DataRRMeanInterval extends RRMilliseconds {
  static type = 'R-R Mean Interval';
}

/** Reciprocal of accepted mean interval, distinct from recorded average HR. */
export class DataRRHeartRateAvg extends RRNumber {
  static type = 'R-R Average Heart Rate';
  static override unit = 'bpm';
}

/** Minimum of available complete, coverage-gated ten-second R–R-derived HR windows. */
export class DataRRHeartRateMin extends RRNumber {
  static type = 'R-R Minimum Heart Rate';
  static override unit = 'bpm';
}

/** Maximum of available complete, coverage-gated ten-second R–R-derived HR windows. */
export class DataRRHeartRateMax extends RRNumber {
  static type = 'R-R Maximum Heart Rate';
  static override unit = 'bpm';
}

/** Activity HRV: root mean square of adjacent accepted differences, in milliseconds. */
export class DataRRRMSSD extends RRMilliseconds {
  static type = 'R-R RMSSD';
}

/** Activity HRV: sample standard deviation of accepted intervals, in milliseconds. */
export class DataRRSDNN extends RRMilliseconds {
  static type = 'R-R SDNN';
}

/** Percentage of accepted adjacent differences strictly greater than 50 ms. */
export class DataRRPNN50 extends RRPercentage {
  static type = 'R-R pNN50';
}

/** Median of quality-gated two-minute DFA alpha1 windows, every five seconds. */
export class DataRRDFAAlpha1Median extends RRAlpha {
  static type = 'R-R DFA Alpha1 Median';
}

/** Minimum of available two-minute DFA alpha1 windows. */
export class DataRRDFAAlpha1Min extends RRAlpha {
  static type = 'R-R DFA Alpha1 Minimum';
}

/** Maximum of available two-minute DFA alpha1 windows. */
export class DataRRDFAAlpha1Max extends RRAlpha {
  static type = 'R-R DFA Alpha1 Maximum';
}

/** Count of available quality-gated DFA alpha1 windows. */
export class DataRRDFAWindowCount extends RRCount {
  static type = 'R-R DFA Window Count';
}
