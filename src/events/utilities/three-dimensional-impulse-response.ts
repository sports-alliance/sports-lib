import type { PowerCurveSampleLike } from './power-curve-sampling';

/**
 * The three parameters of the Morton three-parameter critical-power model.
 *
 * `criticalPowerWatts` is the sustainable oxidative-power asymptote, `wPrimeJoules`
 * is finite work capacity above it, and `maximumPowerWatts` is the fatigue-free
 * maximum power. All three values must be strictly positive and maximum power
 * must exceed critical power.
 */
export interface ThreeParameterCriticalPowerModel {
  criticalPowerWatts: number;
  wPrimeJoules: number;
  maximumPowerWatts: number;
}

export interface ThreeParameterCriticalPowerFitOptions {
  /** Minimum number of distinct curve durations required. Defaults to 5. */
  minimumSampleCount?: number;
  /** Maximum Nelder-Mead iterations per deterministic starting point. Defaults to 800. */
  maximumIterations?: number;
}

export interface ThreeParameterCriticalPowerFit {
  model: ThreeParameterCriticalPowerModel;
  sampleCount: number;
  rmseWatts: number;
  normalizedRmse: number;
  rSquared: number | null;
  iterations: number;
  converged: boolean;
}

export interface ThreeDimensionalPowerContributions {
  criticalPowerWatts: number;
  wPrimeWatts: number;
  maximumPowerWatts: number;
}

export interface ThreeDimensionalStrainScores {
  total: number;
  criticalPower: number;
  wPrime: number;
  maximumPower: number;
}

export type ThreeDimensionalStrainStatus = 'ready' | 'insufficient-evidence' | 'invalid-model';

export type ThreeDimensionalStrainReason =
  | 'missing-power'
  | 'insufficient-coverage'
  | 'power-exceeds-maximum'
  | 'invalid-model';

/**
 * A power sample may be a direct watt value or an object whose optional duration
 * gives that sample's elapsed interval. Direct values use `sampleIntervalSeconds`.
 */
export type ThreeDimensionalPowerSample =
  | number
  | null
  | undefined
  | {
      power: unknown;
      durationSeconds?: unknown;
    };

export interface CalculateThreeDimensionalStrainOptions {
  /** Elapsed seconds for a direct numeric sample. Defaults to one second. */
  sampleIntervalSeconds?: number;
  /** Minimum recorded-duration coverage required for a usable result. Defaults to 0.95. */
  minimumCoverageRatio?: number;
  /** Minimum recorded power duration required for a usable result. Defaults to one second. */
  minimumRecordedDurationSeconds?: number;
  /**
   * The MPA exponent. `1` implements Equation 4 in Kontro et al.; `2` implements
   * the modified MPA calculation used in the paper's Fig 4/5 supporting workbook.
   * Defaults to `1`.
   */
  maximumPowerAvailableExponent?: 1 | 2;
  /** W′ balance at the start of the activity. Defaults to a fully recovered W′. */
  initialWPrimeBalanceJoules?: number;
}

export interface ThreeDimensionalStrainAnalysis {
  status: ThreeDimensionalStrainStatus;
  reason: ThreeDimensionalStrainReason | null;
  sampleCount: number;
  validSampleCount: number;
  candidateDurationSeconds: number;
  recordedDurationSeconds: number;
  coverageRatio: number;
  scores: ThreeDimensionalStrainScores | null;
  endingWPrimeBalanceJoules: number | null;
  minimumWPrimeBalanceJoules: number | null;
}

export interface ImpulseResponseParameters {
  baseline: number;
  fitnessGain: number;
  fatigueGain: number;
  fitnessTimeConstantDays: number;
  fatigueTimeConstantDays: number;
  initialFitness?: number;
  initialFatigue?: number;
}

export interface ImpulseResponsePoint {
  load: number;
  fitness: number;
  fatigue: number;
  performance: number;
}

export interface ThreeDimensionalStrainLoad {
  criticalPower: number;
  wPrime: number;
  maximumPower: number;
}

export interface ThreeDimensionalImpulseResponseParameters {
  criticalPower: ImpulseResponseParameters;
  wPrime: ImpulseResponseParameters;
  maximumPower: ImpulseResponseParameters;
}

