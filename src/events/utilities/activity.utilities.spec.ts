import { Event } from '../event';
import { Activity } from '../../activities/activity';
import { DataHeartRate } from '../../data/data.heart-rate';
import { DataAltitude } from '../../data/data.altitude';
import { EventUtilities } from './event.utilities';
import { DataDistance } from '../../data/data.distance';
import { DataDuration } from '../../data/data.duration';
import { EventInterface } from '../event.interface';
import { Creator } from '../../creators/creator';
import { ActivityTypes } from '../../activities/activity.types';
import { Stream } from '../../streams/stream';
import { ActivityUtilities } from './activity.utilities';

describe('Activity Utilities', () => {

  let event: EventInterface;

  beforeEach(() => {
    event = new Event('New name', new Date(0), new Date(200));
    const activity = new Activity(
      new Date(0),
      new Date((new Date(0)).getTime() + 10000),
      ActivityTypes.Running,
      new Creator('Test'),
    );
    activity.setDuration(new DataDuration(10));
    activity.setDistance(new DataDistance(10));
    event.addActivity(activity);
  });

  it('should get the correct minimum for a DataType', () => {
    event.getFirstActivity().addStream(
      new Stream(DataHeartRate.type, [0, 50, 100]),
    );
    event.getFirstActivity().addStream(
      new Stream(DataAltitude.type, [200, 300, 400]),
    );

    expect(ActivityUtilities.getDataTypeMin(event.getFirstActivity(), DataHeartRate.type)).toBe(0);
    expect(ActivityUtilities.getDataTypeMin(event.getFirstActivity(), DataAltitude.type)).toBe(200);
  });

  it('should get the correct maximum for a DataType', () => {
    event.getFirstActivity().addStream(
      new Stream(DataHeartRate.type, [0, 50, 100]),
    );
    event.getFirstActivity().addStream(
      new Stream(DataAltitude.type, [200, 300, 400]),
    );

    expect(ActivityUtilities.getDataTypeMax(event.getFirstActivity(), DataHeartRate.type)).toBe(100);
    expect(ActivityUtilities.getDataTypeMax(event.getFirstActivity(), DataAltitude.type)).toBe(400);
  });

  it('should get the correct difference for a DataType', () => {
    event.getFirstActivity().addStream(
      new Stream(DataHeartRate.type, [0, 50, 100]),
    );
    event.getFirstActivity().addStream(
      new Stream(DataAltitude.type, [200, 300, 400]),
    );

    expect(ActivityUtilities.getDataTypeMinToMaxDifference(event.getFirstActivity(), DataHeartRate.type)).toBe(100);
    expect(ActivityUtilities.getDataTypeMinToMaxDifference(event.getFirstActivity(), DataAltitude.type)).toBe(200);
  });

  it('should get the correct average for a DataType', () => {
    event.getFirstActivity().addStream(
      new Stream(DataHeartRate.type, [0, 50, 100]),
    );
    event.getFirstActivity().addStream(
      new Stream(DataAltitude.type, [200, 300, 400]),
    );

    expect(ActivityUtilities.getDataTypeAvg(event.getFirstActivity(), DataHeartRate.type)).toBe(50);
    expect(ActivityUtilities.getDataTypeAvg(event.getFirstActivity(), DataAltitude.type)).toBe(300);
  });

  it('should get the correct gain for a DataType', () => {
    event.getFirstActivity().addStream(
      new Stream(DataAltitude.type, [200, 300, 400]),
    );
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
    event.getFirstActivity().addStream(
      new Stream(DataAltitude.type, [200, 300, 400]),
    );
    // With a diff of 100,200 the gain should be included
    expect(ActivityUtilities.getActivityDataTypeGain(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 100)).toBe(200);
    expect(ActivityUtilities.getActivityDataTypeGain(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 200)).toBe(200);

    // with a diff of 201 it shouldn't
    expect(ActivityUtilities.getActivityDataTypeGain(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 201)).toBe(0);

    // Add more
    event.getFirstActivity().getStreamData(DataAltitude.type).push(100);
    event.getFirstActivity().getStreamData(DataAltitude.type).push(101);
    event.getFirstActivity().getStreamData(DataAltitude.type).push(102);

    // Up to now we have 200m, 300m, 400m, 100m, 101m, 102m
    expect(ActivityUtilities.getActivityDataTypeGain(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 100)).toBe(200);
    expect(ActivityUtilities.getActivityDataTypeGain(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 200)).toBe(200);
    expect(ActivityUtilities.getActivityDataTypeGain(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 300)).toBe(0);
    expect(ActivityUtilities.getActivityDataTypeGain(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 1)).toBe(202);
    expect(ActivityUtilities.getActivityDataTypeGain(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 2)).toBe(202);
    expect(ActivityUtilities.getActivityDataTypeGain(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 3)).toBe(200);
  });


  it('should get the correct gain for a DataType with a set of points of non data', () => {
    event.getFirstActivity().addStream(
      new Stream(DataAltitude.type, [100, 300, 200, 400]),
    );

    expect(ActivityUtilities.getActivityDataTypeGain(event.getFirstActivity(), DataAltitude.type)).toBe(400);
  });

  it('should get the correct loss for a DataType', () => {
    event.getFirstActivity().addStream(
      new Stream(DataAltitude.type, [400, 300, 200]),
    );

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
    event.getFirstActivity().addStream(
      new Stream(DataAltitude.type, [400, 300, 200]),
    );

    // With a diff of 100,200 the gain should be included
    expect(ActivityUtilities.getActivityDataTypeLoss(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 100)).toBe(200);
    expect(ActivityUtilities.getActivityDataTypeLoss(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 200)).toBe(200);

    // with a diff of 201 it shouldn't
    expect(ActivityUtilities.getActivityDataTypeLoss(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 201)).toBe(0);

    // Add more
    event.getFirstActivity().getStreamData(DataAltitude.type).push(500);
    event.getFirstActivity().getStreamData(DataAltitude.type).push(499);
    event.getFirstActivity().getStreamData(DataAltitude.type).push(498);

    // 200m, 300m, 400m, 100m, 101m, 102m
    // Up to now we have 400m, 300m, 200m, 500m, 499m, 498m
    expect(ActivityUtilities.getActivityDataTypeLoss(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 100)).toBe(200);
    expect(ActivityUtilities.getActivityDataTypeLoss(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 200)).toBe(200);
    expect(ActivityUtilities.getActivityDataTypeLoss(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 300)).toBe(0);
    expect(ActivityUtilities.getActivityDataTypeLoss(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 1)).toBe(202);
    expect(ActivityUtilities.getActivityDataTypeLoss(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 2)).toBe(202);
    expect(ActivityUtilities.getActivityDataTypeLoss(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 3)).toBe(200);
  });


  it('should get the correct loss for a DataType with a set of points of non data', () => {
    event.getFirstActivity().getAllStreams().push(
      new Stream(DataAltitude.type, [400, 200, 300, 100]), // loos 0, 200, 0, 400
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
    activity.endDate = new Date(50);// 50ms
    // More than 0 = 1 slug
    expect(ActivityUtilities.getDataLength(activity.startDate, activity.endDate)).toBe(2);
    // Change start / end date to >9999ms and <100000s
    activity.startDate = new Date(0);
    activity.endDate = new Date(9999);// 9.9 seconds
    // more than 9 is 10 slugs
    expect(ActivityUtilities.getDataLength(activity.startDate, activity.endDate)).toBe(11);
  });
});
