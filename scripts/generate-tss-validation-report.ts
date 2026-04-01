import * as fs from 'fs';
import * as path from 'path';
import { ActivityParsingOptions } from '../src/activities/activity-parsing-options';
import { ActivityTypeGroups, ActivityTypesHelper } from '../src/activities/activity.types';
import { type ActivityInterface } from '../src/activities/activity.interface';
import { DataEnergy } from '../src/data/data.energy';
import { DataFTP } from '../src/data/data.ftp';
import { DataGender } from '../src/data/data.gender';
import { DataGrade } from '../src/data/data.grade';
import { DataGradeSmooth } from '../src/data/data.grade-smooth';
import { DataHeartRate } from '../src/data/data.heart-rate';
import { DataHeartRateMax } from '../src/data/data.heart-rate-max';
import { DataMaxHRSetting } from '../src/data/data.max-hr-setting';
import { DataPower } from '../src/data/data.power';
import { DataPowerTrainingStressScore } from '../src/data/data.power-training-stress-score';
import {
  DataTrainingStressScoreMethod,
  TrainingStressScoreMethod,
  type TrainingStressScoreMethodType
} from '../src/data/data.training-stress-score-method';
import { DataSpeed } from '../src/data/data.speed';
import { DataSpeedAvg } from '../src/data/data.speed-avg';
import { DataSwimPace } from '../src/data/data.swim-pace';
import { DataVerticalSpeed } from '../src/data/data.vertical-speed';
import { DataWeight } from '../src/data/data.weight';
import { type TssCalculationResult } from '../src/events/utilities/tss/tss-calculator';
import { ActivityUtilities } from '../src/events/utilities/activity.utilities';
import { SportsLib } from '../src/index';

type MethodName = TrainingStressScoreMethodType;

type AttemptMethod = Exclude<MethodName, 'IMPORTED'>;

interface AttemptResultSnapshot {
  tss: number;
  intensityFactor?: number;
  normalizedPower?: number;
  averageGradeAdjustedPace?: number;
}

interface MethodAttemptDiagnostics {
  method: AttemptMethod;
  attempted: boolean;
  eligible: boolean;
  success: boolean;
  reason?: string;
  inputs: Record<string, unknown>;
  result?: AttemptResultSnapshot;
}

interface ActivityDiagnostics {
  selectedMethod: MethodName | null;
  selectedTss: number | null;
  durationSeconds: number;
  enableHeuristicFallbacks: boolean;
  attempts: MethodAttemptDiagnostics[];
}

interface ComparisonRow {
  file: string;
  activityIndex: number;
  activityType: string;
  reportedTss: number;
  reportedMethod: MethodName | 'n/a';
  computedTss: number | null;
  delta: number | null;
  absDelta: number | null;
  method: MethodName | 'n/a';
  diagnostics: ActivityDiagnostics | null;
}

interface ParseErrorRow {
  file: string;
  error: string;
}

interface PrivateStreamSample {
  duration: number;
  value: number;
}

interface ActivityUtilitiesPrivate {
  resolveFunctionalThresholdPower(activity: ActivityInterface): number | null;
  resolveMaxHeartRate(activity: ActivityInterface): number | null;
  resolveRestingHeartRate(activity: ActivityInterface): number | null;
  resolveLactateThresholdHr(activity: ActivityInterface): number | null;
  resolveFunctionalThresholdPace(activity: ActivityInterface): number | null;
  resolveSwimSpeed(activity: ActivityInterface): number | null;
  resolveThresholdSwimSpeed(activity: ActivityInterface, swimSpeed: number): number | null;
  resolveMetScore(activity: ActivityInterface, durationSeconds: number): number | null;
  resolveMetThreshold(activity: ActivityInterface): number;
  getDurationSecondsWithoutPauses(activity: ActivityInterface): number;
  getStreamSamplesByDuration(activity: ActivityInterface, streamType: string): PrivateStreamSample[];
  supportsPaceTss(activity: ActivityInterface): boolean;
  calculatePowerTss(activity: ActivityInterface): TssCalculationResult | null;
  calculateHrTss(activity: ActivityInterface): TssCalculationResult | null;
  calculatePaceTss(activity: ActivityInterface): TssCalculationResult | null;
  calculateSwimPaceTss(activity: ActivityInterface): TssCalculationResult | null;
  calculateMetTss(activity: ActivityInterface): TssCalculationResult | null;
}

