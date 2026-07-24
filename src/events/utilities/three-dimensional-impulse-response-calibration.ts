import type { ImpulseResponseParameters, ThreeDimensionalStrainLoad } from './three-dimensional-impulse-response';

/** A single calendar day's pre-aggregated CP, W′, and Pmax strain-score loads. */
export interface ThreeDimensionalDailyStrainLoad extends ThreeDimensionalStrainLoad {
  /** Calendar day in the unambiguous `YYYY-MM-DD` form. Missing days are treated as zero load. */
  date: string;
}

/**
 * An independently measured performance observation for one or more three-parameter
 * critical-power outputs. Values must come from a measurement protocol that is independent
 * of the activity data used to calculate the training loads.
 */
export interface ThreeDimensionalPerformanceObservation {
  /** Calendar day in the unambiguous `YYYY-MM-DD` form. */
  date: string;
  /** Measured critical power, in watts. */
  criticalPowerWatts?: number;
  /** Measured W′, in joules. */
  wPrimeJoules?: number;
  /** Measured fatigue-free maximum power, in watts. */
  maximumPowerWatts?: number;
}

/** Bounds and data-sufficiency controls for fitting the three parallel response models. */
export interface FitThreeDimensionalImpulseResponseOptions {
  /**
   * Minimum number of observations required for each output, including held-out observations.
   * Defaults to 16.
   */
  minimumObservationCount?: number;
  /** Minimum observations used for parameter fitting before hold-out validation. Defaults to 12. */
  minimumTrainingObservationCount?: number;
  /** Number of latest observations reserved for chronological validation. Defaults to 4. */
  validationObservationCount?: number;
  /** Minimum calendar span covered by the fitting observations. Defaults to 56 days. */
  minimumTrainingSpanDays?: number;
  /** Lower bound for either response time constant. Defaults to 2 days. */
  minimumTimeConstantDays?: number;
  /** Upper bound for either response time constant. Defaults to 180 days. */
  maximumTimeConstantDays?: number;
  /**
   * Enforces a fitness response no shorter than the fatigue response. Defaults to 1, so the
   * fitness time constant must be at least as long as the fatigue time constant. Must be at least 1.
   */
  minimumFitnessToFatigueTimeConstantRatio?: number;
  /** Maximum deterministic Nelder-Mead iterations per starting point. Defaults to 500. */
  maximumIterations?: number;
  /**
   * Maximum held-out RMSE divided by the held-out mean performance measurement. Defaults to
   * 0.10. This is a quality gate, not an athlete-specific model parameter.
   */
  maximumValidationNormalizedRmse?: number;
  /**
   * Maximum inclusive calendar span after zero-fill. Defaults to 3,660 days (roughly ten
   * years), protecting callers from malformed dates creating unbounded allocations.
   */
  maximumCalendarSpanDays?: number;
}

export type ImpulseResponseCalibrationStatus = 'ready' | 'insufficient-evidence' | 'poor-fit';

export type ImpulseResponseCalibrationReason =
  | 'missing-observations'
  | 'insufficient-observations'
  | 'insufficient-training-observations'
  | 'insufficient-training-span'
  | 'no-training-response-signal'
  | 'optimizer-failed'
  | 'time-constant-at-bound'
  | 'validation-error-exceeds-limit'
  | null;

/** Error summary for either the fitting or held-out observations. */
export interface ImpulseResponseCalibrationError {
  rmse: number;
  normalizedRmse: number;
  meanAbsoluteError: number;
  meanBias: number;
}

/** Diagnostics retained for a calibrated component without retaining raw observations. */
export interface ImpulseResponseCalibrationDiagnostics {
  observationCount: number;
  trainingObservationCount: number;
  validationObservationCount: number;
  trainingSpanDays: number;
  trainingError: ImpulseResponseCalibrationError;
  validationError: ImpulseResponseCalibrationError;
  iterations: number;
  converged: boolean;
  /** True when optimization reached a configured time-constant bound. */
  hitTimeConstantBoundary: boolean;
}

