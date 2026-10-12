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
