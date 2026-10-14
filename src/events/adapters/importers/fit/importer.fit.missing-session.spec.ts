import { FitBaseType, FitEncoder } from 'fit-file-parser/encoder';
import { EventImporterFIT } from './importer.fit';
import { EventImporterJSON } from '../json/importer.json';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { ActivityTypes } from '../../../../activities/activity.types';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { EventUtilities } from '../../../utilities/event.utilities';
import { fileHeartRateCalibration } from '../../../utilities/tss/tss-evaluation';
import { DataDistance } from '../../../../data/data.distance';
import { DataHeartRate } from '../../../../data/data.heart-rate';
import { DataDuration } from '../../../../data/data.duration';
import { DataPause } from '../../../../data/data.pause';
import { DataTrainingStressScore } from '../../../../data/data.training-stress-score';
import { DataJumpHeightAvg } from '../../../../data/data.jump-stats';

const start = FitEncoder.toFitTimestamp(new Date('2026-01-01T00:00:00Z'));
const field = (number: number, value: number, baseType = FitBaseType.Uint8) => ({ number, value, baseType,
  size: baseType === FitBaseType.Uint32 || baseType === FitBaseType.Float32 ? 4 : baseType === FitBaseType.Uint16 ? 2 : 1 });
function source(declared = 2, calibration: boolean | 'tail' = false, tailLap = false, tailLength = false, jumps = false) {
  const encoder = new FitEncoder();
  encoder.writeMessage(0, [field(0, 4, FitBaseType.Enum), field(1, 23, FitBaseType.Uint16)]);
  for (let second = 0; second <= 30; second++) encoder.writeMessage(20, [
    field(253, start + second, FitBaseType.Uint32), field(3, second <= 10 ? 110 : 140),
    field(5, second * 200, FitBaseType.Uint32)], 1);
  encoder.writeMessage(18, [field(253, start + 10, FitBaseType.Uint32), field(2, start, FitBaseType.Uint32),
    field(5, 1, FitBaseType.Enum), field(7, 10000, FitBaseType.Uint32), field(8, 10000, FitBaseType.Uint32),
    field(9, 2000, FitBaseType.Uint32), field(35, 0, FitBaseType.Uint16)], 2);
  for (const [second, type] of [[0, 0], [20, 1], [25, 0], [30, 4]]) encoder.writeMessage(21, [
    field(253, start + second, FitBaseType.Uint32), field(0, 0, FitBaseType.Enum), field(1, type, FitBaseType.Enum)], 3);
  if (calibration) encoder.writeMessage(216, [field(0, 18, FitBaseType.Uint16),
    ...(calibration === 'tail' ? [field(1, 1, FitBaseType.Uint16)] : []), field(11, 190), field(12, 55), field(13, 165)], 4);
  if (tailLap) encoder.writeMessage(19, [field(253, start + 30, FitBaseType.Uint32), field(2, start + 10, FitBaseType.Uint32),
    field(7, 20000, FitBaseType.Uint32)], 5);
  if (tailLength) encoder.writeMessage(101, [field(253, start + 30, FitBaseType.Uint32), field(2, start + 10, FitBaseType.Uint32),
    field(3, 20000, FitBaseType.Uint32), field(12, 1, FitBaseType.Enum)], 6);
  if (jumps) for (const [second, height] of [[5, 2], [25, 4]]) encoder.writeMessage(285, [
    field(253, start + second, FitBaseType.Uint32), field(0, 5, FitBaseType.Float32),
    field(1, height, FitBaseType.Float32), field(4, 10, FitBaseType.Float32)], 8);
  encoder.writeMessage(34, [field(253, start + 30, FitBaseType.Uint32), field(1, declared, FitBaseType.Uint16)], 7);
  const bytes = encoder.close();
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}
const options = (extra = {}) => new ActivityParsingOptions({ generateUnitStreams: false, ...extra });

