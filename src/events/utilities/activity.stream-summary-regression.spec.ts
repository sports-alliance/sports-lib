import { Activity } from '../../activities/activity';
import { ActivityParsingOptions } from '../../activities/activity-parsing-options';
import { ActivityTypes } from '../../activities/activity.types';
import { Creator } from '../../creators/creator';
import { DataAbsolutePressure } from '../../data/data.absolute-pressure';
import { DataAirPower } from '../../data/data.air-power';
import { DataAirPowerAvg } from '../../data/data.air-power-avg';
import { DataAirPowerMax } from '../../data/data.air-power-max';
import { DataAirPowerMin } from '../../data/data.air-power-min';
import { DataAltitude } from '../../data/data.altitude';
import { DataAltitudeSmooth } from '../../data/data.altitude-smooth';
import { DataCadence } from '../../data/data.cadence';
import { DataEffortPace } from '../../data/data.effort-pace';
import { DataEHPE } from '../../data/data.ehpe';
import { DataEVPE } from '../../data/data.evpe';
import { DataGrade } from '../../data/data.grade';
import { DataGradeAdjustedSpeed } from '../../data/data.grade-adjusted-speed';
import { DataGradeSmooth } from '../../data/data.grade-smooth';
import { DataGroundContactTime } from '../../data/data.ground-contact-time';
import { DataHeartRate } from '../../data/data.heart-rate';
import { DataLegStiffness } from '../../data/data.leg-stiffness';
import { DataNumberOfSatellites } from '../../data/data.number-of-satellites';
import { DataPower } from '../../data/data.power';
import {
  DataContactTimeToFlightTimeRatio,
  DataGroundContactTimePercentage,
  DataRunningFlightTime
} from '../../data/data.running-dynamics';
import { DataSatellite5BestSNR } from '../../data/data.satellite-5-best-snr';
import { DataSpeed } from '../../data/data.speed';
import { DataPotentialStamina, DataStamina } from '../../data/data.stamina';
import { DataStrokeRate } from '../../data/data.stroke-rate';
import { DataTemperature } from '../../data/data.temperature';
import { DynamicDataLoader } from '../../data/data.store';
import { DataVerticalOscillation } from '../../data/data.vertical-oscillation';
import { DataVerticalRatio } from '../../data/data.vertical-ratio';
import { DataVerticalSpeed } from '../../data/data.vertical-speed';
import { Lap } from '../../laps/lap';
import { LapTypes } from '../../laps/lap.types';
import { Stream } from '../../streams/stream';
import { EventImporterJSON } from '../adapters/importers/json/importer.json';
import { ActivityUtilities } from './activity.utilities';

interface StreamSummaryRegressionCase {
  name: string;
  streamType: string;
  values: number[];
  expected: { min: number; max: number; avg: number };
  types?: { min: string; max: string; avg: string };
}

const defaultOptions = new ActivityParsingOptions({
  generateUnitStreams: false,
  streams: {
    smooth: { altitudeSmooth: false, grade: false, gradeSmooth: false },
    fixAbnormal: { speed: false }
  }
});

const defaultValues = [1, 3, 2];

