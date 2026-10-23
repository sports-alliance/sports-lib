import { DataAltitude } from '../data/data.altitude';
import { Stream } from './stream';
import { DataPace, DataPaceMinutesPerMile } from '../data/data.pace';
import { DataSwimPace, DataSwimPaceMinutesPer100Yard } from '../data/data.swim-pace';
import { DataSpeed, DataSpeedKilometersPerHour } from '../data/data.speed';
import { DataGNSSDistance } from '../data/data.gnss-distance';
import { DataGradeAdjustedSpeed, DataGradeAdjustedSpeedKilometersPerHour } from '../data/data.grade-adjusted-speed';
import { DataTime } from '../data/data.time';
import { DataGradeAdjustedPace, DataGradeAdjustedPaceMinutesPerMile } from '../data/data.grade-adjusted-pace';
import { DataVerticalSpeed, DataVerticalSpeedFeetPerHour } from '../data/data.vertical-speed';

describe('Stream', () => {
  beforeEach(() => {});

  it('retains interval evidence in JSON but invalidates it for filtered or replaced data', () => {
    const evidence = { direction: 'ending' as const, durations: [null, null, 2] };
    const stream = new Stream('Speed', [null, null, 3], evidence);
    expect(stream.toJSON().intervalSupport).toEqual(evidence);
    stream.useFilter({ filterData: data => data.slice() });
    expect(stream.getIntervalSupport()).toBeUndefined();
    expect(stream.toJSON().intervalSupport).toEqual(evidence);
    stream.clearFilters();
    expect(stream.getIntervalSupport()).toEqual(evidence);
    stream.setData([1, 2, 3]);
    expect(stream.toJSON()).toEqual({ type: 'Speed', data: [1, 2, 3] });
  });

  it.each([
    { direction: 'ending', durations: [null, null, 3] },
    { direction: 'ending', durations: [null, null, -1] },
    { direction: 'ending', durations: [null, null, NaN] },
    { direction: 'ending', durations: [null, null, 1.5] },
    { direction: 'starting', durations: [null, null, 1] },
    { direction: 'ending', durations: [null, 1, 1] },
    { direction: 'ending', durations: [null] },
    { direction: 'invalid', durations: [null, null, 2] }
  ])('ignores malformed interval evidence %j', evidence => {
    const stream = new Stream('Speed', [null, null, 3], evidence as any);
    expect(stream.getIntervalSupport()).toBeUndefined();
    expect(stream.toJSON()).toEqual({ type: 'Speed', data: [null, null, 3] });
  });

  it('should get data', () => {
    const stream = new Stream(DataAltitude.type, [200, null, 502, Infinity, -Infinity, NaN, 0]);
    expect(stream.getData()).toEqual([200, null, 502, Infinity, -Infinity, NaN, 0]);
    expect(stream.getData(true)).toEqual([200, 502, Infinity, -Infinity, 0]);
    expect(stream.getData(false, true)).toEqual([200, null, 502, NaN, 0]);
    expect(stream.getData(true, true)).toEqual([200, 502, 0]);
  });

  it('should if it can be exported', () => {
    let stream;
    // Pace not exportable
    stream = new Stream(DataPace.type);
    expect(stream.isExportable()).toBe(false);
    stream = new Stream(DataPaceMinutesPerMile.type);
    expect(stream.isExportable()).toBe(false);
    // Swim pace not exportable
    stream = new Stream(DataSwimPace.type);
    expect(stream.isExportable()).toBe(false);
    stream = new Stream(DataSwimPaceMinutesPer100Yard.type);
    expect(stream.isExportable()).toBe(false);
    // Speed exportable
    stream = new Stream(DataSpeed.type);
    expect(stream.isExportable()).toBe(true);
    // Speed unit not
    stream = new Stream(DataSpeedKilometersPerHour.type);
    expect(stream.isExportable()).toBe(false);
    // Black listed ones
    stream = new Stream(DataGNSSDistance.type);
    expect(stream.isExportable()).toBe(false);
    stream = new Stream(DataTime.type);
    expect(stream.isExportable()).toBe(false);

    // Grade one
    stream = new Stream(DataGradeAdjustedSpeed.type);
    expect(stream.isExportable()).toBe(true);
    stream = new Stream(DataGradeAdjustedSpeedKilometersPerHour.type);
    expect(stream.isExportable()).toBe(false);

    // GAP should not be exportable
    stream = new Stream(DataGradeAdjustedPace.type);
    expect(stream.isExportable()).toBe(false);
    stream = new Stream(DataGradeAdjustedPaceMinutesPerMile.type);
    expect(stream.isExportable()).toBe(false);

    // Verticalos
    stream = new Stream(DataVerticalSpeed.type);
    expect(stream.isExportable()).toBe(true);
    stream = new Stream(DataVerticalSpeedFeetPerHour.type);
    expect(stream.isExportable()).toBe(false);
  });

  it('should get stream data by time', () => {
    const stream = new Stream(DataAltitude.type, [200, null, 502, Infinity, -Infinity, NaN, 0]);
    const date = new Date();
    expect(stream.getStreamDataByTime(date)).toEqual([
      {
        time: date.getTime(),
        value: 200
      },
      {
        time: date.getTime() + 1000,
        value: null
      },
      {
        time: date.getTime() + 2000,
        value: 502
      },
      {
        time: date.getTime() + 3000,
        value: Infinity
      },
      {
        time: date.getTime() + 4000,
        value: -Infinity
      },
      {
        time: date.getTime() + 5000,
        value: NaN
      },
      {
        time: date.getTime() + 6000,
        value: 0
      }
    ]);
    expect(stream.getStreamDataByTime(date, true, true)).toEqual([
      {
        time: date.getTime(),
        value: 200
      },
      {
        time: date.getTime() + 2000,
        value: 502
      },
      {
        time: date.getTime() + 6000,
        value: 0
      }
    ]);
  });

  it('should get stream data by duration', () => {
    const stream = new Stream(DataAltitude.type, [200, null, 502, Infinity, -Infinity, NaN, 0]);
    expect(stream.getStreamDataByDuration(0)).toEqual([
      {
        time: 0,
        value: 200
      },
      {
        time: 1000,
        value: null
      },
      {
        time: 2000,
        value: 502
      },
      {
        time: 3000,
        value: Infinity
      },
      {
        time: 4000,
        value: -Infinity
      },
      {
        time: 5000,
        value: NaN
      },
      {
        time: 6000,
        value: 0
      }
    ]);
    expect(stream.getStreamDataByDuration(0, true, true)).toEqual([
      {
        time: 0,
        value: 200
      },
      {
        time: 2000,
        value: 502
      },
      {
        time: 6000,
        value: 0
      }
    ]);
    expect(stream.getStreamDataByDuration(33, true, true)).toEqual([
      {
        time: 33,
        value: 200
      },
      {
        time: 2033,
        value: 502
      },
      {
        time: 6033,
        value: 0
      }
    ]);
  });
});
