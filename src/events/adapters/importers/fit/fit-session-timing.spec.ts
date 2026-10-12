import { getCorroboratedSessionElapsedTime as resolve } from './fit-session-timing';

type File = Parameters<typeof resolve>[0];
const at = (second: number) => new Date(Date.UTC(2026, 0, 1) + second * 1000);
const end = 3 * 86400 + 3600;
const max = 20 * 86400;
const record = (second: number) => ({ timestamp: at(second) });
const fixture = (): File => ({
  sessions: [{ start_time: at(0), timestamp: at(end), total_timer_time: 7200.35, total_elapsed_time: 7200.65 }],
  records: [0, 1800, 3600, end - 3600, end - 1800, end].map(record),
  events: [0, 3600, end - 3600, end].map((second, index) => ({
    timestamp: at(second),
    event: 'timer',
    event_type: index % 2 ? 'stop' : 'start'
  }))
});

describe('corroborated FIT session chronology', () => {
  it('retains chronology supported by every complete active interval without changing source data', () => {
    const file = fixture(),
      original = structuredClone(file);
    expect(resolve(file, max)).toBe(end);
    expect(file).toEqual(original);
  });

  it.each(['stop', 'stop_all', 'stop_disable', 'stop_disable_all'])(
    'accepts complete %s intervals in one group',
    stop => {
      const file = fixture();
      file.events!.forEach((event, index) => {
        event.event_group = 3;
        if (index % 2) event.event_type = stop;
      });
      expect(resolve(file, max)).toBe(end);
    }
  );

  it('uses only closed-interval timestamp and encoded-duration precision', () => {
    const file = fixture();
    file.sessions![0].total_elapsed_time = 7210;
    file.sessions![0].total_timer_time = 7202.001;
    expect(resolve(file, max)).toBe(end);
    file.sessions![0].total_timer_time = 7202.002;
    expect(resolve(file, max)).toBeNull();
    file.sessions![0].total_timer_time = 7197.999;
    expect(resolve(file, max)).toBe(end);
    file.sessions![0].total_timer_time = 7197.998;
    expect(resolve(file, max)).toBeNull();
  });

  const rejected: Array<[string, (file: File) => void]> = [
    [
      'missing sessions',
      file => {
        delete file.sessions;
      }
    ],
    [
      'synthesized-only timing',
      file => {
        file.sessions = [];
      }
    ],
    [
      'multiple sessions',
      file => {
        file.sessions!.push({ ...file.sessions![0] });
      }
    ],
    [
      'missing explicit start',
      file => {
        delete file.sessions![0].start_time;
      }
    ],
    [
      'invalid end',
      file => {
        file.sessions![0].timestamp = new Date(NaN);
      }
    ],
    [
      'fractional bounds',
      file => {
        file.sessions![0].timestamp = at(end + 0.001);
      }
    ],
    [
      'inverted durations',
      file => {
        file.sessions![0].total_elapsed_time = 7199;
      }
    ],
    [
      'missing timer',
      file => {
        delete file.sessions![0].total_timer_time;
      }
    ],
    [
      'zero timer',
      file => {
        file.sessions![0].total_timer_time = 0;
      }
    ],
    [
      'invalid timer',
      file => {
        file.sessions![0].total_timer_time = NaN;
      }
    ],
    [
      'string timer',
      file => {
        file.sessions![0].total_timer_time = '7200';
      }
    ],
    [
      'clock jump inside active interval',
      file => {
        file.events![1].timestamp = at(end - 4000);
      }
    ],
    [
      'out-of-order events',
      file => {
        file.events = [file.events![0], file.events![2], file.events![1], file.events![3]];
      }
    ],
    [
      'unclosed timeline',
      file => {
        file.events!.pop();
      }
    ],
    [
      'duplicate start',
      file => {
        file.events![1].event_type = 'start';
      }
    ],
    [
      'duplicate stop',
      file => {
        file.events![2].event_type = 'stop';
      }
    ],
    [
      'conflicting simultaneous events',
      file => {
        file.events![1].timestamp = at(0);
      }
    ],
    [
      'unsupported timer event',
      file => {
        file.events![1].event_type = 'marker';
      }
    ],
    [
      'missing initial start',
      file => {
        file.events![0].timestamp = at(1);
      }
    ],
    [
      'missing final stop',
      file => {
        file.events![3].timestamp = at(end - 1);
      }
    ],
    [
      'unscoped timer event',
      file => {
        file.events![3].timestamp = at(end + 1);
      }
    ],
    [
      'different timer groups',
      file => {
        file.events![1].event_group = 1;
      }
    ],
    [
      'invalid timer group',
      file => {
        file.events!.forEach(event => {
          event.event_group = 255;
        });
      }
    ],
    [
      'no records',
      file => {
        file.records = [];
      }
    ],
    [
      'bookends without interval support',
      file => {
        file.records = [0, 1, 2, end].map(record);
      }
    ],
    [
      'duplicate-only interval records',
      file => {
        file.records = [0, 1, 2, end, end].map(record);
      }
    ],
    [
      'out-of-order records',
      file => {
        file.records!.reverse();
      }
    ],
    [
      'invalid record timestamp',
      file => {
        file.records![2].timestamp = new Date(NaN);
      }
    ],
    [
      'fractional record timestamp',
      file => {
        file.records![2].timestamp = at(3600.001);
      }
    ],
    [
      'outside record',
      file => {
        file.records!.push(record(end + 1));
      }
    ],
    [
      'missing first record endpoint',
      file => {
        file.records!.shift();
      }
    ],
    [
      'missing final record endpoint',
      file => {
        file.records!.pop();
      }
    ]
  ];
  it.each(rejected)('does not override timestamp safeguards for %s', (_label, mutate) => {
    const file = fixture();
    mutate(file);
    expect(resolve(file, max)).toBeNull();
  });

  it('requires a real pause and more than one interval', () => {
    const file = fixture();
    file.events = [file.events![0], file.events![3]];
    file.sessions![0].total_timer_time = end;
    file.sessions![0].total_elapsed_time = end;
    expect(resolve(file, max)).toBeNull();
  });

  it('does not bypass the caller duration bound', () => {
    expect(resolve(fixture(), end - 1)).toBeNull();
    expect(resolve(fixture(), end)).toBe(end);
    expect(resolve(fixture(), NaN)).toBeNull();
  });
});

