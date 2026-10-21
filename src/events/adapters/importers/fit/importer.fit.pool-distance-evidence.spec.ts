import { FitBaseType, FitEncoder } from 'fit-file-parser/encoder';
import { EventImporterFIT } from './importer.fit';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { DataDistance } from '../../../../data/data.distance';

const field = (number: number, value: number, baseType = FitBaseType.Uint8) => ({
  number,
  value,
  baseType,
  size: baseType === FitBaseType.Uint32 ? 4 : baseType === FitBaseType.Uint16 ? 2 : 1
});

async function pool(
  options: {
    counter?: 'complete' | 'partial' | 'reset' | 'invalid-end' | 'late-first' | 'early-end' | 'absent';
    laps?: 'cumulative' | 'consistent' | 'missing';
    geometry?:
      | 'complete'
      | 'duplicate-index'
      | 'overlap'
      | 'incomplete'
      | 'zero-timer'
      | 'fractional-start-overlap'
      | 'elapsed-only-overlap'
      | 'encoded-second-overlap';
    summary?: number | null;
    imported?: number;
  } = {}
) {
  const encoder = new FitEncoder();
  const start = FitEncoder.toFitTimestamp(new Date('2026-01-01T10:00:00Z'));
  encoder.writeMessage(0, [
    field(0, 4, FitBaseType.Enum),
    field(1, 23, FitBaseType.Uint16),
    field(4, start, FitBaseType.Uint32)
  ]);
  for (let index = 0; index < 4; index++) {
    const seconds = options.geometry === 'overlap' && index === 1 ? 15 : index * 30;
    const fractionalFirst =
      index === 0 &&
      ['fractional-start-overlap', 'elapsed-only-overlap', 'encoded-second-overlap'].includes(options.geometry ?? '');
    encoder.writeMessage(
      101,
      [
        field(254, options.geometry === 'duplicate-index' && index === 1 ? 0 : index, FitBaseType.Uint16),
        field(253, start + seconds + (fractionalFirst ? 31 : 30), FitBaseType.Uint32),
        ...(index === 0 && options.geometry === 'fractional-start-overlap'
          ? []
          : [field(2, start + seconds, FitBaseType.Uint32)]),
        field(3, fractionalFirst ? 30500 : 30000, FitBaseType.Uint32),
        ...(index === 0 && options.geometry === 'elapsed-only-overlap'
          ? []
          : [
              field(
                4,
                options.geometry === 'zero-timer' && index === 1
                  ? 0
                  : options.geometry === 'encoded-second-overlap' && index === 0
                    ? 30500
                    : 30000,
                FitBaseType.Uint32
              )
            ]),
        field(6, 833, FitBaseType.Uint16),
        field(12, 1, FitBaseType.Enum)
      ],
      1
    );
  }
  const counter = options.counter ?? 'complete';
  if (counter !== 'absent')
    for (let index = 0; index <= 4; index++) {
      if (
        (counter === 'partial' && index > 2) ||
        (counter === 'late-first' && index === 0) ||
        (counter === 'early-end' && index === 4)
      )
        continue;
      const distance =
        counter === 'reset' && index === 2
          ? 0
          : counter === 'invalid-end' && index === 4
            ? 0xffffffff
            : counter === 'early-end' && index === 3
              ? 10000
              : index * 2500;
      encoder.writeMessage(
        20,
        [field(253, start + index * 30, FitBaseType.Uint32), field(5, distance, FitBaseType.Uint32)],
        2
      );
    }
  for (let lap = 0; lap < 2; lap++) {
    const distance = options.laps === 'missing' ? null : options.laps === 'consistent' ? 5000 : lap ? 10000 : null;
    encoder.writeMessage(
      19,
      [
        field(254, lap, FitBaseType.Uint16),
        field(253, start + (lap + 1) * 60, FitBaseType.Uint32),
        field(2, start + lap * 60, FitBaseType.Uint32),
        field(7, 60000, FitBaseType.Uint32),
        field(8, 60000, FitBaseType.Uint32),
        ...(distance === null ? [] : [field(9, distance, FitBaseType.Uint32)]),
        field(32, 2, FitBaseType.Uint16),
        field(35, lap * 2, FitBaseType.Uint16)
      ],
      3
    );
  }
  const summary = options.summary === undefined ? 100 : options.summary;
  encoder.writeMessage(
    18,
    [
      field(254, 0, FitBaseType.Uint16),
      field(253, start + 120, FitBaseType.Uint32),
      field(2, start, FitBaseType.Uint32),
      field(5, 5, FitBaseType.Enum),
      field(6, 17, FitBaseType.Enum),
      field(7, 120000, FitBaseType.Uint32),
      field(8, 120000, FitBaseType.Uint32),
      ...(summary === null ? [] : [field(9, summary * 100, FitBaseType.Uint32)]),
      field(25, 0, FitBaseType.Uint16),
      field(26, 2, FitBaseType.Uint16),
      field(44, 2500, FitBaseType.Uint16),
      field(47, options.geometry === 'incomplete' ? 5 : 4, FitBaseType.Uint16),
      ...(options.imported === undefined ? [] : [field(35, options.imported * 10, FitBaseType.Uint16)])
    ],
    4
  );
  const bytes = encoder.close();
  return (
    await EventImporterFIT.getFromArrayBuffer(
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
      new ActivityParsingOptions({ generateUnitStreams: false })
    )
  ).getFirstActivity();
}