export interface ThreeDimensionalImpulseResponsePoint {
  criticalPower: ImpulseResponsePoint;
  wPrime: ImpulseResponsePoint;
  maximumPower: ImpulseResponsePoint;
}

const DEFAULT_MINIMUM_SAMPLE_COUNT = 5;
const DEFAULT_MAXIMUM_ITERATIONS = 800;
const DEFAULT_SAMPLE_INTERVAL_SECONDS = 1;
const DEFAULT_MINIMUM_COVERAGE_RATIO = 0.95;
const DEFAULT_MINIMUM_RECORDED_DURATION_SECONDS = 1;
const MAXIMUM_SIMPLEX_COORDINATE = 10;
const MINIMUM_SIMPLEX_COORDINATE = -10;
const FIT_EPSILON = 1e-9;

/**
 * Predicts mean maximal power for a duration using Morton's three-parameter
 * critical-power model. Returns `null` for invalid model inputs or durations.
 */
export function predictThreeParameterCriticalPower(
  model: ThreeParameterCriticalPowerModel,
  durationSeconds: number
): number | null {
  if (!isValidModel(model) || !isFinitePositiveNumber(durationSeconds)) {
    return null;
  }
  const powerRange = model.maximumPowerWatts - model.criticalPowerWatts;
  return model.criticalPowerWatts + model.wPrimeJoules / (durationSeconds + model.wPrimeJoules / powerRange);
}

/**
 * Fits Morton's three-parameter critical-power model to a mean-max power curve.
 * Duplicate durations keep their strongest value. The fit is deterministic and
 * bounded so malformed curves cannot produce negative capacities or Pmax ≤ CP.
 */
export function fitThreeParameterCriticalPowerModel(
  points: readonly PowerCurveSampleLike[],
  options: ThreeParameterCriticalPowerFitOptions = {}
): ThreeParameterCriticalPowerFit | null {
  const normalized = normalizePowerCurve(points);
  const minimumSampleCount = resolvePositiveInteger(options.minimumSampleCount, DEFAULT_MINIMUM_SAMPLE_COUNT);
  if (normalized.length < minimumSampleCount) {
    return null;
  }

  const maximumIterations = resolvePositiveInteger(options.maximumIterations, DEFAULT_MAXIMUM_ITERATIONS);
  const minimumPower = Math.min(...normalized.map(point => point.power));
  const maximumPower = Math.max(...normalized.map(point => point.power));
  const maximumDuration = Math.max(...normalized.map(point => point.duration));
  if (!isFinitePositiveNumber(minimumPower) || !isFinitePositiveNumber(maximumPower)) {
    return null;
  }

  const bounds: FitBounds = {
    minimumPower,
    maximumPower,
    minimumWPrime: 1,
    maximumWPrime: Math.max(10_000, maximumDuration * Math.max(maximumPower - minimumPower * 0.05, 1) * 100)
  };
  const objective = (coordinates: readonly number[]): number => {
    const model = decodeFitCoordinates(coordinates, bounds);
    if (!model) {
      return Number.POSITIVE_INFINITY;
    }
    return normalized.reduce((sum, point) => {
      const predicted = predictThreeParameterCriticalPower(model, point.duration);
      return predicted === null ? Number.POSITIVE_INFINITY : sum + Math.pow(predicted - point.power, 2);
    }, 0);
  };

  const baseModel = createFitStartingModel(normalized, bounds);
  const starts = createFitStartingCoordinates(baseModel, bounds);
  let best: NelderMeadResult | null = null;
  for (const start of starts) {
    const candidate = minimizeNelderMead(objective, start, maximumIterations);
    if (!best || candidate.value < best.value) {
      best = candidate;
    }
  }
  if (!best || !Number.isFinite(best.value)) {
    return null;
  }

  const model = decodeFitCoordinates(best.coordinates, bounds);
  if (!model) {
    return null;
  }
  const predictions = normalized.map(point => predictThreeParameterCriticalPower(model, point.duration));
  if (predictions.some((prediction): prediction is null => prediction === null)) {
    return null;
  }
  const meanPower = normalized.reduce((sum, point) => sum + point.power, 0) / normalized.length;
  const totalSumSquares = normalized.reduce((sum, point) => sum + Math.pow(point.power - meanPower, 2), 0);
  const rmseWatts = Math.sqrt(best.value / normalized.length);

  return {
    model,
    sampleCount: normalized.length,
    rmseWatts,
    normalizedRmse: rmseWatts / meanPower,
    rSquared: totalSumSquares > 0 ? 1 - best.value / totalSumSquares : null,
    iterations: best.iterations,
    converged: best.converged
  };
}

