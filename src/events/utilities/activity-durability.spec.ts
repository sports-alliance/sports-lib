import { ActivityInterface } from '../../activities/activity.interface';
import { Activity } from '../../activities/activity';
import { ActivityTypes } from '../../activities/activity.types';
import { DataDuration } from '../../data/data.duration';
import {
  DataDurabilityEvidence,
  type DurabilityEvidenceValue,
  normalizeDurabilityEvidenceValue
} from '../../data/data.durability-evidence';
import { DataGrade } from '../../data/data.grade';
import { DataGradeAdjustedSpeed } from '../../data/data.grade-adjusted-speed';
import { DataHeartRate } from '../../data/data.heart-rate';
import { DataHeartRateZoneFiveDuration } from '../../data/data.heart-rate-zone-five-duration';
import { DataHeartRateZoneFourDuration } from '../../data/data.heart-rate-zone-four-duration';
import { DataHeartRateZoneOneDuration } from '../../data/data.heart-rate-zone-one-duration';
import { DataPower } from '../../data/data.power';
import { DataSpeed } from '../../data/data.speed';
import { Creator } from '../../creators/creator';
import { SwimLengthInterface } from '../../swim-lengths/swim-length.interface';
import {
  analyzeActivityDurability,
  calculateActivityDurabilitySourceFingerprint,
  calculateAerobicEfficiency
} from './activity-durability';
import { ActivityUtilities } from './activity.utilities';

function mockActivity(options: {
  type: ActivityTypes;
  durationSeconds?: number;
  streams?: Record<string, (number | null)[]>;
  stats?: Record<string, number>;
  swimLengths?: SwimLengthInterface[];
}): ActivityInterface {
  const durationSeconds = options.durationSeconds ?? 3600;
  return {
    type: options.type,
    startDate: new Date(0),
    endDate: new Date(durationSeconds * 1000),
    getDuration: () => new DataDuration(durationSeconds),
    getStreamData: (type: string) => options.streams?.[type] || [],
    getStat: (type: string) => {
      const value = options.stats?.[type];
      return value === undefined ? undefined : ({ getValue: () => value } as any);
    },
    getSwimLengths: () => options.swimLengths || []
  } as unknown as ActivityInterface;
}

function swimLength(
  index: number,
  paceSecondsPer100m: number,
  swolf: number,
  stroke = 'freestyle'
): SwimLengthInterface {
  const speed = 100 / paceSecondsPer100m;
  return {
    index,
    type: 'active',
    stroke,
    poolLength: { getValue: () => 25 } as any,
    distance: { getValue: () => 25 } as any,
    timerTime: { getValue: () => 25 / speed } as any,
    elapsedTime: { getValue: () => 25 / speed } as any,
    avgSpeed: { getValue: () => speed } as any,
    swolf
  } as unknown as SwimLengthInterface;
}

