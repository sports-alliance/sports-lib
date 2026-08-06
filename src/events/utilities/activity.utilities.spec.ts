import { Event } from '../event';
import { DataSpeedMaxKilometersPerHour } from '../../data/data.speed-max';

import { Activity } from '../../activities/activity';
import { ActivityParsingOptions } from '../../activities/activity-parsing-options';
import { DataHeartRate } from '../../data/data.heart-rate';
import { DataAltitude } from '../../data/data.altitude';
import { DataPower } from '../../data/data.power';
import { DataDistance, DataDistanceMiles } from '../../data/data.distance';
import { DataDuration } from '../../data/data.duration';
import { EventInterface } from '../event.interface';
import { Creator } from '../../creators/creator';
import { ActivityTypes } from '../../activities/activity.types';
import { Stream, StreamJSONInterface } from '../../streams/stream';
import { ActivityUtilities } from './activity.utilities';
import { DataSpeed } from '../../data/data.speed';
import { Lap } from '../../laps/lap';
import { DataSpeedAvg } from '../../data/data.speed-avg';
import { LapTypes } from '../../laps/lap.types';
import { DataTime } from '../../data/data.time';
import { FileType } from '../adapters/file-type.enum';
import { EventImporterJSON } from '../adapters/importers/json/importer.json';
import { ActivityInterface } from '../../activities/activity.interface';
import { DataPace, DataPaceMinutesPerMile } from '../../data/data.pace';
import { DataPaceAvg } from '../../data/data.pace-avg';
import { DataPaceMax } from '../../data/data.pace-max';
import { DataPaceMin } from '../../data/data.pace-min';
import { DataSpeedKilometersPerHour } from '../../data/data.speed';
import { DataSwimPace } from '../../data/data.swim-pace';
import { DataSwimPaceAvg } from '../../data/data.swim-pace-avg';
import { DataSwimPaceMax } from '../../data/data.swim-pace-max';
import { DataSwimPaceMin } from '../../data/data.swim-pace-min';
import { DataGradeAdjustedSpeed } from '../../data/data.grade-adjusted-speed';
import { DataGradeAdjustedPaceMin } from '../../data/data.grade-adjusted-pace-min';
import { DataStepLength } from '../../data/data.step-length';
import { DataGNSSDistance } from '../../data/data.gnss-distance';
import { DataGNSSDistanceMiles } from '../../data/data.gnss-distance-miles';
import { DataAscent } from '../../data/data.ascent';
import { DataDescent } from '../../data/data.descent';
import { DataAbsolutePressure } from '../../data/data.absolute-pressure';
import { DataAbsolutePressureAvg } from '../../data/data.absolute-pressure-avg';
import { DataAbsolutePressureMax } from '../../data/data.absolute-pressure-max';
import { DataAbsolutePressureMin } from '../../data/data.absolute-pressure-min';
import { DataEVPE } from '../../data/data.evpe';
import { DataEVPEMin } from '../../data/data.evpe-min';
import { DataEVPEMax } from '../../data/data.evpe-max';
import { DataEVPEAvg } from '../../data/data.evpe-avg';
import { DataEHPE } from '../../data/data.ehpe';
import { DataEHPEMin } from '../../data/data.ehpe-min';
import { DataEHPEMax } from '../../data/data.ehpe-max';
import { DataEHPEAvg } from '../../data/data.ehpe-avg';
import { DataSatellite5BestSNR } from '../../data/data.satellite-5-best-snr';
import { DataSatellite5BestSNRMin } from '../../data/data.satellite-5-best-snr-min';
import { DataSatellite5BestSNRMax } from '../../data/data.satellite-5-best-snr-max';
import { DataSatellite5BestSNRAvg } from '../../data/data.satellite-5-best-snr-avg';
import { DataNumberOfSatellites } from '../../data/data.number-of-satellites';
import { DataNumberOfSatellitesMin } from '../../data/data.number-of-satellites-min';
import { DataNumberOfSatellitesMax } from '../../data/data.number-of-satellites-max';
import { DataNumberOfSatellitesAvg } from '../../data/data.number-of-satellites-avg';
import { DataGrade } from '../../data/data.grade';
import { DataGradeMin } from '../../data/data.grade-min';
import { DataGradeMax } from '../../data/data.grade-max';
import { DataGradeAvg } from '../../data/data.grade-avg';
import { DataLegStiffness } from '../../data/data.leg-stiffness';
import { DataLegStiffnessMin } from '../../data/data.leg-stiffness-min';
import { DataLegStiffnessMax } from '../../data/data.leg-stiffness-max';
import { DataLegStiffnessAvg } from '../../data/data.leg-stiffness-avg';
import { DataVerticalRatio } from '../../data/data.vertical-ratio';
import { DataVerticalRatioMin } from '../../data/data.vertical-ratio-min';
import { DataVerticalRatioMax } from '../../data/data.vertical-ratio-max';
import { DataVerticalRatioAvg } from '../../data/data.vertical-ratio-avg';
import {
  DataPotentialStamina,
  DataPotentialStaminaAvg,
  DataPotentialStaminaMax,
  DataPotentialStaminaMin,
  DataStamina,
  DataStaminaAvg,
  DataStaminaMax,
  DataStaminaMin
} from '../../data/data.stamina';
import { DataPowerAvg } from '../../data/data.power-avg';
import { DataPowerBalanceLeft } from '../../data/data.power-balance-left';
import { DataPowerBalanceRight } from '../../data/data.power-balance-right';
import { DataPowerWattsPerKg } from '../../data/data.power-watts-per-kg';
import { DataWeight } from '../../data/data.weight';
import { IBIStream } from '../../streams/ibi-stream';
import { DataIBI } from '../../data/data.ibi';
import {
  DataImpactLoadingRateBalanceLeft,
  DataImpactLoadingRateBalanceRight,
  DataLegSpringStiffnessBalanceLeft,
  DataLegSpringStiffnessBalanceRight,
  DataVerticalOscillationBalanceLeft,
  DataVerticalOscillationBalanceRight
} from '../../data/data.running-dynamics-balance';