/** The outcome of fitting one independent CP, W′, or Pmax response model. */
export interface ImpulseResponseComponentCalibration {
  status: ImpulseResponseCalibrationStatus;
  reason: ImpulseResponseCalibrationReason;
  /** Null unless the model met the held-out validation quality gate. */
  parameters: ImpulseResponseParameters | null;
  /** Present once enough data allowed an optimization attempt, including a poor held-out fit. */
  diagnostics: ImpulseResponseCalibrationDiagnostics | null;
}

export type ThreeDimensionalImpulseResponseCalibrationStatus =
  | 'ready'
  | 'partial'
  | 'insufficient-evidence'
  | 'poor-fit'
  | 'invalid-input';

export type ThreeDimensionalImpulseResponseCalibrationReason =
  | 'invalid-options'
  | 'invalid-daily-loads'
  | 'invalid-observations'
  | 'observations-precede-load-history'
  | 'calendar-span-exceeds-limit'
  | null;

/**
 * Calibration result for the three parallel energy-system responses. A `ready` result has a
 * validated parameter set for all three outputs. `partial` keeps any individually valid result,
 * while `poor-fit` and `insufficient-evidence` must not be treated as predictive parameters.
 */
export interface ThreeDimensionalImpulseResponseCalibration {
  status: ThreeDimensionalImpulseResponseCalibrationStatus;
  reason: ThreeDimensionalImpulseResponseCalibrationReason;
  /** Inclusive calendar range represented by the zero-filled daily load series. */
  dateRange: { start: string; end: string } | null;
  dailyLoadCount: number;
  criticalPower: ImpulseResponseComponentCalibration;
  wPrime: ImpulseResponseComponentCalibration;
  maximumPower: ImpulseResponseComponentCalibration;
}

interface ResolvedFitOptions {
  minimumObservationCount: number;
  minimumTrainingObservationCount: number;
  validationObservationCount: number;
  minimumTrainingSpanDays: number;
  minimumTimeConstantDays: number;
  maximumTimeConstantDays: number;
  minimumFitnessToFatigueTimeConstantRatio: number;
  maximumIterations: number;
  maximumValidationNormalizedRmse: number;
  maximumCalendarSpanDays: number;
}

interface IndexedObservation {
  dayIndex: number;
  value: number;
}

interface ResponseStates {
  fitness: number[];
  fatigue: number[];
}

interface LinearCoefficients {
  baseline: number;
  fitnessGain: number;
  fatigueGain: number;
  sumSquaredError: number;
}

interface CalibrationCandidate {
  parameters: ImpulseResponseParameters;
  states: ResponseStates;
  sumSquaredError: number;
  iterations: number;
  converged: boolean;
  hitTimeConstantBoundary: boolean;
}

interface NelderMeadResult {
  coordinates: number[];
  value: number;
  iterations: number;
  converged: boolean;
}

const DEFAULT_MINIMUM_OBSERVATION_COUNT = 16;
const DEFAULT_MINIMUM_TRAINING_OBSERVATION_COUNT = 12;
const DEFAULT_VALIDATION_OBSERVATION_COUNT = 4;
const DEFAULT_MINIMUM_TRAINING_SPAN_DAYS = 56;
const DEFAULT_MINIMUM_TIME_CONSTANT_DAYS = 2;
const DEFAULT_MAXIMUM_TIME_CONSTANT_DAYS = 180;
const DEFAULT_MINIMUM_FITNESS_TO_FATIGUE_RATIO = 1;
const DEFAULT_MAXIMUM_ITERATIONS = 500;
const DEFAULT_MAXIMUM_VALIDATION_NORMALIZED_RMSE = 0.1;
const DEFAULT_MAXIMUM_CALENDAR_SPAN_DAYS = 3_660;
const CALIBRATION_COORDINATE_LIMIT = 10;
const CALIBRATION_EPSILON = 1e-10;

/**
 * Fits the paper's three independent fitness-fatigue response models to dated daily strain
 * loads and independent CP, W′, and Pmax performance observations.
 *
 * The fitter never uses held-out observations to choose parameters: the latest observations for
 * each output are reserved for chronological validation. It also never invents athlete-specific
 * gains or time constants when evidence is insufficient. Callers should aggregate activity strain
 * into one load per calendar day, include zero-load rest days implicitly, and periodically
 * recalibrate with independently measured performance observations. Returned models retain a
 * strictly positive baseline and daily performance trajectory.
 */