const regressionCases: StreamSummaryRegressionCase[] = [
  { name: 'altitude', streamType: DataAltitude.type, values: defaultValues, expected: { min: 1, max: 3, avg: 2 } },
  {
    name: 'heart rate',
    streamType: DataHeartRate.type,
    values: [100, 101, 103],
    expected: { min: 100, max: 103, avg: 101 }
  },
  {
    name: 'cadence',
    streamType: DataCadence.type,
    values: [0, 80, 100],
    expected: { min: 80, max: 100, avg: 90 }
  },
  {
    name: 'stroke rate',
    streamType: DataStrokeRate.type,
    values: [0, 30, 36],
    expected: { min: 30, max: 36, avg: 33 }
  },
  { name: 'speed', streamType: DataSpeed.type, values: defaultValues, expected: { min: 1, max: 3, avg: 2 } },
  {
    name: 'effort pace',
    streamType: DataEffortPace.type,
    values: defaultValues,
    expected: { min: 1, max: 3, avg: 2 }
  },
  {
    name: 'grade-adjusted speed',
    streamType: DataGradeAdjustedSpeed.type,
    values: defaultValues,
    expected: { min: 1, max: 3, avg: 2 }
  },
  { name: 'grade', streamType: DataGrade.type, values: defaultValues, expected: { min: 1, max: 3, avg: 2 } },
  {
    name: 'vertical speed',
    streamType: DataVerticalSpeed.type,
    values: defaultValues,
    expected: { min: 1, max: 3, avg: 2 }
  },
  { name: 'power', streamType: DataPower.type, values: defaultValues, expected: { min: 1, max: 3, avg: 2 } },
  {
    name: 'air power',
    streamType: DataAirPower.type,
    values: defaultValues,
    expected: { min: 1, max: 3, avg: 2 },
    types: { min: DataAirPowerMin.type, max: DataAirPowerMax.type, avg: DataAirPowerAvg.type }
  },
  {
    name: 'absolute pressure',
    streamType: DataAbsolutePressure.type,
    values: defaultValues,
    expected: { min: 1, max: 3, avg: 2 }
  },
  { name: 'EVPE', streamType: DataEVPE.type, values: defaultValues, expected: { min: 1, max: 3, avg: 2 } },
  { name: 'EHPE', streamType: DataEHPE.type, values: defaultValues, expected: { min: 1, max: 3, avg: 2 } },
  {
    name: 'satellite 5 best SNR',
    streamType: DataSatellite5BestSNR.type,
    values: defaultValues,
    expected: { min: 1, max: 3, avg: 2 }
  },
  {
    name: 'number of satellites',
    streamType: DataNumberOfSatellites.type,
    values: defaultValues,
    expected: { min: 1, max: 3, avg: 2 }
  },
  {
    name: 'temperature',
    streamType: DataTemperature.type,
    values: defaultValues,
    expected: { min: 1, max: 3, avg: 2 }
  },
  {
    name: 'ground contact time',
    streamType: DataGroundContactTime.type,
    values: defaultValues,
    expected: { min: 1, max: 3, avg: 2 }
  },
  {
    name: 'ground contact time percentage',
    streamType: DataGroundContactTimePercentage.type,
    values: [-1, 0, 50, 101, 75],
    expected: { min: 50, max: 75, avg: 62.5 }
  },
  {
    name: 'running flight time',
    streamType: DataRunningFlightTime.type,
    values: [-1, 0, 0.2],
    expected: { min: 0, max: 0.2, avg: 0.1 }
  },
  {
    name: 'contact-time-to-flight-time ratio',
    streamType: DataContactTimeToFlightTimeRatio.type,
    values: [-1, 0, 0.4],
    expected: { min: 0, max: 0.4, avg: 0.2 }
  },
  {
    name: 'leg stiffness',
    streamType: DataLegStiffness.type,
    values: defaultValues,
    expected: { min: 1, max: 3, avg: 2 }
  },
  {
    name: 'vertical oscillation',
    streamType: DataVerticalOscillation.type,
    values: defaultValues,
    expected: { min: 1, max: 3, avg: 2 }
  },
  {
    name: 'vertical ratio',
    streamType: DataVerticalRatio.type,
    values: defaultValues,
    expected: { min: 1, max: 3, avg: 2 }
  },
  {
    name: 'stamina',
    streamType: DataStamina.type,
    values: defaultValues,
    expected: { min: 1, max: 3, avg: 2 }
  },
  {
    name: 'potential stamina',
    streamType: DataPotentialStamina.type,
    values: defaultValues,
    expected: { min: 1, max: 3, avg: 2 }
  }
];

function getSummaryTypes(testCase: StreamSummaryRegressionCase): { min: string; max: string; avg: string } {
  return (
    testCase.types || {
      min: DynamicDataLoader.dataTypeMinDataType[testCase.streamType],
      max: DynamicDataLoader.dataTypeMaxDataType[testCase.streamType],
      avg: DynamicDataLoader.dataTypeAvgDataType[testCase.streamType]
    }
  );
}

function createActivity(type = ActivityTypes.Running): Activity {
  return new Activity(new Date(0), new Date(5000), type, new Creator('test'), defaultOptions);
}