describe('Activity Utilities', () => {
  let event: EventInterface;

  beforeEach(() => {
    event = new Event('New name', new Date(0), new Date(200), FileType.FIT);
    const activity = new Activity(
      new Date(0),
      new Date(new Date(0).getTime() + 10000),
      ActivityTypes.Running,
      new Creator('Test')
    );
    activity.setDuration(new DataDuration(10));
    activity.setDistance(new DataDistance(10));
    event.addActivity(activity);
  });

  it('should get the correct minimum for a DataType', () => {
    event.getFirstActivity().addStream(new Stream(DataHeartRate.type, [0, 50, 100]));
    event.getFirstActivity().addStream(new Stream(DataAltitude.type, [200, 300, 400]));

    expect(ActivityUtilities.getDataTypeMin(event.getFirstActivity(), DataHeartRate.type)).toBe(0);
    expect(ActivityUtilities.getDataTypeMin(event.getFirstActivity(), DataAltitude.type)).toBe(200);
  });

  it('should get the correct maximum for a DataType', () => {
    event.getFirstActivity().addStream(new Stream(DataHeartRate.type, [0, 50, 100]));
    event.getFirstActivity().addStream(new Stream(DataAltitude.type, [200, 300, 400]));

    expect(ActivityUtilities.getDataTypeMax(event.getFirstActivity(), DataHeartRate.type)).toBe(100);
    expect(ActivityUtilities.getDataTypeMax(event.getFirstActivity(), DataAltitude.type)).toBe(400);
  });

  it('should get the correct difference for a DataType', () => {
    event.getFirstActivity().addStream(new Stream(DataHeartRate.type, [0, 50, 100]));
    event.getFirstActivity().addStream(new Stream(DataAltitude.type, [200, 300, 400]));

    expect(ActivityUtilities.getDataTypeMinToMaxDifference(event.getFirstActivity(), DataHeartRate.type)).toBe(100);
    expect(ActivityUtilities.getDataTypeMinToMaxDifference(event.getFirstActivity(), DataAltitude.type)).toBe(200);
  });

  it('should get the correct average for a DataType', () => {
    event.getFirstActivity().addStream(new Stream(DataHeartRate.type, [0, 50, 100]));
    event.getFirstActivity().addStream(new Stream(DataAltitude.type, [200, 300, 400]));

    expect(ActivityUtilities.getDataTypeAvg(event.getFirstActivity(), DataHeartRate.type)).toBe(50);
    expect(ActivityUtilities.getDataTypeAvg(event.getFirstActivity(), DataAltitude.type)).toBe(300);
  });

  it('should calculate stream aggregates without changing numeric filtering semantics', () => {
    event.getFirstActivity().addStream(new Stream(DataHeartRate.type, [null, NaN, Infinity, -Infinity, -0, 0, 2, 4]));

    expect(ActivityUtilities.getDataTypeAvg(event.getFirstActivity(), DataHeartRate.type)).toBe(1.5);
    expect(Object.is(ActivityUtilities.getDataTypeMin(event.getFirstActivity(), DataHeartRate.type), -0)).toBe(true);
    expect(ActivityUtilities.getDataTypeMax(event.getFirstActivity(), DataHeartRate.type)).toBe(4);
    expect(
      ActivityUtilities.getDataTypeAvg(event.getFirstActivity(), DataHeartRate.type, undefined, undefined, 0)
    ).toBe(3);
    expect(
      ActivityUtilities.getDataTypeMin(event.getFirstActivity(), DataHeartRate.type, undefined, undefined, 0)
    ).toBe(2);
    expect(ActivityUtilities.getDataTypeFirst(event.getFirstActivity(), DataHeartRate.type)).toBe(Infinity);
    expect(ActivityUtilities.getDataTypeLast(event.getFirstActivity(), DataHeartRate.type)).toBe(4);
  });

  it('should preserve empty and date-bounded aggregate results', () => {
    event.getFirstActivity().addStream(new Stream(DataHeartRate.type, [null, NaN, Infinity, -Infinity]));
    event.getFirstActivity().addStream(new Stream(DataAltitude.type, [1, 2, 3, 4]));

    expect(ActivityUtilities.getDataTypeAvg(event.getFirstActivity(), DataHeartRate.type)).toBeNaN();
    expect(ActivityUtilities.getDataTypeMin(event.getFirstActivity(), DataHeartRate.type)).toBe(Infinity);
    expect(ActivityUtilities.getDataTypeMax(event.getFirstActivity(), DataHeartRate.type)).toBe(-Infinity);
    expect(
      ActivityUtilities.getDataTypeAvg(event.getFirstActivity(), DataAltitude.type, new Date(1000), new Date(3000))
    ).toBe(3);
    expect(
      ActivityUtilities.getDataTypeFirst(event.getFirstActivity(), DataAltitude.type, new Date(1000), new Date(3000))
    ).toBe(2);
    expect(
      ActivityUtilities.getDataTypeLast(event.getFirstActivity(), DataAltitude.type, new Date(1000), new Date(3000))
    ).toBe(4);
  });

  it('should match legacy aggregates for deterministic sparse and non-finite streams', () => {
    let randomState = 0x5f3759df;
    const random = () => {
      randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
      return randomState / 0x1_0000_0000;
    };
    const specialValues: (number | null)[] = [null, NaN, Infinity, -Infinity, -0, 0, -10, 2.5, 100];

    for (let iteration = 0; iteration < 64; iteration++) {
      const values = new Array<number | null>(1 + Math.floor(random() * 80));
      for (let index = 0; index < values.length; index++) {
        if (random() >= 0.15) {
          values[index] = specialValues[Math.floor(random() * specialValues.length)];
        }
      }
      const activity = new Activity(new Date(0), new Date(1000), ActivityTypes.Running, new Creator('Test'));
      activity.addStream(new Stream(DataHeartRate.type, values));
      const numeric = values.filter(value => typeof value === 'number' && !isNaN(value)) as number[];
      const finite = numeric.filter(value => value !== Infinity && value !== -Infinity);

      for (const filterOver of [undefined, NaN, -Infinity, -0, 2.5, Infinity]) {
        const filtered = finite.filter(value => (Number.isFinite(filterOver) ? value > (filterOver as number) : true));
        const expectedAverage = filtered.reduce((sum, value) => sum + value, 0) / filtered.length;
        const expectedMinimum = filtered.reduce((minimum, value) => Math.min(minimum, value), Infinity);

        expect(ActivityUtilities.getDataTypeAvg(activity, DataHeartRate.type, undefined, undefined, filterOver)).toBe(
          expectedAverage
        );
        expect(ActivityUtilities.getDataTypeMin(activity, DataHeartRate.type, undefined, undefined, filterOver)).toBe(
          expectedMinimum
        );
      }

      expect(ActivityUtilities.getDataTypeMax(activity, DataHeartRate.type)).toBe(
        finite.reduce((maximum, value) => Math.max(maximum, value), -Infinity)
      );
      expect(ActivityUtilities.getDataTypeFirst(activity, DataHeartRate.type)).toBe(numeric[0]);
      expect(ActivityUtilities.getDataTypeLast(activity, DataHeartRate.type)).toBe(numeric[numeric.length - 1]);
    }
  });

  it('should shape only finite samples and preserve their original indexes', () => {
    const activity = event.getFirstActivity();
    activity.addStream(new Stream(DataAltitude.type, [1, null, Infinity, 3, NaN, -Infinity, 5]));
    activity.addStream(new Stream(DataDistance.type, [0, 1, 2, 3, 4, 5, 6]));

    ActivityUtilities.shapeStream(DataAltitude.type, activity, values => values.map(value => value * 10));

    expect(activity.getStreamData(DataAltitude.type)).toEqual([
      10,
      null,
      null,
      30,
      null,
      null,
      50,
      null,
      null,
      null,
      null
    ]);
    expect(activity.getAllStreams().map(stream => stream.type)).toEqual([DataDistance.type, DataAltitude.type]);
  });

  it('should preserve irregular IBI timing when shaping the stream', () => {
    const activity = new Activity(new Date(0), new Date(3000), ActivityTypes.Running, new Creator('Test'));
    activity.addStream(new IBIStream([823, 823, 823]));

    ActivityUtilities.shapeStream(DataIBI.type, activity, () => [100, 200, 300]);

    expect(activity.getStreamData(DataIBI.type)).toEqual([null, 100, 300, null]);
  });

  it('should get the correct gain for a DataType', () => {
    event.getFirstActivity().addStream(new Stream(DataAltitude.type, [200, 300, 400]));
    expect(ActivityUtilities.getActivityDataTypeGain(event.getFirstActivity(), DataAltitude.type)).toBe(200);

    // Add more altitude data but this time descending so it would not affect the gain
    event.getFirstActivity().getStreamData(DataAltitude.type).push(400);
    event.getFirstActivity().getStreamData(DataAltitude.type).push(300);
    event.getFirstActivity().getStreamData(DataAltitude.type).push(200);

    expect(ActivityUtilities.getActivityDataTypeGain(event.getFirstActivity(), DataAltitude.type)).toBe(200);

    // Add more for gain

    event.getFirstActivity().getStreamData(DataAltitude.type).push(400); // Gain 400 (from prev)
    event.getFirstActivity().getStreamData(DataAltitude.type).push(300);
    // Gain 400
    event.getFirstActivity().getStreamData(DataAltitude.type).push(400); // Gain 500

    expect(ActivityUtilities.getActivityDataTypeGain(event.getFirstActivity(), DataAltitude.type)).toBe(500);
  });

  it('should get the correct gain for a DataType with a changed min difference', () => {
    event.getFirstActivity().addStream(new Stream(DataAltitude.type, [200, 300, 400]));
    // With a diff of 100,200 the gain should be included
    expect(
      ActivityUtilities.getActivityDataTypeGain(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 100)
    ).toBe(200);
    expect(
      ActivityUtilities.getActivityDataTypeGain(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 200)
    ).toBe(200);

    // with a diff of 201 it shouldn't
    expect(
      ActivityUtilities.getActivityDataTypeGain(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 201)
    ).toBe(0);

    // Add more
    event.getFirstActivity().getStreamData(DataAltitude.type).push(100);
    event.getFirstActivity().getStreamData(DataAltitude.type).push(101);
    event.getFirstActivity().getStreamData(DataAltitude.type).push(102);

    // Up to now we have 200m, 300m, 400m, 100m, 101m, 102m
    expect(
      ActivityUtilities.getActivityDataTypeGain(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 100)
    ).toBe(200);
    expect(
      ActivityUtilities.getActivityDataTypeGain(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 200)
    ).toBe(200);
    expect(
      ActivityUtilities.getActivityDataTypeGain(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 300)
    ).toBe(0);
    expect(
      ActivityUtilities.getActivityDataTypeGain(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 1)
    ).toBe(202);
    expect(
      ActivityUtilities.getActivityDataTypeGain(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 2)
    ).toBe(202);
    expect(
      ActivityUtilities.getActivityDataTypeGain(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 3)
    ).toBe(200);
  });

  it('should get the correct gain for a DataType with a set of points of non data', () => {
    event.getFirstActivity().addStream(new Stream(DataAltitude.type, [100, 300, 200, 400]));

    expect(ActivityUtilities.getActivityDataTypeGain(event.getFirstActivity(), DataAltitude.type)).toBe(400);
  });

  it('should get the correct loss for a DataType', () => {
    event.getFirstActivity().addStream(new Stream(DataAltitude.type, [400, 300, 200]));

    expect(ActivityUtilities.getActivityDataTypeLoss(event.getFirstActivity(), DataAltitude.type)).toBe(200);
    // Add more altitude data but this time ascenting so it would not affect the Loss
    event.getFirstActivity().getStreamData(DataAltitude.type).push(200); // Loss 0
    event.getFirstActivity().getStreamData(DataAltitude.type).push(300); // Loss 0
    event.getFirstActivity().getStreamData(DataAltitude.type).push(400); // Loss 0

    expect(ActivityUtilities.getActivityDataTypeLoss(event.getFirstActivity(), DataAltitude.type)).toBe(200);

    event.getFirstActivity().getStreamData(DataAltitude.type).push(200); // loss 200
    event.getFirstActivity().getStreamData(DataAltitude.type).push(300); // loss 0
    event.getFirstActivity().getStreamData(DataAltitude.type).push(200); // Gain 100 a total (see above of 500)

    expect(ActivityUtilities.getActivityDataTypeLoss(event.getFirstActivity(), DataAltitude.type)).toBe(500);
  });

  it('should get the correct loss for a DataType with a changed min difference', () => {
    event.getFirstActivity().addStream(new Stream(DataAltitude.type, [400, 300, 200]));

    // With a diff of 100,200 the gain should be included
    expect(
      ActivityUtilities.getActivityDataTypeLoss(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 100)
    ).toBe(200);
    expect(
      ActivityUtilities.getActivityDataTypeLoss(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 200)
    ).toBe(200);

    // with a diff of 201 it shouldn't
    expect(
      ActivityUtilities.getActivityDataTypeLoss(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 201)
    ).toBe(0);

    // Add more
    event.getFirstActivity().getStreamData(DataAltitude.type).push(500);
    event.getFirstActivity().getStreamData(DataAltitude.type).push(499);
    event.getFirstActivity().getStreamData(DataAltitude.type).push(498);

    // 200m, 300m, 400m, 100m, 101m, 102m
    // Up to now we have 400m, 300m, 200m, 500m, 499m, 498m
    expect(
      ActivityUtilities.getActivityDataTypeLoss(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 100)
    ).toBe(200);
    expect(
      ActivityUtilities.getActivityDataTypeLoss(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 200)
    ).toBe(200);
    expect(
      ActivityUtilities.getActivityDataTypeLoss(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 300)
    ).toBe(0);
    expect(
      ActivityUtilities.getActivityDataTypeLoss(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 1)
    ).toBe(202);
    expect(
      ActivityUtilities.getActivityDataTypeLoss(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 2)
    ).toBe(202);
    expect(
      ActivityUtilities.getActivityDataTypeLoss(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 3)
    ).toBe(200);
  });

  it('should get the correct loss for a DataType with a set of points of non data', () => {
    event
      .getFirstActivity()
      .getAllStreams()
      .push(
        new Stream(DataAltitude.type, [400, 200, 300, 100]) // loos 0, 200, 0, 400
      );
    expect(ActivityUtilities.getActivityDataTypeLoss(event.getFirstActivity(), DataAltitude.type)).toBe(400);
  });

  it('should get the correct data length', () => {
    const activity = event.getFirstActivity(); // 10s
    // 10 seconds = 11 slugs; from second 1 eg
    // [1,2,3,4,5,6,7,8,9,10] ->
    // [0, 1, 2,3,4,5,6,7,8,9,10]
    expect(ActivityUtilities.getDataLength(activity.startDate, activity.endDate)).toBe(11);
    // Change start / end date to <1s
    activity.startDate = new Date(0);
    activity.endDate = new Date(50); // 50ms
    // More than 0 = 1 slug
    expect(ActivityUtilities.getDataLength(activity.startDate, activity.endDate)).toBe(2);
    // Change start / end date to >9999ms and <100000s
    activity.startDate = new Date(0);
    activity.endDate = new Date(9999); // 9.9 seconds
    // more than 9 is 10 slugs
    expect(ActivityUtilities.getDataLength(activity.startDate, activity.endDate)).toBe(11);
  });

  it('should provide serialization/deserialization through toJSON', () => {
    // Given
    const activity = event.getFirstActivity();
    activity.startDate = new Date();
    activity.endDate = new Date(activity.startDate.getTime() + 3000);
    event.getFirstActivity().addStream(new Stream(DataDistance.type, [0, 9, null, 30]));
    event.getFirstActivity().addStream(new Stream(DataSpeed.type, [0, 10, null, 15]));
    event.getFirstActivity().addStream(new Stream(DataHeartRate.type, [0, 50, null, 100]));
    event.getFirstActivity().addStream(new Stream(DataAltitude.type, [200, 300, null, 400]));

    const lap1 = new Lap(activity.startDate, activity.endDate, 1, LapTypes.Autolap);
    lap1.addStat(new DataSpeedAvg(10));
    activity.addLap(lap1);

    const lap2 = new Lap(activity.startDate, activity.endDate, 2, LapTypes.Autolap);
    lap2.addStat(new DataSpeedAvg(15));
    activity.addLap(lap2);

    // When serialize
    const activitySerialized = activity.toJSON();

    // Then
    expect(activitySerialized.name).toBeNull();
    expect(activitySerialized.startDate).toEqual(activity.startDate.getTime());
    expect(activitySerialized.endDate).toEqual(activity.endDate.getTime());
    expect(activitySerialized.powerMeter).toBeFalsy();
    expect(activitySerialized.trainer).toBeFalsy();
    expect(activitySerialized.laps.length).toEqual(activity.getLaps().length);
    expect(activitySerialized.laps[0].startIndex).toEqual(0);
    expect(activitySerialized.laps[0].endIndex).toEqual(3);
    expect(activitySerialized.laps[0].stats[DataSpeedAvg.type]).toEqual(
      (activity.getLaps()[0].getStat(DataSpeedAvg.type) as DataSpeedAvg).getValue()
    );

    expect(activitySerialized.streams.length).toEqual(activity.getAllStreams().length + 1); // +1 because we add time stream
    expect(
      (activitySerialized.streams as StreamJSONInterface[]).find(s => s.type == DataTime.type)?.data.length
    ).toEqual(
      (activitySerialized.streams as StreamJSONInterface[]).find(s => s.type == DataDistance.type)?.data.length
    );

    // When deserialize
    const activityDeserialized = EventImporterJSON.getActivityFromJSON(activitySerialized);

    // Then
    expect(activityDeserialized.startDate).toEqual(activity.startDate);
    expect(activityDeserialized.endDate).toEqual(activity.endDate);
    expect(activityDeserialized.hasPowerMeter()).toEqual(activity.hasPowerMeter());
    expect(activityDeserialized.getLaps().length).toEqual(activity.getLaps().length);
    expect((activityDeserialized.getLaps()[0].getStat(DataSpeedAvg.type) as DataSpeedAvg).getValue()).toEqual(
      (activity.getLaps()[0].getStat(DataSpeedAvg.type) as DataSpeedAvg).getValue()
    );
    expect(activityDeserialized.getStream(DataDistance.type).getData().length).toEqual(
      activity.getStream(DataDistance.type).getData().length
    );
    expect(activityDeserialized.getStream(DataDistance.type)).toEqual(activity.getStream(DataDistance.type));
    expect(activityDeserialized.getStream(DataSpeed.type)).toEqual(activity.getStream(DataSpeed.type));
    expect(activityDeserialized.getStream(DataHeartRate.type)).toEqual(activity.getStream(DataHeartRate.type));
    expect(activityDeserialized.getStream(DataAltitude.type)).toEqual(activity.getStream(DataAltitude.type));
    expect(activityDeserialized.hasStreamData(DataTime.type)).toBeFalsy();
  });

  it('should serialize time from the primary regular stream even when IBI is also present', () => {
    const activity = event.getFirstActivity();
    activity.startDate = new Date();
    activity.endDate = new Date(activity.startDate.getTime() + 3000);
    activity.addStream(new IBIStream([823, 823, 823]));
    activity.addStream(new Stream(DataDistance.type, [0, 9, null, 30]));

    const activitySerialized = activity.toJSON();
    const timeStream = (activitySerialized.streams as StreamJSONInterface[]).find(s => s.type === DataTime.type);

    expect(timeStream?.data).toEqual([0, 1, null, 3]);
  });

  it('should serialize projected time data when IBI is the only stream', () => {
    const activity = new Activity(
      new Date(0),
      new Date(new Date(0).getTime() + 1000),
      ActivityTypes.Running,
      new Creator('Test')
    );
    activity.addStream(new IBIStream([823, 823, 823]));

    const activitySerialized = activity.toJSON();
    const timeStream = (activitySerialized.streams as StreamJSONInterface[]).find(s => s.type === DataTime.type);
    const activityDeserialized = EventImporterJSON.getActivityFromJSON(activitySerialized);

    expect(timeStream?.data).toEqual([null, 1, 2]);
    expect(activityDeserialized.getStream(DataIBI.type)).toEqual(activity.getStream(DataIBI.type));
    expect(activityDeserialized.hasStreamData(DataTime.type)).toBeFalsy();
  });

  describe('Fill streams', () => {
    const createFakeActivityWithStreams = (
      lengthInSeconds: number,
      streams: { type: string; data: (number | null)[] }[]
    ): ActivityInterface => {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + lengthInSeconds * 1000);
      const activity = new Activity(startDate, endDate, ActivityTypes.Running, new Creator('creator'));
      streams.forEach(stream => {
        activity.addStream(new Stream(stream.type).setData(stream.data));
      });

      return activity;
    };

    it('should add missing data to streams (1)', done => {
      // Given
      const timeData = [0, 1, 2, 3, 4, 5, 6]; // 6 seconds
      const seconds = timeData.length - 1;
      const distanceData = [0, 10, 20, 25, 40, 45, 55];
      const altitudeData = [null, 13, 10, null, 8, 7, null];
      const heartRateData = [123, 135, null, null, null, null, null];
      const expectedAltitudes = [13, 13, 10, 10, 8, 7, 7];
      const expectedHeartRates = [123, 135, 135, 135, 135, 135, 135];

      const activity = createFakeActivityWithStreams(seconds, [
        { type: DataDistance.type, data: distanceData },
        { type: DataAltitude.type, data: altitudeData },
        { type: DataHeartRate.type, data: heartRateData }
      ]);

      // When
      ActivityUtilities.addMissingDataToStreams(activity);

      // Then
      expect(activity.getStreamData(DataDistance.type)).toEqual(distanceData);
      expect(activity.getStreamData(DataAltitude.type)).toEqual(expectedAltitudes);
      expect(activity.getStreamData(DataHeartRate.type)).toEqual(expectedHeartRates);
      done();
    });

    it('should ignore IBI occupancy when backfilling distance and altitude streams', () => {
      const activity = createFakeActivityWithStreams(6, [
        { type: DataDistance.type, data: [0, null, null, null, null, null, 60] },
        { type: DataAltitude.type, data: [100, null, null, null, null, null, 160] }
      ]);
      activity.addStream(new IBIStream([1000, 1000, 1000, 1000, 1000]));

      ActivityUtilities.addMissingDataToStreams(activity);

      expect(activity.getStreamData(DataDistance.type)).toEqual([0, null, null, null, null, null, 60]);
      expect(activity.getStreamData(DataAltitude.type)).toEqual([100, null, null, null, null, null, 160]);
    });
  });

  describe('createUnitStreamsFromStreams', () => {
    it('should include derived types and unit variants by default', () => {
      const streams = [new Stream(DataSpeed.type, [10, 20])];
      const result = ActivityUtilities.createUnitStreamsFromStreams(streams, ActivityTypes.Running);

      const paceStream = result.find(s => s.type === DataPaceMinutesPerMile.type);
      const kmhStream = result.find(s => s.type === DataSpeedKilometersPerHour.type);

      expect(paceStream).toBeDefined();
      expect(kmhStream).toBeDefined();
    });

    it('should include pace-derived streams for hiking activities', () => {
      const streams = [new Stream(DataSpeed.type, [10, 20])];
      const result = ActivityUtilities.createUnitStreamsFromStreams(streams, ActivityTypes.Hiking);

      const paceStream = result.find(s => s.type === DataPace.type);
      const paceUnitStream = result.find(s => s.type === DataPaceMinutesPerMile.type);
      const kmhStream = result.find(s => s.type === DataSpeedKilometersPerHour.type);

      expect(paceStream).toBeDefined();
      expect(paceUnitStream).toBeDefined();
      expect(kmhStream).toBeDefined();
    });

    it('should exclude derived types when includeDerivedTypes is false', () => {
      const streams = [new Stream(DataSpeed.type, [10, 20])];
      const result = ActivityUtilities.createUnitStreamsFromStreams(streams, ActivityTypes.Running, undefined, {
        includeDerivedTypes: false,
        includeUnitVariants: true
      });

      const paceStream = result.find(s => s.type === DataPaceMinutesPerMile.type);
      const kmhStream = result.find(s => s.type === DataSpeedKilometersPerHour.type);

      expect(paceStream).toBeUndefined();
      expect(kmhStream).toBeDefined();
    });

    it('should exclude unit variants when includeUnitVariants is false', () => {
      const streams = [new Stream(DataSpeed.type, [10, 20])];
      // We pass DataPace.type in unitStreamTypes so we can check if the derived base stream is present
      const result = ActivityUtilities.createUnitStreamsFromStreams(streams, ActivityTypes.Running, [DataPace.type], {
        includeDerivedTypes: true,
        includeUnitVariants: false
      });

      const paceStream = result.find(s => s.type === DataPace.type);
      const paceUnitStream = result.find(s => s.type === DataPaceMinutesPerMile.type);

      expect(paceStream).toBeDefined(); // Derived type should be there
      expect(paceUnitStream).toBeUndefined(); // Unit variant should be gone
    });

    it('should exclude both derived types and unit variants', () => {
      const streams = [new Stream(DataSpeed.type, [10, 20])];
      const result = ActivityUtilities.createUnitStreamsFromStreams(streams, ActivityTypes.Running, [DataPace.type], {
        includeDerivedTypes: false,
        includeUnitVariants: false
      });

      const paceStream = result.find(s => s.type === DataPace.type);
      const paceUnitStream = result.find(s => s.type === DataPaceMinutesPerMile.type);

      expect(paceStream).toBeUndefined();
      expect(paceUnitStream).toBeUndefined();
    });

    it('should not generate derived pace when pace already exists', () => {
      const streams = [new Stream(DataSpeed.type, [10, 20]), new Stream(DataPace.type, [100, 200])];
      const result = ActivityUtilities.createUnitStreamsFromStreams(streams, ActivityTypes.Running, [DataPace.type], {
        includeDerivedTypes: true,
        includeUnitVariants: false
      });

      const generatedPaceStreams = result.filter(stream => stream.type === DataPace.type);
      expect(generatedPaceStreams.length).toBe(0);
    });

    it('should generate distance miles only once when distance and step length both exist', () => {
      const streams = [new Stream(DataDistance.type, [1000, 2000]), new Stream(DataStepLength.type, [0.8, 0.9])];
      const result = ActivityUtilities.createUnitStreamsFromStreams(
        streams,
        ActivityTypes.Running,
        [DataDistanceMiles.type],
        {
          includeDerivedTypes: true,
          includeUnitVariants: true
        }
      );

      const generatedDistanceMiles = result.filter(stream => stream.type === DataDistanceMiles.type);
      expect(generatedDistanceMiles.length).toBe(1);
    });

    it('should generate GNSS-specific miles stream for GNSS distance', () => {
      const streams = [new Stream(DataGNSSDistance.type, [0, 1000, 2000])];
      const result = ActivityUtilities.createUnitStreamsFromStreams(streams, ActivityTypes.Running);

      const generatedDistanceMiles = result.filter(stream => stream.type === DataDistanceMiles.type);
      const generatedGNSSDistanceMiles = result.filter(stream => stream.type === DataGNSSDistanceMiles.type);
      expect(generatedDistanceMiles.length).toBe(0);
      expect(generatedGNSSDistanceMiles.length).toBe(1);
    });
  });

  describe('generateMissingStreams', () => {
    it('should generate unit streams when generateUnitStreams = true', () => {
      const activity = new Activity(
        new Date(),
        new Date(),
        ActivityTypes.Running,
        new Creator('test'),
        new ActivityParsingOptions({ generateUnitStreams: true })
      );
      // Add a speed stream
      activity.addStream(new Stream(DataSpeed.type, [10, 20]));

      ActivityUtilities.generateMissingStreams(activity);

      // Should have generated "sister" types (e.g. Pace) and unit variants (e.g. Speed km/h)
      expect(activity.hasStreamData(DataSpeedKilometersPerHour.type)).toBe(true);
      expect(activity.hasStreamData(DataPaceMinutesPerMile.type)).toBe(true);
    });

    it('should NOT generate unit streams when generateUnitStreams = false', () => {
      const activity = new Activity(new Date(), new Date(), ActivityTypes.Running, new Creator('test'));
      // Mock parsing options
      activity.parseOptions = {
        streams: { smooth: {}, fixAbnormal: {} },
        maxActivityDurationDays: 14,
        generateUnitStreams: false,
        deviceInfoMode: 'raw'
      };

      // Add a speed stream
      activity.addStream(new Stream(DataSpeed.type, [10, 20]));

      ActivityUtilities.generateMissingStreams(activity);

      // Should NOT have generated unit variants
      expect(activity.hasStreamData(DataSpeedKilometersPerHour.type)).toBe(false);
      // It might still generate some "derived" streams depending on other flags, but our specific unit loop should be skipped
      // The Pace stream comes from createUnitStreamsFromStreams too, so it should also be missing
      expect(activity.hasStreamData(DataPaceMinutesPerMile.type)).toBe(false);
    });
  });

  describe('generateMissingStreamsAndStatsForActivity', () => {
    it('hydrates missing pace-family stats on speed-only laps', () => {
      const activity = new Activity(new Date(0), new Date(1000), ActivityTypes.Running, new Creator('test'));
      const lap = new Lap(new Date(0), new Date(1000), 1, LapTypes.Manual);
      lap.addStat(new DataSpeedAvg(4));
      activity.addLap(lap);

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      expect(lap.getStat(DataPaceAvg.type)?.getValue()).toBe(250);
      expect(lap.getStat(DataSwimPaceAvg.type)?.getValue()).toBe(25);
    });

    it('should generate PowerWattsPerKg when average power and weight are available', () => {
      const activity = new Activity(new Date(), new Date(), ActivityTypes.Cycling, new Creator('test'));
      activity.addStream(new Stream(DataPower.type, [280, 280, 280]));
      activity.addStat(new DataWeight(70));

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      const powerAvg = activity.getStat(DataPowerAvg.type) as DataPowerAvg | undefined;
      const powerWattsPerKg = activity.getStat(DataPowerWattsPerKg.type) as DataPowerWattsPerKg | undefined;
      expect(powerAvg).toBeDefined();
      expect(powerAvg?.getValue()).toBe(280);
      expect(powerWattsPerKg).toBeDefined();
      expect(powerWattsPerKg?.getValue()).toBe(4);
    });

    it('should not generate PowerWattsPerKg when weight is missing', () => {
      const activity = new Activity(new Date(), new Date(), ActivityTypes.Cycling, new Creator('test'));
      activity.addStream(new Stream(DataPower.type, [280, 280, 280]));

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      expect(activity.getStat(DataPowerAvg.type)).toBeDefined();
      expect(activity.getStat(DataPowerWattsPerKg.type)).toBeUndefined();
    });

    it('should generate unit STATS even if unit STREAMS are disabled', () => {
      const activity = new Activity(new Date(), new Date(), ActivityTypes.Running, new Creator('test'));
      activity.parseOptions = {
        streams: { smooth: {}, fixAbnormal: {} },
        maxActivityDurationDays: 14,
        generateUnitStreams: false, // DISABLE streams
        deviceInfoMode: 'raw'
      };

      // Add a speed stream [10 m/s, 20 m/s]
      // Max speed = 20 m/s
      activity.addStream(new Stream(DataSpeed.type, [10, 20]));

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      // 1. Verify Unit Streams are missing (as requested)
      expect(activity.hasStreamData(DataSpeedKilometersPerHour.type)).toBe(false);

      // 2. Verify Derived Base Streams are PRESENT (The fix)
      expect(activity.hasStreamData(DataPace.type)).toBe(true);

      // 3. Verify Stats are PRESENT (Safety Check)
      // 20 m/s = 72 km/h
      const allStats = Array.from(activity.getStats().values());
      const speedMaxKmh = allStats.find(s => s.getType() === DataSpeedMaxKilometersPerHour.type);

      expect(speedMaxKmh).toBeDefined();
      expect(speedMaxKmh?.getValue()).toBe(72);
    });

    it('should generate DataSwimPace when generateUnitStreams = false for swimming', () => {
      const activity = new Activity(new Date(), new Date(), ActivityTypes.Swimming, new Creator('test'));
      activity.parseOptions = {
        streams: { smooth: {}, fixAbnormal: {} },
        maxActivityDurationDays: 14,
        generateUnitStreams: false,
        deviceInfoMode: 'raw'
      };

      activity.addStream(new Stream(DataSpeed.type, [1, 2])); // m/s

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      // Verify Unit Streams missing
      expect(activity.hasStreamData(DataSpeedKilometersPerHour.type)).toBe(false);

      // Verify Derived Base Stream (Swim Pace) IS present
      expect(activity.hasStreamData(DataSwimPace.type)).toBe(true);
    });

    it('should derive finite pace minimums from maximum speed even when minimum speed is zero', () => {
      const activity = new Activity(new Date(), new Date(), ActivityTypes.Running, new Creator('test'));
      activity.addStream(new Stream(DataSpeed.type, [0, 3]));
      activity.addStream(new Stream(DataGradeAdjustedSpeed.type, [0, 4]));

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      const paceMin = activity.getStat(DataPaceMin.type) as DataPaceMin;
      const paceMax = activity.getStat(DataPaceMax.type) as DataPaceMax;
      const swimPaceMin = activity.getStat(DataSwimPaceMin.type) as DataSwimPaceMin;
      const swimPaceMax = activity.getStat(DataSwimPaceMax.type) as DataSwimPaceMax;
      const gapPaceMin = activity.getStat(DataGradeAdjustedPaceMin.type) as DataGradeAdjustedPaceMin;

      expect(Number.isFinite(paceMin.getValue())).toBe(true);
      expect(paceMin.getValue()).toBeCloseTo(333.3333333333, 8);
      expect(paceMax.getValue()).toBe(Infinity);

      expect(Number.isFinite(swimPaceMin.getValue())).toBe(true);
      expect(swimPaceMin.getValue()).toBeCloseTo(33.3333333333, 8);
      expect(swimPaceMax.getValue()).toBe(Infinity);

      expect(Number.isFinite(gapPaceMin.getValue())).toBe(true);
      expect(gapPaceMin.getValue()).toBeCloseTo(250, 8);
    });

    it('should generate DataDistanceMiles when generateUnitStreams = true', () => {
      const activity = new Activity(
        new Date(),
        new Date(),
        ActivityTypes.Running,
        new Creator('test'),
        new ActivityParsingOptions({ generateUnitStreams: true })
      );

      activity.addStream(new Stream(DataDistance.type, [1000, 2000]));

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      // Should generate miles
      expect(activity.hasStreamData(DataDistanceMiles.type)).toBe(true);
    });

    it('should NOT generate DataDistanceMiles when generateUnitStreams = false', () => {
      const activity = new Activity(new Date(), new Date(), ActivityTypes.Running, new Creator('test'));
      activity.parseOptions = {
        streams: { smooth: {}, fixAbnormal: {} },
        maxActivityDurationDays: 14,
        generateUnitStreams: false,
        deviceInfoMode: 'raw'
      };

      activity.addStream(new Stream(DataDistance.type, [1000, 2000]));

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      // Should NOT generate miles
      expect(activity.hasStreamData(DataDistanceMiles.type)).toBe(false);
      // But base Distance should still be there (it was added manually)
      expect(activity.hasStreamData(DataDistance.type)).toBe(true);
    });

    it('should generate unit streams for Mountain Biking using DataSpeed', () => {
      const speedData = [10, 20, 30]; // m/s
      const speedStream = new Stream(DataSpeed.type, speedData);
      // Mountain Biking (defaults to Cycling group)
      const unitStreams = ActivityUtilities.createUnitStreamsFromStreams(
        [speedStream],
        ActivityTypes.MountainBiking,
        undefined, // Auto-detect all known unit types
        { includeDerivedTypes: true, includeUnitVariants: true }
      );

      const kmhStream = unitStreams.find(s => s.type === 'Speed in kilometers per hour');
      expect(kmhStream).toBeDefined();
      if (kmhStream) {
        expect(kmhStream.getData()[0]).toBeCloseTo(36, 1); // 10 m/s = 36 km/h
      }
    });

    it('should NOT generate ascent but SHOULD generate descent for AlpineSkiing', () => {
      const activity = new Activity(
        new Date(),
        new Date(),
        ActivityTypes.AlpineSkiing,
        new Creator('test'),
        new ActivityParsingOptions({
          streams: { smooth: { altitudeSmooth: false }, fixAbnormal: {} }
        })
      );
      activity.addStream(new Stream(DataAltitude.type, [100, 200, 300, 200, 100])); // 200m gain, 200m loss

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      expect(activity.getStat(DataAscent.type)).toBeUndefined();
      expect(activity.getStat(DataDescent.type)).toBeDefined();
      expect((activity.getStat(DataDescent.type) as DataDescent).getValue()).toBe(200);
    });

    it('should generate ascent/descent for Running (NOT excluded)', () => {
      const activity = new Activity(
        new Date(),
        new Date(),
        ActivityTypes.Running,
        new Creator('test'),
        new ActivityParsingOptions({
          streams: { smooth: { altitudeSmooth: false }, fixAbnormal: {} }
        })
      );
      activity.addStream(new Stream(DataAltitude.type, [100, 150, 200, 150, 100])); // 100m gain, 100m loss

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      expect(activity.getStat(DataAscent.type)).toBeDefined();
      expect(activity.getStat(DataDescent.type)).toBeDefined();
      expect((activity.getStat(DataAscent.type) as DataAscent).getValue()).toBe(100);
      expect((activity.getStat(DataDescent.type) as DataDescent).getValue()).toBe(100);
    });

    it('should generate ascent/descent for Kayaking (specifically NOT excluded)', () => {
      const activity = new Activity(new Date(), new Date(), ActivityTypes.Kayaking, new Creator('test'));
      activity.addStream(new Stream(DataAltitude.type, [100, 150, 200, 150, 100]));

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      expect(activity.getStat(DataAscent.type)).toBeDefined();
      expect(activity.getStat(DataDescent.type)).toBeDefined();
    });

    it('should NOT generate ascent OR descent for Swimming (excluded)', () => {
      const activity = new Activity(new Date(), new Date(), ActivityTypes.Swimming, new Creator('test'));
      activity.addStream(new Stream(DataAltitude.type, [100, 150, 200, 150, 100]));

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      expect(activity.getStat(DataAscent.type)).toBeUndefined();
      expect(activity.getStat(DataDescent.type)).toBeUndefined();
    });

    it('should NOT generate ascent but SHOULD generate descent for Diving', () => {
      const activity = new Activity(
        new Date(),
        new Date(),
        ActivityTypes.Diving,
        new Creator('test'),
        new ActivityParsingOptions({
          streams: { smooth: { altitudeSmooth: false }, fixAbnormal: {} }
        })
      );
      // Diving 10m down (alt 0 to -10)
      activity.addStream(new Stream(DataAltitude.type, [0, -2, -5, -8, -10]));

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      expect(activity.getStat(DataAscent.type)).toBeUndefined();
      expect(activity.getStat(DataDescent.type)).toBeDefined();
      expect((activity.getStat(DataDescent.type) as DataDescent).getValue()).toBe(10);
    });

    it('should generate min/max/avg stats for Absolute Pressure when pressure stream exists', () => {
      const activity = new Activity(new Date(), new Date(), ActivityTypes.Running, new Creator('test'));
      activity.addStream(new Stream(DataAbsolutePressure.type, [1000, 1007, 1003]));

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      expect((activity.getStat(DataAbsolutePressureMin.type) as DataAbsolutePressureMin).getValue()).toBe(1000);
      expect((activity.getStat(DataAbsolutePressureMax.type) as DataAbsolutePressureMax).getValue()).toBe(1007);
      expect((activity.getStat(DataAbsolutePressureAvg.type) as DataAbsolutePressureAvg).getValue()).toBeCloseTo(
        1003.3333333333,
        10
      );
    });

    it('should generate min/max/avg stats for Grade when grade stream exists', () => {
      const activity = new Activity(new Date(), new Date(), ActivityTypes.Running, new Creator('test'));
      activity.addStream(new Stream(DataGrade.type, [-6, 0, 4, 10]));

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      expect((activity.getStat(DataGradeMin.type) as DataGradeMin).getValue()).toBe(-6);
      expect((activity.getStat(DataGradeMax.type) as DataGradeMax).getValue()).toBe(10);
      expect((activity.getStat(DataGradeAvg.type) as DataGradeAvg).getValue()).toBeCloseTo(2, 5);
    });

    it('should generate min/max/avg stats for EVPE when stream exists', () => {
      const activity = new Activity(new Date(), new Date(), ActivityTypes.Running, new Creator('test'));
      activity.addStream(new Stream(DataEVPE.type, [4.1, 5.3, 4.7]));

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      expect((activity.getStat(DataEVPEMin.type) as DataEVPEMin).getValue()).toBe(4.1);
      expect((activity.getStat(DataEVPEMax.type) as DataEVPEMax).getValue()).toBe(5.3);
      expect((activity.getStat(DataEVPEAvg.type) as DataEVPEAvg).getValue()).toBeCloseTo(4.7, 10);
    });

    it('should generate min/max/avg stats for EHPE when stream exists', () => {
      const activity = new Activity(new Date(), new Date(), ActivityTypes.Running, new Creator('test'));
      activity.addStream(new Stream(DataEHPE.type, [3.2, 4.1, 3.7]));

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      expect((activity.getStat(DataEHPEMin.type) as DataEHPEMin).getValue()).toBe(3.2);
      expect((activity.getStat(DataEHPEMax.type) as DataEHPEMax).getValue()).toBe(4.1);
      expect((activity.getStat(DataEHPEAvg.type) as DataEHPEAvg).getValue()).toBeCloseTo(3.6666666667, 10);
    });

    it('should generate min/max/avg stats for Satellite 5 Best SNR when stream exists', () => {
      const activity = new Activity(new Date(), new Date(), ActivityTypes.Running, new Creator('test'));
      activity.addStream(new Stream(DataSatellite5BestSNR.type, [31.1, 34.5, 32.9]));

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      expect((activity.getStat(DataSatellite5BestSNRMin.type) as DataSatellite5BestSNRMin).getValue()).toBe(31.1);
      expect((activity.getStat(DataSatellite5BestSNRMax.type) as DataSatellite5BestSNRMax).getValue()).toBe(34.5);
      expect((activity.getStat(DataSatellite5BestSNRAvg.type) as DataSatellite5BestSNRAvg).getValue()).toBeCloseTo(
        32.8333333333,
        10
      );
    });

    it('should generate min/max/avg stats for Number of Satellites when stream exists', () => {
      const activity = new Activity(new Date(), new Date(), ActivityTypes.Running, new Creator('test'));
      activity.addStream(new Stream(DataNumberOfSatellites.type, [9, 11, 10]));

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      expect((activity.getStat(DataNumberOfSatellitesMin.type) as DataNumberOfSatellitesMin).getValue()).toBe(9);
      expect((activity.getStat(DataNumberOfSatellitesMax.type) as DataNumberOfSatellitesMax).getValue()).toBe(11);
      expect((activity.getStat(DataNumberOfSatellitesAvg.type) as DataNumberOfSatellitesAvg).getValue()).toBeCloseTo(
        10,
        10
      );
    });

    it('should generate min/max/avg stats for Leg Stiffness when stream exists', () => {
      const activity = new Activity(new Date(), new Date(), ActivityTypes.Running, new Creator('test'));
      activity.addStream(new Stream(DataLegStiffness.type, [8.2, 9.1, 8.7]));

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      expect((activity.getStat(DataLegStiffnessMin.type) as DataLegStiffnessMin).getValue()).toBe(8.2);
      expect((activity.getStat(DataLegStiffnessMax.type) as DataLegStiffnessMax).getValue()).toBe(9.1);
      expect((activity.getStat(DataLegStiffnessAvg.type) as DataLegStiffnessAvg).getValue()).toBeCloseTo(
        8.6666666667,
        10
      );
    });

    it('should generate power balance stats from a left-only balance stream', () => {
      const activity = new Activity(new Date(), new Date(), ActivityTypes.Cycling, new Creator('test'));
      activity.addStream(new Stream(DataPowerBalanceLeft.type, [51, 52, 53]));

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      expect((activity.getStat(DataPowerBalanceLeft.type) as DataPowerBalanceLeft).getValue()).toBe(52);
      expect((activity.getStat(DataPowerBalanceRight.type) as DataPowerBalanceRight).getValue()).toBe(48);
    });

    it('should generate running dynamics balance stats from left or right streams', () => {
      const activity = new Activity(new Date(), new Date(), ActivityTypes.Running, new Creator('test'));
      activity.addStream(new Stream(DataVerticalOscillationBalanceLeft.type, [48, 49]));
      activity.addStream(new Stream(DataLegSpringStiffnessBalanceRight.type, [52, 53]));
      activity.addStream(new Stream(DataImpactLoadingRateBalanceLeft.type, [50, 50]));

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      expect(
        (activity.getStat(DataVerticalOscillationBalanceLeft.type) as DataVerticalOscillationBalanceLeft).getValue()
      ).toBe(48.5);
      expect(
        (activity.getStat(DataVerticalOscillationBalanceRight.type) as DataVerticalOscillationBalanceRight).getValue()
      ).toBe(51.5);
      expect(
        (activity.getStat(DataLegSpringStiffnessBalanceLeft.type) as DataLegSpringStiffnessBalanceLeft).getValue()
      ).toBe(47.5);
      expect(
        (activity.getStat(DataLegSpringStiffnessBalanceRight.type) as DataLegSpringStiffnessBalanceRight).getValue()
      ).toBe(52.5);
      expect(
        (activity.getStat(DataImpactLoadingRateBalanceLeft.type) as DataImpactLoadingRateBalanceLeft).getValue()
      ).toBe(50);
      expect(
        (activity.getStat(DataImpactLoadingRateBalanceRight.type) as DataImpactLoadingRateBalanceRight).getValue()
      ).toBe(50);
    });

    it('should generate min/max/avg stats for Vertical Ratio when stream exists', () => {
      const activity = new Activity(new Date(), new Date(), ActivityTypes.Running, new Creator('test'));
      activity.addStream(new Stream(DataVerticalRatio.type, [7.5, 8.1, 7.9]));

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      expect((activity.getStat(DataVerticalRatioMin.type) as DataVerticalRatioMin).getValue()).toBe(7.5);
      expect((activity.getStat(DataVerticalRatioMax.type) as DataVerticalRatioMax).getValue()).toBe(8.1);
      expect((activity.getStat(DataVerticalRatioAvg.type) as DataVerticalRatioAvg).getValue()).toBeCloseTo(
        7.8333333333,
        10
      );
    });

    it('should generate min/max/avg stats for Garmin stamina streams', () => {
      const activity = new Activity(new Date(), new Date(), ActivityTypes.Running, new Creator('test'));
      activity.addStream(new Stream(DataStamina.type, [95, 66, 34]));
      activity.addStream(new Stream(DataPotentialStamina.type, [95, 80, 66]));

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      expect((activity.getStat(DataStaminaMin.type) as DataStaminaMin).getValue()).toBe(34);
      expect((activity.getStat(DataStaminaMax.type) as DataStaminaMax).getValue()).toBe(95);
      expect((activity.getStat(DataStaminaAvg.type) as DataStaminaAvg).getValue()).toBe(65);

      expect((activity.getStat(DataPotentialStaminaMin.type) as DataPotentialStaminaMin).getValue()).toBe(66);
      expect((activity.getStat(DataPotentialStaminaMax.type) as DataPotentialStaminaMax).getValue()).toBe(95);
      expect((activity.getStat(DataPotentialStaminaAvg.type) as DataPotentialStaminaAvg).getValue()).toBeCloseTo(
        80.3333333333,
        10
      );
    });

    it('should generate BOTH ascent and descent for Kitesurfing', () => {
      const activity = new Activity(
        new Date(),
        new Date(),
        ActivityTypes.Kitesurfing,
        new Creator('test'),
        new ActivityParsingOptions({
          streams: { smooth: { altitudeSmooth: false }, fixAbnormal: {} }
        })
      );
      // Up 10m then down 10m
      activity.addStream(new Stream(DataAltitude.type, [0, 5, 10, 5, 0]));

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      expect(activity.getStat(DataAscent.type)).toBeDefined();
      expect((activity.getStat(DataAscent.type) as DataAscent).getValue()).toBe(10);
      expect(activity.getStat(DataDescent.type)).toBeDefined();
      expect((activity.getStat(DataDescent.type) as DataDescent).getValue()).toBe(10);
    });
  });
});
