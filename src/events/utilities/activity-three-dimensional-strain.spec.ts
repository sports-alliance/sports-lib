import { Activity } from '../../activities/activity';
import { ActivityTypeGroups, ActivityTypes, ActivityTypesHelper } from '../../activities/activity.types';
import { Creator } from '../../creators/creator';
import { DataDuration } from '../../data/data.duration';
import { DataPower } from '../../data/data.power';
import { DataPowerCurve } from '../../data/data.power-curve';
import {
  DataThreeDimensionalStrainEvidence,
  THREE_DIMENSIONAL_STRAIN_LEGACY_PROTOCOL_VERSION,
  THREE_DIMENSIONAL_STRAIN_PROTOCOL_VERSION,
  type ThreeDimensionalStrainEvidenceValue,
  type ThreeDimensionalStrainEvidenceValueV1,
  normalizeThreeDimensionalStrainEvidenceValue
} from '../../data/data.three-dimensional-strain-evidence';
import { ActivityUtilities } from './activity.utilities';
import {
  analyzeActivityThreeDimensionalStrain,
  calculateActivityThreeDimensionalStrainSourceFingerprint
} from './activity-three-dimensional-strain';
import { predictThreeParameterCriticalPower } from './three-dimensional-impulse-response';

const model = {
  criticalPowerWatts: 220,
  wPrimeJoules: 18_000,
  maximumPowerWatts: 800
};

const durations = [5, 15, 30, 120, 180, 360, 600, 1_200];
const canonicalActivityTypes = [...new Set(Object.values(ActivityTypes))] as ActivityTypes[];

function createPowerCurve(): DataPowerCurve {
  return new DataPowerCurve(
    durations.map(duration => ({
      duration: new DataDuration(duration),
      power: new DataPower(predictThreeParameterCriticalPower(model, duration)!)
    }))
  );
}

function createActivity(
  power: (number | null)[] = Array(3_600).fill(200),
  activityType: ActivityTypes = ActivityTypes.Cycling
): Activity {
  const activity = new Activity(new Date(0), new Date(power.length * 1000), activityType, new Creator('Test'));
  activity.addStream(activity.createStream(DataPower.type).setData(power));
  activity.addStat(createPowerCurve());
  return activity;
}