const ROOT_DIR = path.resolve(__dirname, '..');
const SEARCH_DIRS = ['samples', 'src/specs/fixtures'];
const REPORTS_DIR = path.join(ROOT_DIR, 'reports');
const TABLE_JSON_PATH = path.join(REPORTS_DIR, 'tss-validation-table.json');
const TABLE_MD_PATH = path.join(REPORTS_DIR, 'tss-validation-table.md');
const DIAGNOSTICS_JSON_PATH = path.join(REPORTS_DIR, 'tss-validation-diagnostics.json');
const utilities = ActivityUtilities as unknown as ActivityUtilitiesPrivate;

const round = (value: number, decimals = 1): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

const finiteOrNull = (value: unknown): number | null => {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

const positiveOrNull = (value: unknown): number | null => {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
};

const toRelative = (absolutePath: string): string => path.relative(ROOT_DIR, absolutePath);

const walkFitFiles = (directory: string): string[] => {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFitFiles(absolute));
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.fit')) {
      files.push(absolute);
    }
  }

  return files;
};

const getFitFiles = (): string[] => {
  const dedup = new Set<string>();

  for (const relativeDir of SEARCH_DIRS) {
    const absoluteDir = path.join(ROOT_DIR, relativeDir);
    walkFitFiles(absoluteDir).forEach(file => dedup.add(file));
  }

  return Array.from(dedup.values()).sort((a, b) => a.localeCompare(b));
};

const getFiniteStatValue = (activity: ActivityInterface, type: string): number | null => {
  const stat = activity.getStat(type);
  if (!stat) {
    return null;
  }
  return finiteOrNull(stat.getValue());
};

const getPositiveOverride = (activity: ActivityInterface, key: string): number | null => {
  const overrides = activity.parseOptions?.tss?.overrides as Record<string, unknown> | undefined;
  return positiveOrNull(overrides?.[key]);
};

const getZoneFiveLowerLimit = (activity: ActivityInterface, zoneType: string): number | null => {
  const zone = activity.intensityZones.find(item => item.type === zoneType);
  return positiveOrNull(zone?.zone5LowerLimit);
};

const snapshotResult = (result: TssCalculationResult | null): AttemptResultSnapshot | undefined => {
  if (!result) {
    return undefined;
  }

  return {
    tss: round(result.trainingStressScore, 3),
    intensityFactor: finiteOrNull(result.intensityFactor ?? null) ?? undefined,
    normalizedPower: finiteOrNull(result.normalizedPower ?? null) ?? undefined,
    averageGradeAdjustedPace: finiteOrNull(result.averageGradeAdjustedPace ?? null) ?? undefined
  };
};

const buildPowerDiagnostics = (activity: ActivityInterface): MethodAttemptDiagnostics => {
  const ftpOverride = getPositiveOverride(activity, 'functionalThresholdPower');
  const ftpStatBefore = positiveOrNull(getFiniteStatValue(activity, DataFTP.type));
  const ftpResolved = positiveOrNull(utilities.resolveFunctionalThresholdPower(activity));
  const powerSamples = utilities.getStreamSamplesByDuration(activity, DataPower.type) as Array<{
    duration: number;
    value: number;
  }>;
  const result = utilities.calculatePowerTss(activity) as TssCalculationResult | null;

  let ftpSource = 'missing';
  if (ftpOverride !== null) {
    ftpSource = 'override';
  } else if (ftpStatBefore !== null) {
    ftpSource = 'DataFTP';
  } else if (ftpResolved !== null) {
    ftpSource = 'derived';
  }

  let reason: string | undefined;
  if (ftpResolved === null) {
    reason = 'missing_functionalThresholdPower';
  } else if (!powerSamples.length) {
    reason = 'missing_power_samples';
  } else if (!result) {
    reason = 'power_calculation_failed_or_out_of_range';
  }

  return {
    method: TrainingStressScoreMethod.POWER,
    attempted: true,
    eligible: true,
    success: !!result,
    reason,
    inputs: {
      ftpOverride,
      ftpStatBefore,
      ftpResolved,
      ftpSource,
      powerSampleCount: powerSamples.length
    },
    result: snapshotResult(result)
  };
};