describe('activity durability', () => {
  it('calculates aerobic efficiency defensively', () => {
    expect(calculateAerobicEfficiency(240, 150)).toBe(1.6);
    expect(calculateAerobicEfficiency(0, 150)).toBeNull();
    expect(calculateAerobicEfficiency(240, null)).toBeNull();
  });

  it('builds an eligible cycling timeline and compact early/late evidence', () => {
    const power = Array.from({ length: 3600 }, (_, index) => (index < 1800 ? 210 : 195));
    const heartRate = Array.from({ length: 3600 }, (_, index) => (index < 1800 ? 135 : 145));
    const result = analyzeActivityDurability(
      mockActivity({
        type: ActivityTypes.Cycling,
        streams: {
          [DataPower.type]: power,
          [DataHeartRate.type]: heartRate
        }
      })
    );

    expect(result.timeline).toHaveLength(3600);
    expect(result.summary?.discipline).toBe('cycling');
    expect(result.summary?.eligibility).toMatchObject({ eligible: true, reason: 'eligible' });
    expect(result.summary?.eligibility).toMatchObject({
      comparisonSegments: 'halves',
      earlySampleCount: 1350,
      lateSampleCount: 1350
    });
    expect(result.summary?.evidence).toMatchObject({
      kind: 'aerobic-efficiency',
      outputRetentionPercent: expect.any(Number),
      heartRateDriftBpm: expect.any(Number)
    });
    expect(
      result.summary?.evidence && 'decouplingPercent' in result.summary.evidence
        ? result.summary.evidence.decouplingPercent
        : null
    ).toBeGreaterThan(0);
    expect(JSON.stringify(result.summary)).not.toContain('timeline');
  });

  it('requires coverage in both fixed time halves instead of splitting available samples by count', () => {
    const power = Array<number | null>(3600).fill(200);
    const heartRate = Array<number | null>(3600).fill(140);
    power.fill(null, 600, 1500);
    heartRate.fill(null, 600, 1500);

    const result = analyzeActivityDurability(
      mockActivity({
        type: ActivityTypes.Cycling,
        streams: { [DataPower.type]: power, [DataHeartRate.type]: heartRate }
      })
    );

    expect(result.summary?.coverageRatio).toBeCloseTo(2 / 3, 3);
    expect(result.summary?.eligibility).toMatchObject({
      eligible: false,
      reason: 'insufficient-halves',
      earlySampleCount: 450,
      lateSampleCount: 1350
    });
  });

  it('uses grade-adjusted speed for running and rejects hard-zone-heavy evidence', () => {
    const output = Array(3600).fill(3.5);
    const heartRate = Array(3600).fill(145);
    const result = analyzeActivityDurability(
      mockActivity({
        type: ActivityTypes.Running,
        streams: {
          [DataGradeAdjustedSpeed.type]: output,
          [DataHeartRate.type]: heartRate
        },
        stats: {
          [DataHeartRateZoneOneDuration.type]: 600,
          [DataHeartRateZoneFiveDuration.type]: 600
        }
      })
    );

    expect(result.summary?.outputSource).toBe('grade-adjusted-speed');
    expect(result.summary?.eligibility).toMatchObject({ eligible: false, reason: 'too-intense' });
  });

  it('treats Zone 4 as hard while allowing the exact configured boundary', () => {
    const streams = {
      [DataGradeAdjustedSpeed.type]: Array(3600).fill(3.5),
      [DataHeartRate.type]: Array(3600).fill(145)
    };
    const boundary = analyzeActivityDurability(
      mockActivity({
        type: ActivityTypes.Running,
        streams,
        stats: {
          [DataHeartRateZoneOneDuration.type]: 1200,
          [DataHeartRateZoneFourDuration.type]: 300
        }
      })
    );
    const overBoundary = analyzeActivityDurability(
      mockActivity({
        type: ActivityTypes.Running,
        streams,
        stats: {
          [DataHeartRateZoneOneDuration.type]: 1200,
          [DataHeartRateZoneFourDuration.type]: 301
        }
      })
    );

    expect(boundary.summary?.eligibility).toMatchObject({ eligible: true, reason: 'eligible' });
    expect(overBoundary.summary?.eligibility).toMatchObject({ eligible: false, reason: 'too-intense' });
  });

  it('falls back from sparse GAP to complete raw speed only when grade context is sufficiently covered', () => {
    const partialGap = Array<number | null>(3600).fill(null);
    partialGap.fill(3.5, 1000, 1100);
    const baseStreams = {
      [DataGradeAdjustedSpeed.type]: partialGap,
      [DataSpeed.type]: Array(3600).fill(3.4),
      [DataHeartRate.type]: Array(3600).fill(140)
    };
    const safe = analyzeActivityDurability(
      mockActivity({
        type: ActivityTypes.Running,
        streams: { ...baseStreams, [DataGrade.type]: Array(3600).fill(0) }
      })
    );
    const sparseGrades = Array<number | null>(3600).fill(null);
    sparseGrades[1000] = 0;
    const unsafe = analyzeActivityDurability(
      mockActivity({
        type: ActivityTypes.Running,
        streams: { ...baseStreams, [DataGrade.type]: sparseGrades }
      })
    );

    expect(safe.summary).toMatchObject({ outputSource: 'speed', eligibility: { eligible: true } });
    expect(unsafe.summary).toMatchObject({
      outputSource: 'grade-adjusted-speed',
      eligibility: { eligible: false, reason: 'unsupported-context' }
    });
  });

  it.each([
    [ActivityTypes.MountainBiking, 'cycling', DataPower.type],
    [ActivityTypes.TrailRunning, 'running', DataGradeAdjustedSpeed.type],
    [ActivityTypes.OpenWaterSwimming, 'open-water-swimming', DataSpeed.type]
  ])('groups %s into %s durability', (type, discipline, outputType) => {
    const result = analyzeActivityDurability(
      mockActivity({
        type: type as ActivityTypes,
        streams: {
          [outputType]: Array(3600).fill(outputType === DataPower.type ? 200 : 3),
          [DataHeartRate.type]: Array(3600).fill(140)
        }
      })
    );
    expect(result.summary).toMatchObject({ discipline, eligibility: { eligible: true } });
  });

  it('keeps unsupported activities out of the persisted metric', () => {
    const result = analyzeActivityDurability(
      mockActivity({
        type: ActivityTypes.WeightTraining,
        streams: {
          [DataPower.type]: Array(3600).fill(200),
          [DataHeartRate.type]: Array(3600).fill(130)
        }
      })
    );
    expect(result).toEqual({ timeline: [], summary: null });
  });

  it('compares like-for-like active pool lengths', () => {
    const lengths = Array.from({ length: 72 }, (_, index) =>
      swimLength(index, index < 24 ? 100 : index >= 48 ? 110 : 105, index < 24 ? 35 : index >= 48 ? 39 : 37)
    );
    const result = analyzeActivityDurability(
      mockActivity({
        type: ActivityTypes.Swimming,
        durationSeconds: 2700,
        streams: { [DataSpeed.type]: [] },
        swimLengths: lengths
      })
    );

    expect(result.timeline).toEqual([]);
    expect(result.summary?.eligibility).toMatchObject({ eligible: true, reason: 'eligible' });
    expect(result.summary?.evidence).toMatchObject({
      kind: 'pool-consistency',
      poolLengthMeters: 25,
      stroke: 'freestyle',
      comparableLengthCount: 72,
      paceRetentionPercent: 90.909,
      swolfChange: 4
    });
    expect(result.summary?.eligibility).toMatchObject({
      comparisonSegments: 'outer-thirds',
      earlySampleCount: 24,
      lateSampleCount: 24
    });
  });

  it('keeps short, mixed-context, low-coverage, and hard pool sessions explicit', () => {
    const short = analyzeActivityDurability(
      mockActivity({
        type: ActivityTypes.Swimming,
        durationSeconds: 2700,
        swimLengths: Array.from({ length: 24 }, (_, index) => swimLength(index, 100, 35))
      })
    );
    const mixed = analyzeActivityDurability(
      mockActivity({
        type: ActivityTypes.Swimming,
        durationSeconds: 2700,
        swimLengths: Array.from({ length: 72 }, (_, index) => swimLength(index, 100, 35, 'mixed'))
      })
    );
    const valid = Array.from({ length: 72 }, (_, index) => swimLength(index, 100, 0));
    const missingContextRows = Array.from(
      { length: 72 },
      (_, index) =>
        ({
          ...swimLength(index + 72, 100, 0),
          poolLength: { getValue: () => null },
          distance: { getValue: () => null }
        }) as unknown as SwimLengthInterface
    );
    const lowCoverage = analyzeActivityDurability(
      mockActivity({
        type: ActivityTypes.Swimming,
        durationSeconds: 3600,
        swimLengths: [...valid, ...missingContextRows]
      })
    );
    const hard = analyzeActivityDurability(
      mockActivity({
        type: ActivityTypes.Swimming,
        durationSeconds: 2700,
        swimLengths: valid,
        stats: {
          [DataHeartRateZoneOneDuration.type]: 1000,
          [DataHeartRateZoneFourDuration.type]: 500
        }
      })
    );

    expect(short.summary?.eligibility.reason).toBe('insufficient-coverage');
    expect(mixed.summary?.eligibility.reason).toBe('unsupported-context');
    expect(lowCoverage.summary).toMatchObject({
      coverageRatio: 0.5,
      eligibility: { reason: 'insufficient-coverage' }
    });
    expect(hard.summary?.eligibility.reason).toBe('too-intense');
    expect(
      (
        analyzeActivityDurability(
          mockActivity({
            type: ActivityTypes.Swimming,
            durationSeconds: 2700,
            swimLengths: valid
          })
        ).summary?.evidence as any
      )?.swolfChange
    ).toBeNull();
  });

  it('supports a summary-only path without allocating a display timeline', () => {
    const result = analyzeActivityDurability(
      mockActivity({
        type: ActivityTypes.Cycling,
        streams: {
          [DataPower.type]: Array(3600).fill(200),
          [DataHeartRate.type]: Array(3600).fill(140)
        }
      }),
      { includeTimeline: false }
    );
    expect(result.timeline).toEqual([]);
    expect(result.summary?.eligibility.eligible).toBe(true);
  });

  it('canonicalizes compact evidence and strips unknown timeline fields', () => {
    const result = analyzeActivityDurability(
      mockActivity({
        type: ActivityTypes.Cycling,
        streams: {
          [DataPower.type]: Array(3600).fill(200),
          [DataHeartRate.type]: Array(3600).fill(140)
        }
      }),
      { includeTimeline: false }
    );
    const stat = new DataDurabilityEvidence({ ...result.summary, timeline: [{ output: 999 }] });
    expect(JSON.stringify(stat.toJSON())).not.toContain('timeline');
    stat.setValue({ ...stat.getDurabilityValue(), timeline: [{ output: 999 }] } as DurabilityEvidenceValue);
    expect(JSON.stringify(stat.toJSON())).not.toContain('timeline');
  });

  it('round-trips analyzer output while rejecting impossible eligible and inconsistent arithmetic', () => {
    const result = analyzeActivityDurability(
      mockActivity({
        type: ActivityTypes.Cycling,
        streams: {
          [DataPower.type]: Array(3600).fill(200),
          [DataHeartRate.type]: Array(3600).fill(140)
        }
      }),
      { includeTimeline: false }
    );
    const summary = result.summary!;
    expect(normalizeDurabilityEvidenceValue(summary)).toEqual(summary);
    expect(
      normalizeDurabilityEvidenceValue({
        ...summary,
        qualifyingDurationSeconds: 0,
        coverageRatio: 0,
        eligibility: {
          ...summary.eligibility,
          validSampleCount: 0,
          earlySampleCount: 0,
          lateSampleCount: 0
        }
      })
    ).toBeNull();
    expect(
      normalizeDurabilityEvidenceValue({
        ...summary,
        evidence:
          summary.evidence?.kind === 'aerobic-efficiency'
            ? { ...summary.evidence, outputRetentionPercent: summary.evidence.outputRetentionPercent + 1 }
            : summary.evidence
      })
    ).toBeNull();
  });

  it('keeps low-speed aerobic evidence canonical after compact rounding', () => {
    const result = analyzeActivityDurability(
      mockActivity({
        type: ActivityTypes.OpenWaterSwimming,
        streams: {
          [DataSpeed.type]: Array.from({ length: 3600 }, (_, index) =>
            index < 1800 ? 0.7841418666152612 : 0.7315227118907159
          ),
          [DataHeartRate.type]: Array.from({ length: 3600 }, (_, index) =>
            index < 1800 ? 126.27571303159694 : 129.2996705923337
          )
        }
      }),
      { includeTimeline: false }
    );

    expect(result.summary).toMatchObject({
      discipline: 'open-water-swimming',
      eligibility: { eligible: true, reason: 'eligible' }
    });
    expect(normalizeDurabilityEvidenceValue(result.summary)).toEqual(result.summary);
    expect(() => new DataDurabilityEvidence(result.summary)).not.toThrow();
  });

  it('fingerprints protocol inputs deterministically and changes when source evidence changes', () => {
    const streams = {
      [DataPower.type]: Array(3600).fill(200),
      [DataHeartRate.type]: Array(3600).fill(140)
    };
    const stats = { [DataHeartRateZoneOneDuration.type]: 1800 };
    const activity = mockActivity({ type: ActivityTypes.Cycling, streams, stats });
    const original = calculateActivityDurabilitySourceFingerprint(activity);

    expect(calculateActivityDurabilitySourceFingerprint(activity)).toBe(original);
    streams[DataPower.type][1800] = 201;
    expect(calculateActivityDurabilitySourceFingerprint(activity)).not.toBe(original);
    const changedStream = calculateActivityDurabilitySourceFingerprint(activity);
    stats[DataHeartRateZoneOneDuration.type] = 1799;
    expect(calculateActivityDurabilitySourceFingerprint(activity)).not.toBe(changedStream);

    const lengths = Array.from({ length: 24 }, (_, index) => swimLength(index, 100, 35));
    const pool = mockActivity({ type: ActivityTypes.Swimming, swimLengths: lengths });
    const originalPool = calculateActivityDurabilitySourceFingerprint(pool);
    lengths[0].swolf = 36;
    expect(calculateActivityDurabilitySourceFingerprint(pool)).not.toBe(originalPool);
  });

  it('reuses current evidence, regenerates stale evidence, and preserves compact summary-only data', () => {
    const start = new Date(0);
    const activity = new Activity(start, new Date(3600 * 1000), ActivityTypes.Cycling, new Creator('Test'));
    activity.addStream(activity.createStream(DataPower.type).setData(Array(3600).fill(200)));
    activity.addStream(activity.createStream(DataHeartRate.type).setData(Array(3600).fill(140)));
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    const original = activity.getStat(DataDurabilityEvidence.type);

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    expect(activity.getStat(DataDurabilityEvidence.type)).toBe(original);

    activity.replaceStreamData(DataPower.type, Array(3600).fill(205));
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    const regenerated = activity.getStat<DurabilityEvidenceValue>(DataDurabilityEvidence.type);
    expect(regenerated).not.toBe(original);
    expect(regenerated?.getValue().sourceFingerprint).toMatch(/^durability-v1:[0-9a-f]{16}$/);

    const compactSummary = regenerated!.getValue();
    const summaryOnly = new Activity(start, new Date(3600 * 1000), ActivityTypes.Cycling, new Creator('Test'));
    const compactStat = new DataDurabilityEvidence(compactSummary);
    summaryOnly.addStat(compactStat);
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(summaryOnly);
    expect(summaryOnly.getStat(DataDurabilityEvidence.type)).toBe(compactStat);
    expect(JSON.stringify(compactStat.toJSON())).not.toContain('timeline');
  });

  it('persists only the compact activity stat and does not promote it to an event summary', () => {
    const start = new Date(0);
    const activity = new Activity(start, new Date(3600 * 1000), ActivityTypes.Cycling, new Creator('Test'));
    activity.addStream(activity.createStream(DataPower.type).setData(Array(3600).fill(200)));
    activity.addStream(activity.createStream(DataHeartRate.type).setData(Array(3600).fill(140)));

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    const stat = activity.getStat(DataDurabilityEvidence.type) as unknown as DataDurabilityEvidence;
    expect(stat).toBeDefined();
    expect(stat.getDurabilityValue().protocolVersion).toBe(1);
    expect(JSON.stringify(stat.toJSON())).not.toContain('timeline');
    expect(
      ActivityUtilities.getSummaryStatsForActivities([activity]).some(
        summary => summary.getType() === DataDurabilityEvidence.type
      )
    ).toBe(false);

    const originalValue = stat.getDurabilityValue();
    (stat as any).value = { ...originalValue, timeline: [{ output: 999 }] };
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    expect(JSON.stringify(activity.getStat(DataDurabilityEvidence.type)?.toJSON())).not.toContain('timeline');

    const canonicalStat = activity.getStat(DataDurabilityEvidence.type) as any;
    canonicalStat.value = { ...canonicalStat.getValue(), protocolVersion: 0 };
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    expect((activity.getStat(DataDurabilityEvidence.type)?.getValue() as any).protocolVersion).toBe(1);
  });
});
