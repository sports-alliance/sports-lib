import { Activity } from './activity';
import { ActivityInterface } from './activity.interface';
import { DataHeartRate } from '../data/data.heart-rate';
import { DataAltitude } from '../data/data.altitude';
import { ActivityTypes } from './activity.types';
import { Creator } from '../creators/creator';
import { Stream } from '../streams/stream';
import { DataDistance } from '../data/data.distance';
import { DataStopEvent } from '../data/data.stop-event';
import { DataStartEvent } from '../data/data.start-event';
import { DataStopAllEvent } from '../data/data.stop-all-event';

describe('Activity', () => {

  let activity: ActivityInterface;

  beforeEach(() => {
    // New activity that ends +6m and is 10s duration from new Date(0)
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
    activity.addStream(new Stream(DataAltitude.type, [200, 500, null, 502, null, 500, 700]));
    activity.addStream(new Stream(DataHeartRate.type, [60, 70, 80, null, null, null, 120]));
    activity.addStream(new Stream(DataDistance.type, [0, 10, 20, 30, 40, 50, 60]));
    expect(activity.getStreamDataTypesBasedOnDataType(DataDistance.type, [DataAltitude.type])).toEqual([
      {
        'Altitude': 200,
        'Distance': 0
      },
      {
        'Altitude': 500,
        'Distance': 10
      },
      {
        'Altitude': null,
        'Distance': 20
      },
      {
        'Altitude': 502,
        'Distance': 30
      },
      {
        'Altitude': null,
        'Distance': 40
      },
      {
        'Altitude': 500,
        'Distance': 50
      },
      {
        'Altitude': 700,
        'Distance': 60
      }
    ]);
    expect(activity.getStreamDataTypesBasedOnDataType(DataDistance.type, [DataHeartRate.type, DataAltitude.type])).toEqual([
    {
      'Altitude': 200,
      'Distance': 0,
      'Heart Rate': 60
    },
    {
      'Altitude': 500,
      'Distance': 10,
      'Heart Rate': 70
    },
    {
      'Altitude': null,
      'Distance': 20,
      'Heart Rate': 80
    },
    {
      'Altitude': 502,
      'Distance': 30,
      'Heart Rate': null
    },
    {
      'Altitude': null,
      'Distance': 40,
      'Heart Rate': null
    },
    {
      'Altitude': 500,
      'Distance': 50,
      'Heart Rate': null
    },
    {
      'Altitude': 700,
      'Distance': 60,
      'Heart Rate': 120
    }
    ]);
    expect(activity.getStreamDataTypesBasedOnDataType(DataAltitude.type, [DataDistance.type, DataHeartRate.type])).toEqual([
      {
        'Altitude': 200,
        'Distance': 0,
        'Heart Rate': 60
      },
      {
        'Altitude': 500,
        'Distance': 10,
        'Heart Rate': 70
      },
      {
        'Altitude': 502,
        'Distance': 30,
        'Heart Rate': null
      },
      {
        'Altitude': 500,
        'Distance': 50,
        'Heart Rate': null
      },
      {
        'Altitude': 700,
        'Distance': 60,
        'Heart Rate': 120
      }
    ]);
  });

  describe('Trainer flagging', () => {

    it('should flag activities to be performed on a trainer', () => {

      // Given
      const types = [
        ActivityTypes.VirtualRun,
        ActivityTypes.VirtualCycling,
        ActivityTypes.Treadmill,
        ActivityTypes.IndoorCycling,
        ActivityTypes.IndoorRunning,
        ActivityTypes.IndoorRowing,
        ActivityTypes.Crosstrainer,
        ActivityTypes.EllipticalTrainer,
        ActivityTypes.FitnessEquipment,
        ActivityTypes.StairStepper,
      ];

      // When, Then
      types.forEach(type => {
        const fakeActivity = new Activity(new Date(), new Date(), type, new Creator('John doo'));
        expect(fakeActivity.isTrainer()).toBeTruthy();
      })

    });

    it('should NOT flag activities to be performed on a trainer', () => {

      // Given
      const types = [
        ActivityTypes.Aerobics,
        ActivityTypes.AlpineSkiing,
        ActivityTypes.AmericanFootball,
        ActivityTypes.Aquathlon,
        ActivityTypes.BackcountrySkiing,
        ActivityTypes.Badminton,
        ActivityTypes.Baseball,
        ActivityTypes.Basketball,
        ActivityTypes.Boxing,
        ActivityTypes.Canoeing,
        ActivityTypes.CardioTraining,
        ActivityTypes.Climbing,
        ActivityTypes.Combat,
        ActivityTypes.Cricket,
        ActivityTypes.Crossfit,
        ActivityTypes.CrosscountrySkiing,
        ActivityTypes.Cycling,
        ActivityTypes.Dancing,
        ActivityTypes.Diving,
        ActivityTypes.DownhillSkiing,
        ActivityTypes.Driving,
        ActivityTypes.Duathlon,
        ActivityTypes.EBikeRide,
        ActivityTypes.Fishing,
        ActivityTypes.FlexibilityTraining,
        ActivityTypes.FloorClimbing,
        ActivityTypes.Floorball,
        ActivityTypes.Flying,
        ActivityTypes.Football,
        ActivityTypes.FreeDiving,
        ActivityTypes.Frisbee,
        ActivityTypes.Generic,
        ActivityTypes.Golf,
        ActivityTypes.Gymnastics,
        ActivityTypes.Handcycle,
        ActivityTypes.Handball,
        ActivityTypes.HangGliding,
        ActivityTypes.Hiking,
        ActivityTypes.HorsebackRiding,
        ActivityTypes.IceHockey,
        ActivityTypes.IceSkating,
        ActivityTypes.IndoorTraining,
        ActivityTypes.InlineSkating,
        ActivityTypes.Kayaking,
        ActivityTypes.Kettlebell,
        ActivityTypes.Kitesurfing,
        ActivityTypes.Motorcycling,
        ActivityTypes.Motorsports,
        ActivityTypes.MountainBiking,
        ActivityTypes.Mountaineering,
        ActivityTypes.NordicWalking,
        ActivityTypes.OpenWaterSwimming,
        ActivityTypes.Orienteering,
        ActivityTypes.Paddling,
        ActivityTypes.Paragliding,
        ActivityTypes.Rafting,
        ActivityTypes.RockClimbing,
        ActivityTypes.RollerSki,
        ActivityTypes.Rowing,
        ActivityTypes.Rugby,
        ActivityTypes.Running,
        ActivityTypes.Sailing,
        ActivityTypes.ScubaDiving,
        ActivityTypes.Skating,
        ActivityTypes.SkiTouring,
        ActivityTypes.SkyDiving,
        ActivityTypes.Snorkeling,
        ActivityTypes.Snowboarding,
        ActivityTypes.Snowmobiling,
        ActivityTypes.Snowshoeing,
        ActivityTypes.Soccer,
        ActivityTypes.Softball,
        ActivityTypes.Squash,
        ActivityTypes.StandUpPaddling,
        ActivityTypes.StrengthTraining,
        ActivityTypes.Stretching,
        ActivityTypes.Surfing,
        ActivityTypes.Swimming,
        ActivityTypes.Swimrun,
        ActivityTypes.TableTennis,
        ActivityTypes.Tactical,
        ActivityTypes.TelemarkSkiing,
        ActivityTypes.Tennis,
        ActivityTypes.TrackAndField,
        ActivityTypes.TrailRunning,
        ActivityTypes.Training,
        ActivityTypes.Trekking,
        ActivityTypes.Triathlon,
        ActivityTypes.UnknownSport,
        ActivityTypes.Velomobile,
        ActivityTypes.Volleyball,
        ActivityTypes.Wakeboarding,
        ActivityTypes.Walking,
        ActivityTypes.WaterSkiing,
        ActivityTypes.WeightTraining,
        ActivityTypes.Wheelchair,
        ActivityTypes.Windsurfing,
        ActivityTypes.Workout,
        ActivityTypes.Yoga,
        ActivityTypes.YogaPilates,
      ];

      // When, Then
      types.forEach(type => {
        const fakeActivity = new Activity(new Date(), new Date(), type, new Creator('John doo'));
        expect(fakeActivity.isTrainer()).toBeFalsy();
      })

    });

  });

  it('should get the time stream', () => {
    activity.addStreams([
      //                                   0     1    2       3       4         5    6     7    8 9 and 10 are not set
      new Stream(DataAltitude.type, [200, null, 502, Infinity, -Infinity, NaN,  0]),
      new Stream(DataDistance.type, [0,   null,   600,   700,   800,      null, NaN, 900, Infinity])
    ])
    expect(activity.generateTimeStream().getData()).toEqual([0, null, 2, 3, 4, null, 6, 7, 8, null, null]);
    expect(activity.generateTimeStream().getData(true)).toEqual([0, 2, 3, 4, 6, 7, 8]);
    expect(activity.generateTimeStream().getData(false)).toEqual([0, null, 2, 3, 4, null, 6, 7, 8, null, null]);
  });


  it('should set the correct sample sizes', () => {
    const stream = activity.createStream(DataAltitude.type);
    expect(stream.getData().length).toBe(11);
  });

  it('should get and set the correct sample keys and ', () => {
    const stream = activity.createStream(DataAltitude.type);
    activity.addStream(stream);
    activity.addDataToStream(DataAltitude.type, new Date(0), 0);
    activity.addDataToStream(DataAltitude.type, new Date(500), 5);
    activity.addDataToStream(DataAltitude.type, new Date(1040), 10);
    activity.addDataToStream(DataAltitude.type, new Date(2010), 20);
    activity.addDataToStream(DataAltitude.type, new Date(2060), 30);
    activity.addDataToStream(DataAltitude.type, new Date(2080), 35);
    activity.addDataToStream(DataAltitude.type, new Date(3000), 40);
    activity.addDataToStream(DataAltitude.type, new Date(4000), 50);
    activity.addDataToStream(DataAltitude.type, new Date(5000), 60);
    activity.addDataToStream(DataAltitude.type, new Date(6300), 70);
    activity.addDataToStream(DataAltitude.type, new Date(7000), 80);
    activity.addDataToStream(DataAltitude.type, new Date(8000), 90);
    activity.addDataToStream(DataAltitude.type, new Date(9000), 100);
    activity.addDataToStream(DataAltitude.type, new Date(10000), 110);
    expect(stream.getData()).toEqual([
      0,
      10,
      35,
      40,
      50,
      60,
      70,
      80,
      90,
      100,
      110,
    ])
  });

  it('should get events correctly', () => {
    activity.addEvent(new DataStopEvent(1));
    activity.addEvent(new DataStopEvent(1));
    activity.addEvent(new DataStartEvent(1));
    activity.addEvent(new DataStartEvent(1));
    activity.addEvent(new DataStopAllEvent(1));
    expect(activity.getAllEvents().length).toBe(5);
    expect(activity.getStartEvents().length).toBe(2);
    expect(activity.getStopEvents().length).toBe(2);
    expect(activity.getStopAllEvents().length).toBe(1);
  });

  it('should set all events', () => {
    activity.setAllEvents([
      new DataStopEvent(1),
      new DataStopEvent(1),
      new DataStartEvent(1),
      new DataStartEvent(1),
      new DataStopAllEvent(1),
    ])
    expect(activity.getAllEvents().length).toBe(5);
    expect(activity.getStartEvents().length).toBe(2);
    expect(activity.getStopEvents().length).toBe(2);
    expect(activity.getStopAllEvents().length).toBe(1);
  });
});