const buildHrDiagnostics = (activity: ActivityInterface): MethodAttemptDiagnostics => {
  const maxHrOverride = getPositiveOverride(activity, 'maxHeartRate');
  const maxHrSetting = positiveOrNull(getFiniteStatValue(activity, DataMaxHRSetting.type));
  const maxHrStat = positiveOrNull(getFiniteStatValue(activity, DataHeartRateMax.type));
  const maxHeartRate = positiveOrNull(utilities.resolveMaxHeartRate(activity));

  const restingHrOverride = getPositiveOverride(activity, 'restingHeartRate');
  const restingHeartRate = positiveOrNull(utilities.resolveRestingHeartRate(activity));

  const lthrOverride = getPositiveOverride(activity, 'lactateThresholdHR');
  const lthrZone5 = getZoneFiveLowerLimit(activity, DataHeartRate.type);
  const lactateThresholdHR = positiveOrNull(utilities.resolveLactateThresholdHr(activity));

  const hrSamples = utilities.getStreamSamplesByDuration(activity, DataHeartRate.type) as Array<{
    duration: number;
    value: number;
  }>;
  const hrAverage =
    hrSamples.length > 0 ? round(hrSamples.reduce((sum, sample) => sum + sample.value, 0) / hrSamples.length, 3) : null;

  const gender = activity.getStat(DataGender.type)?.getValue();
  const result = utilities.calculateHrTss(activity) as TssCalculationResult | null;

  let maxHrSource = 'missing';
  if (maxHrOverride !== null) {
    maxHrSource = 'override';
  } else if (maxHrSetting !== null) {
    maxHrSource = 'DataMaxHRSetting';
  } else if (maxHrStat !== null) {
    maxHrSource = 'DataHeartRateMax';
  }

  let restingHrSource = 'missing';
  if (restingHrOverride !== null) {
    restingHrSource = 'override';
  }

  let lthrSource = 'missing';
  if (lthrOverride !== null) {
    lthrSource = 'override';
  } else if (lthrZone5 !== null) {
    lthrSource = 'HR_zone5_lower';
  }

  const banisterPossible = maxHeartRate !== null && restingHeartRate !== null && maxHeartRate > restingHeartRate;
  const hrAlgorithm = banisterPossible ? 'BANISTER' : 'EDWARDS';

  let reason: string | undefined;
  if (maxHeartRate === null) {
    reason = 'missing_maxHeartRate';
  } else if (!hrSamples.length) {
    reason = 'missing_hr_samples';
  } else if (!result) {
    reason = 'hr_calculation_failed_or_out_of_range';
  }

  return {
    method: TrainingStressScoreMethod.HR,
    attempted: true,
    eligible: true,
    success: !!result,
    reason,
    inputs: {
      maxHrOverride,
      maxHrSetting,
      maxHrStat,
      maxHeartRate,
      maxHrSource,
      restingHrOverride,
      restingHeartRate,
      restingHrSource,
      lthrOverride,
      lthrZone5,
      lactateThresholdHR,
      lthrSource,
      hrSampleCount: hrSamples.length,
      hrAverage,
      gender,
      hrAlgorithm
    },
    result: snapshotResult(result)
  };
};

