import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { ActivityInterface } from '../../../../activities/activity.interface';
import {
  ActivityTypeGroups,
  ActivityTypes,
  ActivityTypesGroupMapping,
  ActivityTypesHelper,
  ActivityTypesMoving
} from '../../../../activities/activity.types';
import names from '../../../../activities/fixtures/distinct-sport-names.json';
import { DataTrainingStressScore } from '../../../../data/data.training-stress-score';
import {
  DataTrainingStressScoreMethod,
  TrainingStressScoreMethod
} from '../../../../data/data.training-stress-score-method';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { EventImporterJSON } from '../json/importer.json';
import { EventImporterFIT } from './importer.fit';

const importer = EventImporterFIT as unknown as {
  getActivityTypeFromSessionObject(session: Record<string, unknown>, manufacturer?: unknown): ActivityTypes;
  getActivityFromSessionObject(
    session: Record<string, unknown>,
    data: Record<string, unknown>,
    options: ActivityParsingOptions,
    sessionIndex: number
  ): ActivityInterface;
};

const jsonActivity = (type: ActivityTypes) => ({
  name: 'distinct-sport',
  startDate: 1000,
  endDate: 61000,
  type,
  powerMeter: false,
  trainer: false,
  stats: {},
  streams: [],
  laps: [],
  intensityZones: [],
  events: [],
  creator: { name: 'test', devices: [] }
});

