import { Event } from '../event';
import { DataSpeedMaxKilometersPerHour } from '../../data/data.speed-max';

import { Activity } from '../../activities/activity';
import { ActivityParsingOptions } from '../../activities/activity-parsing-options';
import { DataHeartRate } from '../../data/data.heart-rate';
import { DataAltitude } from '../../data/data.altitude';
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
import { DataSpeedKilometersPerHour } from '../../data/data.speed';
import { DataSwimPace } from '../../data/data.swim-pace';
import { DataAscent } from '../../data/data.ascent';
import { DataDescent } from '../../data/data.descent';

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

  describe('createUnitStreamsFromStreams', () => {
    it('should include derived types and unit variants by default', () => {
      const streams = [new Stream(DataSpeed.type, [10, 20])];
      const result = ActivityUtilities.createUnitStreamsFromStreams(streams, ActivityTypes.Running);

      const paceStream = result.find(s => s.type === DataPaceMinutesPerMile.type);
      const kmhStream = result.find(s => s.type === DataSpeedKilometersPerHour.type);

      expect(paceStream).toBeDefined();
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
        generateUnitStreams: false
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
    it('should generate unit STATS even if unit STREAMS are disabled', () => {
      const activity = new Activity(new Date(), new Date(), ActivityTypes.Running, new Creator('test'));
      activity.parseOptions = {
        streams: { smooth: {}, fixAbnormal: {} },
        maxActivityDurationDays: 14,
        generateUnitStreams: false // DISABLE streams
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
        generateUnitStreams: false
      };

      activity.addStream(new Stream(DataSpeed.type, [1, 2])); // m/s

      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);

      // Verify Unit Streams missing
      expect(activity.hasStreamData(DataSpeedKilometersPerHour.type)).toBe(false);

      // Verify Derived Base Stream (Swim Pace) IS present
      expect(activity.hasStreamData(DataSwimPace.type)).toBe(true);
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
        generateUnitStreams: false
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