/**
 * Splits a power output into the CP, W′, and Pmax components described by
 * Equations 8–10 of Kontro et al. Returns `null` when the output exceeds Pmax.
 */
export function resolveThreeDimensionalPowerContributions(
  powerWatts: number,
  model: ThreeParameterCriticalPowerModel
): ThreeDimensionalPowerContributions | null {
  if (!isValidModel(model) || !isFiniteNonNegativeNumber(powerWatts) || powerWatts > model.maximumPowerWatts) {
    return null;
  }
  if (powerWatts <= model.criticalPowerWatts) {
    return {
      criticalPowerWatts: powerWatts,
      wPrimeWatts: 0,
      maximumPowerWatts: 0
    };
  }
  const aboveCriticalPower = powerWatts - model.criticalPowerWatts;
  const maximumPowerWatts = Math.pow(aboveCriticalPower, 2) / (model.maximumPowerWatts - model.criticalPowerWatts);
  return {
    criticalPowerWatts: model.criticalPowerWatts,
    maximumPowerWatts,
    wPrimeWatts: Math.max(0, aboveCriticalPower - maximumPowerWatts)
  };
}

/**
 * Calculates maximum power available (MPA) from W′ balance. An exponent of one
 * is the published main-model equation; two is the supporting-workbook variant.
 */
export function calculateMaximumPowerAvailable(
  wPrimeBalanceJoules: number,
  model: ThreeParameterCriticalPowerModel,
  maximumPowerAvailableExponent: 1 | 2 = 1
): number | null {
  if (
    !isValidModel(model) ||
    !isFiniteNonNegativeNumber(wPrimeBalanceJoules) ||
    wPrimeBalanceJoules > model.wPrimeJoules ||
    !isValidMaximumPowerAvailableExponent(maximumPowerAvailableExponent)
  ) {
    return null;
  }
  const remainingRatio = wPrimeBalanceJoules / model.wPrimeJoules;
  return (
    model.maximumPowerWatts -
    (model.maximumPowerWatts - model.criticalPowerWatts) * Math.pow(1 - remainingRatio, maximumPowerAvailableExponent)
  );
}

/**
 * Calculates the strain coefficient in Equation 11. Both power and MPA are
 * validated against the model's fatigue-free maximum power.
 */
export function calculateThreeDimensionalStrainCoefficient(
  powerWatts: number,
  maximumPowerAvailableWatts: number,
  model: ThreeParameterCriticalPowerModel
): number | null {
  if (
    !isValidModel(model) ||
    !isFiniteNonNegativeNumber(powerWatts) ||
    !isFiniteNonNegativeNumber(maximumPowerAvailableWatts) ||
    powerWatts > model.maximumPowerWatts ||
    maximumPowerAvailableWatts < model.criticalPowerWatts ||
    maximumPowerAvailableWatts > model.maximumPowerWatts
  ) {
    return null;
  }
  const denominator = model.maximumPowerWatts - powerWatts + model.criticalPowerWatts;
  return denominator > 0
    ? (model.maximumPowerWatts - maximumPowerAvailableWatts + model.criticalPowerWatts) / denominator
    : null;
}

/**
 * Converts a continuous power series to total and component strain scores.
 * Missing samples are never interpolated; results remain unavailable until the
 * caller's requested coverage threshold is met.
 */
