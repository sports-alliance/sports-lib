import { FitBaseType as T, FitEncoder } from 'fit-file-parser/encoder';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { ActivityInterface } from '../../../../activities/activity.interface';
import { DataDistance } from '../../../../data/data.distance';
import { DataHeartRate } from '../../../../data/data.heart-rate';
import { DataPower } from '../../../../data/data.power';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { EventImporterJSON } from '../json/importer.json';
import { EventImporterFIT } from './importer.fit';

const base = new Date('2026-01-01T00:00:00Z');
const field = (number: number, value: number, baseType = T.Uint32) => ({
  number,
  value,
  baseType,
  size: baseType === T.Uint32 ? 4 : baseType === T.Uint16 ? 2 : 1
});
interface Fixture {
  normal?: boolean;
  elapsed?: number | null;
  timer?: number | null;
  nextStart?: number;
  duplicate?: boolean;
  noIndexes?: boolean;
  missingActive?: boolean;
  activeCount?: number | null;
  records?: boolean;
  sport?: number;
  pool?: number;
  unit?: number;
  imported?: number;
  splitLaps?: boolean;
}
function bytes(o: Fixture = {}) {
  const e = new FitEncoder(),
    start = FitEncoder.toFitTimestamp(base);
  e.writeMessage(0, [field(0, 4, T.Enum), field(1, 1, T.Uint16)], 0);
  for (let index = 0; index < 4; index++) {
    const elapsed = index === 0 && o.elapsed !== undefined ? o.elapsed : 30;
    const timer = index === 0 && o.timer !== undefined ? o.timer : 30;
    const offset = index === 3 && o.missingActive ? 86400 : index === 1 ? (o.nextStart ?? 30) : index * 30;
    e.writeMessage(
      101,
      [
        ...(o.noIndexes ? [] : [field(254, o.duplicate && index === 1 ? 0 : index, T.Uint16)]),
        field(2, start + offset),
        field(253, start + (o.normal ? (index + 1) * 30 : 120)),
        ...(elapsed === null ? [] : [field(3, elapsed * 1000)]),
        ...(timer === null ? [] : [field(4, timer * 1000)]),
        field(5, 10, T.Uint16),
        field(6, 833, T.Uint16),
        field(12, 1, T.Enum)
      ],
      1
    );
  }
  if (o.records)
    for (const second of [0, 30, 60, 90, 120])
      e.writeMessage(
        20,
        [
          field(253, start + second),
          field(5, (second / 120) * 10000),
          field(3, second === 60 ? 0 : 120, T.Uint8),
          field(7, second === 60 ? 0 : 100, T.Uint16)
        ],
        2
      );
  const lapCount = o.splitLaps ? 2 : 1;
  for (let lap = 0; lap < lapCount; lap++)
    e.writeMessage(
      19,
      [
        field(254, lap, T.Uint16),
        field(2, start + (lap * 120) / lapCount),
        field(253, start + ((lap + 1) * 120) / lapCount),
        field(7, 120000 / lapCount),
        field(8, 120000 / lapCount),
        field(9, 10000 / lapCount),
        field(32, 4 / lapCount, T.Uint16),
        field(35, (lap * 4) / lapCount, T.Uint16),
        ...(o.activeCount === null ? [] : [field(40, o.activeCount ?? 4 / lapCount, T.Uint16)]),
        field(15, 120, T.Uint8)
      ],
      3
    );
  e.writeMessage(
    18,
    [
      field(254, 0, T.Uint16),
      field(2, start),
      field(253, start + 120),
      field(5, o.sport ?? 5, T.Enum),
      field(6, 17, T.Enum),
      field(7, 120000),
      field(8, 120000),
      field(9, 10000),
      field(25, 0, T.Uint16),
      field(26, lapCount, T.Uint16),
      field(44, (o.pool ?? 25) * 100, T.Uint16),
      field(46, o.unit ?? 0, T.Enum),
      field(47, 4, T.Uint16),
      ...(o.imported === undefined ? [] : [field(35, o.imported * 10, T.Uint16)])
    ],
    4
  );
  return e.close();
}
async function parse(o: Fixture = {}, options = new ActivityParsingOptions({ generateUnitStreams: false })) {
  const b = bytes(o);
  return EventImporterFIT.getFromArrayBuffer(
    b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer,
    options
  );
}
const ends = (activity: ActivityInterface) => activity.getSwimLengths().map(length => (+length.endDate - +base) / 1000);

