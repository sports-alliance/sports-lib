import { Activity } from '../../activities/activity';
import { ActivityTypes } from '../../activities/activity.types';
import { ActivityParsingOptions } from '../../activities/activity-parsing-options';
import { Creator } from '../../creators/creator';
import { Stream } from '../../streams/stream';
import { DataDuration } from '../../data/data.duration';
import { DataTimerTime } from '../../data/data.timer-time';
import { DataMovingTime } from '../../data/data.moving-time';
import { DataStartEvent } from '../../data/data.start-event';
import { DataStopEvent } from '../../data/data.stop-event';
import { DataStopAllEvent } from '../../data/data.stop-all-event';
import { DataJumpEvent } from '../../data/data.jump-event';
import { DataTrainingStressScore } from '../../data/data.training-stress-score';
import { DataPowerWork } from '../../data/data.power-work';
import { DataSpeedAvg } from '../../data/data.speed-avg';
import { Lap } from '../../laps/lap';
import { LapTypes } from '../../laps/lap.types';
import { ActivityUtilities } from './activity.utilities';
import { EventImporterJSON } from '../adapters/importers/json/importer.json';
import { TssCalculator } from './tss/tss-calculator';
import {
  adjustedSpeedFromGrade,
  gradeFromDistance,
  gradeSamplesForSpeed,
  intervalAverage,
  movingSeconds,
  speedFromDistance
} from './distance-intervals';

const sparse = (end: number, points: number[][]) => {
  const values: (number | null)[] = Array(end + 1).fill(null);
  points.forEach(([time, value]) => (values[time] = value));
  return values;
};
const make = (distance: (number | null)[], grade = false) => {
  const seconds = distance.length - 1;
  const a = new Activity(
    new Date(0),
    new Date(seconds * 1000),
    ActivityTypes.Cycling,
    new Creator('Synthetic'),
    new ActivityParsingOptions({
      generateUnitStreams: true,
      streams: { smooth: { altitudeSmooth: false, grade, gradeSmooth: grade } }
    })
  );
  a.addStat(new DataDuration(seconds));
  a.addStat(new DataTimerTime(seconds));
  a.addStream(new Stream('Distance', [...distance]));
  a.addStream(new Stream('Heart Rate', Array(distance.length).fill(140)));
  a.addStream(
    new Stream(
      'Latitude',
      Array.from({ length: distance.length }, (_, i) => 10 + i * 0.00001)
    )
  );
  a.addStream(new Stream('Longitude', Array(distance.length).fill(30)));
  return a;
};
const value = (a: Activity, type: string) => a.getStat(type)?.getValue();

