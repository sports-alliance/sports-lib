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

const importSession = (
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
    const activity = importSession(identity);
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
      const activity = importSession(
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
    const activity = importSession(
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

// Suunto Activities.pdf: distinct documented pairs reuse the existing canonical types.
const distinctMappings = [
  {
    sport: 24,
    subSport: 0,
    sportName: 'driving',
    subSportName: 'generic',
    type: ActivityTypes.Motorsports,
    previous: ActivityTypes.Driving
  },
  {
    sport: 31,
    subSport: 0,
    sportName: 'rock_climbing',
    subSportName: 'generic',
    type: ActivityTypes.Climbing,
    previous: ActivityTypes.RockClimbing
  },
  {
    sport: 13,
    subSport: 37,
    sportName: 'alpine_skiing',
    subSportName: 'backcountry',
    type: ActivityTypes.SkiTouring,
    previous: ActivityTypes.BackcountrySkiing
  },
  {
    sport: 4,
    subSport: 15,
    sportName: 'fitness_equipment',
    subSportName: 'elliptical',
    type: ActivityTypes.Crosstrainer,
    previous: ActivityTypes.EllipticalTrainer
  },
  {
    sport: 10,
    subSport: 26,
    sportName: 'training',
    subSportName: 'cardio_training',
    type: ActivityTypes.Aerobics,
    previous: ActivityTypes.CardioTraining
  },
  {
    sport: 17,
    subSport: 0,
    sportName: 'hiking',
    subSportName: 'generic',
    type: ActivityTypes.Trekking,
    previous: ActivityTypes.Hiking
  },
  {
    sport: 26,
    subSport: 0,
    sportName: 'hang_gliding',
    subSportName: 'generic',
    type: ActivityTypes.Paragliding,
    previous: ActivityTypes.HangGliding
  },
  {
    sport: 4,
    subSport: 20,
    sportName: 'fitness_equipment',
    subSportName: 'strength_training',
    type: ActivityTypes.Calisthenics,
    previous: ActivityTypes.StrengthTraining
  }
];

describe('Suunto distinct documented FIT pairs', () => {
  it.each(distinctMappings)('retains $type for numeric and decoded names', row => {
    for (const manufacturer of [23, '23', 'suunto', ' Suunto ']) {
      for (const session of [
        { sport: row.sport, sub_sport: row.subSport },
        { sport: String(row.sport), sub_sport: String(row.subSport) },
        { sport: row.sportName, sub_sport: row.subSportName },
        { sport: row.sportName.toUpperCase(), sub_sport: row.subSportName.toUpperCase().replace(/_/g, '-') }
      ])
        expect(importerInternals.getActivityTypeFromSessionObject(session, manufacturer)).toBe(row.type);
    }
    if (row.subSport === 0) {
      expect(importerInternals.getActivityTypeFromSessionObject({ sport: row.sport }, 23)).toBe(row.type);
    }
  });

  it.each(distinctMappings)('retains the original $previous classification for other creators', row => {
    for (const manufacturer of [undefined, 1, 'garmin', 123, 'polar', 'suunto_sensor']) {
      expect(
        importerInternals.getActivityTypeFromSessionObject({ sport: row.sport, sub_sport: row.subSport }, manufacturer)
      ).toBe(row.previous);
    }
    const accessoryOnly = importSession(
      { file_ids: [{ manufacturer: 'garmin' }], device_infos: [{ device_index: 1, manufacturer: 'suunto' }] },
      { sport: row.sport, sub_sport: row.subSport }
    );
    expect(accessoryOnly.type).toBe(row.previous);
  });

  it.each(distinctMappings.filter(row => row.subSport === 0))(
    'does not treat an unknown sub-sport as documented $type context',
    row => {
      for (const sub_sport of [999, -1, 255, 'unrecognized', {}]) {
        expect(importerInternals.getActivityTypeFromSessionObject({ sport: row.sport, sub_sport }, 23)).toBe(
          row.previous
        );
      }
    }
  );

  it.each(distinctMappings)('round-trips $type and respects both TSS settings', row => {
    for (const preserveImportedTss of [undefined, true, false]) {
      for (const score of [0, 42.375]) {
        const options = new ActivityParsingOptions({
          generateUnitStreams: false,
          tss: { preserveImportedTss, overrides: { metScore: 6, thresholdMet: 6 } }
        });
        const activity = importSession(
          { file_ids: [{ manufacturer: 'suunto' }] },
          { sport: row.sport, sub_sport: row.subSport, training_stress_score: score },
          options
        );
        ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
        const restored = EventImporterJSON.getActivityFromJSON(JSON.parse(JSON.stringify(activity.toJSON())));
        restored.parseOptions = options;
        ActivityUtilities.generateMissingStreamsAndStatsForActivity(restored);
        for (const candidate of [activity, restored]) {
          expect(candidate.type).toBe(row.type);
          if (preserveImportedTss !== false) {
            expect(candidate.getStat(DataTrainingStressScore.type)?.getValue()).toBe(score);
            expect(candidate.getStat(DataTrainingStressScoreMethod.type)?.getValue()).toBe(
              TrainingStressScoreMethod.IMPORTED
            );
          } else if (row.type === ActivityTypes.Motorsports) {
            expect(candidate.getStat(DataTrainingStressScore.type)).toBeUndefined();
            expect(candidate.getStat(DataTrainingStressScoreMethod.type)).toBeUndefined();
          } else {
            expect(candidate.getStat(DataTrainingStressScore.type)?.getValue()).toBeGreaterThan(0);
            expect(candidate.getStat(DataTrainingStressScore.type)?.getValue()).not.toBe(score);
            expect(candidate.getStat(DataTrainingStressScoreMethod.type)?.getValue()).toBe(
              TrainingStressScoreMethod.MET
            );
          }
        }
      }
    }
  });

  it.each([
    [{ sport: 24, sub_sport: 0, sport_profile_name: 'Motorcycling' }, ActivityTypes.Motorcycling],
    [{ sport: 31, sub_sport: 0, sport_profile_name: 'Indoor Climbing' }, ActivityTypes.IndoorClimbing],
    [{ sport: 26, sub_sport: 0, sport_profile_name: 'Hang Gliding' }, ActivityTypes.HangGliding],
    [{ sport: 17, sub_sport: 0, sport_profile_name: 'Rucking' }, ActivityTypes.Rucking],
    [{ sport: 17, sub_sport: 3 }, ActivityTypes.Hiking],
    [{ sport: 17, sub_sport: 124 }, ActivityTypes.Rucking],
    [{ sport: 31, sub_sport: 68 }, ActivityTypes.IndoorClimbing],
    [{ sport: 4, sub_sport: 14 }, ActivityTypes.IndoorRowing],
    [{ sport: 10, sub_sport: 20 }, ActivityTypes.StrengthTraining],
    [{ sport: 13, sub_sport: 9 }, ActivityTypes.AlpineSkiing],
    [{ sport: 0, sub_sport: 26 }, ActivityTypes.CardioTraining],
    [{ sport: 0, sub_sport: 15 }, ActivityTypes.EllipticalTrainer],
    [{ sport: 0, sub_sport: 20 }, ActivityTypes.StrengthTraining],
    [{ sport: 12, sub_sport: 37 }, ActivityTypes.BackcountrySkiing],
    [{ sport: 13, sub_sport: 37, sport_profile_name: 'Unknown profile' }, ActivityTypes.SkiTouring]
  ])('preserves explicit refinements and neighboring session %j', (session, type) => {
    expect(importerInternals.getActivityTypeFromSessionObject(session, 23)).toBe(type);
  });
});

describe('Suunto named profiles on shared FIT pairs', () => {
  it.each([
    {
      sport: 10,
      subSport: 20,
      type: ActivityTypes.Kettlebell,
      profile: 'Kettlebell',
      previous: ActivityTypes.StrengthTraining
    },
    {
      sport: 13,
      subSport: 9,
      type: ActivityTypes.TelemarkSkiing,
      profile: 'Telemarkskiing',
      previous: ActivityTypes.AlpineSkiing
    }
  ])('preserves explicit $profile without guessing from the shared pair', row => {
    for (const profile of [row.profile, row.type, row.profile.toUpperCase()]) {
      expect(
        importerInternals.getActivityTypeFromSessionObject(
          { sport: row.sport, sub_sport: row.subSport, sport_profile_name: profile },
          23
        )
      ).toBe(row.type);
      for (const manufacturer of [undefined, 1, 123]) {
        expect(
          importerInternals.getActivityTypeFromSessionObject(
            { sport: row.sport, sub_sport: row.subSport, sport_profile_name: profile },
            manufacturer
          )
        ).toBe(row.previous);
      }
    }
    for (const profile of [undefined, 'Custom profile', 'Running']) {
      expect(
        importerInternals.getActivityTypeFromSessionObject(
          { sport: row.sport, sub_sport: row.subSport, sport_profile_name: profile },
          23
        )
      ).toBe(row.previous);
    }
    for (const sub_sport of [0, row.subSport]) {
      // An unrelated parent must not acquire the new manufacturer-qualified refinement.
      expect(importerInternals.getActivityTypeFromSessionObject({ sport: 'cycling', sub_sport }, 23)).not.toBe(
        row.type
      );
    }
    const activity = importSession(
      { file_ids: [{ manufacturer: 'suunto' }] },
      { sport: row.sport, sub_sport: row.subSport, sport_profile_name: row.profile, training_stress_score: 42.375 }
    );
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    const restored = EventImporterJSON.getActivityFromJSON(JSON.parse(JSON.stringify(activity.toJSON())));
    expect(restored.type).toBe(row.type);
    expect(restored.getStat(DataTrainingStressScore.type)?.getValue()).toBe(42.375);
  });
});
