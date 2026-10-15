import { rejectImpossiblePoolTiming, rejectedPoolTiming } from './fit-pool-timing';
const d = (s: number) => new Date(1700000000000 + s * 1000);
const fixture = () => ({
  sessions: [
    {
      start_time: d(0),
      timestamp: d(3600),
      total_elapsed_time: 3600,
      total_timer_time: 3000,
      sport: 'swimming',
      sub_sport: 'lap_swimming',
      pool_length: 25
    }
  ],
  records: [{ timestamp: d(0) }, { timestamp: d(3600) }],
  events: [
    { timestamp: d(0), event: 'timer', event_type: 'start' },
    { timestamp: d(3600), event: 'timer', event_type: 'stop_all' }
  ],
  laps: [{ start_time: d(0), timestamp: d(3600), total_elapsed_time: 3600, total_timer_time: 3000 }],
  lengths: [{ start_time: d(0), timestamp: d(30), total_elapsed_time: 30, total_timer_time: 4000000 }]
});
describe('source-proven impossible pool timing', () => {
  it.each([0, 2, 3, '1'])('does not reject timing with conflicting declared session count %s', count => {
    const file = { ...fixture(), activity: { timestamp: d(3600), num_sessions: count } };
    const before = structuredClone(file);
    rejectImpossiblePoolTiming(file);
    expect(file).toEqual(before);
  });
  it('retains impossible-timer rejection with a declared sole session', () => {
    const file = { ...fixture(), activity: { timestamp: d(3600), num_sessions: 1 } };
    rejectImpossiblePoolTiming(file);
    expect(file.lengths[0]).toMatchObject({ [rejectedPoolTiming]: { timerTime: 4000000 } });
  });
  it('does not reject timing using multiple activity summaries', () => {
    const file = {
      ...fixture(),
      activity: { timestamp: d(3600), num_sessions: 1 },
      messages: { activity: [{ num_sessions: 2 }, { num_sessions: 1 }] }
    };
    const before = structuredClone(file);
    rejectImpossiblePoolTiming(file);
    expect(file).toEqual(before);
  });
  it('retains independent elapsed and rejected timer evidence before normalization', () => {
    const file = fixture();
    rejectImpossiblePoolTiming(file);
    expect(file.lengths[0]).toMatchObject({
      total_elapsed_time: 30,
      [rejectedPoolTiming]: { version: 1, reason: 'exceeds-workout-envelope', timerTime: 4000000 }
    });
    expect(file.lengths[0].total_timer_time).toBe(4000000);
    expect(file.laps[0].total_timer_time).toBe(3000);
  });
  it.each(['multisport', 'missing stop', 'late record', 'not pool', 'missing elapsed', 'unordered timers'])(
    'defers %s evidence unchanged',
    kind => {
      const file = fixture();
      if (kind === 'multisport') file.sessions.push({ ...file.sessions[0] });
      if (kind === 'missing stop') file.events.pop();
      if (kind === 'late record') file.records.push({ timestamp: d(3700) });
      if (kind === 'not pool') file.sessions[0].sport = 'running';
      if (kind === 'missing elapsed') file.sessions[0].total_elapsed_time = 0;
      if (kind === 'unordered timers')
        file.events.splice(1, 0, { timestamp: d(3700), event: 'timer', event_type: 'stop' });
      const before = structuredClone(file);
      rejectImpossiblePoolTiming(file);
      expect(file).toEqual(before);
    }
  );
  it('preserves whole-second precision and long independently supported rests', () => {
    const file = fixture();
    file.lengths[0].total_timer_time = 3601;
    const before = structuredClone(file);
    rejectImpossiblePoolTiming(file);
    expect(file).toEqual(before);
    file.lengths[0].timestamp = d(9000);
    file.lengths[0].total_timer_time = 9000;
    rejectImpossiblePoolTiming(file);
    expect(file.lengths[0].total_timer_time).toBe(9000);
  });
  it('rejects both impossible lap durations but protects child-supported totals', () => {
    const file = fixture();
    file.laps[0].total_elapsed_time = file.laps[0].total_timer_time = 100000;
    rejectImpossiblePoolTiming(file);
    expect(file.laps[0]).toMatchObject({
      [rejectedPoolTiming]: { elapsedTime: 100000, timerTime: 100000 }
    });
    const supported = fixture();
    supported.lengths = [0, 1].map(() => ({
      ...supported.lengths[0],
      total_timer_time: 2000,
      total_elapsed_time: 2000
    }));
    supported.laps[0].total_timer_time = 4000;
    rejectImpossiblePoolTiming(supported);
    expect(supported.laps[0].total_timer_time).toBe(4000);
  });
});
