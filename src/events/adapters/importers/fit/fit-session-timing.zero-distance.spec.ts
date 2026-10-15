import { getCorroboratedSessionElapsedTime as resolve } from './fit-session-timing';

const at = (seconds: number) => new Date(Date.UTC(2026, 0, 1) + seconds * 1000);
type File = Parameters<typeof resolve>[0];
const fixture = () => ({
  activity: { num_sessions: 1 },
  sessions: [
    { start_time: at(0), timestamp: at(1000), total_elapsed_time: 500, total_timer_time: 400, total_distance: 0 }
  ],
  events: [0, 200, 400, 600].map((second, i) => ({
    timestamp: at(second),
    event: 'timer',
    event_type: i % 2 ? 'stop_all' : 'start',
    event_group: 0
  })),
  records: [0, 100, 200, 300, 400, 500, 600].map(second => ({ timestamp: at(second), distance: 0 }))
});
type Source = File;

describe('explicit zero-distance delayed-save timing', () => {
  it('recovers the observed stop from complete zero counters without mutating source summaries', () => {
    const file = fixture(),
      before = structuredClone(file);
    expect(resolve(file, 2000)).toBe(600);
    expect(file).toEqual(before);
  });

  it('does not extend the exercise for a later idempotent stop_all', () => {
    const file = fixture();
    file.events.push({ ...file.events[3], timestamp: at(900) });
    expect(resolve(file, 2000)).toBe(600);
  });

  it.each([398.001, 401.999])('accepts a timer within the timestamp quantization bound: %s', timer => {
    const file = fixture();
    file.sessions[0].total_timer_time = timer;
    expect(resolve(file, 2000)).toBe(600);
  });

  const rejected: Array<[string, (f: Source) => void]> = [
    [
      'missing distance',
      f => {
        delete f.sessions![0].total_distance;
      }
    ],
    [
      'negative distance',
      f => {
        f.sessions![0].total_distance = -1;
      }
    ],
    [
      'nonfinite distance',
      f => {
        f.sessions![0].total_distance = NaN;
      }
    ],
    [
      'missing record distance',
      f => {
        delete f.records![2].distance;
      }
    ],
    [
      'moving counter',
      f => {
        f.records![2].distance = 1;
      }
    ],
    [
      'sub-centimetre counter movement',
      f => {
        f.records![6].distance = 0.004;
      }
    ],
    [
      'missing activity declaration',
      f => {
        delete f.activity;
      }
    ],
    [
      'missing declared session count',
      f => {
        delete f.activity!.num_sessions;
      }
    ],
    [
      'multiple declared sessions',
      f => {
        f.activity!.num_sessions = 2;
      }
    ],
    [
      'string session count',
      f => {
        f.activity!.num_sessions = '1';
      }
    ],
    [
      'multiple explicit sessions',
      f => {
        f.sessions!.push({ ...f.sessions![0] });
      }
    ],
    [
      'unclosed interval',
      f => {
        f.events!.pop();
      }
    ],
    [
      'duplicate start',
      f => {
        f.events!.splice(1, 0, { ...f.events![0], timestamp: at(1) });
      }
    ],
    [
      'unmatched plain stop',
      f => {
        f.events!.splice(2, 0, { ...f.events![1], event_type: 'stop', timestamp: at(300) });
      }
    ],
    [
      'mixed timer groups',
      f => {
        f.events![2].event_group = 1;
      }
    ],
    [
      'invalid timer group',
      f => {
        f.events!.forEach(e => {
          e.event_group = 255;
        });
      }
    ],
    [
      'post-stop record',
      f => {
        f.records!.push({ timestamp: at(601), distance: 0 });
      }
    ],
    [
      'backwards record clock',
      f => {
        f.records![3].timestamp = at(50);
      }
    ],
    [
      'fractional timestamp',
      f => {
        f.records![1].timestamp = at(100.5);
      }
    ],
    [
      'unsupported active duration',
      f => {
        f.sessions![0].total_timer_time = 300;
      }
    ],
    [
      'only one interval',
      f => {
        f.events!.splice(1, 2);
      }
    ],
    [
      'missing terminal record',
      f => {
        f.records!.pop();
      }
    ],
    [
      'unobserved active interval',
      f => {
        f.records!.splice(4, 2);
      }
    ],
    [
      'zero active duration',
      f => {
        f.sessions![0].total_timer_time = 0;
      }
    ],
    [
      'timer exceeds elapsed',
      f => {
        f.sessions![0].total_elapsed_time = 399;
      }
    ],
    [
      'lower quantization boundary',
      f => {
        f.sessions![0].total_timer_time = 398;
      }
    ],
    [
      'upper quantization boundary',
      f => {
        f.sessions![0].total_timer_time = 402;
      }
    ],
    [
      'start mismatch',
      f => {
        f.events![0].timestamp = at(2);
      }
    ]
  ];
  it.each(rejected)('rejects recovery with %s', (_name, mutate) => {
    const file: Source = fixture();
    mutate(file);
    expect(resolve(file, 2000)).toBeNull();
  });

  it('retains the configured duration limit', () => {
    expect(resolve(fixture(), 599)).toBeNull();
    expect(resolve(fixture(), 600)).toBe(600);
  });

  it('keeps the existing positive-distance declaration and tolerance behavior', () => {
    const file: Source = fixture();
    delete file.activity;
    file.sessions![0].total_distance = 400;
    file.sessions![0].total_timer_time = 398;
    [0, 100, 200, 200, 200, 300, 400].forEach((distance, i) => {
      file.records![i].distance = distance;
    });
    expect(resolve(file, 2000)).toBe(600);
  });
});