describe('FIT final Unknown Sport recovery', () => {
  it.each([false, true])('retains earlier output and calibration (unindexed calibration=%s)', async calibration => {
    const before = await EventImporterFIT.getFromArrayBuffer(source(1, calibration), options());
    const after = await EventImporterFIT.getFromArrayBuffer(source(2, calibration), options());
    expect(after.getActivities()).toHaveLength(2);
    expect(after.getFirstActivity().toJSON()).toEqual(before.getFirstActivity().toJSON());
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(after.getFirstActivity()))
      .toEqual(ActivityUtilities.getTrainingStressScoreEvaluations(before.getFirstActivity()));
    if (calibration) {
      expect(fileHeartRateCalibration.get(after.getFirstActivity())).toEqual({
        maxHeartRate: 190, restingHeartRate: 55, lactateThresholdHR: 165
      });
    }
    const tail = after.getActivities()[1];
    expect(tail.type).toBe(ActivityTypes.unknown);
    expect(tail.getStat(DataDuration.type)?.getValue()).toBe(15);
    expect(tail.getStat(DataPause.type)?.getValue()).toBe(5);
    expect(tail.getStat(DataDistance.type)?.getValue()).toBe(40);
    expect(tail.getStreamData(DataHeartRate.type)[0] ?? null).toBeNull();
    expect(tail.getStreamData(DataHeartRate.type)[1]).toBe(140);
    expect(tail.getStreamData(DataHeartRate.type)[20]).toBe(140);
    expect(after.getFirstActivity().getStreamData(DataHeartRate.type)[10]).toBe(110);
    expect(tail.getStat(DataTrainingStressScore.type)).toBeUndefined();
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(tail).automatic.score).toBeNull();
    expect(after.getStat(DataDistance.type)?.getValue()).toBe(60);
  });
  it('round-trips and regenerates without duplicate legs or inflated totals', async () => {
    let event = await EventImporterFIT.getFromArrayBuffer(source(), options());
    for (let repeat = 0; repeat < 2; repeat++) {
      event = EventImporterJSON.getEventFromJSON(event.toJSON());
      event.getActivities().forEach(activity => ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity));
      EventUtilities.reGenerateStatsForEvent(event);
      expect(event.getActivities()).toHaveLength(2);
      expect(event.getStat(DataDistance.type)?.getValue()).toBe(60);
      expect(event.getActivities()[1].type).toBe(ActivityTypes.unknown);
      expect(event.getActivities()[1].getStat(DataDuration.type)?.getValue()).toBe(15);
    }
  });
  it('allows HR load only when calibration independently references the recovered session', async () => {
    const event = await EventImporterFIT.getFromArrayBuffer(source(2, 'tail'), options());
    const tail = event.getActivities()[1];
    const evaluation = ActivityUtilities.getTrainingStressScoreEvaluations(tail).automatic;
    expect(evaluation.method).toBe('HR');
    expect(evaluation.score).toBeGreaterThan(0);
    expect(fileHeartRateCalibration.get(tail)).toEqual({ maxHeartRate: 190, restingHeartRate: 55, lactateThresholdHR: 165 });
    expect(event.getFirstActivity().getStat(DataTrainingStressScore.type)?.getValue()).toBe(0);
  });
  it('keeps recovery identical during selective stream parsing', async () => {
    const event = await EventImporterFIT.getFromArrayBuffer(source(), options({ streams: { includeTypes: [DataHeartRate.type] } }));
    expect(event.getActivities()).toHaveLength(2);
    expect(event.getActivities()[1].getAllStreams().map(stream => stream.type)).toEqual([DataHeartRate.type]);
    expect(event.getActivities()[1].getStat(DataDistance.type)?.getValue()).toBe(40);
  });
  it('leaves jump-bearing incomplete files unchanged until auxiliary ownership is resolved', async () => {
    const before = await EventImporterFIT.getFromArrayBuffer(source(1, false, false, false, true), options());
    const after = await EventImporterFIT.getFromArrayBuffer(source(2, false, false, false, true), options());
    expect(before.getStat(DataJumpHeightAvg.type)?.getValue()).toBe(2);
    expect(after.getStat(DataJumpHeightAvg.type)?.getValue()).toBe(2);
    expect(after.getActivities()).toHaveLength(1);
    expect(after.toJSON()).toEqual(before.toJSON());
  });
  it('enforces the caller duration limit without discarding existing valid legs', async () => {
    const event = await EventImporterFIT.getFromArrayBuffer(source(), options({ maxActivityDurationDays: 15 / 86400 }));
    expect(event.getActivities()).toHaveLength(1);
    expect(event.getFirstActivity().getStat(DataDistance.type)?.getValue()).toBe(20);
  });
  it.each([[1, false, false], [3, false, false], [2, true, false], [2, false, true]])(
    'leaves unsupported declarations, laps and lengths unchanged (%s, %s, %s)', async (count, lap, length) => {
      const event = await EventImporterFIT.getFromArrayBuffer(source(count as number, false, lap as boolean, length as boolean), options());
      expect(event.getActivities()).toHaveLength(1);
    });
});
