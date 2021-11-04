import { Event } from '../event';
import { Activity } from '../../activities/activity';
import { DataHeartRate } from '../../data/data.heart-rate';
import { DataAltitude } from '../../data/data.altitude';
import { DataDistance } from '../../data/data.distance';
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
  });
});
