import { FitBaseType as B, FitEncoder } from 'fit-file-parser/encoder';
import { SportsLib } from '../../../../index';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { ParsingEventLibError } from '../../../../errors/parsing-event-lib.error';
import { EmptyEventLibError } from '../../../../errors/empty-event-sports-libs.error';
import { ActivityUtilities } from '../../../utilities/activity.utilities';

const start = FitEncoder.toFitTimestamp(new Date('2026-01-01T10:00:00Z'));
const f = (number: number, value: number, baseType = B.Uint8) => ({ number, value, baseType,
  size: baseType === B.Uint32 ? 4 : baseType === B.Uint16 ? 2 : 1 });

function source(types: Array<number | undefined>, session = false, records = true, imported?: number) {
  const encoder = new FitEncoder();
  for (const type of types) encoder.writeMessage(0, [f(1, 1, B.Uint16),
    ...(type === undefined ? [] : [f(0, type, B.Enum)])]);
  for (const second of [0, 3600]) {
    // Daily monitoring files have timestamped activity-marker events but no workouts.
    encoder.writeMessage(21, [f(253, start + second, B.Uint32), f(0, 41, B.Enum), f(1, 3, B.Enum)], 1);
    if (records) encoder.writeMessage(20, [f(253, start + second, B.Uint32), f(3, 100)], 2);
  }
  if (session) encoder.writeMessage(18, [f(2, start, B.Uint32), f(253, start + 3600, B.Uint32),
    f(5, 11, B.Enum), f(7, 3600000, B.Uint32), f(8, 3600000, B.Uint32),
    ...(imported === undefined ? [] : [f(35, imported * 10, B.Uint16)])], 3);
  const bytes = encoder.close();
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

describe('FIT activity file types', () => {
  it.each([1, 2, 3, 5, 6, 7, 9, 10, 11, 14, 15, 28, 32, 34, 35, 40, 99])(
    'rejects explicit non-activity type %s before sessionless recovery', async type => {
      await expect(SportsLib.importFromFit(source([type], false, false)))
        .rejects.toMatchObject({ code: ParsingEventLibError.CODE, message: 'FIT file is not an activity file' });
    });

  it.each([[4, 32], [32, 4], [undefined, 32]])('rejects conflicting file declarations %j', async (...types) => {
    await expect(SportsLib.importFromFit(source(types, true)))
      .rejects.toBeInstanceOf(ParsingEventLibError);
  });

  it('does not turn an explicit monitoring file with session-like content into a workout', async () => {
    await expect(SportsLib.importFromFit(source([32], true)))
      .rejects.toBeInstanceOf(ParsingEventLibError);
  });

  it.each([undefined, 0, 42.5])('retains completed activity-summary sessions and imported TSS %s without records', async imported => {
    const event = await SportsLib.importFromFit(source([20], true, false, imported));
    expect(event.getActivities()).toHaveLength(1);
    const activity = event.getFirstActivity();
    expect(activity.getTimer().getValue()).toBe(3600);
    if (imported !== undefined) {
      expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic)
        .toMatchObject({ method: 'IMPORTED', score: imported });
    }
  });

  it('requires an explicit session for an activity-summary file', async () => {
    await expect(SportsLib.importFromFit(source([20], false, false))).rejects.toBeInstanceOf(EmptyEventLibError);
  });

  it('still rejects an activity summary that also declares a monitoring file', async () => {
    await expect(SportsLib.importFromFit(source([20, 32], true, false))).rejects.toBeInstanceOf(ParsingEventLibError);
  });

  it.each([[], [undefined], [4], [4, 4], [undefined, 4]])(
    'retains legacy untyped and explicitly typed activity recovery %#', async (...types) => {
      for (const session of [false, true]) {
        const event = await SportsLib.importFromFit(source(types, session),
          new ActivityParsingOptions({ generateUnitStreams: false }));
        expect(event.getActivities()).toHaveLength(1);
        expect(event.getFirstActivity().getTimer().getValue()).toBe(3600);
      }
    });
});