describe('activity stream-summary regression coverage', () => {
  it.each(regressionCases)('derives the canonical $name min/avg/max family', testCase => {
    const activity = createActivity();
    const types = getSummaryTypes(testCase);
    activity.addStream(new Stream(testCase.streamType, testCase.values));

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(activity.getStat(types.min)?.getValue()).toBeCloseTo(testCase.expected.min, 10);
    expect(activity.getStat(types.max)?.getValue()).toBeCloseTo(testCase.expected.max, 10);
    expect(activity.getStat(types.avg)?.getValue()).toBeCloseTo(testCase.expected.avg, 10);
  });

  it.each(regressionCases)('preserves each explicit $name summary while deriving missing siblings', testCase => {
    const types = getSummaryTypes(testCase);
    (['min', 'max', 'avg'] as const).forEach(explicitAggregate => {
      const activity = createActivity();
      const explicitStat = DynamicDataLoader.getDataInstanceFromDataType(types[explicitAggregate], 42);
      activity.addStat(explicitStat);
      activity.addStream(new Stream(testCase.streamType, testCase.values));

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      expect(activity.getStat(types[explicitAggregate])).toBe(explicitStat);
      (['min', 'max', 'avg'] as const)
        .filter(aggregate => aggregate !== explicitAggregate)
        .forEach(aggregate => {
          expect(activity.getStat(types[aggregate])?.getValue()).toBeCloseTo(testCase.expected[aggregate], 10);
        });
    });
  });

  it('prefers smoothed altitude and grade streams', () => {
    const activity = createActivity();
    activity.addStream(new Stream(DataAltitude.type, [100, 200, 300]));
    activity.addStream(new Stream(DataAltitudeSmooth.type, [10, 20, 30]));
    activity.addStream(new Stream(DataGrade.type, [1, 2, 3]));
    activity.addStream(new Stream(DataGradeSmooth.type, [4, 5, 6]));

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(activity.getStat(DynamicDataLoader.dataTypeMinDataType[DataAltitude.type])?.getValue()).toBe(10);
    expect(activity.getStat(DynamicDataLoader.dataTypeAvgDataType[DataAltitude.type])?.getValue()).toBe(20);
    expect(activity.getStat(DynamicDataLoader.dataTypeMaxDataType[DataAltitude.type])?.getValue()).toBe(30);
    expect(activity.getStat(DynamicDataLoader.dataTypeMinDataType[DataGrade.type])?.getValue()).toBe(4);
    expect(activity.getStat(DynamicDataLoader.dataTypeAvgDataType[DataGrade.type])?.getValue()).toBe(5);
    expect(activity.getStat(DynamicDataLoader.dataTypeMaxDataType[DataGrade.type])?.getValue()).toBe(6);
  });

  it('excludes terrain summary families for Diving activities', () => {
    const activity = createActivity(ActivityTypes.Diving);
    activity.addStream(new Stream(DataAltitude.type, [-3, -2, -1]));
    activity.addStream(new Stream(DataGrade.type, [-10, 0, 10]));

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    [DataAltitude.type, DataGrade.type].forEach(streamType => {
      expect(activity.getStat(DynamicDataLoader.dataTypeMinDataType[streamType])).toBeUndefined();
      expect(activity.getStat(DynamicDataLoader.dataTypeAvgDataType[streamType])).toBeUndefined();
      expect(activity.getStat(DynamicDataLoader.dataTypeMaxDataType[streamType])).toBeUndefined();
    });
  });
});