export function calculateThreeDimensionalStrain(
  samples: readonly ThreeDimensionalPowerSample[],
  model: ThreeParameterCriticalPowerModel,
  options: CalculateThreeDimensionalStrainOptions = {}
): ThreeDimensionalStrainAnalysis {
  const resolvedOptions = resolveStrainOptions(options);
  if (!isValidModel(model) || resolvedOptions === null) {
    return {
      sampleCount: samples.length,
      validSampleCount: 0,
      candidateDurationSeconds: 0,
      recordedDurationSeconds: 0,
      coverageRatio: 0,
      ...createUnavailableStrainAnalysis('invalid-model')
    };
  }

  const normalizedSamples = samples.map(sample => normalizePowerSample(sample, resolvedOptions.sampleIntervalSeconds));
  const candidateDurationSeconds = normalizedSamples.reduce((sum, sample) => sum + sample.durationSeconds, 0);
  const validSamples = normalizedSamples.filter(
    (sample): sample is NormalizedPowerSample & { powerWatts: number } => sample.powerWatts !== null
  );
  const recordedDurationSeconds = validSamples.reduce((sum, sample) => sum + sample.durationSeconds, 0);
  const coverageRatio = candidateDurationSeconds > 0 ? recordedDurationSeconds / candidateDurationSeconds : 0;
  const base = {
    sampleCount: samples.length,
    validSampleCount: validSamples.length,
    candidateDurationSeconds,
    recordedDurationSeconds,
    coverageRatio
  };

  if (!validSamples.length) {
    return { ...base, ...createUnavailableStrainAnalysis('missing-power') };
  }
  if (
    recordedDurationSeconds < resolvedOptions.minimumRecordedDurationSeconds ||
    coverageRatio < resolvedOptions.minimumCoverageRatio
  ) {
    return { ...base, ...createUnavailableStrainAnalysis('insufficient-coverage') };
  }
  if (validSamples.some(sample => sample.powerWatts > model.maximumPowerWatts)) {
    return { ...base, ...createUnavailableStrainAnalysis('power-exceeds-maximum') };
  }

  if (
    resolvedOptions.initialWPrimeBalanceJoules !== null &&
    resolvedOptions.initialWPrimeBalanceJoules > model.wPrimeJoules
  ) {
    return { ...base, ...createUnavailableStrainAnalysis('invalid-model') };
  }

  let wPrimeBalance = resolvedOptions.initialWPrimeBalanceJoules ?? model.wPrimeJoules;
  let minimumWPrimeBalanceJoules = wPrimeBalance;
  const strainRateScale = ((100 / 3600) * model.maximumPowerWatts) / Math.pow(model.criticalPowerWatts, 2);
  const scores: ThreeDimensionalStrainScores = {
    total: 0,
    criticalPower: 0,
    wPrime: 0,
    maximumPower: 0
  };

  validSamples.forEach(sample => {
    wPrimeBalance = calculateNextWPrimeBalance(wPrimeBalance, sample.powerWatts, sample.durationSeconds, model);
    minimumWPrimeBalanceJoules = Math.min(minimumWPrimeBalanceJoules, wPrimeBalance);
    const maximumPowerAvailable = calculateMaximumPowerAvailable(
      wPrimeBalance,
      model,
      resolvedOptions.maximumPowerAvailableExponent
    );
    const contributions = resolveThreeDimensionalPowerContributions(sample.powerWatts, model);
    const strainCoefficient =
      maximumPowerAvailable === null
        ? null
        : calculateThreeDimensionalStrainCoefficient(sample.powerWatts, maximumPowerAvailable, model);
    if (!contributions || strainCoefficient === null) {
      return;
    }
    const sampleScale = strainCoefficient * strainRateScale * sample.durationSeconds;
    scores.total += sample.powerWatts * sampleScale;
    scores.criticalPower += contributions.criticalPowerWatts * sampleScale;
    scores.wPrime += contributions.wPrimeWatts * sampleScale;
    scores.maximumPower += contributions.maximumPowerWatts * sampleScale;
  });

  return {
    status: 'ready',
    reason: null,
    ...base,
    scores,
    endingWPrimeBalanceJoules: wPrimeBalance,
    minimumWPrimeBalanceJoules
  };
}

/**
 * Applies the discrete exponential fitness-fatigue model to a load series with
 * one point per day. Invalid parameters or load values return `null`.
 */