describe('corroborated FIT endpoint recovery', () => {
  it('accepts a final sample one tick before an independently anchored stop, but not a longer unobserved tail', () => {
    const file = fixture();
    file.records![file.records!.length - 1].timestamp = at(end - 1);
    expect(resolve(file, max)).toBe(end);
    file.records![file.records!.length - 1].timestamp = at(end - 2);
    expect(resolve(file, max)).toBeNull();
  });

  const distanceRecord = (second: number, distance: number) => ({ timestamp: at(second), distance });
  const timerEvent = (second: number, type: string, group: number | undefined = 0) => ({
    timestamp: at(second),
    event: 'timer',
    event_type: type,
    event_group: group
  });
  const delayedSave = (): File => ({
    sessions: [
      {
        start_time: at(0),
        timestamp: at(15000),
        total_elapsed_time: 2200,
        total_timer_time: 2000.2,
        total_distance: 2000
      }
    ],
    events: [
      timerEvent(0, 'start'),
      timerEvent(1000, 'stop_all'),
      timerEvent(9000, 'start'),
      timerEvent(10000, 'stop_all')
    ],
    records: [
      distanceRecord(0, 0),
      distanceRecord(500, 500),
      distanceRecord(1000, 1000),
      distanceRecord(4000, 1000),
      distanceRecord(9000, 1000),
      distanceRecord(9500, 1500),
      distanceRecord(10000, 2000)
    ]
  });
  const prematureEnd = (): File => ({
    sessions: [
      { start_time: at(0), timestamp: at(90), total_elapsed_time: 100.5, total_timer_time: 90.8, total_distance: 2000 }
    ],
    events: [{ ...timerEvent(0, 'start'), event_group: undefined }, timerEvent(100, 'stop_all')],
    records: [distanceRecord(2, 0), distanceRecord(50, 1000), distanceRecord(95, 2000)]
  });

  it('chooses the final exercise stop rather than a delayed save, without changing the source', () => {
    const file = delayedSave(),
      before = structuredClone(file);
    expect(resolve(file, max)).toBe(10000);
    expect(file).toEqual(before);
  });

  it('keeps idempotent stop-all markers from extending exercise or adding active time', () => {
    const file = delayedSave();
    file.events!.splice(2, 0, timerEvent(5000, 'stop_all'));
    file.events!.push(timerEvent(12000, 'stop_all'));
    expect(resolve(file, max)).toBe(10000);
  });

  it('keeps the source start when its first timer is one tick earlier and pre-start observations exist', () => {
    const file = delayedSave();
    file.events![0].timestamp = at(-1);
    file.records!.unshift(distanceRecord(-50, 0), distanceRecord(-1, 0));
    expect(resolve(file, max)).toBe(10000);
  });

  it('uses corroborated elapsed precision for a premature active-time timestamp', () => {
    const file = prematureEnd(),
      before = structuredClone(file);
    expect(resolve(file, max)).toBe(100.5);
    expect(file).toEqual(before);
  });

  const rejectedTimerEnvelopes: Array<[string, (file: File) => void]> = [
    [
      'inconsistent active duration',
      f => {
        f.sessions![0].total_timer_time = 2100;
      }
    ],
    [
      'advancing distance while stopped',
      f => {
        f.records![3].distance = 1001;
      }
    ],
    [
      'distance reset',
      f => {
        f.records![5].distance = 999;
      }
    ],
    [
      'incomplete session distance',
      f => {
        f.sessions![0].total_distance = 3000;
      }
    ],
    [
      'missing distance samples',
      f => {
        delete f.records![3].distance;
      }
    ],
    [
      'records after the final stop',
      f => {
        f.records!.push(distanceRecord(10001, 2000));
      }
    ],
    [
      'unobserved final stop',
      f => {
        f.records!.pop();
      }
    ],
    [
      'unclosed final interval',
      f => {
        f.events!.push(timerEvent(12000, 'start'));
      }
    ],
    [
      'duplicate start',
      f => {
        f.events!.splice(2, 0, timerEvent(950, 'start'));
      }
    ],
    [
      'conflicting timer group',
      f => {
        f.events![2].event_group = 1;
      }
    ],
    [
      'unsupported marker',
      f => {
        f.events!.splice(2, 0, timerEvent(5000, 'marker'));
      }
    ],
    [
      'ambiguous duplicate stop',
      f => {
        f.events!.splice(2, 0, timerEvent(5000, 'stop'));
      }
    ],
    [
      'missing initial start',
      f => {
        f.events!.shift();
      }
    ],
    [
      'large start displacement',
      f => {
        f.events![0].timestamp = at(-2);
      }
    ],
    [
      'records out of order',
      f => {
        f.records!.reverse();
      }
    ],
    [
      'unsupported interval',
      f => {
        f.records = f.records!.filter(r => +r.timestamp! <= +at(9000));
      }
    ]
  ];
  it.each(rejectedTimerEnvelopes)('rejects delayed-save recovery with %s', (_label, mutate) => {
    const file = delayedSave();
    mutate(file);
    expect(resolve(file, max)).toBeNull();
  });

  const rejectedElapsedEnvelopes: Array<[string, (file: File) => void]> = [
    [
      'end unrelated to active time',
      f => {
        f.sessions![0].timestamp = at(80);
      }
    ],
    [
      'stop disagrees with elapsed summary',
      f => {
        f.events![1].timestamp = at(98);
      }
    ],
    [
      'conflicting explicit groups',
      f => {
        f.events![0].event_group = 1;
      }
    ],
    [
      'unclosed events',
      f => {
        f.events![1].event_type = 'start';
      }
    ],
    [
      'incomplete distance',
      f => {
        f.records![2].distance = 1999;
      }
    ],
    [
      'nonzero initial distance',
      f => {
        f.records![0].distance = 1;
      }
    ],
    [
      'records outside elapsed bounds',
      f => {
        f.records![2].timestamp = at(101);
      }
    ],
    [
      'no later recorded data',
      f => {
        f.records![2].timestamp = at(89);
      }
    ],
    [
      'inverted summaries',
      f => {
        f.sessions![0].total_timer_time = 101;
      }
    ],
    [
      'missing elapsed',
      f => {
        delete f.sessions![0].total_elapsed_time;
      }
    ]
  ];
  it.each(rejectedElapsedEnvelopes)('rejects premature-end recovery with %s', (_label, mutate) => {
    const file = prematureEnd();
    mutate(file);
    expect(resolve(file, max)).toBeNull();
  });

  it.each([delayedSave, prematureEnd])('retains single-session ownership and configured duration bounds', make => {
    const file = make();
    expect(resolve(file, 50)).toBeNull();
    file.sessions!.push({ ...file.sessions![0] });
    expect(resolve(file, max)).toBeNull();
  });
});