describe('lap stream-summary derivation', () => {
  it.each(regressionCases)('derives the canonical $name min/avg/max family', testCase => {
    const activity = createActivity();
    const lap = new Lap(activity.startDate, activity.endDate, 1, LapTypes.Manual);
    const types = getSummaryTypes(testCase);
    activity.addLap(lap);
    activity.addStream(new Stream(testCase.streamType, testCase.values));

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(lap.getStat(types.min)?.getValue()).toBeCloseTo(testCase.expected.min, 10);
    expect(lap.getStat(types.max)?.getValue()).toBeCloseTo(testCase.expected.max, 10);
    expect(lap.getStat(types.avg)?.getValue()).toBeCloseTo(testCase.expected.avg, 10);
  });

  it.each(regressionCases)('preserves each explicit $name summary while deriving missing siblings', testCase => {
    const types = getSummaryTypes(testCase);
    (['min', 'max', 'avg'] as const).forEach(explicitAggregate => {
      const activity = createActivity();
      const lap = new Lap(activity.startDate, activity.endDate, 1, LapTypes.Manual);
      const explicitStat = DynamicDataLoader.getDataInstanceFromDataType(types[explicitAggregate], 42);
      lap.addStat(explicitStat);
      activity.addLap(lap);
      activity.addStream(new Stream(testCase.streamType, testCase.values));

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      expect(lap.getStat(types[explicitAggregate])).toBe(explicitStat);
      (['min', 'max', 'avg'] as const)
        .filter(aggregate => aggregate !== explicitAggregate)
        .forEach(aggregate => {
          expect(lap.getStat(types[aggregate])?.getValue()).toBeCloseTo(testCase.expected[aggregate], 10);
        });
    });
  });

  it('assigns a shared boundary to the next lap and includes the activity endpoint in the terminal lap', () => {
    const activity = new Activity(
      new Date(0),
      new Date(4000),
      ActivityTypes.Running,
      new Creator('test'),
      defaultOptions
    );
    const firstLap = new Lap(new Date(0), new Date(2000), 1, LapTypes.Manual);
    const secondLap = new Lap(new Date(2000), new Date(4000), 2, LapTypes.Manual);
    activity.addLap(firstLap).addLap(secondLap);
    activity.addStream(new Stream(DataSpeed.type, [1, 2, 3, 4, 5]));

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(firstLap.getStat(DynamicDataLoader.dataTypeMinDataType[DataSpeed.type])?.getValue()).toBe(1);
    expect(firstLap.getStat(DynamicDataLoader.dataTypeMaxDataType[DataSpeed.type])?.getValue()).toBe(2);
    expect(firstLap.getStat(DynamicDataLoader.dataTypeAvgDataType[DataSpeed.type])?.getValue()).toBe(1.5);
    expect(secondLap.getStat(DynamicDataLoader.dataTypeMinDataType[DataSpeed.type])?.getValue()).toBe(3);
    expect(secondLap.getStat(DynamicDataLoader.dataTypeMaxDataType[DataSpeed.type])?.getValue()).toBe(5);
    expect(secondLap.getStat(DynamicDataLoader.dataTypeAvgDataType[DataSpeed.type])?.getValue()).toBe(4);
  });

  it('includes a fractional activity endpoint projected onto the terminal 1 Hz slot', () => {
    const activity = new Activity(
      new Date(0),
      new Date(4500),
      ActivityTypes.Running,
      new Creator('test'),
      defaultOptions
    );
    const lap = new Lap(new Date(2000), activity.endDate, 1, LapTypes.Manual);
    activity.addLap(lap);
    activity.addStream(new Stream(DataPower.type, [1, 2, 3, 4, 5, 100]));

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(lap.getStat(DynamicDataLoader.dataTypeMinDataType[DataPower.type])?.getValue()).toBe(3);
    expect(lap.getStat(DynamicDataLoader.dataTypeMaxDataType[DataPower.type])?.getValue()).toBe(100);
    expect(lap.getStat(DynamicDataLoader.dataTypeAvgDataType[DataPower.type])?.getValue()).toBe(28);
  });

  it('calculates overlapping laps independently', () => {
    const activity = new Activity(
      new Date(0),
      new Date(4000),
      ActivityTypes.Running,
      new Creator('test'),
      defaultOptions
    );
    const firstLap = new Lap(new Date(0), new Date(3000), 1, LapTypes.Manual);
    const secondLap = new Lap(new Date(1000), new Date(4000), 2, LapTypes.Manual);
    activity.addLap(firstLap).addLap(secondLap);
    activity.addStream(new Stream(DataPower.type, [1, 2, 3, 4, 5]));

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(firstLap.getStat(DynamicDataLoader.dataTypeAvgDataType[DataPower.type])?.getValue()).toBe(2);
    expect(secondLap.getStat(DynamicDataLoader.dataTypeAvgDataType[DataPower.type])?.getValue()).toBe(3.5);
  });

  it('hydrates pace extrema from the derived lap speed summaries', () => {
    const activity = new Activity(
      new Date(0),
      new Date(2000),
      ActivityTypes.Running,
      new Creator('test'),
      defaultOptions
    );
    const lap = new Lap(activity.startDate, activity.endDate, 1, LapTypes.Manual);
    activity.addLap(lap);
    activity.addStream(new Stream(DataSpeed.type, [0, 3, 6]));

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(lap.getStat('Minimum Pace')?.getValue()).toBeCloseTo(1000 / 6, 10);
    expect(lap.getStat('Maximum Pace')?.getValue()).toBe(Infinity);
    expect(lap.getStat('Minimum Swim Pace')?.getValue()).toBeCloseTo(100 / 6, 10);
    expect(lap.getStat('Maximum Swim Pace')?.getValue()).toBe(Infinity);
  });

  it('adds no summaries when a lap window has no finite policy-valid samples', () => {
    const activity = new Activity(
      new Date(0),
      new Date(2000),
      ActivityTypes.Running,
      new Creator('test'),
      defaultOptions
    );
    const lap = new Lap(activity.startDate, activity.endDate, 1, LapTypes.Manual);
    activity.addLap(lap);
    activity.addStream(new Stream(DataVerticalRatio.type, [NaN, Infinity, -Infinity]));

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    expect(lap.getStat(DynamicDataLoader.dataTypeMinDataType[DataVerticalRatio.type])).toBeUndefined();
    expect(lap.getStat(DynamicDataLoader.dataTypeAvgDataType[DataVerticalRatio.type])).toBeUndefined();
    expect(lap.getStat(DynamicDataLoader.dataTypeMaxDataType[DataVerticalRatio.type])).toBeUndefined();
  });

  it('does not derive terrain summaries on Diving laps', () => {
    const activity = new Activity(
      new Date(0),
      new Date(2000),
      ActivityTypes.Diving,
      new Creator('test'),
      defaultOptions
    );
    const lap = new Lap(activity.startDate, activity.endDate, 1, LapTypes.Manual);
    activity.addLap(lap);
    activity.addStream(new Stream(DataAltitude.type, [-3, -2, -1]));
    activity.addStream(new Stream(DataGrade.type, [-10, 0, 10]));

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    [DataAltitude.type, DataGrade.type].forEach(streamType => {
      expect(lap.getStat(DynamicDataLoader.dataTypeMinDataType[streamType])).toBeUndefined();
      expect(lap.getStat(DynamicDataLoader.dataTypeAvgDataType[streamType])).toBeUndefined();
      expect(lap.getStat(DynamicDataLoader.dataTypeMaxDataType[streamType])).toBeUndefined();
    });
  });

  it('serializes derived canonical lap stats without unit variants and round-trips them', () => {
    const activity = new Activity(
      new Date(0),
      new Date(2000),
      ActivityTypes.Running,
      new Creator('test'),
      defaultOptions
    );
    const lap = new Lap(activity.startDate, activity.endDate, 1, LapTypes.Manual);
    activity.addLap(lap);
    activity.addStream(new Stream(DataSpeed.type, [1, 2, 3]));

    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

    const serialized = activity.toJSON();
    const serializedLapStats = serialized.laps[0].stats;
    expect(serializedLapStats[DynamicDataLoader.dataTypeAvgDataType[DataSpeed.type]]).toBe(2);
    DynamicDataLoader.allUnitDerivedDataTypes.forEach(type => expect(serializedLapStats[type]).toBeUndefined());

    const restored = EventImporterJSON.getActivityFromJSON(serialized);
    expect(restored.getLaps()[0].getStat(DynamicDataLoader.dataTypeAvgDataType[DataSpeed.type])?.getValue()).toBe(2);
  });

  it('keeps native JSON restoration snapshot-based for stream-only lap summaries', () => {
    const activity = new Activity(
      new Date(0),
      new Date(2000),
      ActivityTypes.Running,
      new Creator('test'),
      defaultOptions
    );
    activity.addLap(new Lap(activity.startDate, activity.endDate, 1, LapTypes.Manual));
    activity.addStream(new Stream(DataPower.type, [100, 200, 300]));

    const restored = EventImporterJSON.getActivityFromJSON(activity.toJSON());

    expect(restored.getLaps()[0].getStat(DynamicDataLoader.dataTypeAvgDataType[DataPower.type])).toBeUndefined();
  });
});
