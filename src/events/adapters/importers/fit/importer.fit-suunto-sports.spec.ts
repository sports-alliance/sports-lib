import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { ActivityInterface } from '../../../../activities/activity.interface';
import { ActivityTypeGroups, ActivityTypes, ActivityTypesHelper } from '../../../../activities/activity.types';
import { DataTrainingStressScore } from '../../../../data/data.training-stress-score';
import {
  DataTrainingStressScoreMethod,
  TrainingStressScoreMethod
} from '../../../../data/data.training-stress-score-method';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { EventImporterJSON } from '../json/importer.json';
import { EventImporterFIT } from './importer.fit';

const importerInternals = EventImporterFIT as unknown as {
  getActivityTypeFromSessionObject(session: Record<string, unknown>, manufacturer?: unknown): ActivityTypes;
  getActivityFromSessionObject(
    session: Record<string, unknown>,
    fitData: Record<string, unknown>,
    options: ActivityParsingOptions,
    sessionIndex: number
  ): ActivityInterface;
};

const importStretching = (
  identity: Record<string, unknown>,
  session: Record<string, unknown> = {},
  options = new ActivityParsingOptions({ generateUnitStreams: false })
) =>
  importerInternals.getActivityFromSessionObject(
    {
      sport: 10,
      sub_sport: 19,
      start_time: new Date('2026-01-01T12:00:00.000Z'),
      timestamp: new Date('2026-01-01T12:01:00.000Z'),
      total_elapsed_time: 60,
      total_timer_time: 60,
      laps: [],
      ...session
    },
    { ...identity, records: [], events: [] },
    options,
    0
  );

describe('Suunto documented Stretching export', () => {
  it.each([
    { sport: 10, sub_sport: 19 },
    { sport: '10', sub_sport: '19' },
    { sport: 'training', sub_sport: 'flexibility_training' },
    { sport: 'training', sub_sport: 19 },
    { sport: 'TRAINING', sub_sport: 'FLEXIBILITY-TRAINING' },
    { sport: ' Training ', sub_sport: ' Flexibility Training ' },
    { sport: 10, sub_sport: 19, sport_profile_name: 'Custom profile' }
  ])('preserves Stretching for Suunto App ID 58 export %j', session => {
    expect(importerInternals.getActivityTypeFromSessionObject(session, 23)).toBe(ActivityTypes.Stretching);
  });

  it.each([23, '23', 'suunto', 'SUUNTO', ' Suunto '])('recognizes recorded Suunto manufacturer %j', manufacturer => {
    expect(importerInternals.getActivityTypeFromSessionObject({ sport: 10, sub_sport: 19 }, manufacturer)).toBe(
      ActivityTypes.Stretching
    );
  });

  it.each([undefined, null, '', 1, 'garmin', 123, 'polar', 'suunto_sensor', 'unknown', {}, 23.5])(
    'retains Flexibility Training for manufacturer %j',
    manufacturer => {
      expect(importerInternals.getActivityTypeFromSessionObject({ sport: 10, sub_sport: 19 }, manufacturer)).toBe(
        ActivityTypes.FlexibilityTraining
      );
    }
  );

  it.each([
    [{ sport: 0, sub_sport: 19 }, ActivityTypes.FlexibilityTraining],
    [{ sport: 4, sub_sport: 19 }, ActivityTypes.FlexibilityTraining],
    [{ sub_sport: 19 }, ActivityTypes.FlexibilityTraining],
    [{ sport: 10, sub_sport: 0 }, ActivityTypes.training],
    [{ sport: 10, sub_sport: 20 }, ActivityTypes.StrengthTraining],
    [{ sport: 10, sub_sport: 21 }, ActivityTypes.training],
    [{ sport: 10, sub_sport: 43 }, ActivityTypes.Yoga],
    [{ sport: 10, sub_sport: 44 }, ActivityTypes.Pilates]
  ])('preserves neighboring Suunto export %j', (session, expectedType) => {
    expect(importerInternals.getActivityTypeFromSessionObject(session, 23)).toBe(expectedType);
  });

  it.each([
    [{ file_ids: [{ manufacturer: 23 }] }, ActivityTypes.Stretching],
    [{ file_ids: [{ manufacturer: 'suunto' }] }, ActivityTypes.Stretching],
    [{ file_ids: [], device_infos: [{ device_index: 'creator', manufacturer: 'suunto' }] }, ActivityTypes.Stretching],
    [{ file_ids: [], device_infos: [{ device_index: 0, manufacturer: 23 }] }, ActivityTypes.Stretching],
    [
      { file_ids: [{ manufacturer: 'garmin' }], device_infos: [{ device_index: 'creator', manufacturer: 'suunto' }] },
      ActivityTypes.FlexibilityTraining
    ],
    [{ file_ids: [], device_infos: [{ device_index: 1, manufacturer: 'suunto' }] }, ActivityTypes.FlexibilityTraining],
    [{ file_ids: [{ product_name: 'Suunto' }], device_infos: [] }, ActivityTypes.FlexibilityTraining]
  ])('uses creator identity when constructing and restoring an activity (%j)', (identity, expectedType) => {
    const activity = importStretching(identity);
    expect(activity.type).toBe(expectedType);
    expect(ActivityTypesHelper.getActivityGroupForActivityType(activity.type)).toBe(
      ActivityTypeGroups.IndoorSportsGroup
    );
    expect(EventImporterJSON.getActivityFromJSON(JSON.parse(JSON.stringify(activity.toJSON()))).type).toBe(
      expectedType
    );
  });

  it.each([undefined, true, false])('respects preserveImportedTss=%j after classification', preserveImportedTss => {
    for (const score of [0, 42.375]) {
      const options = new ActivityParsingOptions({
        generateUnitStreams: false,
        tss: { preserveImportedTss, overrides: { metScore: 6, thresholdMet: 6 } }
      });
      const activity = importStretching(
        { file_ids: [{ manufacturer: 'suunto' }] },
        { training_stress_score: score },
        options
      );
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
      const restored = EventImporterJSON.getActivityFromJSON(JSON.parse(JSON.stringify(activity.toJSON())));
      restored.parseOptions = options;
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(restored);

      for (const candidate of [activity, restored]) {
        expect(candidate.type).toBe(ActivityTypes.Stretching);
        if (preserveImportedTss === false) {
          expect(candidate.getStat(DataTrainingStressScore.type)?.getValue()).toBeGreaterThan(0);
          expect(candidate.getStat(DataTrainingStressScore.type)?.getValue()).not.toBe(score);
          expect(candidate.getStat(DataTrainingStressScoreMethod.type)?.getValue()).toBe(TrainingStressScoreMethod.MET);
        } else {
          expect(candidate.getStat(DataTrainingStressScore.type)?.getValue()).toBe(score);
          expect(candidate.getStat(DataTrainingStressScoreMethod.type)?.getValue()).toBe(
            TrainingStressScoreMethod.IMPORTED
          );
        }
      }
    }
  });

  it('clears imported TSS when preservation is off and calculation inputs are unavailable', () => {
    const activity = importStretching(
      { file_ids: [{ manufacturer: 'suunto' }] },
      { training_stress_score: 42.375 },
      new ActivityParsingOptions({
        generateUnitStreams: false,
        tss: { preserveImportedTss: false, enableHeuristicFallbacks: false }
      })
    );
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    expect(activity.type).toBe(ActivityTypes.Stretching);
    expect(activity.getStat(DataTrainingStressScore.type)).toBeUndefined();
    expect(activity.getStat(DataTrainingStressScoreMethod.type)).toBeUndefined();
  });
});
