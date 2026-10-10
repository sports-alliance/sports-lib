import { FitBaseType, FitEncoder } from 'fit-file-parser/encoder';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { ActivityTypeGroups, ActivityTypes, ActivityTypesHelper } from '../../../../activities/activity.types';
import { DataTrainingStressScore } from '../../../../data/data.training-stress-score';
import {
  DataTrainingStressScoreMethod,
  TrainingStressScoreMethod
} from '../../../../data/data.training-stress-score-method';
import { EventImporterJSON } from '../json/importer.json';
import { EventImporterFIT } from './importer.fit';

const importer = EventImporterFIT as unknown as {
  getActivityTypeFromSessionObject(session: unknown, manufacturer?: unknown): ActivityTypes;
};

const namedSports = [
  ['Racket Sport', ActivityTypes.RacketSport, ActivityTypeGroups.TeamRacketGroup],
  ['Para Sport', ActivityTypes.ParaSport, ActivityTypeGroups.UnspecifiedGroup],
  ['Ultimate Disc', ActivityTypes.UltimateDisc, ActivityTypeGroups.TeamRacketGroup],
  ['Ultimate Frisbee', ActivityTypes.UltimateDisc, ActivityTypeGroups.TeamRacketGroup],
  ['AMRAP', ActivityTypes.HIIT, ActivityTypeGroups.IndoorSportsGroup],
  ['EMOM', ActivityTypes.HIIT, ActivityTypeGroups.IndoorSportsGroup],
  ['Tabata', ActivityTypes.HIIT, ActivityTypeGroups.IndoorSportsGroup],
  ['Dynamic Apnea', ActivityTypes.PoolApnea, ActivityTypeGroups.DivingGroup],
  ['E-Bike Fitness', ActivityTypes.EBiking, ActivityTypeGroups.CyclingGroup],
  ['Casual Walking', ActivityTypes.Walking, ActivityTypeGroups.WalkingGroup],
  ['Bike Commute', ActivityTypes.Cycling, ActivityTypeGroups.CyclingGroup]
] as const;

