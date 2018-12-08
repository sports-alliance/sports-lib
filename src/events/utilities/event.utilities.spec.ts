import {Event} from '../event';
import {Activity} from '../../activities/activity';
import {Point} from '../../points/point';
import {DataHeartRate} from '../../data/data.heart-rate';
import {DataAltitude} from '../../data/data.altitude';
import {EventUtilities} from './event.utilities';
import {DataAbsolutePressure} from '../../data/data.absolute-pressure';
import {DataDistance} from '../../data/data.distance';
import {DataDuration} from '../../data/data.duration';
import {EventInterface} from '../event.interface';
import {Creator} from '../../creators/creator';
import {ActivityTypes} from '../../activities/activity.types';
import {Stream} from '../../streams/stream';

describe('EventUtilities', () => {

  let event: EventInterface;

  beforeEach(() => {
    event = new Event('New name', new Date(0), new Date(200));
    const activity = new Activity(
      new Date(0),
      new Date((new Date(0)).getTime() + 10),
      ActivityTypes.Running,
      new Creator('Test'),
    );
    activity.setDuration(new DataDuration(10));
    activity.setDistance(new DataDistance(10));
    event.addActivity(activity);
  });

  it('should get the correct minimum for a DataType', () => {
    const pointA = new Point(new Date(0));
    event.getFirstActivity().streams.push(
      new Stream(DataHeartRate.type, [0, 50, 100]),
    );
    event.getFirstActivity().streams.push(
      new Stream(DataAltitude.type, [200, 300, 400]),
    );

    expect(EventUtilities.getDataTypeMin(event.getFirstActivity(), DataHeartRate.type)).toBe(0);
    expect(EventUtilities.getDataTypeMin(event.getFirstActivity(), DataAltitude.type)).toBe(200);
  });

  it('should get the correct maximum for a DataType', () => {
    event.getFirstActivity().streams.push(
      new Stream(DataHeartRate.type, [0, 50, 100]),
    );
    event.getFirstActivity().streams.push(
      new Stream(DataAltitude.type, [200, 300, 400]),
    );

    expect(EventUtilities.getDataTypeMax(event.getFirstActivity(), DataHeartRate.type)).toBe(100);
    expect(EventUtilities.getDataTypeMax(event.getFirstActivity(), DataAltitude.type)).toBe(400);
  });

  it('should get the correct difference for a DataType', () => {
    event.getFirstActivity().streams.push(
      new Stream(DataHeartRate.type, [0, 50, 100]),
    );
    event.getFirstActivity().streams.push(
      new Stream(DataAltitude.type, [200, 300, 400]),
    );

    expect(EventUtilities.getDataTypeDifference(event.getFirstActivity(), DataHeartRate.type)).toBe(100);
    expect(EventUtilities.getDataTypeDifference(event.getFirstActivity(), DataAltitude.type)).toBe(200);
  });

  it('should get the correct average for a DataType', () => {
    event.getFirstActivity().streams.push(
      new Stream(DataHeartRate.type, [0, 50, 100]),
    );
    event.getFirstActivity().streams.push(
      new Stream(DataAltitude.type, [200, 300, 400]),
    );

    expect(EventUtilities.getDataTypeAvg(event.getFirstActivity(), DataHeartRate.type)).toBe(50);
    expect(EventUtilities.getDataTypeAvg(event.getFirstActivity(), DataAltitude.type)).toBe(300);
  });

  it('should get the correct gain for a DataType', () => {
    event.getFirstActivity().streams.push(
      new Stream(DataAltitude.type, [200, 300, 400]),
    );
    expect(EventUtilities.getEventDataTypeGain(event.getFirstActivity(), DataAltitude.type)).toBe(200);


    // Add more altitude data but this time descending so it would not affect the gain
    event.getFirstActivity().getStreamData(DataAltitude.type).push(400);
    event.getFirstActivity().getStreamData(DataAltitude.type).push(300);
    event.getFirstActivity().getStreamData(DataAltitude.type).push(200);

    expect(EventUtilities.getEventDataTypeGain(event.getFirstActivity(), DataAltitude.type)).toBe(200);

    // Add more for gain

    event.getFirstActivity().getStreamData(DataAltitude.type).push(400); // Gain 400 (from prev)
    event.getFirstActivity().getStreamData(DataAltitude.type).push(300);
    ; // Gain 400
    event.getFirstActivity().getStreamData(DataAltitude.type).push(400); // Gain 500

    expect(EventUtilities.getEventDataTypeGain(event.getFirstActivity(), DataAltitude.type)).toBe(500);
  });

  it('should get the correct gain for a DataType with a changed min difference', () => {
    event.getFirstActivity().streams.push(
      new Stream(DataAltitude.type, [200, 300, 400]),
    );
    // With a diff of 100,200 the gain should be included
    expect(EventUtilities.getEventDataTypeGain(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 100)).toBe(200);
    expect(EventUtilities.getEventDataTypeGain(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 200)).toBe(200);

    // with a diff of 201 it shouldn't
    expect(EventUtilities.getEventDataTypeGain(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 201)).toBe(0);

    // Add more
    event.getFirstActivity().getStreamData(DataAltitude.type).push(100);
    event.getFirstActivity().getStreamData(DataAltitude.type).push(101);
    event.getFirstActivity().getStreamData(DataAltitude.type).push(102);

    // Up to now we have 200m, 300m, 400m, 100m, 101m, 102m
    expect(EventUtilities.getEventDataTypeGain(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 100)).toBe(200);
    expect(EventUtilities.getEventDataTypeGain(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 200)).toBe(200);
    expect(EventUtilities.getEventDataTypeGain(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 300)).toBe(0);
    expect(EventUtilities.getEventDataTypeGain(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 1)).toBe(202);
    expect(EventUtilities.getEventDataTypeGain(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 2)).toBe(202);
    expect(EventUtilities.getEventDataTypeGain(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 3)).toBe(200);
  });


  it('should get the correct gain for a DataType with a set of points of non data', () => {
    event.getFirstActivity().streams.push(
      new Stream(DataAltitude.type, [100, 300, 200, 400]),
    );

    expect(EventUtilities.getEventDataTypeGain(event.getFirstActivity(), DataAltitude.type)).toBe(400);
  });

  it('should get the correct loss for a DataType', () => {
    event.getFirstActivity().streams.push(
      new Stream(DataAltitude.type, [400, 300, 200]),
    );

    expect(EventUtilities.getEventDataTypeLoss(event.getFirstActivity(), DataAltitude.type)).toBe(200);
    // Add more altitude data but this time ascenting so it would not affect the Loss
    event.getFirstActivity().getStreamData(DataAltitude.type).push(200);// Loss 0
    event.getFirstActivity().getStreamData(DataAltitude.type).push(300);// Loss 0
    event.getFirstActivity().getStreamData(DataAltitude.type).push(400);// Loss 0

    expect(EventUtilities.getEventDataTypeLoss(event.getFirstActivity(), DataAltitude.type)).toBe(200);

    // Add more for loss
    const pointG = new Point(new Date(6));
    const pointH = new Point(new Date(7));
    const pointI = new Point(new Date(8));

    event.getFirstActivity().getStreamData(DataAltitude.type).push(200); // loss 200
    event.getFirstActivity().getStreamData(DataAltitude.type).push(300); // loss 0
    event.getFirstActivity().getStreamData(DataAltitude.type).push(200); // Gain 100 a total (see above of 500)

    expect(EventUtilities.getEventDataTypeLoss(event.getFirstActivity(), DataAltitude.type)).toBe(500);
  });

  it('should get the correct loss for a DataType with a changed min difference', () => {
   event.getFirstActivity().streams.push(
      new Stream(DataAltitude.type, [400, 300, 200]),
    );

    // With a diff of 100,200 the gain should be included
    expect(EventUtilities.getEventDataTypeLoss(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 100)).toBe(200);
    expect(EventUtilities.getEventDataTypeLoss(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 200)).toBe(200);

    // with a diff of 201 it shouldn't
    expect(EventUtilities.getEventDataTypeLoss(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 201)).toBe(0);

    // Add more
        event.getFirstActivity().getStreamData(DataAltitude.type).push(500);
    event.getFirstActivity().getStreamData(DataAltitude.type).push(499);
    event.getFirstActivity().getStreamData(DataAltitude.type).push(498);

    // 200m, 300m, 400m, 100m, 101m, 102m
    // Up to now we have 400m, 300m, 200m, 500m, 499m, 498m
    expect(EventUtilities.getEventDataTypeLoss(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 100)).toBe(200);
    expect(EventUtilities.getEventDataTypeLoss(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 200)).toBe(200);
    expect(EventUtilities.getEventDataTypeLoss(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 300)).toBe(0);
    expect(EventUtilities.getEventDataTypeLoss(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 1)).toBe(202);
    expect(EventUtilities.getEventDataTypeLoss(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 2)).toBe(202);
    expect(EventUtilities.getEventDataTypeLoss(event.getFirstActivity(), DataAltitude.type, void 0, void 0, 3)).toBe(200);
  });


  it('should get the correct loss for a DataType with a set of points of non data', () => {
     event.getFirstActivity().streams.push(
      new Stream(DataAltitude.type, [400, 200, 300, 100]), // loos 0, 200, 0, 400
    );
    expect(EventUtilities.getEventDataTypeLoss(event.getFirstActivity(), DataAltitude.type)).toBe(400);
  });

  it('should get an event as tcx blob', (done) => {
    const pointA = new Point(new Date(0));
    const pointB = new Point(new Date(1));
    const pointC = new Point(new Date(2));

    pointA.addData(new DataHeartRate(0));
    pointB.addData(new DataHeartRate(50));
    pointC.addData(new DataHeartRate(100));

    pointA.addData(new DataAltitude(200));
    pointB.addData(new DataAltitude(300));
    pointC.addData(new DataAltitude(400));

    event.getFirstActivity().addPoint(pointA);
    event.getFirstActivity().addPoint(pointB);
    event.getFirstActivity().addPoint(pointC);
    EventUtilities.getEventAsTCXBloB(event).then((blob) => {
      expect(blob instanceof Blob).toBe(true);
    });
    done();
  });

  it('should get an event as json blob', (done) => {
    const pointA = new Point(new Date(0));
    const pointB = new Point(new Date(1));
    const pointC = new Point(new Date(2));

    pointA.addData(new DataHeartRate(0));
    pointB.addData(new DataHeartRate(50));
    pointC.addData(new DataHeartRate(100));

    pointA.addData(new DataAltitude(200));
    pointB.addData(new DataAltitude(300));
    pointC.addData(new DataAltitude(400));

    event.getFirstActivity().addPoint(pointA);
    event.getFirstActivity().addPoint(pointB);
    event.getFirstActivity().addPoint(pointC);
    EventUtilities.getEventAsJSONBloB(event).then((blob) => {
      expect(blob instanceof Blob).toBe(true);
    });
    done();
  });

});