describe('Preserving distinct sport and workout names', () => {
  it.each(names)('exposes $type once in $group with its existing metric behavior', row => {
    const type = row.type as ActivityTypes;
    const parent = row.parent as ActivityTypes;
    expect(type).not.toBe(parent);
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray().filter(value => value === type)).toEqual([type]);
    expect(ActivityTypesGroupMapping.map[ActivityTypeGroups[row.group as keyof typeof ActivityTypeGroups]]).toContain(
      type
    );
    expect(
      Object.values(ActivityTypesGroupMapping.map)
        .flat()
        .filter(value => value === type)
    ).toHaveLength(1);
    expect(ActivityTypesHelper.isIndoorActivityType(type)).toBe(row.indoor);
    expect(ActivityTypesMoving.getSpeedThreshold(type)).toBe(ActivityTypesMoving.getSpeedThreshold(parent));
    for (const getter of [
      'speedDerivedDataTypesToUseForActivityType',
      'averageSpeedDerivedDataTypesToUseForActivityType',
      'altiDistanceSpeedDerivedDataTypesToUseForActivityType',
      'verticalSpeedDerivedDataTypesToUseForActivityType',
      'shouldExcludeAscent',
      'shouldExcludeDescent',
      'shouldExcludeTerrainSummaryMetrics',
      'usesStrokeRate'
    ] as const) {
      expect(ActivityTypesHelper[getter](type)).toEqual(ActivityTypesHelper[getter](parent));
    }
  });

  it.each(names)('preserves explicit $type names through FIT objects and native JSON', row => {
    const type = row.type as ActivityTypes;
    for (const alias of [row.type, row.key, ...row.aliases]) {
      for (const name of [alias, alias.toUpperCase(), alias.replace(/[\s-]/g, '_')]) {
        expect(ActivityTypesHelper.resolveActivityType(name)).toBe(type);
        expect(importer.getActivityTypeFromSessionObject({ sport: 0, sub_sport: 0, sport_profile_name: name })).toBe(
          type
        );
        const activity = EventImporterJSON.getActivityFromJSON(jsonActivity(name as ActivityTypes));
        expect(activity.type).toBe(type);
        expect(EventImporterJSON.getActivityFromJSON(JSON.parse(JSON.stringify(activity.toJSON()))).type).toBe(type);
      }
    }
  });

  it.each(names)('keeps explicit incompatible FIT classifications ahead of $type', row => {
    for (const manufacturer of [1, 23, 123, undefined]) {
      for (const [sport, sub_sport, expected] of [
        [2, 6, ActivityTypes.IndoorCycling],
        [1, 59, ActivityTypes.ObstacleRacing],
        [53, 54, ActivityTypes.ScubaDiving]
      ] as const) {
        expect(
          importer.getActivityTypeFromSessionObject({ sport, sub_sport, sport_profile_name: row.type }, manufacturer)
        ).toBe(expected);
      }
    }
  });

  it.each(names)('respects both TSS settings for $type, including zero and legacy scores', row => {
    for (const preserveImportedTss of [undefined, true, false]) {
      for (const score of [0, 42.375]) {
        for (const method of [undefined, TrainingStressScoreMethod.IMPORTED]) {
          const activity = EventImporterJSON.getActivityFromJSON(jsonActivity(row.type as ActivityTypes));
          activity.parseOptions = new ActivityParsingOptions({
            generateUnitStreams: false,
            tss: { preserveImportedTss, overrides: { metScore: 6, thresholdMet: 6 } }
          });
          activity.addStat(new DataTrainingStressScore(score));
          if (method) activity.addStat(new DataTrainingStressScoreMethod(method));
          ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
          const restored = EventImporterJSON.getActivityFromJSON(JSON.parse(JSON.stringify(activity.toJSON())));
          restored.parseOptions = activity.parseOptions;
          ActivityUtilities.generateMissingStreamsAndStatsForActivity(restored);
          for (const candidate of [activity, restored]) {
            expect(candidate.type).toBe(row.type);
            if (preserveImportedTss === false) {
              expect(candidate.getStat(DataTrainingStressScore.type)?.getValue()).toBeGreaterThan(0);
              expect(candidate.getStat(DataTrainingStressScore.type)?.getValue()).not.toBe(score);
              expect(candidate.getStat(DataTrainingStressScoreMethod.type)?.getValue()).toBe(
                TrainingStressScoreMethod.MET
              );
            } else {
              expect(candidate.getStat(DataTrainingStressScore.type)?.getValue()).toBe(score);
              expect(candidate.getStat(DataTrainingStressScoreMethod.type)?.getValue()).toBe(
                TrainingStressScoreMethod.IMPORTED
              );
            }
          }
        }
      }
    }
    const unavailable = EventImporterJSON.getActivityFromJSON(jsonActivity(row.type as ActivityTypes));
    unavailable.parseOptions = new ActivityParsingOptions({
      generateUnitStreams: false,
      tss: { preserveImportedTss: false, enableHeuristicFallbacks: false }
    });
    unavailable.addStat(new DataTrainingStressScore(42.375));
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(unavailable);
    expect(unavailable.getStat(DataTrainingStressScore.type)).toBeUndefined();
    expect(unavailable.getStat(DataTrainingStressScoreMethod.type)).toBeUndefined();
  });

  it.each([
    [{ sport: 62, sub_sport: 73 }, ActivityTypes.AMRAP],
    [{ sport: 62, sub_sport: 74 }, ActivityTypes.EMOM],
    [{ sport: 62, sub_sport: 75 }, ActivityTypes.Tabata],
    [{ sport: 53, sub_sport: 121 }, ActivityTypes.DynamicApnea],
    [{ sport: 85, sub_sport: 121 }, ActivityTypes.DynamicApnea]
  ])('preserves the decoded workout format %j and imported TSS', (session, expected) => {
    const activity = importer.getActivityFromSessionObject(
      {
        ...session,
        start_time: new Date('2026-01-01T12:00:00Z'),
        timestamp: new Date('2026-01-01T12:01:00Z'),
        total_elapsed_time: 60,
        total_timer_time: 60,
        training_stress_score: 42.375,
        laps: []
      },
      { file_ids: [{ manufacturer: 1 }], records: [], events: [] },
      new ActivityParsingOptions({ generateUnitStreams: false }),
      0
    );
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    expect(activity.type).toBe(expected);
    expect(activity.getStat(DataTrainingStressScore.type)?.getValue()).toBe(42.375);
  });

  it.each([
    { sport: 1, sub_sport: 0 },
    { sport: 1, sub_sport: 4 },
    { sport: 1, sub_sport: 45 },
    { sport: 'running', sub_sport: 'indoor' }
  ])('preserves an explicit indoor track profile on compatible running context %j', session => {
    expect(importer.getActivityTypeFromSessionObject({ ...session, sport_profile_name: 'Indoor Track Running' })).toBe(
      ActivityTypes.IndoorTrackRunning
    );
  });

  it('retains broad canonical names and true aliases', () => {
    expect(
      importer.getActivityTypeFromSessionObject({ sport: 1, sub_sport: 4, sport_profile_name: 'Indoor Running' })
    ).toBe(ActivityTypes.IndoorRunning);
    for (const type of [
      'Dancing',
      'HIIT',
      'Mobility',
      'Pool Apnea',
      'Crosscountry Skiing',
      'Indoor Running',
      'Running',
      'Cycling',
      'Barre',
      'Core Training'
    ]) {
      expect(EventImporterJSON.getActivityFromJSON(jsonActivity(type as ActivityTypes)).type).toBe(type);
    }
    expect(ActivityTypesHelper.resolveActivityType('LES MILLS CXWORX')).toBe(ActivityTypes.LesMillsCore);
    expect(ActivityTypesHelper.resolveActivityType('LES MILLS CORE')).toBe(ActivityTypes.LesMillsCore);
    expect(ActivityTypesHelper.resolveActivityType('Jazz')).toBeNull();
    expect(ActivityTypesHelper.resolveActivityType('Jazz', 'polar')).toBe(ActivityTypes.JazzDancing);
    expect(ActivityTypesHelper.resolveActivityType('Group exercise', 'polar')).toBe(ActivityTypes.IndoorTraining);
    expect(ActivityTypesHelper.resolveActivityType('Jogging', 'polar')).toBe(ActivityTypes.Running);
    expect(ActivityTypesHelper.resolveActivityType('Bike Commute')).toBe(ActivityTypes.Cycling);
    expect(ActivityTypesHelper.resolveActivityType('E-Bike Fitness')).toBe(ActivityTypes.EBiking);
  });
});