export function fitThreeDimensionalImpulseResponseParameters(
  dailyLoads: readonly ThreeDimensionalDailyStrainLoad[],
  observations: readonly ThreeDimensionalPerformanceObservation[],
  options: FitThreeDimensionalImpulseResponseOptions = {}
): ThreeDimensionalImpulseResponseCalibration {
  const resolvedOptions = resolveFitOptions(options);
  if (!resolvedOptions) {
    return createInvalidCalibration('invalid-options');
  }
  if (!isValidDailyLoads(dailyLoads)) {
    return createInvalidCalibration('invalid-daily-loads');
  }
  if (!isValidPerformanceObservations(observations)) {
    return createInvalidCalibration('invalid-observations');
  }

  const dates = [...dailyLoads.map(load => load.date), ...observations.map(observation => observation.date)];
  if (dates.length === 0) {
    return createInvalidCalibration('invalid-daily-loads');
  }
  const firstLoadDate = Math.min(...dailyLoads.map(load => dateToDayNumber(load.date)!));
  const earliestObservationDate = observations.length
    ? Math.min(...observations.map(observation => dateToDayNumber(observation.date)!))
    : firstLoadDate;
  if (earliestObservationDate < firstLoadDate) {
    return createInvalidCalibration('observations-precede-load-history');
  }

  const startDay = Math.min(...dates.map(date => dateToDayNumber(date)!));
  const endDay = Math.max(...dates.map(date => dateToDayNumber(date)!));
  const dailyLoadCount = endDay - startDay + 1;
  if (dailyLoadCount > resolvedOptions.maximumCalendarSpanDays) {
    return createInvalidCalibration('calendar-span-exceeds-limit');
  }

  const normalizedLoads = createDenseDailyLoads(dailyLoads, startDay, dailyLoadCount);
  const indexedObservations = createIndexedObservations(observations, startDay);
  const criticalPower = fitComponent(
    normalizedLoads.map(load => load.criticalPower),
    indexedObservations.criticalPower,
    resolvedOptions
  );
  const wPrime = fitComponent(
    normalizedLoads.map(load => load.wPrime),
    indexedObservations.wPrime,
    resolvedOptions
  );
  const maximumPower = fitComponent(
    normalizedLoads.map(load => load.maximumPower),
    indexedObservations.maximumPower,
    resolvedOptions
  );
  const components = [criticalPower, wPrime, maximumPower];
  const readyCount = components.filter(component => component.status === 'ready').length;
  const hasPoorFit = components.some(component => component.status === 'poor-fit');

  return {
    status:
      readyCount === components.length
        ? 'ready'
        : readyCount > 0
          ? 'partial'
          : hasPoorFit
            ? 'poor-fit'
            : 'insufficient-evidence',
    reason: null,
    dateRange: { start: dayNumberToDate(startDay), end: dayNumberToDate(endDay) },
    dailyLoadCount,
    criticalPower,
    wPrime,
    maximumPower
  };
}