export function calculateImpulseResponse(
  loads: readonly number[],
  parameters: ImpulseResponseParameters
): ImpulseResponsePoint[] | null {
  if (!isValidImpulseResponseParameters(parameters) || loads.some(load => !isFiniteNonNegativeNumber(load))) {
    return null;
  }
  const fitnessAlpha = 1 - Math.exp(-1 / parameters.fitnessTimeConstantDays);
  const fatigueAlpha = 1 - Math.exp(-1 / parameters.fatigueTimeConstantDays);
  let fitness = parameters.initialFitness ?? 0;
  let fatigue = parameters.initialFatigue ?? 0;

  return loads.map(load => {
    fitness = fitness * (1 - fitnessAlpha) + load * fitnessAlpha;
    fatigue = fatigue * (1 - fatigueAlpha) + load * fatigueAlpha;
    return {
      load,
      fitness,
      fatigue,
      performance: parameters.baseline + parameters.fitnessGain * fitness - parameters.fatigueGain * fatigue
    };
  });
}

/**
 * Runs three independent fitness-fatigue responses over CP, W′, and Pmax strain
 * inputs. It intentionally does not calibrate the parameters: callers must fit
 * and validate them against independent performance observations.
 */
export function calculateThreeDimensionalImpulseResponse(
  loads: readonly ThreeDimensionalStrainLoad[],
  parameters: ThreeDimensionalImpulseResponseParameters
): ThreeDimensionalImpulseResponsePoint[] | null {
  if (!parameters || !loads.every(isValidThreeDimensionalStrainLoad)) {
    return null;
  }
  const criticalPower = calculateImpulseResponse(
    loads.map(load => load.criticalPower),
    parameters.criticalPower
  );
  const wPrime = calculateImpulseResponse(
    loads.map(load => load.wPrime),
    parameters.wPrime
  );
  const maximumPower = calculateImpulseResponse(
    loads.map(load => load.maximumPower),
    parameters.maximumPower
  );
  if (!criticalPower || !wPrime || !maximumPower) {
    return null;
  }
  return loads.map((_, index) => ({
    criticalPower: criticalPower[index],
    wPrime: wPrime[index],
    maximumPower: maximumPower[index]
  }));
}

interface NormalizedPowerSample {
  powerWatts: number | null;
  durationSeconds: number;
}

interface ResolvedStrainOptions {
  sampleIntervalSeconds: number;
  minimumCoverageRatio: number;
  minimumRecordedDurationSeconds: number;
  maximumPowerAvailableExponent: 1 | 2;
  initialWPrimeBalanceJoules: number | null;
}

interface FitBounds {
  minimumPower: number;
  maximumPower: number;
  minimumWPrime: number;
  maximumWPrime: number;
}

interface NelderMeadResult {
  coordinates: number[];
  value: number;
  iterations: number;
  converged: boolean;
}

function normalizePowerCurve(points: readonly PowerCurveSampleLike[]): Array<{ duration: number; power: number }> {
  const strongestPowerByDuration = new Map<number, number>();
  points.forEach(point => {
    const duration = toFiniteNumber(point?.duration);
    const power = toFiniteNumber(point?.power);
    if (!isFinitePositiveNumber(duration) || !isFinitePositiveNumber(power)) {
      return;
    }
    const strongest = strongestPowerByDuration.get(duration);
    if (strongest === undefined || power > strongest) {
      strongestPowerByDuration.set(duration, power);
    }
  });
  return Array.from(strongestPowerByDuration, ([duration, power]) => ({ duration, power })).sort(
    (left, right) => left.duration - right.duration
  );
}

function createFitStartingModel(
  points: readonly { duration: number; power: number }[],
  bounds: FitBounds
): ThreeParameterCriticalPowerModel {
  const middlePoint = points[Math.floor(points.length / 2)];
  const criticalPowerWatts = Math.max(bounds.minimumPower * 0.5, bounds.minimumPower * 0.9);
  const maximumPowerWatts = Math.max(bounds.maximumPower * 1.1, criticalPowerWatts + 1);
  const wPrimeJoules = clamp(
    Math.max(100, (middlePoint.power - criticalPowerWatts) * middlePoint.duration),
    bounds.minimumWPrime,
    bounds.maximumWPrime
  );
  return { criticalPowerWatts, wPrimeJoules, maximumPowerWatts };
}

function createFitStartingCoordinates(model: ThreeParameterCriticalPowerModel, bounds: FitBounds): number[][] {
  const base = encodeFitModel(model, bounds);
  if (!base) {
    return [];
  }
  return [
    base,
    [base[0] - 0.8, base[1] + 0.7, base[2] + 0.5],
    [base[0] + 0.8, base[1] - 0.7, base[2] - 0.5],
    [base[0] - 1.5, base[1] + 1.2, base[2] + 1]
  ].map(coordinates => coordinates.map(coordinate => clampSimplexCoordinate(coordinate)));
}

