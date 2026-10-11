import { FitBaseType, FitEncoder } from 'fit-file-parser/encoder';
import { EventImporterFIT } from './importer.fit';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { DataTrainingStressScore } from '../../../../data/data.training-stress-score';
import { DataTrainingStressScoreMethod } from '../../../../data/data.training-stress-score-method';

const field = (number: number, value: number, baseType = FitBaseType.Uint8) => ({ number, value, baseType,
  size: baseType === FitBaseType.Uint32 ? 4 : baseType === FitBaseType.Uint16 ? 2 : 1 });

// Entirely synthetic: one elapsed hour, forty active minutes at threshold HR.
async function workout(options: { sport?: number; stopType?: number; imported?: number; noTimers?: boolean;
  readings?: 'continuous' | 'gap' | 'paused-only' } = {}) {
  const encoder = new FitEncoder(), start = FitEncoder.toFitTimestamp(new Date('2026-01-01T10:00:00Z'));
  encoder.writeMessage(0, [field(0, 4, FitBaseType.Enum), field(1, 1, FitBaseType.Uint16), field(4, start, FitBaseType.Uint32)]);
  encoder.writeMessage(3, [field(4, 700, FitBaseType.Uint16)], 5);
  for (let second = 0; second <= 3600; second++) {
    const paused = second > 1200 && second < 2400;
    if (options.readings === 'gap' && paused || options.readings === 'paused-only' && !paused) continue;
    encoder.writeMessage(20, [field(253, start + second, FitBaseType.Uint32), field(3, paused ? 190 : 165)], 1);
  }
  if (!options.noTimers) for (const [second, type] of [[0, 0], [1200, options.stopType ?? 4], [2400, 0], [3600, 4]]) {
    encoder.writeMessage(21, [field(253, start + second, FitBaseType.Uint32),
      field(0, 0, FitBaseType.Enum), field(1, type, FitBaseType.Enum)], 2);
  }
  encoder.writeMessage(18, [field(254, 0, FitBaseType.Uint16), field(253, start + 3600, FitBaseType.Uint32),
    field(2, start, FitBaseType.Uint32), field(5, options.sport ?? 2, FitBaseType.Enum),
    field(7, 3600000, FitBaseType.Uint32), field(8, 2400000, FitBaseType.Uint32), field(11, 210, FitBaseType.Uint16),
    ...(options.imported === undefined ? [] : [field(35, options.imported * 10, FitBaseType.Uint16)])], 3);
  encoder.writeMessage(216, [field(0, 18, FitBaseType.Uint16), field(1, 0, FitBaseType.Uint16),
    field(11, 190), field(12, 55), field(13, 165)], 4);
  const bytes = encoder.close();
  const event = await EventImporterFIT.getFromArrayBuffer(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
    new ActivityParsingOptions({ generateUnitStreams: false }));
  return event.getFirstActivity();
}

describe('FIT HR TSS timer pauses', () => {
  it.each([1, 4, 8, 9])('excludes a timer stop of type %s with continuous or gapped HR recording', async stopType => {
    for (const readings of ['continuous', 'gap'] as const) {
      const activity = await workout({ stopType, readings });
      for (let repeat = 0; repeat < 2; repeat++) {
        const evaluations = ActivityUtilities.getTrainingStressScoreEvaluations(activity);
        expect(evaluations.automatic).toMatchObject({ method: 'HR', score: 66.7 });
        expect(evaluations.hr).toMatchObject({ method: 'HR', score: 66.7 });
        expect(evaluations.met).toMatchObject({ method: 'MET', score: 13.5 });
        activity.addStat(new DataTrainingStressScore(100));
        activity.addStat(new DataTrainingStressScoreMethod('HR'));
        ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
        expect(activity.getStat(DataTrainingStressScore.type)?.getValue()).toBe(66.7);
      }
    }
  });

  it.each([1, 5, 11, 17])('applies the same pause handling outside cycling (FIT sport %s)', async sport => {
    const activity = await workout({ sport, readings: 'gap' });
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic)
      .toMatchObject({ method: 'HR', score: 66.7 });
  });

  it.each([0, 42.5])('preserves imported TSS %s for every preference despite pauses', async imported => {
    const activity = await workout({ imported });
    for (let repeat = 0; repeat < 2; repeat++) {
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
      const evaluations = ActivityUtilities.getTrainingStressScoreEvaluations(activity);
      for (const preference of ['automatic', 'hr', 'met'] as const) {
        expect(evaluations[preference]).toMatchObject({ method: 'IMPORTED', score: imported, provenance: 'imported' });
      }
    }
  });

  it('falls back to MET if all HR readings occur inside a pause', async () => {
    const activity = await workout({ readings: 'paused-only' });
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).hr)
      .toMatchObject({ method: 'MET', score: 13.5, reasons: expect.arrayContaining(['missing-hr-samples']) });
  });

  it('does not guess pause positions from timer duration or ordinary recording gaps', async () => {
    const activity = await workout({ noTimers: true, readings: 'gap' });
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).hr)
      .toMatchObject({ method: 'HR', score: 100 });
  });
});