function fitComponent(
  loads: readonly number[],
  observations: readonly IndexedObservation[],
  options: ResolvedFitOptions
): ImpulseResponseComponentCalibration {
  if (observations.length === 0) {
    return createUnavailableComponentCalibration('missing-observations');
  }
  if (observations.length < options.minimumObservationCount) {
    return createUnavailableComponentCalibration('insufficient-observations');
  }

  const validationStart = observations.length - options.validationObservationCount;
  const trainingObservations = observations.slice(0, validationStart);
  const validationObservations = observations.slice(validationStart);
  if (trainingObservations.length < options.minimumTrainingObservationCount) {
    return createUnavailableComponentCalibration('insufficient-training-observations');
  }
  const trainingSpanDays =
    trainingObservations[trainingObservations.length - 1].dayIndex - trainingObservations[0].dayIndex;
  if (trainingSpanDays < options.minimumTrainingSpanDays) {
    return createUnavailableComponentCalibration('insufficient-training-span');
  }

  const objective = (coordinates: readonly number[]): number => {
    const timeConstants = decodeTimeConstantCoordinates(coordinates, options);
    if (!timeConstants) {
      return Number.POSITIVE_INFINITY;
    }
    const states = calculateResponseStates(
      loads,
      timeConstants.fitnessTimeConstantDays,
      timeConstants.fatigueTimeConstantDays
    );
    const coefficients = fitNonNegativeCoefficients(states, trainingObservations);
    return coefficients && hasPositivePerformanceTrajectory(states, coefficients)
      ? coefficients.sumSquaredError
      : Number.POSITIVE_INFINITY;
  };

  let best: CalibrationCandidate | null = null;
  for (const start of createCalibrationStarts()) {
    const result = minimizeNelderMead(objective, start, options.maximumIterations);
    const timeConstants = decodeTimeConstantCoordinates(result.coordinates, options);
    if (!timeConstants || !Number.isFinite(result.value)) {
      continue;
    }
    const states = calculateResponseStates(
      loads,
      timeConstants.fitnessTimeConstantDays,
      timeConstants.fatigueTimeConstantDays
    );
    const coefficients = fitNonNegativeCoefficients(states, trainingObservations);
    if (
      !coefficients ||
      !Number.isFinite(coefficients.sumSquaredError) ||
      !hasPositivePerformanceTrajectory(states, coefficients)
    ) {
      continue;
    }
    const candidate: CalibrationCandidate = {
      parameters: {
        baseline: coefficients.baseline,
        fitnessGain: coefficients.fitnessGain,
        fatigueGain: coefficients.fatigueGain,
        fitnessTimeConstantDays: timeConstants.fitnessTimeConstantDays,
        fatigueTimeConstantDays: timeConstants.fatigueTimeConstantDays
      },
      states,
      sumSquaredError: coefficients.sumSquaredError,
      iterations: result.iterations,
      converged: result.converged,
      hitTimeConstantBoundary: result.coordinates.some(
        coordinate => Math.abs(coordinate) >= CALIBRATION_COORDINATE_LIMIT - 0.001
      )
    };
    if (!best || candidate.sumSquaredError < best.sumSquaredError) {
      best = candidate;
    }
  }

  if (!best) {
    return createUnavailableComponentCalibration('optimizer-failed', 'poor-fit');
  }

  const trainingError = calculateError(best.states, trainingObservations, best.parameters);
  const validationError = calculateError(best.states, validationObservations, best.parameters);
  const diagnostics: ImpulseResponseCalibrationDiagnostics = {
    observationCount: observations.length,
    trainingObservationCount: trainingObservations.length,
    validationObservationCount: validationObservations.length,
    trainingSpanDays,
    trainingError,
    validationError,
    iterations: best.iterations,
    converged: best.converged,
    hitTimeConstantBoundary: best.hitTimeConstantBoundary
  };
  if (best.parameters.fitnessGain === 0 && best.parameters.fatigueGain === 0) {
    return {
      status: 'insufficient-evidence',
      reason: 'no-training-response-signal',
      parameters: null,
      diagnostics
    };
  }
  if (best.hitTimeConstantBoundary) {
    return {
      status: 'poor-fit',
      reason: 'time-constant-at-bound',
      parameters: null,
      diagnostics
    };
  }
  if (validationError.normalizedRmse > options.maximumValidationNormalizedRmse) {
    return {
      status: 'poor-fit',
      reason: 'validation-error-exceeds-limit',
      parameters: null,
      diagnostics
    };
  }
  return { status: 'ready', reason: null, parameters: best.parameters, diagnostics };
}

function createDenseDailyLoads(
  dailyLoads: readonly ThreeDimensionalDailyStrainLoad[],
  startDay: number,
  dailyLoadCount: number
): ThreeDimensionalStrainLoad[] {
  const result = Array.from({ length: dailyLoadCount }, () => ({ criticalPower: 0, wPrime: 0, maximumPower: 0 }));
  dailyLoads.forEach(load => {
    result[dateToDayNumber(load.date)! - startDay] = {
      criticalPower: load.criticalPower,
      wPrime: load.wPrime,
      maximumPower: load.maximumPower
    };
  });
  return result;
}