function encodeFitModel(model: ThreeParameterCriticalPowerModel, bounds: FitBounds): number[] | null {
  if (!isValidModel(model)) {
    return null;
  }
  const criticalPowerRatio = model.criticalPowerWatts / bounds.minimumPower;
  const maximumPowerDeltaRatio = (model.maximumPowerWatts - bounds.maximumPower) / bounds.maximumPower;
  if (
    criticalPowerRatio <= 0 ||
    criticalPowerRatio >= 1 ||
    maximumPowerDeltaRatio <= 0 ||
    model.wPrimeJoules < bounds.minimumWPrime ||
    model.wPrimeJoules > bounds.maximumWPrime
  ) {
    return null;
  }
  return [
    logit(criticalPowerRatio),
    normalizeLogRange(model.wPrimeJoules, bounds.minimumWPrime, bounds.maximumWPrime),
    normalizeLogRange(maximumPowerDeltaRatio, FIT_EPSILON, 100)
  ].map(coordinate => clampSimplexCoordinate(coordinate));
}

function decodeFitCoordinates(
  coordinates: readonly number[],
  bounds: FitBounds
): ThreeParameterCriticalPowerModel | null {
  if (coordinates.length !== 3 || coordinates.some(coordinate => !Number.isFinite(coordinate))) {
    return null;
  }
  const criticalPowerWatts = bounds.minimumPower * sigmoid(clampSimplexCoordinate(coordinates[0]));
  const wPrimeJoules = denormalizeLogRange(
    clampSimplexCoordinate(coordinates[1]),
    bounds.minimumWPrime,
    bounds.maximumWPrime
  );
  const maximumPowerWatts =
    bounds.maximumPower * (1 + denormalizeLogRange(clampSimplexCoordinate(coordinates[2]), FIT_EPSILON, 100));
  const model = { criticalPowerWatts, wPrimeJoules, maximumPowerWatts };
  return isValidModel(model) ? model : null;
}

function minimizeNelderMead(
  objective: (coordinates: readonly number[]) => number,
  start: readonly number[],
  maximumIterations: number
): NelderMeadResult {
  const dimensions = start.length;
  const initialStep = [0.75, 0.75, 0.75];
  let simplex = Array.from({ length: dimensions + 1 }, (_, index) => {
    const coordinates = [...start];
    if (index > 0) {
      coordinates[index - 1] = clampSimplexCoordinate(coordinates[index - 1] + initialStep[index - 1]);
    }
    return { coordinates, value: objective(coordinates) };
  });
  let iterations = 0;

  for (; iterations < maximumIterations; iterations += 1) {
    simplex = simplex.sort((left, right) => left.value - right.value);
    if (hasSimplexConverged(simplex)) {
      return { ...simplex[0], iterations, converged: true };
    }
    const centroid = Array.from(
      { length: dimensions },
      (_, dimension) =>
        simplex.slice(0, dimensions).reduce((sum, point) => sum + point.coordinates[dimension], 0) / dimensions
    );
    const worst = simplex[dimensions];
    const reflected = evaluatePoint(objective, transformPoint(centroid, worst.coordinates, 1));

    if (reflected.value < simplex[0].value) {
      const expanded = evaluatePoint(objective, transformPoint(centroid, worst.coordinates, 2));
      simplex[dimensions] = expanded.value < reflected.value ? expanded : reflected;
      continue;
    }
    if (reflected.value < simplex[dimensions - 1].value) {
      simplex[dimensions] = reflected;
      continue;
    }

    const contracted =
      reflected.value < worst.value
        ? evaluatePoint(objective, transformPoint(centroid, worst.coordinates, 0.5))
        : evaluatePoint(objective, midpoint(centroid, worst.coordinates));
    if (contracted.value < Math.min(worst.value, reflected.value)) {
      simplex[dimensions] = contracted;
      continue;
    }

    const best = simplex[0];
    simplex = simplex.map((point, index) =>
      index === 0 ? point : evaluatePoint(objective, midpoint(best.coordinates, point.coordinates))
    );
  }
  simplex = simplex.sort((left, right) => left.value - right.value);
  return { ...simplex[0], iterations, converged: false };
}

