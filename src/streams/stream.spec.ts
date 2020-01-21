import {DataAltitude} from '../data/data.altitude';
import {Stream} from './stream';

describe('Stream', () => {

  beforeEach(() => {

  });

  it('should get numeric data', () => {
    const stream = new Stream(DataAltitude.type, [200, null, 502, Infinity, -Infinity, NaN, 0]);
    expect(stream.getData()).toEqual([200, null, 502, Infinity, -Infinity, NaN, 0]);
    expect(stream.getData(true)).toEqual([200, 502, Infinity, -Infinity, 0]);
    expect(stream.getData(false, true)).toEqual([200, null, 502, NaN, 0]);
    expect(stream.getData(true, true)).toEqual([200, 502, 0]);
  });

  it('should get the duration of data', () => {
    const stream = new Stream(DataAltitude.type, [200, null, 502, Infinity, -Infinity, NaN, 0]);
    expect(stream.getDurationOfData()).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(stream.getDurationOfData(true)).toEqual([0, 2, 3, 4, 6]);
    expect(stream.getDurationOfData(false, true)).toEqual([0, 1, 2, 5, 6]);
    expect(stream.getDurationOfData(true, true)).toEqual([0, 2, 6]);
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
