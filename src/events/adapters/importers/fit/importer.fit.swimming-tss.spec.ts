import { FitBaseType, FitEncoder } from 'fit-file-parser/encoder';
import { EventImporterFIT } from './importer.fit';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { ActivityTypes } from '../../../../activities/activity.types';
import { DataTrainingStressScore } from '../../../../data/data.training-stress-score';
import { DataTrainingStressScoreMethod } from '../../../../data/data.training-stress-score-method';

const field = (number: number, value: number, baseType = FitBaseType.Uint8) => ({ number, value, baseType,
  size: baseType === FitBaseType.Uint32 ? 4 : baseType === FitBaseType.Uint16 ? 2 : 1 });

async function swim(subsport: number, options: { calibrated?: boolean; rest?: number; samples?: boolean;
  met?: boolean; weight?: boolean; calories?: boolean; imported?: number; heuristics?: boolean; zeroGlobal?: boolean; globalConflicts?: boolean } = {}) {
  const encoder = new FitEncoder();
  const start = FitEncoder.toFitTimestamp(new Date('2026-01-01T10:00:00Z'));
  encoder.writeMessage(0, [field(0, 4, FitBaseType.Enum), field(1, 1, FitBaseType.Uint16), field(4, start, FitBaseType.Uint32)]);
  if (options.met && options.weight !== false) encoder.writeMessage(3, [field(4, 700, FitBaseType.Uint16)], 4);
  if (options.zeroGlobal) encoder.writeMessage(7, [field(2, 0)], 5);
  if (options.globalConflicts) for (const threshold of [0, 140, 145, 150, 160, 170, 180]) {
    encoder.writeMessage(7, [field(2, threshold)], 5);
  }
  for (let second = 0; second <= 3600; second++) encoder.writeMessage(20, [field(253, start + second, FitBaseType.Uint32),
    field(6, 1000, FitBaseType.Uint16), ...(options.samples === false ? [] : [field(3, second < 1830 ? 78 : second < 3600 ? 86 : 100)])], 1);
  encoder.writeMessage(18, [field(254, 0, FitBaseType.Uint16), field(253, start + 3600, FitBaseType.Uint32),
    field(2, start, FitBaseType.Uint32), field(5, 5, FitBaseType.Enum), field(6, subsport, FitBaseType.Enum),
    field(7, 3600000, FitBaseType.Uint32), field(8, 3600000, FitBaseType.Uint32), field(9, 360000, FitBaseType.Uint32),
    field(14, 1000, FitBaseType.Uint16), ...(options.met && options.calories !== false ? [field(11, 210, FitBaseType.Uint16)] : []),
    ...(options.imported === undefined ? [] : [field(35, Math.round(options.imported * 10), FitBaseType.Uint16)])], 2);
  if (options.calibrated) encoder.writeMessage(216, [field(0, 18, FitBaseType.Uint16), field(1, 0, FitBaseType.Uint16),
    field(11, 190), field(12, options.rest ?? 55), field(13, 165)], 3);
  const bytes = encoder.close();
  const event = await EventImporterFIT.getFromArrayBuffer(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
    new ActivityParsingOptions({ generateUnitStreams: false, tss: { enableHeuristicFallbacks: options.heuristics } }));
  const activity = event.getFirstActivity();
  expect(activity.type).toBe(subsport === 17 ? ActivityTypes.Swimming : ActivityTypes.OpenWaterSwimming);
  return activity;
}

describe.each([17, 18])('FIT swimming TSS (subsport %s)', subsport => {
  it.each([undefined, true, false])('never assumes average speed is threshold (heuristics=%s)', async heuristics => {
    const activity = await swim(subsport, { heuristics });
    const result = ActivityUtilities.getTrainingStressScoreEvaluations(activity);
    for (const preference of ['automatic', 'hr', 'met'] as const) {
      expect(result[preference].score).toBeNull();
      expect(result[preference].reasons).toContain('missing-swim-threshold');
    }
    expect(activity.getStat(DataTrainingStressScore.type)).toBeUndefined();
  });

  it('uses valid session HR despite a zero generic threshold, retaining preferred MET', async () => {
    const activity = await swim(subsport, { calibrated: true, zeroGlobal: true, met: true });
    const result = ActivityUtilities.getTrainingStressScoreEvaluations(activity);
    expect(result.automatic).toMatchObject({ score: 7.6, method: 'HR', estimated: false });
    expect(result.hr).toMatchObject({ score: 7.6, method: 'HR' });
    expect(result.met).toMatchObject({ score: 9, method: 'MET', estimated: true });
  });

  it('uses scoped HR despite conflicting global sport settings', async () => {
    const activity = await swim(subsport, { calibrated: true, globalConflicts: true, met: true });
    for (let repeat = 0; repeat < 2; repeat++) {
      expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic)
        .toMatchObject({ method: 'HR', score: 7.6 });
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    }
  });

  it.each([{ calibrated: false }, { calibrated: true, rest: 0 }, { calibrated: true, samples: false }])(
    'falls back to calorie MET when HR is unavailable: %j', async options => {
      const result = ActivityUtilities.getTrainingStressScoreEvaluations(await swim(subsport, { ...options, met: true }));
      expect(result.automatic).toMatchObject({ score: 9, method: 'MET', estimated: true });
      expect(result.automatic.reasons).toContain('missing-swim-threshold');
      expect(result.hr).toMatchObject({ score: 9, method: 'MET' });
    });

  it.each([{ weight: false }, { calories: false }])('leaves missing MET inputs unavailable: %j', async options => {
    const result = ActivityUtilities.getTrainingStressScoreEvaluations(await swim(subsport, { ...options, met: true }));
    expect(result.automatic.score).toBeNull();
    expect(result.automatic.reasons).toContain('missing-met-inputs');
  });

  it.each([0, 42.5])('preserves native TSS %s for every preference and repeated recalculation', async imported => {
    const activity = await swim(subsport, { imported, calibrated: true, zeroGlobal: true, met: true });
    for (let repeat = 0; repeat < 2; repeat++) {
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
      const result = ActivityUtilities.getTrainingStressScoreEvaluations(activity);
      for (const preference of ['automatic', 'hr', 'met'] as const) expect(result[preference]).toMatchObject({
        score: imported, method: 'IMPORTED', provenance: 'imported', reasons: ['imported-score'] });
      expect(activity.getStat(DataTrainingStressScore.type)?.getValue()).toBe(imported);
    }
  });

  it.each([false, true])('replaces stale calculated scores, including zero (MET=%s)', async met => {
    const activity = await swim(subsport, { met });
    for (const stale of [0, 100]) {
      activity.addStat(new DataTrainingStressScore(stale));
      activity.addStat(new DataTrainingStressScoreMethod('SWIM_PACE'));
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
      expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic).toMatchObject({
        score: met ? 9 : null, method: met ? 'MET' : null, provenance: met ? 'calculated' : null });
      expect(activity.getStat(DataTrainingStressScore.type)?.getValue() ?? null).toBe(met ? 9 : null);
      expect(activity.getStat(DataTrainingStressScoreMethod.type)?.getValue() ?? null).toBe(met ? 'MET' : null);
    }
  });
});