describe('Racket, para, disc and recognized workout names', () => {
  it.each(namedSports)('normalizes the source name %s to %s in %s', (name, expected, group) => {
    for (const alias of [name, name.toUpperCase(), name.replace(/[\s-]/g, ''), name.replace(/[\s-]/g, '_')]) {
      expect(ActivityTypesHelper.resolveActivityType(alias)).toBe(expected);
      expect(ActivityTypesHelper.getActivityGroupForActivityType(expected)).toBe(group);
      for (const manufacturer of [1, 7, 23, 123, undefined]) {
        expect(importer.getActivityTypeFromSessionObject({ sport: alias, sub_sport: 0 }, manufacturer)).toBe(expected);
        expect(
          importer.getActivityTypeFromSessionObject({ sport: 0, sub_sport: 0, sport_profile_name: alias }, manufacturer)
        ).toBe(expected);
      }
    }
  });

  it.each([
    [64, 0, ActivityTypes.RacketSport],
    [64, 84, ActivityTypes.Pickleball],
    [64, 85, ActivityTypes.Padel],
    [64, 93, ActivityTypes.PlatformTennis],
    [64, 94, ActivityTypes.Squash],
    [64, 95, ActivityTypes.Badminton],
    [64, 96, ActivityTypes.RacquetBall],
    [64, 97, ActivityTypes.TableTennis],
    [68, 0, ActivityTypes.ParaSport],
    [62, 73, ActivityTypes.HIIT],
    [62, 74, ActivityTypes.HIIT],
    [62, 75, ActivityTypes.HIIT],
    [21, 28, ActivityTypes.EBiking],
    [11, 30, ActivityTypes.Walking],
    [2, 48, ActivityTypes.Cycling],
    [53, 121, ActivityTypes.PoolApnea]
  ] as const)('preserves the explicit FIT classification %s/%s as %s', (sport, sub_sport, expected) => {
    for (const manufacturer of [1, 7, 23, 123, undefined]) {
      for (const session of [
        { sport, sub_sport },
        { sport: String(sport), sub_sport: String(sub_sport) }
      ]) {
        expect(importer.getActivityTypeFromSessionObject(session, manufacturer)).toBe(expected);
      }
    }
  });

  it.each([
    [62, 73, ActivityTypes.HIIT],
    [62, 74, ActivityTypes.HIIT],
    [62, 75, ActivityTypes.HIIT],
    [21, 28, ActivityTypes.EBiking],
    [11, 30, ActivityTypes.Walking],
    [2, 48, ActivityTypes.Cycling],
    [53, 121, ActivityTypes.PoolApnea]
  ] as const)('keeps the specific FIT pair %s/%s ahead of a conflicting profile', (sport, sub_sport, expected) => {
    expect(importer.getActivityTypeFromSessionObject({ sport, sub_sport, sport_profile_name: 'Running' })).toBe(
      expected
    );
  });

  it.each([73, 74, 75, 28, 30, 121])('requires the matching parent for sub-sport %s', sub_sport => {
    expect(importer.getActivityTypeFromSessionObject({ sport: 0, sub_sport })).toBe(ActivityTypes.Generic);
    expect(importer.getActivityTypeFromSessionObject({ sport: 1, sub_sport })).toBe(ActivityTypes.Running);
    expect(importer.getActivityTypeFromSessionObject({ sport: 'not-a-sport', sub_sport })).toBe(ActivityTypes.unknown);
  });

  it.each([
    [{ sport: 64, sub_sport: 0, sport_profile_name: 'Tennis' }, ActivityTypes.Tennis],
    [{ sport: 64, sub_sport: 0, sport_profile_name: 'Racquet Ball' }, ActivityTypes.RacquetBall],
    [{ sport: 64, sub_sport: 95, sport_profile_name: 'Squash' }, ActivityTypes.Badminton],
    [{ sport: 64, sub_sport: 0, sport_profile_name: 'Running' }, ActivityTypes.RacketSport],
    [{ sport: 64, sub_sport: 'constructor' }, ActivityTypes.RacketSport],
    [{ sport: 68, sub_sport: 0, sport_profile_name: 'Wheelchair Push Run' }, ActivityTypes.WheelchairPushRun],
    [{ sport: 68, sub_sport: 0, sport_profile_name: 'Custom para sport' }, ActivityTypes.ParaSport],
    [{ sport: 70, sub_sport: 92, sport_profile_name: 'Ultimate Disc' }, ActivityTypes.UltimateDisc],
    [{ sport: 64, sub_sport: 92, sport_profile_name: 'Ultimate Frisbee' }, ActivityTypes.UltimateDisc],
    [{ sport: 70, sub_sport: 92 }, ActivityTypes.TeamSport],
    [{ sport: 69, sub_sport: 92, sport_profile_name: 'Ultimate Disc' }, ActivityTypes.DiscGolf],
    [{ sport: 0, sub_sport: 92 }, ActivityTypes.Generic],
    [{ sport: 0, sport_profile_name: 'Ultimate' }, ActivityTypes.Generic],
    [{ sport: 0, sport_profile_name: 'Commute' }, ActivityTypes.Generic],
    [{ sport: 0, sport_profile_name: 'Dynamic' }, ActivityTypes.Generic],
    [{ sport: 0, sport_profile_name: 'Para' }, ActivityTypes.Generic]
  ])('uses precise names while retaining unrelated or ambiguous source context (%j)', (session, expected) => {
    expect(importer.getActivityTypeFromSessionObject(session)).toBe(expected);
  });

  describe.each([1, 7, 23, 123, 65535])('binary FIT import for manufacturer %s', manufacturer => {
    it.each([
      [64, 0, '', ActivityTypes.RacketSport],
      [68, 0, '', ActivityTypes.ParaSport],
      [0, 0, 'Ultimate Disc', ActivityTypes.UltimateDisc],
      [70, 92, 'Ultimate Frisbee', ActivityTypes.UltimateDisc],
      [0, 0, 'AMRAP', ActivityTypes.HIIT],
      [0, 0, 'EMOM', ActivityTypes.HIIT],
      [0, 0, 'Tabata', ActivityTypes.HIIT],
      [0, 0, 'Dynamic Apnea', ActivityTypes.PoolApnea],
      [0, 0, 'E-Bike Fitness', ActivityTypes.EBiking],
      [0, 0, 'Casual Walking', ActivityTypes.Walking],
      [0, 0, 'Bike Commute', ActivityTypes.Cycling],
      [62, 73, '', ActivityTypes.HIIT],
      [62, 74, '', ActivityTypes.HIIT],
      [62, 75, '', ActivityTypes.HIIT],
      [21, 28, '', ActivityTypes.EBiking],
      [11, 30, '', ActivityTypes.Walking],
      [2, 48, '', ActivityTypes.Cycling],
      [53, 121, '', ActivityTypes.PoolApnea]
    ] as const)(
      'imports %s/%s (%s) as %s with the approved TSS setting',
      async (sport, subSport, profile, expected) => {
        for (const preserveImportedTss of [undefined, true, false]) {
          for (const score of [0, 42.5]) {
            const encoder = new FitEncoder();
            const startTime = FitEncoder.toFitTimestamp(new Date('2026-01-01T12:00:00Z'));
            encoder.writeMessage(0, [
              { number: 0, size: 1, baseType: FitBaseType.Enum, value: 4 },
              { number: 1, size: 2, baseType: FitBaseType.Uint16, value: manufacturer },
              { number: 4, size: 4, baseType: FitBaseType.Uint32, value: startTime }
            ]);
            encoder.writeMessage(18, [
              { number: 253, size: 4, baseType: FitBaseType.Uint32, value: startTime + 60 },
              { number: 2, size: 4, baseType: FitBaseType.Uint32, value: startTime },
              { number: 5, size: 1, baseType: FitBaseType.Enum, value: sport },
              { number: 6, size: 1, baseType: FitBaseType.Enum, value: subSport },
              { number: 7, size: 4, baseType: FitBaseType.Uint32, value: 60_000 },
              { number: 8, size: 4, baseType: FitBaseType.Uint32, value: 60_000 },
              { number: 35, size: 2, baseType: FitBaseType.Uint16, value: score * 10 },
              {
                number: 110,
                size: profile.length + 1,
                baseType: FitBaseType.String,
                value: Buffer.from(`${profile}\0`)
              }
            ]);
            const event = await EventImporterFIT.getFromArrayBuffer(
              Buffer.from(encoder.close()),
              new ActivityParsingOptions({
                generateUnitStreams: false,
                tss: { preserveImportedTss, enableHeuristicFallbacks: false }
              })
            );
            const restored = EventImporterJSON.getEventFromJSON(JSON.parse(JSON.stringify(event.toJSON())));
            for (const candidate of [event, restored]) {
              expect(candidate.getFirstActivity().type).toBe(expected);
              expect(candidate.getActivityTypesAsArray()).toEqual([expected]);
              if (preserveImportedTss === false) {
                expect(candidate.getFirstActivity().getStat(DataTrainingStressScore.type)).toBeUndefined();
                expect(candidate.getFirstActivity().getStat(DataTrainingStressScoreMethod.type)).toBeUndefined();
              } else {
                expect(candidate.getFirstActivity().getStat(DataTrainingStressScore.type)?.getValue()).toBe(score);
                expect(candidate.getFirstActivity().getStat(DataTrainingStressScoreMethod.type)?.getValue()).toBe(
                  TrainingStressScoreMethod.IMPORTED
                );
              }
            }
          }
        }
      }
    );
  });
});