describe('activity three dimensional strain', () => {
  it('builds compact ready evidence from self-fitted activity power', () => {
    const result = analyzeActivityThreeDimensionalStrain(createActivity());

    expect(result.summary).toMatchObject({
      protocolVersion: THREE_DIMENSIONAL_STRAIN_PROTOCOL_VERSION,
      activityType: ActivityTypes.Cycling,
      activityGroup: ActivityTypeGroups.CyclingGroup,
      eligibility: { eligible: true, reason: 'eligible' },
      input: {
        powerSampleCount: 3_600,
        validPowerSampleCount: 3_600,
        coverageRatio: 1,
        curvePointCount: durations.length,
        hasShortDuration: true,
        hasMediumDuration: true,
        hasLongDuration: true
      },
      fit: {
        criticalPowerWatts: expect.closeTo(model.criticalPowerWatts, 4),
        wPrimeJoules: expect.closeTo(model.wPrimeJoules, 1),
        maximumPowerWatts: expect.closeTo(model.maximumPowerWatts, 4),
        converged: true
      },
      evidence: {
        total: expect.any(Number),
        criticalPower: expect.any(Number),
        wPrime: expect.any(Number),
        maximumPower: expect.any(Number)
      }
    });
    expect(result.summary?.evidence?.total).toBeCloseTo(
      (result.summary?.evidence?.criticalPower || 0) +
        (result.summary?.evidence?.wPrime || 0) +
        (result.summary?.evidence?.maximumPower || 0),
      10
    );
  });

  it('retains an unavailable supported-activity record for missing, gapped, and out-of-range source data', () => {
    const missing = createActivity([]);
    const gapped = createActivity(Array.from({ length: 3_600 }, (_, index) => (index < 200 ? null : 200)));
    const missingCurve = createActivity();
    missingCurve.removeStat(DataPowerCurve.type);
    const insufficientRange = createActivity();
    insufficientRange.removeStat(DataPowerCurve.type);
    insufficientRange.addStat(
      new DataPowerCurve(
        [5, 10, 15, 20, 25, 30, 35, 45].map(duration => ({
          duration: new DataDuration(duration),
          power: new DataPower(predictThreeParameterCriticalPower(model, duration)!)
        }))
      )
    );
    const powerExceeded = createActivity([1_000, ...Array(3_599).fill(200)]);
    const poorFit = createActivity();
    poorFit.removeStat(DataPowerCurve.type);
    poorFit.addStat(
      new DataPowerCurve(
        [5, 15, 30, 120, 180, 360, 600, 1_200].map((duration, index) => ({
          duration: new DataDuration(duration),
          power: new DataPower(index % 2 ? 100 : 900)
        }))
      )
    );

    expect(analyzeActivityThreeDimensionalStrain(missing).summary?.eligibility.reason).toBe('missing-power');
    expect(analyzeActivityThreeDimensionalStrain(gapped).summary?.eligibility.reason).toBe('insufficient-coverage');
    expect(analyzeActivityThreeDimensionalStrain(missingCurve).summary?.eligibility.reason).toBe(
      'insufficient-curve-points'
    );
    expect(analyzeActivityThreeDimensionalStrain(insufficientRange).summary?.eligibility.reason).toBe(
      'insufficient-duration-range'
    );
    expect(analyzeActivityThreeDimensionalStrain(powerExceeded).summary?.eligibility.reason).toBe(
      'power-exceeds-maximum'
    );
    expect(analyzeActivityThreeDimensionalStrain(poorFit).summary?.eligibility.reason).toBe('poor-fit');
  });

  it('canonicalizes v2 serialization, reads historic v1 records, and rejects impossible eligible values', () => {
    const summary = analyzeActivityThreeDimensionalStrain(createActivity()).summary!;
    const stat = new DataThreeDimensionalStrainEvidence({ ...summary, timeline: [{ power: 900 }] });
    const legacy = {
      ...summary,
      protocolVersion: THREE_DIMENSIONAL_STRAIN_LEGACY_PROTOCOL_VERSION,
      sourceFingerprint: 'three-dimensional-strain-v1:0000000000000000',
      discipline: 'cycling'
    };

    expect(JSON.stringify(stat.toJSON())).not.toContain('timeline');
    expect(normalizeThreeDimensionalStrainEvidenceValue(summary)).toEqual(summary);
    expect(normalizeThreeDimensionalStrainEvidenceValue(legacy)).toEqual({
      protocolVersion: THREE_DIMENSIONAL_STRAIN_LEGACY_PROTOCOL_VERSION,
      sourceFingerprint: 'three-dimensional-strain-v1:0000000000000000',
      discipline: 'cycling',
      eligibility: summary.eligibility,
      input: summary.input,
      fit: summary.fit,
      evidence: summary.evidence
    });
    expect(
      normalizeThreeDimensionalStrainEvidenceValue({
        ...summary,
        activityType: 'cycling',
        activityGroup: ActivityTypeGroups.WaterSportsGroup
      })
    ).toMatchObject({
      activityType: ActivityTypes.Cycling,
      activityGroup: ActivityTypeGroups.CyclingGroup
    });
    expect(
      normalizeThreeDimensionalStrainEvidenceValue({
        ...summary,
        activityGroup: null
      })
    ).toBeNull();
    expect(
      normalizeThreeDimensionalStrainEvidenceValue({
        ...summary,
        eligibility: { eligible: true, reason: 'eligible' },
        evidence: null
      })
    ).toBeNull();
    expect(
      normalizeThreeDimensionalStrainEvidenceValue({
        ...summary,
        protocolVersion: 0
      })
    ).toBeNull();
    expect(
      normalizeThreeDimensionalStrainEvidenceValue({
        ...summary,
        input: { ...summary.input, powerSampleCount: -1 }
      })
    ).toBeNull();
    expect(
      normalizeThreeDimensionalStrainEvidenceValue({
        ...summary,
        eligibility: { eligible: false, reason: 'missing-power' },
        evidence: null
      })
    ).toBeNull();
    expect(
      normalizeThreeDimensionalStrainEvidenceValue({
        ...summary,
        input: { ...summary.input, coverageRatio: 0.5 }
      })
    ).toBeNull();
  });

  it('fingerprints source inputs and reparses only its own evidence stat', () => {
    const activity = createActivity();
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    const originalEvidence = activity.getStat(DataThreeDimensionalStrainEvidence.type);
    const originalCurve = activity.getStat(DataPowerCurve.type);
    const originalFingerprint = calculateActivityThreeDimensionalStrainSourceFingerprint(activity);
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    expect(activity.getStat(DataThreeDimensionalStrainEvidence.type)).toBe(originalEvidence);

    const changedPower = Array(3_600).fill(200);
    changedPower[1_800] = 210;
    activity.replaceStreamData(DataPower.type, changedPower);
    expect(calculateActivityThreeDimensionalStrainSourceFingerprint(activity)).not.toBe(originalFingerprint);
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    const regenerated = activity.getStat<ThreeDimensionalStrainEvidenceValue>(DataThreeDimensionalStrainEvidence.type);
    expect(regenerated).not.toBe(originalEvidence);
    expect(regenerated?.getValue().sourceFingerprint).toMatch(/^three-dimensional-strain-v2:[0-9a-f]{16}$/);
    expect(activity.getStat(DataPowerCurve.type)).toBe(originalCurve);
  });

  it('uses the canonical activity type, rather than a source alias, in the v2 fingerprint', () => {
    const canonical = createActivity();
    const sourceAlias = createActivity();
    sourceAlias.type = 'cycling' as ActivityTypes;

    expect(calculateActivityThreeDimensionalStrainSourceFingerprint(sourceAlias)).toBe(
      calculateActivityThreeDimensionalStrainSourceFingerprint(canonical)
    );
    expect(analyzeActivityThreeDimensionalStrain(sourceAlias).summary).toMatchObject({
      activityType: ActivityTypes.Cycling,
      activityGroup: ActivityTypeGroups.CyclingGroup
    });
  });

  it('replaces readable v1 evidence with v2 on reparse', () => {
    const activity = createActivity();
    const current = analyzeActivityThreeDimensionalStrain(activity).summary!;
    const { activityType: _activityType, activityGroup: _activityGroup, ...core } = current;
    const legacy: ThreeDimensionalStrainEvidenceValueV1 = {
      ...core,
      protocolVersion: THREE_DIMENSIONAL_STRAIN_LEGACY_PROTOCOL_VERSION,
      sourceFingerprint: 'three-dimensional-strain-v1:0000000000000000',
      discipline: 'cycling'
    };
    activity.addStat(new DataThreeDimensionalStrainEvidence(legacy));

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(
      activity.getStat<ThreeDimensionalStrainEvidenceValue>(DataThreeDimensionalStrainEvidence.type)?.getValue()
    ).toMatchObject({
      protocolVersion: THREE_DIMENSIONAL_STRAIN_PROTOCOL_VERSION,
      activityType: ActivityTypes.Cycling,
      activityGroup: ActivityTypeGroups.CyclingGroup,
      sourceFingerprint: expect.stringMatching(/^three-dimensional-strain-v2:[0-9a-f]{16}$/)
    });
  });

  it('does not promote compact evidence into event summary stats', () => {
    const activity = createActivity();
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(activity.getStat(DataThreeDimensionalStrainEvidence.type)).toBeDefined();
    expect(
      ActivityUtilities.getSummaryStatsForActivities([activity]).some(
        stat => stat.getType() === DataThreeDimensionalStrainEvidence.type
      )
    ).toBe(false);
  });

  it.each(canonicalActivityTypes)(
    'evaluates canonical activity type %s when it has valid power input',
    activityType => {
      const summary = analyzeActivityThreeDimensionalStrain(createActivity(Array(120).fill(200), activityType)).summary;

      expect(summary).toMatchObject({
        protocolVersion: THREE_DIMENSIONAL_STRAIN_PROTOCOL_VERSION,
        activityType,
        activityGroup: ActivityTypesHelper.getActivityGroupForActivityType(activityType),
        eligibility: { eligible: true, reason: 'eligible' }
      });
    }
  );

  it('generates a power curve and persists v2 evidence through the parsing pipeline for rowing', () => {
    const activity = new Activity(new Date(0), new Date(3_600_000), ActivityTypes.Rowing, new Creator('Test'));
    activity.addStream(activity.createStream(DataPower.type).setData(Array(3_600).fill(200)));

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(activity.getStat(DataPowerCurve.type)).toBeDefined();
    expect(
      activity.getStat<ThreeDimensionalStrainEvidenceValue>(DataThreeDimensionalStrainEvidence.type)?.getValue()
    ).toMatchObject({
      protocolVersion: THREE_DIMENSIONAL_STRAIN_PROTOCOL_VERSION,
      activityType: ActivityTypes.Rowing,
      activityGroup: ActivityTypeGroups.WaterSportsGroup
    });
  });

  it('does not persist evidence for activity types with neither recorded power nor a power curve', () => {
    const activity = new Activity(new Date(0), new Date(3_600_000), ActivityTypes.Rowing, new Creator('Test'));

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(activity.getStat(DataThreeDimensionalStrainEvidence.type)).toBeUndefined();
  });

  it('keeps a day-long parsing pipeline result finite and compact', () => {
    const power = Array.from({ length: 86_400 }, (_value, index) => {
      const phase = index % 600;
      if (phase < 10) return 700;
      if (phase < 60) return 400;
      if (phase < 180) return 250;
      return 180;
    });
    const activity = createActivity(power);

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    const evidence = activity
      .getStat<ThreeDimensionalStrainEvidenceValue>(DataThreeDimensionalStrainEvidence.type)
      ?.getValue();
    expect(evidence).toMatchObject({
      eligibility: { eligible: true, reason: 'eligible' },
      input: { powerSampleCount: 86_400, validPowerSampleCount: 86_400, coverageRatio: 1 }
    });
    expect(evidence?.evidence && Object.values(evidence.evidence).every(Number.isFinite)).toBe(true);
    expect(JSON.stringify(evidence)).not.toContain('timeline');
  });
});