const buildPaceDiagnostics = (activity: ActivityInterface): MethodAttemptDiagnostics => {
  const paceEligible = !!utilities.supportsPaceTss(activity);
  const enableHeuristicFallbacks = activity.parseOptions?.tss?.enableHeuristicFallbacks ?? true;

  const thresholdOverride = getPositiveOverride(activity, 'functionalThresholdPace');
  const speedZone5 = getZoneFiveLowerLimit(activity, DataSpeed.type);
  const thresholdPace = positiveOrNull(utilities.resolveFunctionalThresholdPace(activity));

  const speedSamples = utilities.getStreamSamplesByDuration(activity, DataSpeed.type) as Array<{
    duration: number;
    value: number;
  }>;
  const gradeSmoothByDuration = new Map<number, number>(
    (
      utilities.getStreamSamplesByDuration(activity, DataGradeSmooth.type) as Array<{ duration: number; value: number }>
    ).map(sample => [sample.duration, sample.value])
  );
  const gradeByDuration = new Map<number, number>(
    (utilities.getStreamSamplesByDuration(activity, DataGrade.type) as Array<{ duration: number; value: number }>).map(
      sample => [sample.duration, sample.value]
    )
  );
  const verticalByDuration = new Map<number, number>(
    (
      utilities.getStreamSamplesByDuration(activity, DataVerticalSpeed.type) as Array<{
        duration: number;
        value: number;
      }>
    ).map(sample => [sample.duration, sample.value])
  );

  let fromGradeSmooth = 0;
  let fromGrade = 0;
  let fromVertical = 0;
  let fromHeuristicZero = 0;
  let unresolved = 0;

  speedSamples.forEach(sample => {
    if (gradeSmoothByDuration.has(sample.duration)) {
      fromGradeSmooth += 1;
      return;
    }
    if (gradeByDuration.has(sample.duration)) {
      fromGrade += 1;
      return;
    }

    const vertical = verticalByDuration.get(sample.duration);
    if (vertical !== undefined && sample.value > 0) {
      fromVertical += 1;
      return;
    }

    if (enableHeuristicFallbacks) {
      fromHeuristicZero += 1;
      return;
    }

    unresolved += 1;
  });

  let thresholdSource = 'missing';
  if (thresholdOverride !== null) {
    thresholdSource = 'override';
  } else if (speedZone5 !== null) {
    thresholdSource = 'speed_zone5_lower';
  }

  let attempted = false;
  let eligible = paceEligible;
  let result: TssCalculationResult | null = null;
  let reason: string | undefined;

  if (!paceEligible) {
    attempted = false;
    reason = 'sport_not_pace_enabled';
  } else {
    attempted = true;
    result = utilities.calculatePaceTss(activity) as TssCalculationResult | null;

    if (thresholdPace === null) {
      reason = 'missing_functionalThresholdPace';
    } else if (!speedSamples.length) {
      reason = 'missing_speed_samples';
    } else if (!enableHeuristicFallbacks && unresolved > 0) {
      reason = 'missing_grade_data_with_heuristics_disabled';
    } else if (!result) {
      reason = 'pace_calculation_failed_or_out_of_range';
    }
  }

  return {
    method: TrainingStressScoreMethod.PACE,
    attempted,
    eligible,
    success: !!result,
    reason,
    inputs: {
      thresholdOverride,
      speedZone5,
      thresholdPace,
      thresholdSource,
      speedSampleCount: speedSamples.length,
      enableHeuristicFallbacks,
      gradeSourceCounts: {
        gradeSmooth: fromGradeSmooth,
        grade: fromGrade,
        verticalSpeedOverSpeed: fromVertical,
        heuristicZero: fromHeuristicZero,
        unresolved
      }
    },
    result: snapshotResult(result)
  };
};