describe('distance interval evidence', () => {
  it('retains supported adjusted-speed weights beside an unsupported stationary crop boundary', () => {
    const speed = new Stream('Speed', [0, 2, 2], {
      direction: 'ending',
      durations: [null, 1, 1]
    });
    const grade = new Stream('Grade', [0, 0, null], {
      direction: 'starting',
      durations: [1, 1, null]
    });
    const adjusted = adjustedSpeedFromGrade(speed, grade);
    expect(adjusted.getData()[0]).toBe(0);
    expect(adjusted.getIntervalSupport()).toEqual({ direction: 'ending', durations: [null, 1, 1] });
    expect(intervalAverage(adjusted)).toBe(adjusted.getData()[1]);
    const json = JSON.parse(JSON.stringify(adjusted.toJSON()));
    expect(intervalAverage(new Stream(json.type, json.data, json.intervalSupport))).toBe(intervalAverage(adjusted));
    expect(speed.getData()).toEqual([0, 2, 2]);
  });

  it('uses supported terrain between slower altitude observations without crossing a real gap', () => {
    const a = make(Array.from({ length: 11 }, (_, i) => i * 2));
    const gradeData = sparse(10, [
      [0, 10],
      [8, 20]
    ]);
    const grade = new Stream('Grade', gradeData, {
      direction: 'starting',
      durations: sparse(10, [
        [0, 5],
        [8, 2]
      ])
    });
    expect(gradeSamplesForSpeed(new Stream('Speed', Array(11).fill(2)), grade)).toEqual([
      10,
      10,
      10,
      10,
      10,
      10,
      null,
      null,
      20,
      20,
      20
    ]);
    expect(gradeSamplesForSpeed(speedFromDistance(a, a.getStreamData('Distance')), grade)).toEqual([
      null,
      10,
      10,
      10,
      10,
      10,
      null,
      null,
      null,
      20,
      20
    ]);
    expect(grade.getData()).toEqual(gradeData);
  });

  it('keeps pace TSS available with one-second speed and two-second terrain observations', () => {
    const a = make(Array.from({ length: 61 }, (_, i) => i * 3));
    a.type = ActivityTypes.Running;
    a.parseOptions = new ActivityParsingOptions({
      tss: {
        enableHeuristicFallbacks: false,
        overrides: { functionalThresholdPace: 3 }
      }
    });
    a.addStream(new Stream('Speed', Array(61).fill(3)));
    const grade = new Stream(
      'Grade',
      Array.from({ length: 61 }, (_, i) => (i < 60 && i % 2 === 0 ? 0 : null)),
      {
        direction: 'starting',
        durations: Array.from({ length: 61 }, (_, i) => (i < 60 && i % 2 === 0 ? 2 : null))
      }
    );
    a.addStream(grade);
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(a);
    expect(value(a, 'Training Stress Score Method')).toBe('PACE');
    expect(value(a, 'Training Stress Score')).toBe(1.7);
    expect(grade.getData().filter(Number.isFinite)).toHaveLength(30);
  });

  it('does not manufacture dense speed samples to satisfy pace-TSS coverage', () => {
    const distance = Array.from({ length: 61 }, (_, i) => (i % 2 === 0 ? i * 3 : null));
    const a = make(distance);
    a.type = ActivityTypes.Running;
    a.parseOptions = new ActivityParsingOptions({
      tss: {
        enableHeuristicFallbacks: false,
        overrides: { functionalThresholdPace: 3 }
      }
    });
    a.addStream(speedFromDistance(a, distance));
    gradeFromDistance(a, distance, Array(61).fill(0), false).forEach(stream => a.addStream(stream));
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(a);
    expect(a.getStreamData('Speed').filter(Number.isFinite)).toHaveLength(30);
    expect(value(a, 'Training Stress Score')).toBeUndefined();
    expect(a.getStreamData('Distance')).toEqual(distance);
  });

  it('pairs generated pace-TSS speed with its own grade interval, including the final interval', () => {
    const a = make(Array.from({ length: 61 }, (_, i) => i * 3));
    a.type = ActivityTypes.Running;
    a.parseOptions = new ActivityParsingOptions({
      tss: {
        enableHeuristicFallbacks: false,
        overrides: { functionalThresholdPace: 3 }
      }
    });
    a.addStream(speedFromDistance(a, a.getStreamData('Distance')));
    // Each grade is attached to the beginning of the interval; speed ends it.
    a.addStream(
      new Stream(
        'Grade',
        Array.from({ length: 61 }, (_, i) => (i < 60 ? (i < 30 ? -10 : 10) : null)),
        {
          direction: 'starting',
          durations: Array.from({ length: 61 }, (_, i) => (i < 60 ? 1 : null))
        }
      )
    );
    const calculate = jest.spyOn(TssCalculator, 'calculatePaceTss');
    try {
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(a);
      const input = calculate.mock.calls[0][0];
      expect(input.samples).toHaveLength(60);
      expect(input.samples[29]).toMatchObject({ duration: 30, speed: 3, grade: -0.1 });
      expect(input.samples[30]).toMatchObject({ duration: 31, speed: 3, grade: 0.1 });
      expect(input.samples[59]).toMatchObject({ duration: 60, speed: 3, grade: 0.1 });
      expect(value(a, 'Training Stress Score Method')).toBe('PACE');
    } finally {
      calculate.mockRestore();
    }
  });

  it.each([
    [
      [0, null, 4, null, 8],
      [null, null, 2, null, 2]
    ],
    [
      [null, null, 100, null, 104],
      [null, null, null, null, 2]
    ],
    [
      [null, 100, null],
      [null, null, null]
    ],
    [
      [0, 0, 0],
      [null, 0, 0]
    ],
    [
      [0, 10, 2, 12],
      [null, 10, null, 10]
    ],
    [
      [0, NaN, 4, 6],
      [null, null, null, 2]
    ],
    [
      [0, -1, 4, 6],
      [null, null, null, 2]
    ],
    [
      [null, null, null],
      [null, null, null]
    ]
  ])('derives only supported rates for %j', (distance, expected) => {
    const a = make(distance);
    expect(speedFromDistance(a, distance).getData()).toEqual(expected);
    expect(a.getStreamData('Distance')).toEqual(distance);
  });

  it('weights unequal intervals and requires a supported interval inside a lap', () => {
    const distance = sparse(10, [
      [0, 0],
      [1, 1],
      [10, 19]
    ]);
    const speed = speedFromDistance(make(distance), distance);
    expect(intervalAverage(speed)).toBeCloseTo(1.9);
    expect(intervalAverage(speed, 0, 1)).toBe(1);
    expect(intervalAverage(speed, 1, 10)).toBe(2);
    expect(intervalAverage(speed, 2, 8)).toBeNull();
  });

  it.each([DataStopEvent, DataStopAllEvent])('never joins a pair across %s', Stop => {
    const distance = sparse(60, [
      [0, 0],
      [20, 40],
      [40, 40],
      [60, 80]
    ]);
    const a = make(distance);
    a.setAllEvents([new DataStartEvent(0), new Stop(20), new DataStartEvent(40), new Stop(60)]);
    const speed = speedFromDistance(a, distance);
    expect(speed.getData()[20]).toBe(2);
    expect(speed.getData()[40]).toBeNull();
    expect(speed.getData()[60]).toBe(2);
    expect(movingSeconds(a, speed, 0.5)).toBe(40);
    const spanning = speedFromDistance(
      a,
      sparse(60, [
        [0, 0],
        [60, 80]
      ])
    );
    expect(intervalAverage(spanning)).toBeNull();
    expect(movingSeconds(a, spanning, 0.5)).toBeNull();
  });

  it('keeps explicit zero moving time and distinguishes absent coverage', () => {
    const a = make([0, 0, 0]);
    expect(movingSeconds(a, speedFromDistance(a, [0, 0, 0]), 0.5)).toBe(0);
    expect(movingSeconds(a, speedFromDistance(a, [null, 0, null]), 0.5)).toBeNull();
    a.setAllEvents([new DataStopEvent(-1)]);
    expect(movingSeconds(a, new Stream('Speed', [2, 2, 2]), 0.5)).toBeNull();
  });

  it('invalidates interval weights through the public sample setter and JSON roundtrip', () => {
    const a = make(
      sparse(10, [
        [0, 0],
        [1, 1],
        [10, 19]
      ])
    );
    a.addStream(speedFromDistance(a, a.getStreamData('Distance')));
    a.addDataToStream('Speed', new Date(5000), 10);
    expect(a.getStream('Speed').getIntervalSupport?.()).toBeUndefined();
    expect(a.getStreamData('Speed')[5]).toBe(10);
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(a);
    expect(value(a, 'Average Speed')).toBeCloseTo(13 / 3);
    const restored = EventImporterJSON.getActivityFromJSON(JSON.parse(JSON.stringify(a.toJSON())));
    restored.removeStat('Average Speed');
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(restored);
    expect(restored.getStat('Average Speed')?.getValue()).toBeCloseTo(13 / 3);
    expect(restored.getStream('Speed').getIntervalSupport?.()).toBeUndefined();
  });

  it('edits original values without persisting a filtered view or reviving stale weights', () => {
    const a = make([0, null, 4]);
    const speed = speedFromDistance(a, a.getStreamData('Distance'));
    a.addStream(speed);
    speed.useFilter({ filterData: data => data.map(v => (v === null ? null : v * 2)) });
    a.addDataToStream('Speed', new Date(1000), 5);
    expect(speed.getData()).toEqual([null, 10, 4]);
    expect(speed.toJSON().data).toEqual([null, 5, 2]);
    speed.clearFilters();
    expect(speed.getIntervalSupport()).toBeUndefined();
  });

  it.each([
    {
      start: 20,
      end: 70,
      moving: 30,
      events: [
        ['Stop ALL Event', 20],
        ['Start Event', 40]
      ]
    },
    {
      start: 50,
      end: 90,
      moving: 30,
      events: [
        ['Stop ALL Event', 0],
        ['Start Event', 10]
      ]
    },
    { start: 60, end: 90, moving: 30, events: [['Start Event', 0]] },
    { start: 0, end: 30, moving: 30, events: [['Start Event', 0]] }
  ])('rebases crop $start–$end and retains the timer state at its start', ({ start, end, moving, events }) => {
    const a = make(Array.from({ length: 101 }, (_, i) => i * 2));
    a.addStream(new Stream('Speed', Array(101).fill(2)));
    const sourceEvents = [
      new DataStartEvent(60),
      new DataStopAllEvent(40),
      new DataStopEvent(100),
      new DataStartEvent(0)
    ];
    const before = sourceEvents.map(event => event.toJSON());
    a.setAllEvents(sourceEvents);
    ActivityUtilities.cropTime(a, new Date(start * 1000), new Date(end * 1000));
    expect(a.getAllEvents().map(event => [event.getType(), event.timestamp])).toEqual(events);
    expect(sourceEvents.map(event => event.toJSON())).toEqual(before);
    expect(a.getStreamData('Distance')[0]).toBe(start * 2);
    expect(movingSeconds(a, a.getStream('Speed'), 0.5)).toBe(moving);
    a.addStat(new DataDuration(moving));
    a.addStat(new DataTimerTime(moving));
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(a);
    expect(value(a, 'Moving time')).toBe(moving);
    const restored = EventImporterJSON.getActivityFromJSON(JSON.parse(JSON.stringify(a.toJSON())));
    expect(movingSeconds(restored, restored.getStream('Speed'), 0.5)).toBe(moving);
  });

  it('keeps one-sided crops on the original clock and rebases repeated crops once', () => {
    const a = make(Array.from({ length: 101 }, (_, i) => i));
    a.addStream(new Stream('Speed', Array(101).fill(2)));
    a.setAllEvents([new DataStartEvent(0), new DataStopEvent(40), new DataStartEvent(60), new DataStopEvent(100)]);
    ActivityUtilities.cropTime(a, new Date(20000));
    expect(a.getStreamData('Distance')[0]).toBe(20);
    expect(a.getAllEvents().map(event => event.timestamp)).toEqual([20, 40, 80]);
    ActivityUtilities.cropTime(a, undefined, new Date(70000));
    expect(a.getStreamData('Distance').slice(-1)[0]).toBe(70);
    expect(movingSeconds(a, a.getStream('Speed'), 0.5)).toBe(30);
    ActivityUtilities.cropTime(a, new Date(50000), new Date(70000));
    expect(a.getAllEvents().map(event => [event.getType(), event.timestamp])).toEqual([
      [DataStopEvent.type, 0],
      [DataStartEvent.type, 10]
    ]);
    expect(movingSeconds(a, a.getStream('Speed'), 0.5)).toBe(10);
  });

  it('keeps fractional crop requests on the source sample clock and validates before changing data', () => {
    const a = make(Array.from({ length: 101 }, (_, i) => i));
    a.startDate = new Date(456);
    a.endDate = new Date(100456);
    a.setAllEvents([new DataStartEvent(0), new DataStopEvent(40), new DataStartEvent(60)]);
    ActivityUtilities.cropTime(a, new Date(20956), new Date(70956));
    expect(+a.startDate).toBe(21456);
    expect(+a.endDate).toBe(70956);
    expect(a.getStreamData('Distance')[0]).toBe(21);
    expect(a.getAllEvents().map(event => event.timestamp)).toEqual([19, 39]);
    const before = JSON.stringify(a.toJSON());
    expect(() => ActivityUtilities.cropTime(a, new Date(80000))).toThrow(RangeError);
    expect(JSON.stringify(a.toJSON())).toBe(before);
  });

  it('leaves an omitted crop unchanged and does not extend a crop beyond the original activity', () => {
    const a = make([0, 1, 2]);
    const stream = a.getStream('Distance');
    ActivityUtilities.cropTime(a);
    expect(a.getStream('Distance')).toBe(stream);
    ActivityUtilities.cropTime(a, new Date(-1000), new Date(4000));
    expect(+a.startDate).toBe(0);
    expect(+a.endDate).toBe(2000);
    expect(a.getStreamData('Distance')).toEqual([0, 1, 2]);
  });

  it('crops other timed events without losing their payload or mutating shared event objects', () => {
    const a = make(Array(101).fill(0));
    const jump = new DataJumpEvent(30, { distance: 5, score: 8, height: 1 });
    const outside = new DataJumpEvent(80, { distance: 7, score: 9 });
    a.setAllEvents([jump, outside]);
    ActivityUtilities.cropTime(a, new Date(20000), new Date(70000));
    expect(a.getAllEvents()).toHaveLength(1);
    expect(a.getAllEvents()[0]).toBeInstanceOf(DataJumpEvent);
    expect(a.getAllEvents()[0].toJSON()).toEqual({
      [DataJumpEvent.type]: {
        timestamp: 10,
        jumpData: { distance: 5, score: 8, height: 1 }
      }
    });
    expect(jump.timestamp).toBe(30);
    expect(outside.timestamp).toBe(80);
  });

  it('invalidates interval weights when a caller replaces stream data', () => {
    const a = make([0, null, 4]);
    const speed = speedFromDistance(a, a.getStreamData('Distance'));
    speed.setData([1, 2, 3]);
    expect(intervalAverage(speed)).toBeUndefined();
  });

  it('round-trips interval weights and recalculates the same sparse summaries', () => {
    const a = make(
      sparse(10, [
        [0, 0],
        [1, 1],
        [10, 19]
      ]),
      true
    );
    a.addStream(
      new Stream(
        'Altitude',
        Array.from({ length: 11 }, (_, i) => i)
      )
    );
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(a);
    const json = JSON.parse(JSON.stringify(a.toJSON()));
    const restored = EventImporterJSON.getActivityFromJSON(json);
    for (const type of ['Speed', 'Grade', 'Grade Smooth', 'Grade Adjusted Speed']) {
      const stream = a.getStream(type);
      expect(restored.getStream(type).toJSON()).toEqual(stream.toJSON());
      expect(intervalAverage(restored.getStream(type))).toEqual(intervalAverage(stream));
    }
    restored.removeStat('Average Speed');
    restored.removeStat('Moving time');
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(restored);
    expect(restored.getStat('Average Speed')?.getValue()).toBe(1.9);
    expect(restored.getStat('Moving time')?.getValue()).toBe(9);
  });

  it('retains crop weights without guessing partial boundary intervals', () => {
    const a = make(
      sparse(10, [
        [0, 0],
        [1, 1],
        [10, 19]
      ])
    );
    a.addStream(speedFromDistance(a, a.getStreamData('Distance')));
    ActivityUtilities.cropTime(a, new Date(1000), new Date(10000));
    expect(intervalAverage(a.getStream('Speed'))).toBe(2);
    expect(a.getStreamData('Speed')[0]).toBe(1); // Source sample retained; crossing weight omitted.
    expect(a.getStream('Speed').getIntervalSupport?.()?.durations[0]).toBeNull();
  });

  it('retains interval clocks through cloning and value-only shaping', () => {
    const a = make(
      sparse(10, [
        [0, 0],
        [1, 1],
        [10, 19]
      ])
    );
    a.addStream(speedFromDistance(a, a.getStreamData('Distance')));
    ActivityUtilities.cloneStream(a, 'Speed', 'Grade Adjusted Speed');
    expect(intervalAverage(a.getStream('Grade Adjusted Speed'))).toBe(1.9);
    ActivityUtilities.shapeStream('Speed', a, values => values.map(value => value * 2));
    expect(intervalAverage(a.getStream('Speed'))).toBe(3.8);
    expect(a.getStreamData('Speed')[2]).toBeNull();
  });

  it('pairs terrain observations without filling either input', () => {
    const distance = sparse(20, [
      [0, 0],
      [5, 10],
      [10, 20],
      [15, 30],
      [20, 40]
    ]);
    const altitude = Array.from({ length: 21 }, (_, i) => i * 0.2);
    const a = make(distance);
    const [grade] = gradeFromDistance(a, distance, altitude, false);
    expect(grade.getData()).toEqual(
      sparse(20, [
        [0, 10],
        [5, 10],
        [10, 10],
        [15, 10]
      ])
    );
    expect(intervalAverage(grade)).toBe(10);
    const speed = speedFromDistance(a, distance);
    const adjusted = adjustedSpeedFromGrade(speed, grade);
    expect(adjusted.getData()).toEqual(
      sparse(20, [
        [5, 2.94],
        [10, 2.94],
        [15, 2.94],
        [20, 2.94]
      ])
    );
    expect(intervalAverage(adjusted)).toBe(2.94);
  });

  it('does not infer flat grade from a stationary or terminal observation', () => {
    const a = make([0, 0, 0]);
    const [grade] = gradeFromDistance(a, [0, 0, 0], [10, 11, 12], false);
    expect(grade.getData()).toEqual([null, null, null]);
    expect(adjustedSpeedFromGrade(new Stream('Speed', [0, 2, null]), grade).getData()).toEqual([0, null, null]);
  });

  it('retains the look-ahead slope across genuine repeated distance readings', () => {
    const distance = [0, 0, 4, 4, 8];
    const a = make(distance);
    const [grade] = gradeFromDistance(a, distance, [0, 0, 0.4, 0.4, 0.8], false);
    expect(grade.getData()).toEqual([10, 10, 10, 10, null]);
    expect(gradeSamplesForSpeed(new Stream('Speed', Array(5).fill(2)), grade)).toEqual([10, 10, 10, 10, 10]);
    expect(a.getStreamData('Distance')).toEqual(distance);
  });

  it('splits grade look-ahead and smoothing at resets and pauses', () => {
    const distance = [0, 10, 0, 10, 20, 30];
    const a = make(distance);
    a.addEvent(new DataStopEvent(4));
    a.addEvent(new DataStartEvent(5));
    const [grade, smooth] = gradeFromDistance(a, distance, [0, 1, 100, 102, 104, 106], true);
    expect(grade.getData()).toEqual([10, null, 20, 20, null, null]);
    expect(smooth.getData()[2]).toBe(20);
  });
});

