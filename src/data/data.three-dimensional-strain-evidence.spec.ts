import { ActivityTypes, ActivityTypesHelper } from '../activities/activity.types';
import {
  DataThreeDimensionalStrainEvidence,
  THREE_DIMENSIONAL_STRAIN_LEGACY_PROTOCOL_VERSION,
  THREE_DIMENSIONAL_STRAIN_PROTOCOL_VERSION,
  normalizeThreeDimensionalStrainEvidenceValue,
  type ThreeDimensionalStrainEvidenceValueV1,
  type ThreeDimensionalStrainEvidenceValueV2
} from './data.three-dimensional-strain-evidence';

function createCurrentEvidence(): ThreeDimensionalStrainEvidenceValueV2 {
  return {
    protocolVersion: THREE_DIMENSIONAL_STRAIN_PROTOCOL_VERSION,
    sourceFingerprint: 'three-dimensional-strain-v2:0000000000000000',
    activityType: ActivityTypes.Cycling,
    activityGroup: ActivityTypesHelper.getActivityGroupForActivityType(ActivityTypes.Cycling),
    eligibility: { eligible: true, reason: 'eligible' },
    input: {
      powerSampleCount: 100,
      validPowerSampleCount: 100,
      candidateDurationSeconds: 100,
      recordedDurationSeconds: 100,
      coverageRatio: 1,
      curvePointCount: 8,
      hasShortDuration: true,
      hasMediumDuration: true,
      hasLongDuration: true
    },
    fit: {
      criticalPowerWatts: 280,
      wPrimeJoules: 18_000,
      maximumPowerWatts: 1_000,
      sampleCount: 8,
      rmseWatts: 4,
      normalizedRmse: 0.01,
      rSquared: 0.99,
      iterations: 50,
      converged: true
    },
    evidence: {
      total: 10,
      criticalPower: 6,
      wPrime: 3,
      maximumPower: 1,
      endingWPrimeBalanceJoules: 17_000,
      minimumWPrimeBalanceJoules: 16_000
    }
  };
}

describe('DataThreeDimensionalStrainEvidence legacy compatibility', () => {
  it('retains readable v2 evidence while dropping unknown source data', () => {
    const current = createCurrentEvidence();
    const stat = new DataThreeDimensionalStrainEvidence({
      ...current,
      timeline: [{ power: 900 }]
    });

    expect(stat.getValue()).toEqual(current);
    expect(stat.toJSON()).toEqual({ [DataThreeDimensionalStrainEvidence.type]: current });
  });

  it('retains readable v1 evidence', () => {
    const { activityType: _activityType, activityGroup: _activityGroup, ...core } = createCurrentEvidence();
    const legacy: ThreeDimensionalStrainEvidenceValueV1 = {
      ...core,
      protocolVersion: THREE_DIMENSIONAL_STRAIN_LEGACY_PROTOCOL_VERSION,
      sourceFingerprint: 'three-dimensional-strain-v1:0000000000000000',
      discipline: 'cycling'
    };

    expect(normalizeThreeDimensionalStrainEvidenceValue(legacy)).toEqual(legacy);
  });

  it.each([
    {
      name: 'unknown protocol',
      mutate: (value: Record<string, unknown>) => ({ ...value, protocolVersion: 99 })
    },
    {
      name: 'inconsistent eligibility',
      mutate: (value: Record<string, unknown>) => ({
        ...value,
        eligibility: { eligible: false, reason: 'eligible' }
      })
    },
    {
      name: 'component total mismatch',
      mutate: (value: Record<string, unknown>) => ({
        ...value,
        evidence: {
          ...(value.evidence as Record<string, unknown>),
          total: ((value.evidence as Record<string, number>).total || 0) + 1
        }
      })
    },
    {
      name: 'non-finite fit value',
      mutate: (value: Record<string, unknown>) => ({
        ...value,
        fit: { ...(value.fit as Record<string, unknown>), criticalPowerWatts: Number.NaN }
      })
    }
  ])('rejects $name without weakening historical validation', ({ mutate }) => {
    const invalid = mutate(createCurrentEvidence() as unknown as Record<string, unknown>);

    expect(normalizeThreeDimensionalStrainEvidenceValue(invalid)).toBeNull();
    expect(() => new DataThreeDimensionalStrainEvidence(invalid)).toThrow(
      'Invalid three dimensional strain evidence value'
    );
  });
});
