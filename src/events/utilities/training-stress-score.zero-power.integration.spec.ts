import { FitBaseType, FitEncoder } from 'fit-file-parser/encoder';
import { EventImporterFIT } from '../adapters/importers/fit/importer.fit';
import { ActivityParsingOptions } from '../../activities/activity-parsing-options';
import { ActivityUtilities } from './activity.utilities';
import { DataPower } from '../../data/data.power';
import { DataPowerNormalized } from '../../data/data.power-normalized';
import { DataPowerIntensityFactor } from '../../data/data.power-intensity-factor';
import { DataTrainingStressScore } from '../../data/data.training-stress-score';
import { DataTrainingStressScoreMethod } from '../../data/data.training-stress-score-method';

const field = (number: number, value: number, baseType = FitBaseType.Uint8) => ({
  number,
  value,
  baseType,
  size: baseType === FitBaseType.Uint32 ? 4 : baseType === FitBaseType.Uint16 ? 2 : 1
});
type Coverage = 'complete' | 'thirty' | 'short' | 'gappy' | 'missing' | 'paused';
async function ride(
  options: {
    coverage?: Coverage;
    hr?: boolean;
    ftp?: boolean;
    summaryNP?: number;
    imported?: number;
    sport?: number;
  } = {}
) {
  const coverage = options.coverage ?? 'complete';
  const encoder = new FitEncoder(),
    start = FitEncoder.toFitTimestamp(new Date('2026-01-01T10:00:00Z'));
  encoder.writeMessage(0, [
    field(0, 4, FitBaseType.Enum),
    field(1, 1, FitBaseType.Uint16),
    field(4, start, FitBaseType.Uint32)
  ]);
  encoder.writeMessage(3, [field(4, 700, FitBaseType.Uint16)], 4);
  for (let second = 0; second <= 3600; second++) {
    const hasPower =
      coverage === 'complete' ||
      (coverage === 'thirty' && second < 30) ||
      (coverage === 'short' && second < 29) ||
      (coverage === 'gappy' && second % 2 === 0) ||
      (coverage === 'paused' && second > 1200 && second < 2400);
    encoder.writeMessage(
      20,
      [
        field(253, start + second, FitBaseType.Uint32),
        ...(hasPower ? [field(7, 0, FitBaseType.Uint16)] : []),
        ...(options.hr ? [field(3, 165)] : [])
      ],
      1
    );
  }
  if (coverage === 'paused')
    for (const [second, type] of [
      [0, 0],
      [1200, 1],
      [2400, 0],
      [3600, 4]
    ]) {
      encoder.writeMessage(
        21,
        [
          field(253, start + second, FitBaseType.Uint32),
          field(0, 0, FitBaseType.Enum),
          field(1, type, FitBaseType.Enum)
        ],
        5
      );
    }
  encoder.writeMessage(
    18,
    [
      field(254, 0, FitBaseType.Uint16),
      field(253, start + 3600, FitBaseType.Uint32),
      field(2, start, FitBaseType.Uint32),
      field(5, options.sport ?? 2, FitBaseType.Enum),
      field(7, 3600000, FitBaseType.Uint32),
      field(8, coverage === 'paused' ? 2400000 : 3600000, FitBaseType.Uint32),
      ...(options.ftp === false ? [] : [field(45, 250, FitBaseType.Uint16)]),
      ...(options.summaryNP === undefined ? [] : [field(34, options.summaryNP, FitBaseType.Uint16)]),
      ...(options.imported === undefined ? [] : [field(35, options.imported * 10, FitBaseType.Uint16)]),
      field(11, 210, FitBaseType.Uint16)
    ],
    2
  );
  if (options.hr)
    encoder.writeMessage(
      216,
      [
        field(0, 18, FitBaseType.Uint16),
        field(1, 0, FitBaseType.Uint16),
        field(11, 190),
        field(12, 55),
        field(13, 165)
      ],
      3
    );
  const bytes = encoder.close();
  return (
    await EventImporterFIT.getFromArrayBuffer(
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
      new ActivityParsingOptions({ generateUnitStreams: false })
    )
  ).getFirstActivity();
}

