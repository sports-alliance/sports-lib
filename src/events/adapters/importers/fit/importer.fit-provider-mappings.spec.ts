import { FitBaseType, FitEncoder } from 'fit-file-parser/encoder';
import { getFitSportId, getFitSubSportId } from 'fit-file-parser/profile';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { resolveProviderFITProfile } from '../../../../activities/activity-types.provider';
import {
  ACTIVITIES_EXCLUDED_FROM_ASCENT,
  ACTIVITIES_EXCLUDED_FROM_DESCENT,
  ActivityTypeGroups,
  ActivityTypes,
  ActivityTypesHelper,
  type ActivityTypeSource
} from '../../../../activities/activity.types';
import mappings from '../../../../activities/fixtures/provider-sport-mappings.json';
import profileCompatibility from '../../../../activities/fixtures/provider-profile-compatibility.json';

const allMappings = [...mappings, ...profileCompatibility];
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
const manufacturers = { garmin: 1, polar: 123, strava: 265 };
const manufacturerNames = { garmin: 'garmin', polar: 'polar_electro', strava: 'strava' };

describe('Approved Garmin, Polar and Strava sport mappings', () => {
  it('adds exactly the approved 49 canonical types across 146 source entries', () => {
    expect(mappings).toHaveLength(146);
    expect(new Set(mappings.filter(row => row.newType).map(row => row.type)).size).toBe(49);
    expect(ActivityTypesHelper.getActivityTypesAsUniqueArray()).toHaveLength(245);
  });

  it.each(allMappings)('resolves $source $identifier to $type in $group', row => {
    const source = row.source as ActivityTypeSource;
    const type = row.type as ActivityTypes;
    for (const name of new Set([row.identifier, row.name])) {
      for (const alias of [name, name.toUpperCase(), name.replace(/[\s-]/g, '_')]) {
        expect(ActivityTypesHelper.resolveActivityType(alias, source)).toBe(type);
        expect(
          importer.getActivityTypeFromSessionObject(
            { sport: 0, sub_sport: 0, sport_profile_name: alias },
            manufacturers[source]
          )
        ).toBe(type);
      }
    }
    expect(ActivityTypesHelper.getActivityGroupForActivityType(type)).toBe(
      ActivityTypeGroups[row.group as keyof typeof ActivityTypeGroups]
    );
  });

  it.each(allMappings)('restores $source $identifier through native JSON and canonical JSON', row => {
    const source = row.source as ActivityTypeSource;
    for (const name of new Set([row.identifier, row.name])) {
      const activity = EventImporterJSON.getActivityFromJSON({
        name: 'provider-profile-roundtrip',
        startDate: 1000,
        endDate: 61000,
        type: name as ActivityTypes,
        powerMeter: false,
        trainer: false,
        stats: {},
        streams: [],
        laps: [],
        intensityZones: [],
        events: [],
        creator: { name: 'test', manufacturer: manufacturerNames[source], devices: [] }
      });
      expect(activity.type).toBe(row.type);
      expect(EventImporterJSON.getActivityFromJSON(JSON.parse(JSON.stringify(activity.toJSON()))).type).toBe(row.type);
    }
  });

  it.each(allMappings)('refines only compatible FIT context for $source $identifier', row => {
    const source = row.source as ActivityTypeSource;
    const sport = getFitSportId(row.fitSport);
    const subSport = getFitSubSportId(row.fitSubSport);
    expect(sport).not.toBeNull();
    expect(subSport).not.toBeNull();
    for (const name of new Set([row.identifier, row.name])) {
      for (const session of [
        { sport, sub_sport: subSport, sport_profile_name: name },
        { sport: row.fitSport, sub_sport: row.fitSubSport, sport_profile_name: name }
      ]) {
        expect(importer.getActivityTypeFromSessionObject(session, manufacturers[source])).toBe(row.type);
      }
    }
  });

  it.each(allMappings)('imports binary FIT for $source $identifier with the requested TSS policy', async row => {
    const source = row.source as ActivityTypeSource;
    const sport = getFitSportId(row.fitSport)!;
    const subSport = getFitSubSportId(row.fitSubSport)!;
    for (const preserveImportedTss of [undefined, true, false]) {
      for (const score of [0, 42.5]) {
        const encoder = new FitEncoder();
        const startTime = FitEncoder.toFitTimestamp(new Date('2026-01-01T12:00:00Z'));
        const profileBytes = FitEncoder.string(row.identifier);
        encoder.writeMessage(0, [
          { number: 0, size: 1, baseType: FitBaseType.Enum, value: 4 },
          { number: 1, size: 2, baseType: FitBaseType.Uint16, value: manufacturers[source] },
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
            size: profileBytes.length,
            baseType: FitBaseType.String,
            value: profileBytes
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
          const activity = candidate.getFirstActivity();
          expect(activity.type).toBe(row.type);
          expect(candidate.getActivityTypesAsArray()).toEqual([row.type]);
          if (preserveImportedTss === false) {
            expect(activity.getStat(DataTrainingStressScore.type)).toBeUndefined();
            expect(activity.getStat(DataTrainingStressScoreMethod.type)).toBeUndefined();
          } else {
            expect(activity.getStat(DataTrainingStressScore.type)?.getValue()).toBe(score);
            expect(activity.getStat(DataTrainingStressScoreMethod.type)?.getValue()).toBe(
              TrainingStressScoreMethod.IMPORTED
            );
          }
        }
      }
    }
  });

  it('keeps provider-specific meanings scoped to recorded manufacturer identity', () => {
    expect(ActivityTypesHelper.resolveActivityType('Ski', 'garmin')).toBe(ActivityTypes.AlpineSkiing);
    expect(ActivityTypesHelper.resolveActivityType('Skiing', 'polar')).toBe(ActivityTypes.CrosscountrySkiing);
    expect(ActivityTypesHelper.resolveActivityType('Enduro', 'polar')).toBe(ActivityTypes.MotorcycleEnduro);
    expect(ActivityTypesHelper.resolveActivityType('Enduro MTB', 'polar')).toBe(ActivityTypes.EnduroMTB);
    for (const name of [
      'Ski',
      'Skiing',
      'Enduro',
      'Ultimate',
      'Gravel',
      'Esports',
      'Jazz',
      'Road racing',
      'Riding',
      'Roller skating'
    ]) {
      expect(ActivityTypesHelper.resolveActivityType(name)).toBeNull();
    }
    expect(
      importer.getActivityTypeFromSessionObject({ sport: 0, sub_sport: 0, sport_profile_name: 'ULTIMATE' }, 7)
    ).toBe(ActivityTypes.Generic);
    expect(importer.getActivityTypeFromSessionObject({ sport: 2, sub_sport: 77 }, 123)).toBe(ActivityTypes.Cycling);
  });

  it('requires the explicit Snorkel profile and preserves explicit scuba and apnea classifications', () => {
    expect(
      importer.getActivityTypeFromSessionObject({ sport: 53, sub_sport: 0, sport_profile_name: 'Snorkel' }, 1)
    ).toBe(ActivityTypes.Snorkeling);
    const diving = importer.getActivityTypeFromSessionObject({ sport: 53, sub_sport: 0 }, 1);
    expect(diving).not.toBe(ActivityTypes.Snorkeling);
    for (const subSport of ['single_gas_diving', 'multi_gas_diving', 'gauge_diving', 'apnea_diving', 'apnea_hunting']) {
      const withoutProfile = importer.getActivityTypeFromSessionObject({ sport: 53, sub_sport: subSport }, 1);
      expect(
        importer.getActivityTypeFromSessionObject({ sport: 53, sub_sport: subSport, sport_profile_name: 'Snorkel' }, 1)
      ).toBe(withoutProfile);
    }
  });

  it('keeps explicit incompatible FIT pairs ahead of a conflicting provider profile', () => {
    expect(importer.getActivityTypeFromSessionObject({ sport: 0, sub_sport: 66 }, 1)).toBe(ActivityTypes.Generic);
    expect(importer.getActivityTypeFromSessionObject({ sport: 17, sub_sport: 66 }, 1)).toBe(ActivityTypes.Hiking);
    for (const manufacturer of [1, 123, 265, undefined]) {
      expect(importer.getActivityTypeFromSessionObject({ sport: 0, sub_sport: 12 }, manufacturer)).toBe(
        ActivityTypes.Generic
      );
    }
    for (const manufacturer of [1, 123, 265, 23, undefined]) {
      for (const profile of ['Enduro', 'MOTORSPORTS_ENDURO', 'Breathwork', 'VirtualRow', 'Ski orienteering']) {
        expect(
          importer.getActivityTypeFromSessionObject(
            { sport: 2, sub_sport: 6, sport_profile_name: profile },
            manufacturer
          )
        ).toBe(ActivityTypes.IndoorCycling);
      }
    }
    expect(importer.getActivityTypeFromSessionObject({ sport: 0, sub_sport: 62 }, 1)).toBe(ActivityTypes.Meditation);
    expect(
      importer.getActivityTypeFromSessionObject({ sport: 0, sub_sport: 62, sport_profile_name: 'Breathwork' }, 1)
    ).toBe(ActivityTypes.Breathwork);
    expect(importer.getActivityTypeFromSessionObject({ sport: 14, sub_sport: 37 }, 23)).toBe(
      ActivityTypes.Splitboarding
    );
    expect(
      importer.getActivityTypeFromSessionObject(
        { sport: 14, sub_sport: 37, sport_profile_name: 'Backcountry Snowboard' },
        1
      )
    ).toBe(ActivityTypes.BackcountrySnowboarding);
  });

  it('keeps profile refinements tied to their manufacturer and documented parent pair', () => {
    for (const profile of ['Breathwork', 'Ex. respiration']) {
      for (const manufacturer of [23, 123, undefined]) {
        expect(
          importer.getActivityTypeFromSessionObject(
            { sport: 10, sub_sport: 62, sport_profile_name: profile },
            manufacturer
          )
        ).toBe(ActivityTypes.Meditation);
      }
      expect(
        importer.getActivityTypeFromSessionObject({ sport: 1, sub_sport: 62, sport_profile_name: profile }, 1)
      ).not.toBe(ActivityTypes.Breathwork);
    }
    expect(importer.getActivityTypeFromSessionObject({ sport: 10, sub_sport: 62 }, 1)).toBe(ActivityTypes.Meditation);
    expect(importer.getActivityTypeFromSessionObject({ sport: 0, sub_sport: 19 }, 123)).toBe(
      ActivityTypes.FlexibilityTraining
    );
    expect(importer.getActivityTypeFromSessionObject({ sport: 10, sub_sport: 19 }, 23)).toBe(
      ActivityTypes.FlexibilityTraining
    );
    expect(
      importer.getActivityTypeFromSessionObject({ sport: 1, sub_sport: 45, sport_profile_name: 'CROSS_TRAINER' }, 123)
    ).toBe(ActivityTypes.IndoorRunning);
    expect(
      importer.getActivityTypeFromSessionObject({ sport: 2, sub_sport: 6, sport_profile_name: 'STRETCHING' }, 123)
    ).toBe(ActivityTypes.IndoorCycling);
  });

  it.each(allMappings)('retains unrelated broad FIT parents for $source $identifier', row => {
    for (const sport of ['cycling', 'basketball']) {
      if (sport === row.fitSport) continue;
      const manufacturer = manufacturers[row.source as ActivityTypeSource];
      const expected = importer.getActivityTypeFromSessionObject({ sport, sub_sport: 'generic' }, manufacturer);
      for (const profile of new Set([row.identifier, row.name])) {
        // Cycling/Enduro is an established parent/profile composite, independent of provider aliases.
        if (sport === 'cycling' && profile === 'Enduro') continue;
        expect(
          importer.getActivityTypeFromSessionObject(
            { sport, sub_sport: 'generic', sport_profile_name: profile },
            manufacturer
          )
        ).toBe(expected);
      }
    }
  });

  it('retains every documented context for a shared Polar profile spelling', () => {
    for (const subSport of ['generic', 'backcountry']) {
      expect(resolveProviderFITProfile('Open water swimming', 'polar', 'swimming', subSport)).toBe(
        ActivityTypes.OpenWaterSwimming
      );
    }
    expect(resolveProviderFITProfile('Open water swimming', 'polar', 'cycling', 'generic')).toBeNull();
  });

  it.each([
    ['Trail Run', 'running', 1, ActivityTypes.TrailRunning],
    ['Backcountry Snowboard', 'snowboarding', 1, ActivityTypes.BackcountrySnowboarding],
    ['OFFROADDUATHLON_RUNNING', 'running', 123, ActivityTypes.TrailRunning],
    ['CROSS_TRAINER', 'training', 123, ActivityTypes.Crosstrainer]
  ])('retains %s on its compatible broad %s parent', (profile, sport, manufacturer, type) => {
    for (const subSport of [undefined, 'generic']) {
      expect(
        importer.getActivityTypeFromSessionObject(
          { sport, sub_sport: subSport, sport_profile_name: profile },
          manufacturer
        )
      ).toBe(type);
    }
  });

  it('retains compatible broad cycling and racket profile refinements', () => {
    expect(
      importer.getActivityTypeFromSessionObject(
        { sport: 'cycling', sub_sport: 'generic', sport_profile_name: 'ENDURO MTB' },
        123
      )
    ).toBe(ActivityTypes.EnduroMTB);
    expect(
      importer.getActivityTypeFromSessionObject(
        { sport: 'racket', sub_sport: 'generic', sport_profile_name: 'Padel' },
        1
      )
    ).toBe(ActivityTypes.Padel);
    for (const manufacturer of [1, 7, 23, 123, undefined]) {
      for (const subSport of [undefined, 'generic']) {
        expect(
          importer.getActivityTypeFromSessionObject(
            { sport: 'cycling', sub_sport: subSport, sport_profile_name: 'Enduro' },
            manufacturer
          )
        ).toBe(ActivityTypes.EnduroMTB);
      }
    }
    expect(
      importer.getActivityTypeFromSessionObject(
        { sport: 'generic', sub_sport: 'expedition', sport_profile_name: 'Expedition' },
        1
      )
    ).toBe(ActivityTypes.Expedition);
  });

  it('keeps virtual rowing as indoor stroke-rate activity and suppresses water terrain summaries', () => {
    expect(ActivityTypesHelper.isIndoorActivityType(ActivityTypes.VirtualRowing)).toBe(true);
    expect(ActivityTypesHelper.usesStrokeRate(ActivityTypes.VirtualRowing)).toBe(true);
    for (const type of [ActivityTypes.AquaFitness, ActivityTypes.AdaptiveWaterSkiing, ActivityTypes.WaterRunning]) {
      expect(ACTIVITIES_EXCLUDED_FROM_ASCENT).toContain(type);
      expect(ACTIVITIES_EXCLUDED_FROM_DESCENT).toContain(type);
    }
  });
});