describe('FIT cumulative pool lap distance evidence', () => {
  it('retains the complete recorded counter corroborated by four pool lengths', async () => {
    const activity = await pool();
    expect(activity.getStat(DataDistance.type)?.getValue()).toBe(100);
    expect(activity.getSwimLengths().reduce((sum, length) => sum + (length.distance?.getValue() ?? 0), 0)).toBe(100);
    expect(
      activity
        .getStream(DataDistance.type)
        .getData(true, true)
        .filter((value, index, values) => index === 0 || value !== values[index - 1])
    ).toEqual([0, 25, 50, 75, 100]);
  });

  it.each([null, 75])('prefers corroborated records when the session distance is %s', async summary => {
    const activity = await pool({ summary });
    expect(
      activity
        .getStream(DataDistance.type)
        .getData(true, true)
        .filter((value, index, values) => index === 0 || value !== values[index - 1])
    ).toEqual([0, 25, 50, 75, 100]);
  });

  it.each(['partial', 'reset', 'invalid-end', 'late-first', 'early-end', 'absent'] as const)(
    'uses independently corroborated lengths rather than promoting a %s counter',
    async counter => {
      const activity = await pool({ counter });
      const data = activity.getStream(DataDistance.type).getData();
      expect(data[0]).toBe(0);
      expect(data[15]).toBeCloseTo(12.5, 6);
      expect(data[120]).toBe(100);
    }
  );

  it('does not change consistent lap-distance generation', async () => {
    const activity = await pool({ laps: 'consistent' });
    expect(activity.getStream(DataDistance.type).getData()[15]).toBeCloseTo(12.5, 6);
    expect(activity.getStream(DataDistance.type).getData(true, true).slice(-1)[0]).toBe(100);
  });

  it('still derives distance from pool lengths when every lap distance is absent', async () => {
    const activity = await pool({ laps: 'missing', counter: 'absent' });
    expect(activity.getStream(DataDistance.type).getData(true, true).slice(-1)[0]).toBe(100);
  });

  it.each(['duplicate-index', 'overlap', 'incomplete', 'fractional-start-overlap', 'elapsed-only-overlap'] as const)(
    'does not treat %s length geometry as corroboration for the raw counter',
    async geometry => {
      const activity = await pool({ geometry });
      expect(activity.getStream(DataDistance.type).getData()[15]).not.toBe(0);
    }
  );

  it('accepts recorded timer fractions within the same encoded second for whole-second starts', async () => {
    const activity = await pool({ geometry: 'encoded-second-overlap' });
    // The validated raw counter has observations every 30 seconds; intervening distance stays unknown.
    expect(activity.getStream(DataDistance.type).getData()[15]).toBeNull();
    expect(activity.getStream(DataDistance.type).getData(true, true)).toEqual([0, 25, 50, 75, 100]);
    expect(activity.getStream(DataDistance.type).getData(true, true).slice(-1)[0]).toBe(100);
  });

  it('does not generate a complete distance from a zero-length active interval without records', async () => {
    const activity = await pool({ geometry: 'zero-timer', counter: 'absent' });
    expect(activity.hasStreamData(DataDistance.type)).toBe(false);
  });

  it('requires independent agreement before replacing contradictory lap totals', async () => {
    const activity = await pool({ summary: 75, counter: 'partial' });
    expect(activity.getStream(DataDistance.type).getData(true, true)).not.toEqual([0, 25, 50]);
    expect(activity.getStream(DataDistance.type).getData(true, true).slice(-1)[0]).not.toBe(100);
  });

  it.each([0, 42.5])(
    'preserves imported TSS %s and corrected distance through repeated regeneration',
    async imported => {
      const activity = await pool({ imported });
      for (let index = 0; index < 2; index++) {
        expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic).toMatchObject({
          method: 'IMPORTED',
          score: imported
        });
        expect(
          activity
            .getStream(DataDistance.type)
            .getData(true, true)
            .filter((value, index, values) => index === 0 || value !== values[index - 1])
        ).toEqual([0, 25, 50, 75, 100]);
        ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
      }
    }
  );
});