const buildSwimDiagnostics = (activity: ActivityInterface): MethodAttemptDiagnostics => {
  const activityGroup = ActivityTypesHelper.getActivityGroupForActivityType(activity.type);
  const isSwimGroup = activityGroup === ActivityTypeGroups.SwimmingGroup;
  const enableHeuristicFallbacks = activity.parseOptions?.tss?.enableHeuristicFallbacks ?? true;

  const swimSpeedAvgStat = positiveOrNull(getFiniteStatValue(activity, DataSpeedAvg.type));
  const speedSamples = utilities.getStreamSamplesByDuration(activity, DataSpeed.type) as Array<{
    duration: number;
    value: number;
  }>;
  const swimSpeedResolved = positiveOrNull(utilities.resolveSwimSpeed(activity));

  const thresholdOverride = getPositiveOverride(activity, 'thresholdSwimSpeed');
  const thresholdLegacy = getPositiveOverride(activity, 'refSwimSpeed');
  const thresholdSwimZone5 = getZoneFiveLowerLimit(activity, DataSwimPace.type);
  const thresholdSpeedZone5 = getZoneFiveLowerLimit(activity, DataSpeed.type);

  const thresholdResolved =
    swimSpeedResolved === null
      ? null
      : positiveOrNull(utilities.resolveThresholdSwimSpeed(activity, swimSpeedResolved));

  let thresholdSource = 'missing';
  if (thresholdOverride !== null) {
    thresholdSource = 'override_thresholdSwimSpeed';
  } else if (thresholdLegacy !== null) {
    thresholdSource = 'legacy_refSwimSpeed';
  } else if (thresholdSwimZone5 !== null) {
    thresholdSource = 'swim_zone5_lower';
  } else if (thresholdSpeedZone5 !== null) {
    thresholdSource = 'speed_zone5_lower';
  } else if (thresholdResolved !== null && swimSpeedResolved !== null && enableHeuristicFallbacks) {
    thresholdSource = 'session_swim_speed_heuristic';
  }

  let swimSpeedSource = 'missing';
  if (swimSpeedAvgStat !== null) {
    swimSpeedSource = 'DataSpeedAvg';
  } else if (swimSpeedResolved !== null) {
    swimSpeedSource = 'speed_stream_average';
  }

  let attempted = false;
  let eligible = isSwimGroup;
  let result: TssCalculationResult | null = null;
  let reason: string | undefined;

  if (!isSwimGroup) {
    attempted = false;
    reason = 'not_swimming_group';
  } else {
    attempted = true;
    result = utilities.calculateSwimPaceTss(activity) as TssCalculationResult | null;

    if (swimSpeedResolved === null) {
      reason = 'missing_swim_speed';
    } else if (thresholdResolved === null) {
      reason = 'missing_threshold_swim_speed';
    } else if (!result) {
      reason = 'swim_tss_calculation_failed_or_out_of_range';
    }
  }

  return {
    method: TrainingStressScoreMethod.SWIM_PACE,
    attempted,
    eligible,
    success: !!result,
    reason,
    inputs: {
      isSwimGroup,
      swimSpeedAvgStat,
      speedSampleCount: speedSamples.length,
      swimSpeedResolved,
      swimSpeedSource,
      thresholdOverride,
      thresholdLegacy,
      thresholdSwimZone5,
      thresholdSpeedZone5,
      thresholdResolved,
      thresholdSource,
      enableHeuristicFallbacks
    },
    result: snapshotResult(result)
  };
};

const buildMetDiagnostics = (activity: ActivityInterface): MethodAttemptDiagnostics => {
  const durationSeconds = positiveOrNull(utilities.getDurationSecondsWithoutPauses(activity)) ?? 0;

  const metOverride = getPositiveOverride(activity, 'metScore');
  const energy = positiveOrNull(getFiniteStatValue(activity, DataEnergy.type));
  const weight = positiveOrNull(getFiniteStatValue(activity, DataWeight.type));
  const metResolved = durationSeconds > 0 ? positiveOrNull(utilities.resolveMetScore(activity, durationSeconds)) : null;

  const thresholdOverride = getPositiveOverride(activity, 'thresholdMet');
  const thresholdMet = positiveOrNull(utilities.resolveMetThreshold(activity));

  let metSource = 'missing';
  if (metOverride !== null) {
    metSource = 'override_metScore';
  } else if (metResolved !== null && energy !== null && weight !== null) {
    metSource = 'estimated_from_energy_weight_duration';
  }

  const thresholdSource = thresholdOverride !== null ? 'override_thresholdMet' : 'default_thresholdMet_10';
  const result = utilities.calculateMetTss(activity) as TssCalculationResult | null;

  let reason: string | undefined;
  if (durationSeconds <= 0) {
    reason = 'missing_duration';
  } else if (metResolved === null) {
    reason = 'missing_met_score';
  } else if (!result) {
    reason = 'met_tss_calculation_failed_or_out_of_range';
  }

  return {
    method: TrainingStressScoreMethod.MET,
    attempted: true,
    eligible: true,
    success: !!result,
    reason,
    inputs: {
      durationSeconds,
      metOverride,
      energy,
      weight,
      metResolved,
      metSource,
      thresholdOverride,
      thresholdMet,
      thresholdSource
    },
    result: snapshotResult(result)
  };
};