function createIndexedObservations(
  observations: readonly ThreeDimensionalPerformanceObservation[],
  startDay: number
): Record<'criticalPower' | 'wPrime' | 'maximumPower', IndexedObservation[]> {
  const components: Record<'criticalPower' | 'wPrime' | 'maximumPower', IndexedObservation[]> = {
    criticalPower: [],
    wPrime: [],
    maximumPower: []
  };
  observations.forEach(observation => {
    const dayIndex = dateToDayNumber(observation.date)! - startDay;
    if (observation.criticalPowerWatts !== undefined) {
      components.criticalPower.push({ dayIndex, value: observation.criticalPowerWatts });
    }
    if (observation.wPrimeJoules !== undefined) {
      components.wPrime.push({ dayIndex, value: observation.wPrimeJoules });
    }
    if (observation.maximumPowerWatts !== undefined) {
      components.maximumPower.push({ dayIndex, value: observation.maximumPowerWatts });
    }
  });
  Object.values(components).forEach(componentObservations =>
    componentObservations.sort((left, right) => left.dayIndex - right.dayIndex)
  );
  return components;
}

function calculateResponseStates(
  loads: readonly number[],
  fitnessTimeConstantDays: number,
  fatigueTimeConstantDays: number
): ResponseStates {
  const fitnessAlpha = 1 - Math.exp(-1 / fitnessTimeConstantDays);
  const fatigueAlpha = 1 - Math.exp(-1 / fatigueTimeConstantDays);
  let fitness = 0;
  let fatigue = 0;
  const fitnessValues: number[] = [];
  const fatigueValues: number[] = [];
  loads.forEach(load => {
    fitness = fitness * (1 - fitnessAlpha) + load * fitnessAlpha;
    fatigue = fatigue * (1 - fatigueAlpha) + load * fatigueAlpha;
    fitnessValues.push(fitness);
    fatigueValues.push(fatigue);
  });
  return { fitness: fitnessValues, fatigue: fatigueValues };
}

function fitNonNegativeCoefficients(
  states: ResponseStates,
  observations: readonly IndexedObservation[]
): LinearCoefficients | null {
  const count = observations.length;
  const meanFitness = observations.reduce((sum, observation) => sum + states.fitness[observation.dayIndex], 0) / count;
  const meanFatigue = observations.reduce((sum, observation) => sum + states.fatigue[observation.dayIndex], 0) / count;
  const meanValue = observations.reduce((sum, observation) => sum + observation.value, 0) / count;
  let fitnessVariance = 0;
  let fatigueVariance = 0;
  let covariance = 0;
  let fitnessValueCovariance = 0;
  let fatigueValueCovariance = 0;

  observations.forEach(observation => {
    const centeredFitness = states.fitness[observation.dayIndex] - meanFitness;
    const centeredNegativeFatigue = meanFatigue - states.fatigue[observation.dayIndex];
    const centeredValue = observation.value - meanValue;
    fitnessVariance += centeredFitness * centeredFitness;
    fatigueVariance += centeredNegativeFatigue * centeredNegativeFatigue;
    covariance += centeredFitness * centeredNegativeFatigue;
    fitnessValueCovariance += centeredFitness * centeredValue;
    fatigueValueCovariance += centeredNegativeFatigue * centeredValue;
  });

  const candidates: Array<Omit<LinearCoefficients, 'sumSquaredError'>> = [
    { baseline: meanValue, fitnessGain: 0, fatigueGain: 0 }
  ];
  if (fitnessVariance > CALIBRATION_EPSILON) {
    const fitnessGain = fitnessValueCovariance / fitnessVariance;
    if (fitnessGain >= 0 && Number.isFinite(fitnessGain)) {
      candidates.push({ baseline: meanValue - fitnessGain * meanFitness, fitnessGain, fatigueGain: 0 });
    }
  }
  if (fatigueVariance > CALIBRATION_EPSILON) {
    const fatigueGain = fatigueValueCovariance / fatigueVariance;
    if (fatigueGain >= 0 && Number.isFinite(fatigueGain)) {
      candidates.push({ baseline: meanValue + fatigueGain * meanFatigue, fitnessGain: 0, fatigueGain });
    }
  }
  const determinant = fitnessVariance * fatigueVariance - covariance * covariance;
  if (determinant > CALIBRATION_EPSILON * Math.max(1, fitnessVariance * fatigueVariance)) {
    const fitnessGain = (fitnessValueCovariance * fatigueVariance - fatigueValueCovariance * covariance) / determinant;
    const fatigueGain = (fatigueValueCovariance * fitnessVariance - fitnessValueCovariance * covariance) / determinant;
    if (fitnessGain >= 0 && fatigueGain >= 0 && Number.isFinite(fitnessGain) && Number.isFinite(fatigueGain)) {
      candidates.push({
        baseline: meanValue - fitnessGain * meanFitness + fatigueGain * meanFatigue,
        fitnessGain,
        fatigueGain
      });
    }
  }

  let best: LinearCoefficients | null = null;
  candidates.forEach(candidate => {
    const sumSquaredError = observations.reduce((sum, observation) => {
      const prediction = predictFromStates(states, observation.dayIndex, candidate);
      return sum + Math.pow(prediction - observation.value, 2);
    }, 0);
    if (Number.isFinite(sumSquaredError) && (!best || sumSquaredError < best.sumSquaredError)) {
      best = { ...candidate, sumSquaredError };
    }
  });
  return best;
}