const evaluate = (activity: Awaited<ReturnType<typeof ride>>) =>
  ActivityUtilities.getTrainingStressScoreEvaluations(activity);

describe('zero power TSS with recorded evidence', () => {
  it.each([true, false])('keeps complete recorded zero power ahead of automatic HR/MET (HR=%s)', async hr => {
    const activity = await ride({ hr });
    for (let repeat = 0; repeat < 2; repeat++) {
      expect(evaluate(activity).automatic).toMatchObject({ method: 'POWER', score: 0, provenance: 'calculated' });
      expect(activity.getStat(DataTrainingStressScore.type)?.getValue()).toBe(0);
      expect(activity.getStat(DataPowerNormalized.type)?.getValue()).toBe(0);
      expect(activity.getStat(DataPowerIntensityFactor.type)?.getValue()).toBe(0);
      expect(evaluate(activity).met).toMatchObject({ method: 'MET', score: 9 });
      if (hr) expect(evaluate(activity).hr).toMatchObject({ method: 'HR', score: 100 });
      activity.removeStat(DataPowerNormalized.type);
      activity.removeStat(DataPowerIntensityFactor.type);
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    }
  });

  it('does not extrapolate a 30-second zero window to the full hour', async () => {
    const activity = await ride({ coverage: 'thirty', hr: true });
    expect(activity.getStat(DataPowerNormalized.type)?.getValue()).toBe(0);
    expect(evaluate(activity).automatic).toMatchObject({ method: 'HR', score: 100 });
  });

  it.each(['short', 'gappy', 'missing', 'paused'] as const)(
    'does not turn a zero NP summary with %s power evidence into a valid zero load',
    async coverage => {
      const activity = await ride({ coverage, summaryNP: 0, hr: true });
      for (let repeat = 0; repeat < 2; repeat++) {
        expect(evaluate(activity).automatic).toMatchObject({
          method: 'HR',
          score: coverage === 'paused' ? 66.7 : 100,
          reasons: expect.arrayContaining(['missing-power-inputs'])
        });
        activity.removeStat(DataPowerNormalized.type);
        ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
      }
    }
  );

  it('requires independent FTP even with complete zero power', async () => {
    expect(evaluate(await ride({ ftp: false, hr: true })).automatic).toMatchObject({ method: 'HR', score: 100 });
  });

  it('prioritizes walking power with complete zero power evidence and independent FTP', async () => {
    expect(evaluate(await ride({ sport: 11, hr: true })).automatic).toMatchObject({ method: 'POWER', score: 0 });
  });

  it.each([0, 42.5])('preserves an imported score of %s across repeated generation', async imported => {
    const activity = await ride({ hr: true, imported });
    for (let repeat = 0; repeat < 2; repeat++) {
      for (const preference of ['automatic', 'hr', 'met'] as const) {
        expect(evaluate(activity)[preference]).toMatchObject({
          method: 'IMPORTED',
          score: imported,
          provenance: 'imported'
        });
      }
      activity.removeStat(DataPowerNormalized.type);
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    }
  });

  it('removes a stale calculated zero when its power evidence disappears', async () => {
    const activity = await ride({ hr: true });
    activity.addStat(new DataTrainingStressScore(0));
    activity.addStat(new DataTrainingStressScoreMethod('POWER'));
    activity.removeStream(DataPower.type);
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    expect(evaluate(activity).automatic).toMatchObject({ method: 'HR', score: 100, provenance: 'calculated' });
  });

  it('preserves a positive device NP until explicit regeneration removes it', async () => {
    const activity = await ride({ summaryNP: 200 });
    expect(evaluate(activity).automatic).toMatchObject({ method: 'POWER', score: 64 });
    activity.removeStat(DataPowerNormalized.type);
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    expect(evaluate(activity).automatic).toMatchObject({ method: 'POWER', score: 0 });
  });
});
