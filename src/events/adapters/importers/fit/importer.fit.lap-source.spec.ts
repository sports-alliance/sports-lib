import { FitBaseType as B, FitEncoder } from 'fit-file-parser/encoder';
import { EventImporterFIT } from './importer.fit';
import { EventImporterJSON } from '../json/importer.json';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { DataElapsedTime } from '../../../../data/data.elapsed-time';
import { DataDistance } from '../../../../data/data.distance';
import { DataHeartRateAvg } from '../../../../data/data.heart-rate-avg';

const base = new Date('2026-01-01T10:00:00Z');
const at = (seconds: number) => new Date(+base + seconds * 1000);
const importer = EventImporterFIT as unknown as {
  getCorroboratedLapTimestamps: (raw: any) => WeakSet<object>;
  getLapFromSessionLapObject: (
    lap: any,
    activity: any,
    index: number,
    options: ActivityParsingOptions,
    corroborated?: boolean
  ) => any;
};

describe('independently corroborated FIT lap ends', () => {
  const options = new ActivityParsingOptions({ generateUnitStreams: false });
  const source = () => ({
    start_time: at(100),
    timestamp: at(220),
    total_elapsed_time: 119.958,
    total_timer_time: 119.958,
    total_distance: 157,
    records: [{ timestamp: at(100) }, { timestamp: at(900) }]
  });
  const session = () => ({ start_time: at(0), timestamp: at(1000) });
  const activity = () => ({ startDate: at(0), endDate: at(1000) });

  it.each([119.958, 120, 120.042])('uses source elapsed %s corroborated by whole-second timestamps', elapsed => {
    const lap = { ...source(), total_elapsed_time: elapsed, total_timer_time: elapsed };
    const evidence = importer.getCorroboratedLapTimestamps({ laps: [lap], sessions: [session()] });
    const parsed = importer.getLapFromSessionLapObject(lap, activity(), 0, options, evidence.has(lap));
    expect(parsed.endDate).toEqual(at(220));
    expect(parsed.getStat(DataElapsedTime.type).getValue()).toBeCloseTo(elapsed, 1);
    expect(parsed.getStat(DataDistance.type).getValue()).toBe(157);
    expect(lap.records[lap.records.length - 1]?.timestamp).toEqual(at(900));
  });

  it.each([
    ['missing elapsed', { total_elapsed_time: undefined }],
    ['nonfinite elapsed', { total_elapsed_time: Infinity }],
    ['contradictory elapsed', { total_elapsed_time: 115 }],
    ['zero elapsed', { total_elapsed_time: 0 }],
    ['inverted timing summaries', { total_timer_time: 800 }],
    ['nonfinite timer', { total_timer_time: Infinity }],
    ['negative timer', { total_timer_time: -1 }],
    ['nonnumeric timer', { total_timer_time: '119.958' }],
    ['timer outside the source timestamp tick', { total_timer_time: 121 }],
    ['wrong timestamp precision', { timestamp: at(220.5) }],
    ['missing source start', { start_time: undefined }],
    ['inverted source end', { timestamp: at(50) }]
  ])('retains recovery for %s', (_name, patch) => {
    const lap = { ...source(), ...(patch as object) };
    const evidence = importer.getCorroboratedLapTimestamps({ laps: [lap], sessions: [session()] });
    expect(evidence.has(lap)).toBe(false);
    expect(importer.getLapFromSessionLapObject(lap, activity(), 0, options, evidence.has(lap)).endDate).toEqual(
      at(900)
    );
  });

  it.each([undefined, null, 0, 119, 120, 120.042])('accepts absent or precision-consistent timer %s', timer => {
    const lap = { ...source(), total_timer_time: timer };
    const evidence = importer.getCorroboratedLapTimestamps({ laps: [lap], sessions: [session()] });
    expect(evidence.has(lap)).toBe(true);
    expect(lap.total_timer_time).toBe(timer);
    expect(importer.getLapFromSessionLapObject(lap, activity(), 0, options, evidence.has(lap)).endDate).toEqual(
      at(220)
    );
  });

  it('requires unique source identity and session ownership, and containment after session recovery', () => {
    const lap = source();
    for (const raw of [
      { laps: [lap, { ...lap }], sessions: [session()] },
      { laps: [lap], sessions: [session(), session()] },
      { laps: [lap], sessions: [{ start_time: at(0), timestamp: at(200) }] },
      { laps: [lap], sessions: [] }
    ])
      expect(importer.getCorroboratedLapTimestamps(raw).has(lap)).toBe(false);
    const evidence = importer.getCorroboratedLapTimestamps({ laps: [lap], sessions: [session()] });
    expect(
      importer.getLapFromSessionLapObject(lap, { startDate: at(0), endDate: at(200) }, 0, options, evidence.has(lap))
        .endDate
    ).toEqual(at(900));
  });

  it('keeps a brief uniquely owned multisport lap within its own source window', () => {
    const lap = {
      ...source(),
      start_time: at(1000),
      timestamp: at(1002),
      total_elapsed_time: 1.573,
      total_timer_time: 1.573
    };
    const sessions = [session(), { start_time: at(1000), timestamp: at(2000) }];
    const evidence = importer.getCorroboratedLapTimestamps({ laps: [lap], sessions });
    lap.records = [{ timestamp: at(1000) }, { timestamp: at(1900) }];
    expect(
      importer.getLapFromSessionLapObject(
        lap,
        { startDate: at(1000), endDate: at(2000) },
        0,
        options,
        evidence.has(lap)
      ).endDate
    ).toEqual(at(1002));
  });

  it.each([undefined, 145])(
    'retains source bounds and supplied HR %s through FIT decoding and native JSON',
    async suppliedHr => {
      const encoder = new FitEncoder();
      const start = FitEncoder.toFitTimestamp(base);
      const field = (number: number, value: number, baseType = B.Uint32) => ({
        number,
        value,
        baseType,
        size: baseType === B.Uint32 ? 4 : baseType === B.Uint16 ? 2 : 1
      });
      encoder.writeMessage(0, [field(0, 4, B.Enum), field(1, 23, B.Uint16)]);
      for (const second of [0, 100, 150, 220, 900])
        encoder.writeMessage(
          20,
          [field(253, start + second), field(3, second < 150 ? 100 : second === 150 ? 120 : 200, B.Uint8)],
          1
        );
      encoder.writeMessage(
        19,
        [
          field(253, start + 220),
          field(2, start + 100),
          field(7, 119958),
          field(8, 119958),
          field(9, 15700),
          ...(suppliedHr === undefined ? [] : [field(15, suppliedHr, B.Uint8)])
        ],
        2
      );
      encoder.writeMessage(
        18,
        [field(253, start + 1000), field(2, start), field(7, 1000000), field(8, 1000000), field(5, 1, B.Enum)],
        3
      );
      const bytes = encoder.close();
      const event = await EventImporterFIT.getFromArrayBuffer(
        bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
        options
      );
      for (const parsed of [event, EventImporterJSON.getEventFromJSON(event.toJSON())]) {
        const leg = parsed.getFirstActivity();
        expect(leg.endDate).toEqual(at(1000));
        expect(leg.getLaps()).toHaveLength(1);
        expect(leg.getLaps()[0].startDate).toEqual(at(100));
        expect(leg.getLaps()[0].endDate).toEqual(at(220));
        expect(leg.getLaps()[0].getStat(DataDistance.type)?.getValue()).toBe(157);
        expect(leg.getLaps()[0].getStat(DataHeartRateAvg.type)?.getValue()).toBe(suppliedHr ?? 110);
      }
    }
  );
});