const buildActivityDiagnostics = (activity: ActivityInterface): ActivityDiagnostics => {
  const durationSeconds = positiveOrNull(utilities.getDurationSecondsWithoutPauses(activity)) ?? 0;
  const enableHeuristicFallbacks = activity.parseOptions?.tss?.enableHeuristicFallbacks ?? true;

  const power = buildPowerDiagnostics(activity);
  const hr = buildHrDiagnostics(activity);
  const swim = buildSwimDiagnostics(activity);
  const pace = buildPaceDiagnostics(activity);
  const met = buildMetDiagnostics(activity);

  const activityGroup = ActivityTypesHelper.getActivityGroupForActivityType(activity.type);
  const attempts: MethodAttemptDiagnostics[] = [power, hr];
  if (activityGroup === ActivityTypeGroups.SwimmingGroup) {
    attempts.push(swim);
  } else {
    attempts.push(pace);
  }
  attempts.push(met);

  return {
    selectedMethod:
      (activity.getStat(DataTrainingStressScoreMethod.type)?.getValue() as MethodName | undefined) ?? null,
    selectedTss: finiteOrNull(activity.getStat(DataPowerTrainingStressScore.type)?.getValue()),
    durationSeconds,
    enableHeuristicFallbacks,
    attempts
  };
};

const renderMarkdown = (rows: ComparisonRow[]): string => {
  const header = '| File | Idx | Type | Reported TSS | Reported Method | Computed TSS | Delta | Abs Delta | Method |\n';
  const separator = '|---|---:|---|---:|---|---:|---:|---:|---|\n';
  const body = rows
    .map(row => {
      const computed = row.computedTss === null ? 'n/a' : `${row.computedTss}`;
      const delta = row.delta === null ? 'n/a' : `${row.delta}`;
      const absDelta = row.absDelta === null ? 'n/a' : `${row.absDelta}`;
      return `| ${row.file} | ${row.activityIndex} | ${row.activityType} | ${row.reportedTss} | ${row.reportedMethod} | ${computed} | ${delta} | ${absDelta} | ${row.method} |`;
    })
    .join('\n');

  return `${header}${separator}${body}\n`;
};

const parseFitFile = async (
  absolutePath: string,
  options?: ActivityParsingOptions
): Promise<ReturnType<typeof SportsLib.importFromFit>> => {
  const buffer = fs.readFileSync(absolutePath);
  return SportsLib.importFromFit(buffer, options);
};

