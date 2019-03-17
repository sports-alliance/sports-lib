import {Activity} from './activity';
import {ActivityInterface} from './activity.interface';
import {DataHeartRate} from '../data/data.heart-rate';
import {DataAltitude} from '../data/data.altitude';
import {ActivityTypes} from './activity.types';
import {Creator} from '../creators/creator';
import {Stream} from "../streams/stream";
import {DataDistance} from "../data/data.distance";

describe('Activity', () => {

  let activity: ActivityInterface;

  beforeEach(() => {
    // New activity that ends +6m
    activity = new Activity(
      new Date(0),
      new Date((new Date(0)).getTime() + 10000),
      ActivityTypes.Running,
      new Creator('Test')
    );
    activity.setID('123');
  });


  it('should get streams based on time', () => {
    activity.addStream(new Stream(DataAltitude.type, [200, 500, null, 502, null, 600, 700]));
    activity.addStream(new Stream(DataDistance.type, [0, 10, 20, 30, 40, 50, 60]));
    const a = activity.getStreamDataBasedOnTime([DataAltitude.type]);
    expect(activity.getStreamDataBasedOnTime([DataAltitude.type])).toEqual({
      "0": {
        "Altitude": 200
      },
      "1000": {
        "Altitude": 500
      },
      "3000": {
        "Altitude": 502
      },
      "5000": {
        "Altitude": 600
      },
      "6000": {
        "Altitude": 700
      }
    })
  });

});