function transformPoint(centroid: readonly number[], point: readonly number[], multiplier: number): number[] {
  return centroid.map((value, index) => clampSimplexCoordinate(value + multiplier * (value - point[index])));
}

function midpoint(left: readonly number[], right: readonly number[]): number[] {
  return left.map((value, index) => clampSimplexCoordinate((value + right[index]) / 2));
}

function evaluatePoint(
  objective: (coordinates: readonly number[]) => number,
  coordinates: number[]
): { coordinates: number[]; value: number } {
  return { coordinates, value: objective(coordinates) };
}

function hasSimplexConverged(simplex: readonly { coordinates: number[]; value: number }[]): boolean {
  const best = simplex[0];
  const worst = simplex[simplex.length - 1];
  const largestCoordinateDistance = simplex.reduce(
    (largest, point) =>
      Math.max(
        largest,
        point.coordinates.reduce(
          (distance, coordinate, index) => Math.max(distance, Math.abs(coordinate - best.coordinates[index])),
          0
        )
      ),
    0
  );
  return (
    Math.abs(worst.value - best.value) <= 1e-9 * Math.max(1, Math.abs(best.value)) && largestCoordinateDistance <= 1e-5
  );
}

function resolveStrainOptions(options: CalculateThreeDimensionalStrainOptions): ResolvedStrainOptions | null {
  const sampleIntervalSeconds = resolvePositiveNumber(options.sampleIntervalSeconds, DEFAULT_SAMPLE_INTERVAL_SECONDS);
  const minimumRecordedDurationSeconds = resolvePositiveNumber(
    options.minimumRecordedDurationSeconds,
    DEFAULT_MINIMUM_RECORDED_DURATION_SECONDS
  );
  const minimumCoverageRatio =
    options.minimumCoverageRatio === undefined ? DEFAULT_MINIMUM_COVERAGE_RATIO : options.minimumCoverageRatio;
  const maximumPowerAvailableExponent = options.maximumPowerAvailableExponent ?? 1;
  if (
    !isFinitePositiveNumber(sampleIntervalSeconds) ||
    !isFinitePositiveNumber(minimumRecordedDurationSeconds) ||
    !Number.isFinite(minimumCoverageRatio) ||
    minimumCoverageRatio <= 0 ||
    minimumCoverageRatio > 1 ||
    !isValidMaximumPowerAvailableExponent(maximumPowerAvailableExponent)
  ) {
    return null;
  }
  const initialWPrimeBalanceJoules = options.initialWPrimeBalanceJoules;
  if (initialWPrimeBalanceJoules !== undefined && !isFiniteNonNegativeNumber(initialWPrimeBalanceJoules)) {
    return null;
  }
  return {
    sampleIntervalSeconds,
    minimumRecordedDurationSeconds,
    minimumCoverageRatio,
    maximumPowerAvailableExponent,
    initialWPrimeBalanceJoules: initialWPrimeBalanceJoules ?? null
  };
}

function normalizePowerSample(
  sample: ThreeDimensionalPowerSample,
  defaultDurationSeconds: number
): NormalizedPowerSample {
  if (typeof sample === 'number' || sample === null || sample === undefined) {
    return {
      powerWatts: isFiniteNonNegativeNumber(sample) ? sample : null,
      durationSeconds: defaultDurationSeconds
    };
  }
  const hasExplicitDuration = sample.durationSeconds !== undefined;
  const durationSeconds = hasExplicitDuration ? toFiniteNumber(sample.durationSeconds) : defaultDurationSeconds;
  const powerWatts = toFiniteNumber(sample.power);
  return {
    powerWatts: isFiniteNonNegativeNumber(powerWatts) && isFinitePositiveNumber(durationSeconds) ? powerWatts : null,
    durationSeconds: isFinitePositiveNumber(durationSeconds) ? durationSeconds : defaultDurationSeconds
  };
}