describe('FIT corroborated pool chronology and source completeness', () => {
  it.each([
    { timer: 30, elapsed: 30, expected: 30 },
    { timer: 15, elapsed: 30, expected: 30 },
    { timer: 29.5, elapsed: 29.5, expected: 29.5 },
    { timer: 30.5, elapsed: 30.5, expected: 30.5 }
  ])('uses elapsed endpoint corroborated by the next start: %j', async ({ expected, ...o }) => {
    const activity = (await parse(o)).getFirstActivity();
    expect(ends(activity)).toEqual([expected, 60, 90, 120]);
    expect(activity.getSwimLengths()[0].timerTime?.getValue()).toBe(o.timer);
    expect(activity.getSwimLengths()[0].elapsedTime?.getValue()).toBe(o.elapsed);
    expect(activity.getStat(DataDistance.type)?.getValue()).toBe(100);
    expect(activity.getSwimLengths().map(length => length.distance?.getValue())).toEqual([25, 25, 25, 25]);
  });

  it('keeps all canonical data equal to credible per-length timestamps', async () => {
    const corrected = await parse(),
      control = await parse({ normal: true });
    expect(corrected.toJSON()).toEqual(control.toJSON());
  });

  it.each<Fixture>([
    { elapsed: null },
    { elapsed: 0 },
    { timer: null },
    { timer: 40 },
    { timer: 0 },
    { nextStart: 35 },
    { duplicate: true },
    { noIndexes: true },
    { sport: 2 }
  ])('leaves unsupported first endpoints unchanged: %j', async o => {
    const activity = (await parse(o)).getFirstActivity();
    expect(ends(activity)[0]).toBe(120);
  });

  it.each([null, 3, 0])('does not infer missing distance from unsupported active count %s', async activeCount => {
    const activity = (await parse({ missingActive: true, activeCount })).getFirstActivity();
    expect(activity.hasStreamData(DataDistance.type)).toBe(true);
  });

  it('omits an incomplete generated counter while retaining the source total and individual distances', async () => {
    const activity = (await parse({ missingActive: true, imported: 0 })).getFirstActivity();
    expect(activity.hasStreamData(DataDistance.type)).toBe(false);
    expect(activity.getStat(DataDistance.type)?.getValue()).toBe(100);
    expect(activity.getSwimLengths().map(length => length.distance?.getValue())).toEqual([25, 25, 25]);
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic).toMatchObject({
      method: 'IMPORTED',
      score: 0
    });
    expect(activity.endDate).toEqual(new Date(+base + 120000));
  });

  it('retains recorded distance, HR dropouts, power zeros and imported TSS', async () => {
    const activity = (await parse({ missingActive: true, records: true, imported: 42.5 })).getFirstActivity();
    const control = (
      await parse({ records: true, imported: 42.5, missingActive: true, activeCount: null })
    ).getFirstActivity();
    for (const type of [DataDistance.type, DataHeartRate.type, DataPower.type]) {
      expect(activity.getStreamData(type)).toEqual(control.getStreamData(type));
    }
    expect([0, 30, 60, 90, 120].map(index => activity.getStreamData(DataDistance.type)[index])).toEqual([
      0, 25, 50, 75, 100
    ]);
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic).toMatchObject({
      method: 'IMPORTED',
      score: 42.5
    });
  });

  it.each([{ pool: 22.86, unit: 1 }, { pool: 33.33, unit: 0 }, { missingActive: true }, { records: true }])(
    'round-trips without changing pool units or adding serialized evidence: %j',
    async o => {
      const event = await parse(o),
        activity = event.getFirstActivity(),
        json = activity.toJSON();
      expect(EventImporterJSON.getActivityFromJSON(json).toJSON()).toEqual(json);
      const again = await parse(o);
      expect(again.toJSON()).toEqual(event.toJSON());
      expect(JSON.stringify(json)).not.toMatch(/incompleteSessions|poolLengthEndDates|completeSourceLengths/);
    }
  );

  it('falls back to the recorded counter in a multi-lap swim where generated distance normally takes priority', async () => {
    const activity = (await parse({ splitLaps: true, missingActive: true, records: true })).getFirstActivity();
    const unsupported = (
      await parse({ splitLaps: true, missingActive: true, records: true, activeCount: null })
    ).getFirstActivity();
    expect(activity.getLaps()).toHaveLength(2);
    expect(unsupported.getStreamData(DataDistance.type)[90]).toBe(100);
    expect([0, 30, 60, 90, 120].map(index => activity.getStreamData(DataDistance.type)[index])).toEqual([
      0, 25, 50, 75, 100
    ]);
    expect(activity.getStat(DataDistance.type)?.getValue()).toBe(100);
    expect(activity.getSwimLengths().map(length => length.distance?.getValue())).toEqual([25, 25, 25]);
    for (const type of [DataHeartRate.type, DataPower.type]) {
      expect(activity.getStreamData(type)).toEqual(unsupported.getStreamData(type));
    }
  });

  it('honors selective stream imports', async () => {
    const activity = (
      await parse(
        { records: true, missingActive: true },
        new ActivityParsingOptions({
          generateUnitStreams: false,
          streams: { includeTypes: [DataHeartRate.type] }
        })
      )
    ).getFirstActivity();
    expect(activity.hasStreamData(DataHeartRate.type)).toBe(true);
    expect(activity.hasStreamData(DataDistance.type)).toBe(false);
    expect(activity.hasStreamData(DataPower.type)).toBe(false);
    expect(ends(activity)[0]).toBe(30);
  });
});
