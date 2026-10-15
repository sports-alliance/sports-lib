import { getMissingFinalSession } from './fit-missing-session';

const date = (second: number) => new Date(Date.UTC(2026, 0, 1) + second * 1000);
const fixture = (): any => ({
  sessions: [{ start_time: date(0), timestamp: date(10), total_timer_time: 10, message_index: 0 }],
  activity: { timestamp: date(30), num_sessions: 2 },
  records: [0, 10, 11, 20, 25, 30].map(second => ({ timestamp: date(second), distance: second * 2 })),
  events: [[0, 'start'], [20, 'stop'], [25, 'start'], [30, 'stop_all']].map(([second, type]) =>
    ({ timestamp: date(second as number), event: 'timer', event_type: type, event_group: 0 }))
});

describe('corroborated missing final FIT session', () => {
  it('uses counter delta and active timer intervals without modifying source evidence', () => {
    const file = fixture(), before = structuredClone(file);
    expect(getMissingFinalSession(file, 30)).toEqual({
      start_time: date(10), timestamp: date(30), sport: 'unknown', laps: [],
      total_elapsed_time: 20, total_timer_time: 15, total_distance: 40
    });
    expect(file).toEqual(before);
  });
  it('accepts absent session indexes and a recorded zero distance delta', () => {
    const file = fixture(); delete file.sessions[0].message_index;
    file.records.forEach((r: any) => r.distance = 0);
    expect(getMissingFinalSession(file, 20)?.total_distance).toBe(0);
  });
  it('accepts an indexed, contiguous prefix of several sports', () => {
    const file = fixture(); file.sessions.unshift({ start_time: date(-10), timestamp: date(0), total_timer_time: 10, message_index: 0 });
    file.sessions[1].message_index = { value: 1 }; file.activity.num_sessions = 3; file.events[0].timestamp = date(-10);
    expect(getMissingFinalSession(file, 20)?.total_timer_time).toBe(15);
  });
  it('retains existing earlier laps and pool lengths without assigning them to the tail', () => {
    const file = fixture(); file.laps = [{ timestamp: date(10), lengths: [{ timestamp: date(5) }] }];
    expect(getMissingFinalSession(file, 20)?.laps).toEqual([]);
  });
  it.each([NaN, Infinity, 0, -1, 19])('honors configured maximum duration %s', max => {
    expect(getMissingFinalSession(fixture(), max)).toBeNull();
  });
  it.each<[string, (file: any) => void]>([
    ['complete recording', f => f.activity.num_sessions = 1],
    ['multiple missing sessions', f => f.activity.num_sessions = 3],
    ['no session declaration', f => delete f.activity.num_sessions],
    ['no recorded sessions', f => f.sessions = []],
    ['multiple activity messages', f => f.messages = { activity: [{}, {}] }],
    ['non-final session index', f => f.sessions[0].message_index = 1],
    ['invalid session start', f => f.sessions[0].start_time = null],
    ['zero session span', f => f.sessions[0].start_time = date(10)],
    ['noncontiguous prefix', f => { f.sessions.push({ start_time: date(11), timestamp: date(15), total_timer_time: 4 }); f.activity.num_sessions = 3; }],
    ['non-Date timestamps', f => f.activity.timestamp = +date(30)],
    ['no final span', f => f.activity.timestamp = date(10)],
    ['no trailing records', f => f.records = f.records.slice(0, 2)],
    ['no closing record', f => f.records.pop()],
    ['unordered records', f => f.records.reverse()],
    ['invalid record time', f => f.records[3].timestamp = new Date(NaN)],
    ['pre-start record', f => f.records[0].timestamp = date(-1)],
    ['post-end record', f => f.records.push({ timestamp: date(31) })],
    ['no boundary distance', f => delete f.records[1].distance],
    ['no final distance', f => delete f.records[5].distance],
    ['reset distance', f => f.records[3].distance = 0],
    ['negative distance', f => f.records[1].distance = -1],
    ['nonfinite distance', f => f.records[3].distance = NaN],
    ['conflicting same-tick counter', f => f.records.splice(2, 0, { timestamp: date(10), distance: 21 })],
    ['ambiguous trailing lap', f => f.laps = [{ timestamp: date(20) }]],
    ['cascaded trailing lap', f => f.sessions[0].laps = [{ timestamp: date(20) }]],
    ['unknown lap bounds', f => f.laps = [{}]],
    ['trailing pool length', f => f.lengths = [{ timestamp: date(20) }]],
    ['cascaded pool length', f => f.sessions[0].laps = [{ timestamp: date(10), lengths: [{ timestamp: date(20) }] }]],
    ['unknown pool length bounds', f => f.lengths = [{}]],
    ['explicit sport message', f => f.sports = [{ sport: 'running' }]],
    ['jump ownership', f => f.jumps = [{ timestamp: date(25), distance: 5, score: 10 }]],
    ['explicit tail sport', f => f.records[2].sport = 'running'],
    ['explicit tail subsport', f => f.records[2].sub_sport = 'trail'],
    ['no timer start', f => f.events.shift()],
    ['no timer stop', f => f.events.pop()],
    ['different timer group', f => f.events[1].event_group = 1],
    ['invalid timer group', f => f.events.forEach((e: any) => e.event_group = 255)],
    ['unknown timer event type', f => f.events[1].event_type = 'marker'],
    ['unordered timers', f => f.events.reverse()],
    ['conflicting simultaneous timers', f => f.events[2].timestamp = date(20)],
    ['missing known timer summary', f => delete f.sessions[0].total_timer_time],
    ['conflicting known timer', f => f.sessions[0].total_timer_time = 8.9],
    ['inactive tail', f => { f.events = [f.events[0], { ...f.events[3], timestamp: date(10) }, f.events[3]]; }]
  ])('declines %s', (_, mutate) => {
    const file = fixture(); mutate(file); expect(getMissingFinalSession(file, 30)).toBeNull();
  });
});