const computeRows = async (): Promise<{
  rows: ComparisonRow[];
  parseErrors: ParseErrorRow[];
  scannedFitFiles: number;
}> => {
  const files = getFitFiles();
  const rows: ComparisonRow[] = [];
  const parseErrors: ParseErrorRow[] = [];

  for (const filePath of files) {
    const relativeFile = toRelative(filePath);

    try {
      const defaultEvent = await parseFitFile(filePath);
      const recomputeEvent = await parseFitFile(
        filePath,
        new ActivityParsingOptions({
          tss: {
            preserveImportedTss: false
          }
        })
      );

      const defaultActivities = defaultEvent.getActivities();
      const recomputeActivities = recomputeEvent.getActivities();

      defaultActivities.forEach((defaultActivity, activityIndex) => {
        const reportedMethod =
          (defaultActivity.getStat(DataTrainingStressScoreMethod.type)?.getValue() as MethodName | undefined) ?? 'n/a';
        const reportedTss = finiteOrNull(defaultActivity.getStat(DataPowerTrainingStressScore.type)?.getValue());

        if (reportedTss === null) {
          return;
        }

        const recomputeActivity = recomputeActivities[activityIndex];
        if (!recomputeActivity) {
          rows.push({
            file: relativeFile,
            activityIndex,
            activityType: defaultActivity.type,
            reportedTss: round(reportedTss, 1),
            reportedMethod,
            computedTss: null,
            delta: null,
            absDelta: null,
            method: 'n/a',
            diagnostics: null
          });
          return;
        }

        const computedTss = finiteOrNull(recomputeActivity.getStat(DataPowerTrainingStressScore.type)?.getValue());
        const computedMethod =
          (recomputeActivity.getStat(DataTrainingStressScoreMethod.type)?.getValue() as MethodName | undefined) ??
          'n/a';

        const delta = computedTss === null ? null : round(computedTss - reportedTss, 1);
        const absDelta = delta === null ? null : round(Math.abs(delta), 1);

        rows.push({
          file: relativeFile,
          activityIndex,
          activityType: defaultActivity.type,
          reportedTss: round(reportedTss, 1),
          reportedMethod,
          computedTss: computedTss === null ? null : round(computedTss, 1),
          delta,
          absDelta,
          method: computedMethod,
          diagnostics: buildActivityDiagnostics(recomputeActivity)
        });
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      parseErrors.push({
        file: relativeFile,
        error: message
      });
    }
  }

  rows.sort((left, right) => {
    const leftAbs = left.absDelta ?? -1;
    const rightAbs = right.absDelta ?? -1;
    if (rightAbs !== leftAbs) {
      return rightAbs - leftAbs;
    }
    if (left.file !== right.file) {
      return left.file.localeCompare(right.file);
    }
    return left.activityIndex - right.activityIndex;
  });

  return {
    rows,
    parseErrors,
    scannedFitFiles: files.length
  };
};

const writeReports = async (): Promise<void> => {
  const { rows, parseErrors, scannedFitFiles } = await computeRows();

  const computedRows = rows.filter(row => row.computedTss !== null && row.absDelta !== null);
  const summary = {
    scannedFitFiles,
    parseErrors: parseErrors.length,
    entriesWithReportedTss: rows.length,
    computed: computedRows.length,
    missingComputed: rows.length - computedRows.length,
    within1_0: computedRows.filter(row => (row.absDelta ?? 0) <= 1).length,
    above1_0: computedRows.filter(row => (row.absDelta ?? 0) > 1).length
  };

  const tablePayload = {
    summary,
    parseErrors,
    rows: rows.map(row => ({
      file: row.file,
      activityIndex: row.activityIndex,
      activityType: row.activityType,
      reportedTss: row.reportedTss,
      reportedMethod: row.reportedMethod,
      computedTss: row.computedTss,
      delta: row.delta,
      absDelta: row.absDelta,
      method: row.method
    }))
  };

  const diagnosticsPayload = {
    summary,
    parseErrors,
    rows
  };

  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(TABLE_JSON_PATH, JSON.stringify(tablePayload, null, 2));
  fs.writeFileSync(TABLE_MD_PATH, renderMarkdown(tablePayload.rows));
  fs.writeFileSync(DIAGNOSTICS_JSON_PATH, JSON.stringify(diagnosticsPayload, null, 2));

  console.log(`Wrote ${toRelative(TABLE_JSON_PATH)}`);
  console.log(`Wrote ${toRelative(TABLE_MD_PATH)}`);
  console.log(`Wrote ${toRelative(DIAGNOSTICS_JSON_PATH)}`);
  console.log(
    `Summary: scanned=${summary.scannedFitFiles}, reported=${summary.entriesWithReportedTss}, computed=${summary.computed}, >1.0=${summary.above1_0}`
  );
};

void writeReports();