function calculateError(
  states: ResponseStates,
  observations: readonly IndexedObservation[],
  parameters: ImpulseResponseParameters
): ImpulseResponseCalibrationError {
  const residuals = observations.map(
    observation => predictFromStates(states, observation.dayIndex, parameters) - observation.value
  );
  const count = residuals.length;
  const meanObservedValue = observations.reduce((sum, observation) => sum + observation.value, 0) / count;
  const rmse = Math.sqrt(residuals.reduce((sum, residual) => sum + residual * residual, 0) / count);
  return {
    rmse,
    normalizedRmse: rmse / meanObservedValue,
    meanAbsoluteError: residuals.reduce((sum, residual) => sum + Math.abs(residual), 0) / count,
    meanBias: residuals.reduce((sum, residual) => sum + residual, 0) / count
  };
}

function predictFromStates(
  states: ResponseStates,
  dayIndex: number,
  parameters: Pick<ImpulseResponseParameters, 'baseline' | 'fitnessGain' | 'fatigueGain'>
): number {
  return (
    parameters.baseline +
    parameters.fitnessGain * states.fitness[dayIndex] -
    parameters.fatigueGain * states.fatigue[dayIndex]
  );
}

function hasPositivePerformanceTrajectory(
  states: ResponseStates,
  parameters: Pick<ImpulseResponseParameters, 'baseline' | 'fitnessGain' | 'fatigueGain'>
): boolean {
  return (
    isFinitePositiveNumber(parameters.baseline) &&
    states.fitness.every((_, dayIndex) => isFinitePositiveNumber(predictFromStates(states, dayIndex, parameters)))
  );
}

function decodeTimeConstantCoordinates(
  coordinates: readonly number[],
  options: ResolvedFitOptions
): Pick<ImpulseResponseParameters, 'fitnessTimeConstantDays' | 'fatigueTimeConstantDays'> | null {
  if (coordinates.length !== 2 || coordinates.some(coordinate => !Number.isFinite(coordinate))) {
    return null;
  }
  const maximumFatigueTimeConstant = options.maximumTimeConstantDays / options.minimumFitnessToFatigueTimeConstantRatio;
  const fatigueTimeConstantDays = denormalizeLogRange(
    clampCoordinate(coordinates[0]),
    options.minimumTimeConstantDays,
    maximumFatigueTimeConstant
  );
  const minimumFitnessTimeConstant = fatigueTimeConstantDays * options.minimumFitnessToFatigueTimeConstantRatio;
  const fitnessTimeConstantDays = denormalizeLogRange(
    clampCoordinate(coordinates[1]),
    minimumFitnessTimeConstant,
    options.maximumTimeConstantDays
  );
  return Number.isFinite(fitnessTimeConstantDays) && Number.isFinite(fatigueTimeConstantDays)
    ? { fitnessTimeConstantDays, fatigueTimeConstantDays }
    : null;
}

function createCalibrationStarts(): number[][] {
  return [
    [0, 0],
    [-1.5, -1.5],
    [-1, 1],
    [1, -1],
    [1.5, 1.5]
  ];
}