describe('sparse distance generation and persistence', () => {
  it('preserves missingness, unit masks and all independent timestamps', () => {
    const distance = sparse(60, [
      [5, 100],
      [30, 150],
      [60, 210]
    ]);
    const a = make(distance);
    a.addStream(new Stream('Time', Array(61).fill(999)));
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(a);
    expect(a.getStreamData('Distance')).toEqual(distance);
    expect(a.getStreamData('Distance in miles').map(Number.isFinite)).toEqual(distance.map(Number.isFinite));
    const json = JSON.parse(JSON.stringify(a.toJSON()));
    expect(json.streams.filter((s: { type: string }) => s.type === 'Time')).toHaveLength(1);
    expect(json.streams.find((s: { type: string }) => s.type === 'Time').data).toEqual(
      Array.from({ length: 61 }, (_, i) => i)
    );
    expect(a.getStreamData('Heart Rate')).toEqual(Array(61).fill(140));
  });

  it.each([0, 2147483647456])(
    'uses weighted generated summaries at epoch %s without losing boundary intervals',
    epoch => {
      const a = make(
        sparse(10, [
          [0, 0],
          [1, 1],
          [10, 19]
        ])
      );
      a.startDate = new Date(epoch);
      a.endDate = new Date(epoch + 10000);
      a.addLap(new Lap(new Date(epoch), new Date(epoch + 1000), 1, LapTypes.Manual));
      a.addLap(new Lap(new Date(epoch + 1000), new Date(epoch + 10000), 2, LapTypes.Manual));
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(a);
      expect(value(a, 'Average Speed')).toBeCloseTo(1.9);
      expect(a.getLaps().map(lap => lap.getStat('Average Speed')?.getValue())).toEqual([1, 2]);
      expect(a.getLaps().map(lap => lap.getStat('Minimum Speed')?.getValue())).toEqual([1, 2]);
      expect(a.getLaps().map(lap => lap.getStat('Maximum Speed')?.getValue())).toEqual([1, 2]);
      expect(value(a, 'Moving time')).toBe(9); // First interval is below the existing cycling moving threshold.
    }
  );

  it('keeps measured stationary zero and does not fill unavailable movement with timer time', () => {
    const stationary = make([0, 0, 0]);
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(stationary);
    expect(value(stationary, 'Moving time')).toBe(0);
    const missing = make([null, 100, null]);
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(missing);
    expect(value(missing, 'Moving time')).toBeUndefined();
    expect(value(missing, 'Average Speed')).toBeUndefined();
  });

  it.each([
    [0, 0],
    [200, 0.4]
  ])('does not equate zero movement with zero work at %s watts', (power, expectedWork) => {
    const a = make([0, 0, 0]);
    a.addStream(new Stream('Power', Array(3).fill(power)));
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(a);
    expect(value(a, 'Moving time')).toBe(0);
    expect(value(a, 'Power Work')).toBe(expectedWork);
    a.addStat(new DataPowerWork(10));
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(a);
    expect(value(a, 'Power Work')).toBe(10);
  });

  it('preserves recorded speed, summaries and imported scores across repeated generation', () => {
    const a = make(
      sparse(60, [
        [0, 0],
        [60, 120]
      ])
    );
    a.addStream(new Stream('Speed', Array(61).fill(3)));
    a.addStat(new DataSpeedAvg(4));
    a.addStat(new DataMovingTime(55));
    a.addStat(new DataTrainingStressScore(42));
    for (let i = 0; i < 3; i++) {
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(a);
      expect(a.getStreamData('Speed')).toEqual(Array(61).fill(3));
      expect(value(a, 'Average Speed')).toBe(4);
      expect(value(a, 'Moving time')).toBe(55);
      expect(value(a, 'Training Stress Score')).toBe(42);
      expect(a.getStreamData('Distance')).toEqual(
        sparse(60, [
          [0, 0],
          [60, 120]
        ])
      );
    }
  });

  it('does not invent a GPS position at time zero or replace recorded smoothed grade', () => {
    const a = make([null, null, null, null, null], true);
    a.removeStream('Distance');
    a.getStream('Latitude').setData([null, null, 10, null, 10.0001]);
    a.getStream('Longitude').setData([null, null, 30, null, 30]);
    a.addStream(new Stream('Altitude', [null, null, 100, null, 101]));
    a.addStream(new Stream('Grade Smooth', [null, null, 2, null, 3]));
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(a);
    expect(a.getStreamData('Distance').slice(0, 3)).toEqual([null, null, 0]);
    expect(a.getStreamData('Speed').slice(0, 3)).toEqual([null, null, null]);
    expect(a.getStreamData('Grade Smooth')).toEqual([null, null, 2, null, 3]);
  });

  it('retains the first GPS point as the distance origin when it is at time zero', () => {
    const a = make([null, null, null]);
    a.removeStream('Distance');
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(a);
    expect(a.getStreamData('Distance')[0]).toBe(0);
    expect(a.getStreamData('Distance')[2]).toBeGreaterThan(0);
    expect(a.getStat('Distance')?.getValue()).toBe(a.getStreamData('Distance')[2]);
  });

  it('keeps GNSS distance unavailable when position streams have no valid pairs', () => {
    const a = make([null, null, null]);
    a.getStream('Latitude').setData([null, null, null]);
    a.getStream('Longitude').setData([null, null, null]);
    expect(() => ActivityUtilities.generateMissingStreamsAndStatsForActivity(a)).not.toThrow();
    expect(a.getStat('GNSS Distance')).toBeUndefined();
    expect(a.getStreamData('Distance')).toEqual([null, null, null]);
  });

  it.each([
    { name: 'incomplete', laps: [[0, 5, 5]], expected: undefined },
    {
      name: 'overlapping',
      laps: [
        [0, 6, 3],
        [5, 10, 3]
      ],
      expected: undefined
    },
    {
      name: 'missing movement',
      laps: [
        [0, 5, 5],
        [5, 10, null]
      ],
      expected: undefined
    },
    {
      name: 'complete movement',
      laps: [
        [0, 5, 5],
        [5, 10, 5]
      ],
      expected: 10
    },
    {
      name: 'complete stationary',
      laps: [
        [0, 5, 0],
        [5, 10, 0]
      ],
      expected: 0
    }
  ])('requires complete nonoverlapping moving-time evidence: $name', ({ laps, expected }) => {
    const a = make(Array(11).fill(null));
    laps.forEach(([start, end, moving], index) => {
      const lap = new Lap(new Date(start! * 1000), new Date(end! * 1000), index + 1, LapTypes.Manual);
      if (moving !== null) lap.addStat(new DataMovingTime(moving));
      a.addLap(lap);
    });
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(a);
    expect(a.getStat('Moving time')?.getValue()).toBe(expected);
  });

  it('keeps multisport stationary zero and does not publish partial moving totals', () => {
    const first = make([0, 0, 0]),
      second = make([0, 0, 0]);
    [first, second].forEach(activity => ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity));
    first.addStat(new DataMovingTime(0));
    second.addStat(new DataMovingTime(0));
    const total = () =>
      ActivityUtilities.getSummaryStatsForActivities([first, second]).find(s => s.getType() === DataMovingTime.type);
    expect(total()?.getValue()).toBe(0);
    second.removeStat(DataMovingTime.type);
    expect(total()).toBeUndefined();
    first.addStat(new DataMovingTime(1));
    expect(total()).toBeUndefined();
  });
});
