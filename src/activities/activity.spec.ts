import { Activity } from './activity';
import { ActivityInterface } from './activity.interface';
import { DataHeartRate } from '../data/data.heart-rate';
import { DataAltitude } from '../data/data.altitude';
import { ActivityTypes } from './activity.types';
import { Creator } from '../creators/creator';
import { Stream } from '../streams/stream';
import { DataDistance } from '../data/data.distance';

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
    expect(activity.getStreamDataTypesBasedOnTime([DataAltitude.type])).toEqual({
      0: {
        'Altitude': 200
      },
      1000: {
        'Altitude': 500
      },
      3000: {
        'Altitude': 502
      },
      5000: {
        'Altitude': 600
      },
      6000: {
        'Altitude': 700
      }
    });
    expect(activity.getStreamDataTypesBasedOnTime([DataDistance.type])).toEqual({
      0: {'Distance': 0},
      1000: {'Distance': 10},
      2000: {'Distance': 20},
      3000: {'Distance': 30},
      4000: {'Distance': 40},
      5000: {'Distance': 50},
      6000: {'Distance': 60}
    });
    expect(activity.getStreamDataTypesBasedOnTime([DataAltitude.type, DataDistance.type])).toEqual({
      0: {
        'Altitude': 200,
        'Distance': 0
      },
      1000: {'Altitude': 500, 'Distance': 10},
      2000: {'Distance': 20},
      3000: {'Altitude': 502, 'Distance': 30},
      4000: {'Distance': 40},
      5000: {'Altitude': 600, 'Distance': 50},
      6000: {'Altitude': 700, 'Distance': 60}
    });
  });


  it('should get streams based on another stream', () => {
    activity.addStream(new Stream(DataAltitude.type, [200, 500, null, 502, null, 600, 700]));
    activity.addStream(new Stream(DataHeartRate.type, [60, 70, 80, null, null, null, 120]));
    activity.addStream(new Stream(DataDistance.type, [0, 10, 20, 30, 40, 50, 60]));
    expect(activity.getStreamDataTypesBasedOnDataType(DataDistance.type, [DataAltitude.type])).toEqual({
      0: {
        'Altitude': 200
      },
      10: {
        'Altitude': 500
      },
      30: {
        'Altitude': 502
      },
      50: {
        'Altitude': 600
      },
      60: {
        'Altitude': 700
      }
    });
    expect(activity.getStreamDataTypesBasedOnDataType(DataDistance.type, [DataHeartRate.type, DataAltitude.type])).toEqual({
      0: {
        'Altitude': 200,
        'Heart Rate': 60
      },
      10: {
        'Altitude': 500,
        'Heart Rate': 70
      },
      20: {
        'Heart Rate': 80
      },
      30: {
        'Altitude': 502,
      },
      50: {
        'Altitude': 600
      },
      60: {
        'Altitude': 700,
        'Heart Rate': 120
      }
    });
    expect(activity.getStreamDataTypesBasedOnDataType(DataAltitude.type, [DataDistance.type])).toEqual({
      200: {
        'Distance': 0
      },
      500: {
        'Distance': 10
      },
      502: {
        'Distance': 30
      },
      600: {
        'Distance': 50
      },
      700: {
        'Distance': 60
      }
    });
  });

});