function minimizeNelderMead(
  objective: (coordinates: readonly number[]) => number,
  start: readonly number[],
  maximumIterations: number
): NelderMeadResult {
  const dimensions = start.length;
  const initialStep = 0.75;
  let simplex = Array.from({ length: dimensions + 1 }, (_, index) => {
    const coordinates = [...start];
    if (index > 0) {
      coordinates[index - 1] = clampCoordinate(coordinates[index - 1] + initialStep);
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
  return centroid.map((value, index) => clampCoordinate(value + multiplier * (value - point[index])));
}

function midpoint(left: readonly number[], right: readonly number[]): number[] {
  return left.map((value, index) => clampCoordinate((value + right[index]) / 2));
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

function resolveFitOptions(options: FitThreeDimensionalImpulseResponseOptions): ResolvedFitOptions | null {
  if (!options || typeof options !== 'object') {
    return null;
  }
  const minimumObservationCount = resolvePositiveInteger(
    options.minimumObservationCount,
    DEFAULT_MINIMUM_OBSERVATION_COUNT
  );
  const minimumTrainingObservationCount = resolvePositiveInteger(
    options.minimumTrainingObservationCount,
    DEFAULT_MINIMUM_TRAINING_OBSERVATION_COUNT
  );
  const validationObservationCount = resolvePositiveInteger(
    options.validationObservationCount,
    DEFAULT_VALIDATION_OBSERVATION_COUNT
  );
  const minimumTrainingSpanDays = resolveNonNegativeInteger(
    options.minimumTrainingSpanDays,
    DEFAULT_MINIMUM_TRAINING_SPAN_DAYS
  );
  const minimumTimeConstantDays = resolvePositiveNumber(
    options.minimumTimeConstantDays,
    DEFAULT_MINIMUM_TIME_CONSTANT_DAYS
  );
  const maximumTimeConstantDays = resolvePositiveNumber(
    options.maximumTimeConstantDays,
    DEFAULT_MAXIMUM_TIME_CONSTANT_DAYS
  );
  const minimumFitnessToFatigueTimeConstantRatio = resolvePositiveNumber(
    options.minimumFitnessToFatigueTimeConstantRatio,
    DEFAULT_MINIMUM_FITNESS_TO_FATIGUE_RATIO
  );
  const maximumIterations = resolvePositiveInteger(options.maximumIterations, DEFAULT_MAXIMUM_ITERATIONS);
  const maximumValidationNormalizedRmse = resolveNonNegativeNumber(
    options.maximumValidationNormalizedRmse,
    DEFAULT_MAXIMUM_VALIDATION_NORMALIZED_RMSE
  );
  const maximumCalendarSpanDays = resolvePositiveInteger(
    options.maximumCalendarSpanDays,
    DEFAULT_MAXIMUM_CALENDAR_SPAN_DAYS
  );
  if (
    !minimumObservationCount ||
    !minimumTrainingObservationCount ||
    !validationObservationCount ||
    minimumTrainingSpanDays === null ||
    !minimumTimeConstantDays ||
    !maximumTimeConstantDays ||
    !minimumFitnessToFatigueTimeConstantRatio ||
    !maximumIterations ||
    maximumValidationNormalizedRmse === null ||
    !maximumCalendarSpanDays ||
    minimumObservationCount < minimumTrainingObservationCount + validationObservationCount ||
    minimumFitnessToFatigueTimeConstantRatio < 1 ||
    minimumTimeConstantDays * minimumFitnessToFatigueTimeConstantRatio >= maximumTimeConstantDays
  ) {
    return null;
  }
  return {
    minimumObservationCount,
    minimumTrainingObservationCount,
    validationObservationCount,
    minimumTrainingSpanDays,
    minimumTimeConstantDays,
    maximumTimeConstantDays,
    minimumFitnessToFatigueTimeConstantRatio,
    maximumIterations,
    maximumValidationNormalizedRmse,
    maximumCalendarSpanDays
  };
}

function isValidDailyLoads(dailyLoads: readonly ThreeDimensionalDailyStrainLoad[]): boolean {
  const dates = new Set<string>();
  return (
    dailyLoads.length > 0 &&
    dailyLoads.every(load => {
      if (
        !load ||
        !isValidDate(load.date) ||
        !isFiniteNonNegativeNumber(load.criticalPower) ||
        !isFiniteNonNegativeNumber(load.wPrime) ||
        !isFiniteNonNegativeNumber(load.maximumPower) ||
        dates.has(load.date)
      ) {
        return false;
      }
      dates.add(load.date);
      return true;
    })
  );
}

function isValidPerformanceObservations(observations: readonly ThreeDimensionalPerformanceObservation[]): boolean {
  const measurementsByDate = new Map<string, Partial<Record<'criticalPower' | 'wPrime' | 'maximumPower', number>>>();
  const observationsAreValid = observations.every(observation => {
    if (!observation || !isValidDate(observation.date)) {
      return false;
    }
    const values: Array<['criticalPower' | 'wPrime' | 'maximumPower', number | undefined]> = [
      ['criticalPower', observation.criticalPowerWatts],
      ['wPrime', observation.wPrimeJoules],
      ['maximumPower', observation.maximumPowerWatts]
    ];
    const hasMeasurement = values.some(([, value]) => value !== undefined);
    if (!hasMeasurement) {
      return false;
    }
    const measurements = measurementsByDate.get(observation.date) ?? {};
    const valuesAreValid = values.every(([component, value]) => {
      if (value === undefined) {
        return true;
      }
      if (!isFinitePositiveNumber(value) || measurements[component] !== undefined) {
        return false;
      }
      measurements[component] = value;
      return true;
    });
    if (valuesAreValid) {
      measurementsByDate.set(observation.date, measurements);
    }
    return valuesAreValid;
  });
  return (
    observationsAreValid &&
    [...measurementsByDate.values()].every(
      ({ criticalPower, maximumPower }) =>
        criticalPower === undefined || maximumPower === undefined || maximumPower > criticalPower
    )
  );
}

function createUnavailableComponentCalibration(
  reason: Exclude<ImpulseResponseCalibrationReason, null>,
  status: ImpulseResponseCalibrationStatus = 'insufficient-evidence'
): ImpulseResponseComponentCalibration {
  return { status, reason, parameters: null, diagnostics: null };
}

function createInvalidCalibration(
  reason: Exclude<ThreeDimensionalImpulseResponseCalibrationReason, null>
): ThreeDimensionalImpulseResponseCalibration {
  const unavailable = createUnavailableComponentCalibration('missing-observations');
  return {
    status: 'invalid-input',
    reason,
    dateRange: null,
    dailyLoadCount: 0,
    criticalPower: unavailable,
    wPrime: unavailable,
    maximumPower: unavailable
  };
}

function isValidDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && dateToDayNumber(value) !== null;
}

function dateToDayNumber(date: string): number | null {
  const milliseconds = Date.parse(`${date}T00:00:00.000Z`);
  return Number.isFinite(milliseconds) && new Date(milliseconds).toISOString().slice(0, 10) === date
    ? Math.floor(milliseconds / 86_400_000)
    : null;
}

function dayNumberToDate(dayNumber: number): string {
  return new Date(dayNumber * 86_400_000).toISOString().slice(0, 10);
}

function isFinitePositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function isFiniteNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function resolvePositiveInteger(value: unknown, fallback: number): number | null {
  const resolved = value === undefined ? fallback : value;
  return typeof resolved === 'number' && Number.isInteger(resolved) && resolved > 0 ? resolved : null;
}

function resolveNonNegativeInteger(value: unknown, fallback: number): number | null {
  const resolved = value === undefined ? fallback : value;
  return typeof resolved === 'number' && Number.isInteger(resolved) && resolved >= 0 ? resolved : null;
}

function resolvePositiveNumber(value: unknown, fallback: number): number | null {
  const resolved = value === undefined ? fallback : value;
  return isFinitePositiveNumber(resolved) ? resolved : null;
}

function resolveNonNegativeNumber(value: unknown, fallback: number): number | null {
  const resolved = value === undefined ? fallback : value;
  return isFiniteNonNegativeNumber(resolved) ? resolved : null;
}

function denormalizeLogRange(coordinate: number, lower: number, upper: number): number {
  const ratio = sigmoid(coordinate);
  return Math.exp(Math.log(lower) + ratio * (Math.log(upper) - Math.log(lower)));
}

function sigmoid(value: number): number {
  return 1 / (1 + Math.exp(-value));
}

function clampCoordinate(value: number): number {
  return Math.min(CALIBRATION_COORDINATE_LIMIT, Math.max(-CALIBRATION_COORDINATE_LIMIT, value));
}