function calculateNextWPrimeBalance(
  previousBalance: number,
  powerWatts: number,
  durationSeconds: number,
  model: ThreeParameterCriticalPowerModel
): number {
  const expended = model.wPrimeJoules - previousBalance;
  const nextExpended =
    powerWatts > model.criticalPowerWatts
      ? expended + (powerWatts - model.criticalPowerWatts) * durationSeconds
      : expended * Math.exp(-((model.criticalPowerWatts - powerWatts) * durationSeconds) / model.wPrimeJoules);
  return clamp(model.wPrimeJoules - nextExpended, 0, model.wPrimeJoules);
}

function createUnavailableStrainAnalysis(
  reason: ThreeDimensionalStrainReason
): Omit<
  ThreeDimensionalStrainAnalysis,
  'sampleCount' | 'validSampleCount' | 'candidateDurationSeconds' | 'recordedDurationSeconds' | 'coverageRatio'
> {
  return {
    status: reason === 'invalid-model' ? 'invalid-model' : 'insufficient-evidence',
    reason,
    scores: null,
    endingWPrimeBalanceJoules: null,
    minimumWPrimeBalanceJoules: null
  };
}

function isValidImpulseResponseParameters(parameters: ImpulseResponseParameters): boolean {
  return (
    !!parameters &&
    Number.isFinite(parameters.baseline) &&
    Number.isFinite(parameters.fitnessGain) &&
    parameters.fitnessGain >= 0 &&
    Number.isFinite(parameters.fatigueGain) &&
    parameters.fatigueGain >= 0 &&
    isFinitePositiveNumber(parameters.fitnessTimeConstantDays) &&
    isFinitePositiveNumber(parameters.fatigueTimeConstantDays) &&
    (parameters.initialFitness === undefined || isFiniteNonNegativeNumber(parameters.initialFitness)) &&
    (parameters.initialFatigue === undefined || isFiniteNonNegativeNumber(parameters.initialFatigue))
  );
}

function isValidThreeDimensionalStrainLoad(load: ThreeDimensionalStrainLoad): boolean {
  return (
    !!load &&
    isFiniteNonNegativeNumber(load.criticalPower) &&
    isFiniteNonNegativeNumber(load.wPrime) &&
    isFiniteNonNegativeNumber(load.maximumPower)
  );
}

function isValidModel(
  model: ThreeParameterCriticalPowerModel | null | undefined
): model is ThreeParameterCriticalPowerModel {
  return (
    !!model &&
    isFinitePositiveNumber(model.criticalPowerWatts) &&
    isFinitePositiveNumber(model.wPrimeJoules) &&
    isFinitePositiveNumber(model.maximumPowerWatts) &&
    model.maximumPowerWatts > model.criticalPowerWatts
  );
}

function isValidMaximumPowerAvailableExponent(value: unknown): value is 1 | 2 {
  return value === 1 || value === 2;
}

function toFiniteNumber(value: unknown, seen = new Set<object>()): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string') {
    return value.trim() && Number.isFinite(Number(value)) ? Number(value) : null;
  }
  if (!value || typeof value !== 'object' || seen.has(value)) {
    return null;
  }
  const getter = 'getValue' in value ? value.getValue : undefined;
  if (typeof getter !== 'function') {
    return null;
  }
  seen.add(value);
  try {
    return toFiniteNumber(getter.call(value), seen);
  } catch (_error) {
    return null;
  }
}

function isFinitePositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isFiniteNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function resolvePositiveInteger(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : fallback;
}

function resolvePositiveNumber(value: unknown, fallback: number): number {
  return value === undefined ? fallback : typeof value === 'number' ? value : Number.NaN;
}

function sigmoid(value: number): number {
  return 1 / (1 + Math.exp(-value));
}

function logit(value: number): number {
  return Math.log(value / (1 - value));
}

function normalizeLogRange(value: number, lower: number, upper: number): number {
  const ratio = (Math.log(value) - Math.log(lower)) / (Math.log(upper) - Math.log(lower));
  return logit(clamp(ratio, FIT_EPSILON, 1 - FIT_EPSILON));
}

function denormalizeLogRange(coordinate: number, lower: number, upper: number): number {
  const ratio = sigmoid(coordinate);
  return Math.exp(Math.log(lower) + ratio * (Math.log(upper) - Math.log(lower)));
}

function clampSimplexCoordinate(value: number): number {
  return clamp(value, MINIMUM_SIMPLEX_COORDINATE, MAXIMUM_SIMPLEX_COORDINATE);
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
