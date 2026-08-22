import * as fs from 'fs';
import * as path from 'path';
import { EventImporterFIT } from './importer.fit';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { ActivityTypes } from '../../../../activities/activity.types';
import { DataCadence } from '../../../../data/data.cadence';
import { DataStrokeRate } from '../../../../data/data.stroke-rate';
import { DataDistance } from '../../../../data/data.distance';
import { DataDuration } from '../../../../data/data.duration';
import { DataHeartRate } from '../../../../data/data.heart-rate';
import { DataPace } from '../../../../data/data.pace';
import { DataSpeed } from '../../../../data/data.speed';
import { EventImporterJSON } from '../json/importer.json';
import { Activity } from '../../../../activities/activity';
import { Creator } from '../../../../creators/creator';

describe('EventImporterFIT', () => {
  describe('Sample stream construction', () => {
    it('maps each sample once, preserves mapping order, and keeps the last duplicate timestamp value', () => {
      const activity = new Activity(new Date(0), new Date(3000), ActivityTypes.Running, new Creator('Test'));
      activity.addStream(activity.createStream(DataDuration.type));

      const samples = [
        { timestamp: new Date(0), alpha: 1 },
        { timestamp: new Date(1000), alpha: 2, beta: 10 },
        { timestamp: new Date(1000), alpha: 3, beta: 20 },
        { timestamp: new Date(2000), alpha: Number.NaN, beta: Infinity },
        { timestamp: new Date(3000) }
      ];
      const alpha = jest.fn((sample: any) => sample.alpha);
      const beta = jest.fn((sample: any) => sample.beta);
      const missing = jest.fn(() => null);

      (EventImporterFIT as any).addSampleStreamsToActivity(
        activity,
        samples,
        [
          { dataType: 'Alpha', getSampleValue: alpha },
          { dataType: 'Beta', getSampleValue: beta },
          { dataType: 'Missing', getSampleValue: missing }
        ],
        { hasPowerMeter: false }
      );

      expect(activity.getAllStreams().map(stream => stream.type)).toEqual([DataDuration.type, 'Alpha', 'Beta']);
      expect(activity.getStreamData('Alpha')).toEqual([1, 3, null, null]);
      expect(activity.getStreamData('Beta')).toEqual([null, 20, Infinity, null]);
      expect(activity.hasStreamData('Missing')).toBe(false);
      expect(alpha).toHaveBeenCalledTimes(samples.length);
      expect(beta).toHaveBeenCalledTimes(samples.length);
      expect(missing).toHaveBeenCalledTimes(samples.length);
    });

    it('preserves sparse sample-array behavior', () => {
      const activity = new Activity(new Date(0), new Date(3000), ActivityTypes.Running, new Creator('Test'));
      activity.addStream(activity.createStream(DataDuration.type));
      const samples = new Array<any>(4);
      samples[0] = { timestamp: new Date(0), value: 1 };
      samples[2] = { timestamp: new Date(2000), value: 3 };
      const mapper = jest.fn((sample: any) => sample.value);

      (EventImporterFIT as any).addSampleStreamsToActivity(
        activity,
        samples,
        [{ dataType: 'Sparse', getSampleValue: mapper }],
        { hasPowerMeter: false }
      );

      expect(activity.getStreamData('Sparse')).toEqual([1, null, 3, null]);
      expect(mapper).toHaveBeenCalledTimes(2);
    });

    it('caches timestamp indexes across mappings and accepts supported timestamp representations', () => {
      const startDate = new Date('2023-03-01T09:00:45.000Z');
      const activity = new Activity(
        startDate,
        new Date(startDate.getTime() + 3000),
        ActivityTypes.Running,
        new Creator('Test')
      );
      const samples = [
        { timestamp: startDate.toISOString(), alpha: 1, beta: 10 },
        { timestamp: startDate.getTime() + 1000, alpha: 2, beta: 20 },
        { timestamp: new Date(startDate.getTime() + 2000), alpha: 3, beta: 30 }
      ];
      const getDateIndex = jest.spyOn(activity, 'getDateIndex');

      (EventImporterFIT as any).addSampleStreamsToActivity(
        activity,
        samples,
        [
          { dataType: 'Alpha', getSampleValue: (sample: any) => sample.alpha },
          { dataType: 'Beta', getSampleValue: (sample: any) => sample.beta }
        ],
        { hasPowerMeter: false }
      );

      expect(activity.getStreamData('Alpha')).toEqual([1, 2, 3, null]);
      expect(activity.getStreamData('Beta')).toEqual([10, 20, 30, null]);
      expect(getDateIndex).toHaveBeenCalledTimes(samples.length);
      expect(getDateIndex.mock.calls.map(([date]) => date.getTime())).toEqual([
        startDate.getTime(),
        startDate.getTime() + 1000,
        startDate.getTime() + 2000
      ]);
    });

    it('does not read timestamps for samples that produce no stream values', () => {
      const activity = new Activity(new Date(0), new Date(1000), ActivityTypes.Running, new Creator('Test'));
      const timestampGetter = jest.fn(() => new Date(0));
      const sample = {
        get timestamp() {
          return timestampGetter();
        }
      };

      (EventImporterFIT as any).addSampleStreamsToActivity(
        activity,
        [sample],
        [{ dataType: 'Missing', getSampleValue: () => null }],
        { hasPowerMeter: false }
      );

      expect(timestampGetter).not.toHaveBeenCalled();
      expect(activity.hasStreamData('Missing')).toBe(false);
    });
  });

  describe('Session normalization', () => {
    it('should synthesize a fallback session when sessions are missing but top-level messages exist', () => {
      const startDate = new Date('2026-03-06T08:14:19.000Z');
      const midDate = new Date('2026-03-06T08:24:19.000Z');
      const endDate = new Date('2026-03-06T08:44:19.000Z');
      const fitDataObject: any = {
        sessions: [],
        laps: [
          {
            start_time: startDate,
            timestamp: midDate,
            total_elapsed_time: 600,
            total_timer_time: 550,
            total_distance: 1000,
            total_ascent: 10,
            total_descent: 5,
            avg_grade: 1,
            max_pos_grade: 4,
            max_neg_grade: -2,
            sport: 'running',
            sub_sport: 'road',
            records: [{ timestamp: new Date('2026-03-06T08:14:20.000Z') }]
          },
          {
            start_time: midDate,
            timestamp: endDate,
            total_elapsed_time: 1200,
            total_timer_time: 1150,
            total_distance: 3000,
            total_ascent: 20,
            total_descent: 15,
            avg_grade: 5,
            max_pos_grade: 9,
            max_neg_grade: -6,
            sport: 'running',
            sub_sport: 'road',
            records: [{ timestamp: new Date('2026-03-06T08:24:20.000Z') }]
          }
        ],
        records: [
          { timestamp: startDate, distance: 0 },
          { timestamp: endDate, distance: 4000 }
        ],
        events: [{ timestamp: new Date('2026-03-06T08:14:25.000Z'), event: 'timer', event_type: 'start' }]
      };

      (EventImporterFIT as any).normalizeFitDataObjectForActivities(fitDataObject);

      expect(fitDataObject.sessions).toHaveLength(1);
      const session = fitDataObject.sessions[0];

      expect(session.laps).toHaveLength(2);
      expect(session.start_time.toISOString()).toBe(startDate.toISOString());
      expect(session.timestamp.toISOString()).toBe(endDate.toISOString());
      expect(session.total_elapsed_time).toBe(1800);
      expect(session.total_timer_time).toBe(1700);
      expect(session.total_distance).toBe(4000);
      expect(session.total_ascent).toBe(30);
      expect(session.total_descent).toBe(20);
      expect(session.avg_grade).toBe(4);
      expect(session.max_pos_grade).toBe(9);
      expect(session.max_neg_grade).toBe(-6);
      expect(session.sport).toBe('running');
      expect(session.sub_sport).toBe('road');
    });

    it('should use final record distance when sessionless lap summary distance coverage is incomplete', () => {
      const startDate = new Date('2026-03-06T08:14:19.000Z');
      const midDate = new Date('2026-03-06T08:24:19.000Z');
      const endDate = new Date('2026-03-06T08:44:19.000Z');
      const fitDataObject: any = {
        sessions: [],
        laps: [
          {
            start_time: startDate,
            timestamp: midDate,
            total_elapsed_time: 600,
            total_distance: 1000,
            total_ascent: 10
          },
          {
            start_time: midDate,
            timestamp: endDate,
            total_elapsed_time: 1200
          }
        ],
        records: [{ timestamp: startDate, distance: 0 }, { timestamp: midDate, distance: 4000 }, { timestamp: endDate }]
      };

      (EventImporterFIT as any).normalizeFitDataObjectForActivities(fitDataObject);

      const session = fitDataObject.sessions[0];

      expect(session.total_distance).toBe(4000);
      expect(session.total_ascent).toBeUndefined();
    });

    it('should keep sessions empty when no valid time boundaries exist', () => {
      const fitDataObject: any = {
        sessions: [],
        laps: [{ total_elapsed_time: 120 }],
        records: [{ timestamp: null }],
        events: [{ timestamp: 'not-a-date' }]
      };

      (EventImporterFIT as any).normalizeFitDataObjectForActivities(fitDataObject);

      expect(fitDataObject.sessions).toEqual([]);
    });

    it('should normalize existing sessions that miss laps arrays', () => {
      const fitDataObject: any = {
        sessions: [
          { start_time: new Date('2026-03-06T08:14:19.000Z'), timestamp: new Date('2026-03-06T08:44:19.000Z') }
        ]
      };

      (EventImporterFIT as any).normalizeFitDataObjectForActivities(fitDataObject);

      expect(Array.isArray(fitDataObject.records)).toBe(true);
      expect(Array.isArray(fitDataObject.events)).toBe(true);
      expect(Array.isArray(fitDataObject.laps)).toBe(true);
      expect(Array.isArray(fitDataObject.sessions[0].laps)).toBe(true);
      expect(fitDataObject.sessions[0].laps).toHaveLength(0);
    });
  });

  describe('HRV handling', () => {
    it('should preserve elapsed time after invalid HRV sentinel values', () => {
      const ibiData = (EventImporterFIT as any).getIBIDataForActivity([{ time: [1, 65.535, 1] }], new Date(0), {
        startDate: new Date(50000),
        endDate: new Date(70000)
      });

      expect(ibiData).toEqual([1000]);
    });

    it('should preserve elapsed time across consecutive invalid HRV sentinel values from multiple records', () => {
      const ibiData = (EventImporterFIT as any).getIBIDataForActivity(
        [{ time: [1, 65.535] }, { time: [65.535, 1] }],
        new Date(0),
        {
          startDate: new Date(130000),
          endDate: new Date(140000)
        }
      );

      expect(ibiData).toEqual([1000]);
    });

    it('should drop trailing invalid HRV sentinel values without emitting synthetic intervals', () => {
      const ibiData = (EventImporterFIT as any).getIBIDataForActivity([{ time: [1, 1, 65.535] }], new Date(0), {
        startDate: new Date(0),
        endDate: new Date(100000)
      });

      expect(ibiData).toEqual([1000, 1000]);
    });
  });

  describe('Swim lengths', () => {
    it('should expose FIT pool swim length rows and preserve them through JSON import', async () => {
      const fitFilePath = path.resolve(__dirname, '../../../../specs/fixtures/swim/fit/6860712481.fit');
      const fileBuffer = fs.readFileSync(fitFilePath);
      const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);

      const event = await EventImporterFIT.getFromArrayBuffer(
        arrayBuffer,
        ActivityParsingOptions.DEFAULT,
        'swim-lengths.fit'
      );
      const activity = event.getActivities()[0];
      const swimLengths = activity.getSwimLengths();

      expect(swimLengths).toHaveLength(94);
      expect(swimLengths.filter(length => length.type === 'active')).toHaveLength(80);
      expect(swimLengths.filter(length => length.type === 'idle')).toHaveLength(14);
      expect(swimLengths[0].poolLength?.getValue()).toBe(25);

      const firstActiveLength = swimLengths.find(length => length.type === 'active');
      expect(firstActiveLength?.distance?.getValue()).toBe(25);
      expect(firstActiveLength?.stroke).toBeTruthy();

      const firstIdleLength = swimLengths.find(length => length.type === 'idle');
      expect(firstIdleLength?.distance).toBeNull();

      const roundTrippedActivity = EventImporterJSON.getActivityFromJSON(activity.toJSON());
      expect(roundTrippedActivity.getSwimLengths().map(length => length.toJSON())).toEqual(
        swimLengths.map(length => length.toJSON())
      );
    });

    it('should expose swim lengths from original event 2e7c563f3145828e12ac2eff38ede2d9c4d3ff9f19d4c55aae9c9d6760ab4f7c', async () => {
      const fitFilePath = path.resolve(
        __dirname,
        '../../../../specs/fixtures/swim/fit/original-event-2e7c563f3145828e12ac2eff38ede2d9c4d3ff9f19d4c55aae9c9d6760ab4f7c.fit'
      );
      const fileBuffer = fs.readFileSync(fitFilePath);
      const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);

      const event = await EventImporterFIT.getFromArrayBuffer(
        arrayBuffer,
        ActivityParsingOptions.DEFAULT,
        'original-event-2e7c563f3145828e12ac2eff38ede2d9c4d3ff9f19d4c55aae9c9d6760ab4f7c.fit'
      );
      const activity = event.getActivities()[0];
      const swimLengths = activity.getSwimLengths();

      expect(event.getActivities()).toHaveLength(1);
      expect(activity.type).toBe(ActivityTypes.Swimming);
      expect(activity.getLaps()).toHaveLength(2);
      expect(swimLengths).toHaveLength(67);
      expect(swimLengths.filter(length => length.type === 'active')).toHaveLength(64);
      expect(swimLengths.filter(length => length.type === 'idle')).toHaveLength(3);
      expect(swimLengths.reduce((totalDistance, length) => totalDistance + (length.distance?.getValue() || 0), 0)).toBe(
        1600
      );
      expect(swimLengths[0].toJSON()).toEqual(
        expect.objectContaining({
          index: 1,
          lapIndex: 1,
          type: 'idle',
          distance: null,
          poolLength: 25
        })
      );

      const firstActiveLength = swimLengths.find(length => length.type === 'active');
      expect(firstActiveLength?.toJSON()).toEqual(
        expect.objectContaining({
          lapIndex: 1,
          stroke: 'freestyle',
          distance: 25,
          poolLength: 25
        })
      );

      const roundTrippedActivity = EventImporterJSON.getActivityFromJSON(activity.toJSON());
      expect(roundTrippedActivity.getSwimLengths().map(length => length.toJSON())).toEqual(
        swimLengths.map(length => length.toJSON())
      );
    });

    it('should prefer session-scoped lengths and normalize numeric swim enum fields', () => {
      const startDate = new Date('2026-05-16T15:27:09.000Z');
      const endDate = new Date('2026-05-16T15:27:34.000Z');
      const activity = new Activity(startDate, endDate, ActivityTypes.Swimming, new Creator('Test'));

      (EventImporterFIT as any).addSwimLengthsFromSessionObject(
        activity,
        {
          start_time: startDate,
          timestamp: endDate,
          total_elapsed_time: 25,
          pool_length: 25,
          pool_length_unit: 0,
          laps: [
            {
              start_time: startDate,
              timestamp: endDate,
              total_elapsed_time: 25,
              total_distance: 25
            }
          ],
          lengths: [
            {
              start_time: startDate,
              timestamp: endDate,
              total_elapsed_time: 25,
              total_timer_time: 25,
              length_type: 1,
              swim_stroke: 0,
              total_strokes: 8,
              avg_speed: 1,
              avg_swimming_cadence: 20
            }
          ]
        },
        {
          lengths: [
            {
              start_time: startDate,
              timestamp: endDate,
              total_elapsed_time: 25,
              total_timer_time: 25,
              length_type: 0
            }
          ]
        }
      );

      const swimLength = activity.getSwimLengths()[0];
      expect(swimLength.elapsedTime).toBeInstanceOf(DataDuration);
      expect(swimLength.distance).toBeInstanceOf(DataDistance);
      expect(swimLength.poolLength).toBeInstanceOf(DataDistance);
      expect(swimLength.avgSpeed).toBeInstanceOf(DataSpeed);
      expect(swimLength.avgCadence).toBeInstanceOf(DataStrokeRate);
      expect(swimLength.avgCadence?.getUnit()).toBe('spm');

      expect(activity.getSwimLengths().map(length => length.toJSON())).toEqual([
        expect.objectContaining({
          index: 1,
          lapIndex: 1,
          type: 'active',
          stroke: 'freestyle',
          distance: 25,
          poolLength: 25,
          strokes: 8,
          avgSpeed: 1
        })
      ]);
    });
  });

  describe('Activity type resolution', () => {
    it('should map Garmin snorkeling sport id to canonical Snorkeling activity type', () => {
      const activityType = (EventImporterFIT as any).getActivityTypeFromSessionObject({
        sport: 82
      });

      expect(activityType).toEqual(ActivityTypes.Snorkeling);
    });

    it.each([
      [53, ActivityTypes.ScubaDiving],
      [54, ActivityTypes.ScubaDiving],
      [55, ActivityTypes.ScubaDiving],
      [56, ActivityTypes.FreeDiving],
      [57, ActivityTypes.FreeDiving]
    ])('should map Garmin diving sub-sport id %s to its canonical type', (subSport, expectedType) => {
      const activityType = (EventImporterFIT as any).getActivityTypeFromSessionObject({
        sport: 53,
        sub_sport: subSport
      });

      expect(activityType).toEqual(expectedType);
    });

    it('should map Garmin HIIT sport id 62 to canonical HIIT when sport is numeric', () => {
      const activityType = (EventImporterFIT as any).getActivityTypeFromSessionObject({
        sport: 62,
        sub_sport: 0
      });

      expect(activityType).toEqual(ActivityTypes.HIIT);
    });

    it('should not leak unresolved numeric sport ids when generic sub sport is present', () => {
      const activityType = (EventImporterFIT as any).getActivityTypeFromSessionObject({
        sport: 999999,
        sub_sport: 0
      });

      expect(activityType).toEqual(ActivityTypes.Generic);
    });

    it('should fall back to Unknown Sport when sport id is unresolved and no mapped fallback exists', () => {
      const activityType = (EventImporterFIT as any).getActivityTypeFromSessionObject({
        sport: 999999
      });

      expect(activityType).toEqual(ActivityTypes.unknown);
    });

    it('should map sport profile name ENDURO MTB to canonical Enduro MTB activity type', () => {
      const activityType = (EventImporterFIT as any).getActivityTypeFromSessionObject({
        sport: 'cycling',
        sub_sport: 123,
        sport_profile_name: 'ENDURO MTB'
      });

      expect(activityType).toEqual(ActivityTypes['Enduro MTB']);
    });

    it('should map rock_climbing + sub_sport id 68 to Indoor Climbing', () => {
      const activityType = (EventImporterFIT as any).getActivityTypeFromSessionObject({
        sport: 'rock_climbing',
        sub_sport: 68
      });

      expect(activityType).toEqual(ActivityTypes['Indoor Climbing']);
    });

    it('should map numeric string sport/sub_sport ids to Indoor Climbing', () => {
      const activityType = (EventImporterFIT as any).getActivityTypeFromSessionObject({
        sport: '31',
        sub_sport: '68'
      });

      expect(activityType).toEqual(ActivityTypes['Indoor Climbing']);
    });

    it('should map rock_climbing + sub_sport id 69 to Bouldering', () => {
      const activityType = (EventImporterFIT as any).getActivityTypeFromSessionObject({
        sport: 31,
        sub_sport: 69
      });

      expect(activityType).toEqual(ActivityTypes.Bouldering);
    });
  });

  describe('Handle device creator', () => {
    function generateFitDeviceDataObject(
      manufacturer: string | number | null = null,
      productId = -1,
      productName: string | null = null
    ) {
      const data: any = {};

      if (manufacturer !== null) {
        data.manufacturer = manufacturer;
      }

      if (productId !== -1) {
        data.product = productId;
      }

      if (productName) {
        data.product_name = productName;
      }

      return {
        file_ids: [data]
      };
    }
    describe('Recognized', () => {
      it('should recognize a known Suunto device', done => {
        const manufacturer = 'suunto';
        const expectedName = 'Suunto Ambit3 Peak';
        const productId = 22;
        const fitDataObject = generateFitDeviceDataObject(manufacturer, productId);

        // When
        const creator = EventImporterFIT.getCreatorFromFitDataObject(fitDataObject);

        // Then
        expect(creator.isRecognized).toBeTruthy();
        expect(creator.name).toEqual(expectedName);
        expect(creator.manufacturer).toEqual(manufacturer);
        done();
      });

      it('should recognize a known Coros device', done => {
        const manufacturer = 'coros';
        const expectedName = 'Coros APEX Pro';
        const productId = 841;
        const fitDataObject = generateFitDeviceDataObject(manufacturer, productId);

        // When
        const creator = EventImporterFIT.getCreatorFromFitDataObject(fitDataObject);

        // Then
        expect(creator.isRecognized).toBeTruthy();
        expect(creator.name).toEqual(expectedName);
        expect(creator.manufacturer).toEqual(manufacturer);
        done();
      });

      it('should recognize a known Garmin device', done => {
        const manufacturer = 'garmin';
        const expectedName = 'Garmin Edge 1000';
        const productId = 1836;
        const fitDataObject = generateFitDeviceDataObject(manufacturer, productId);

        // When
        const creator = EventImporterFIT.getCreatorFromFitDataObject(fitDataObject);

        // Then
        expect(creator.isRecognized).toBeTruthy();

        expect(creator.name).toEqual(expectedName);
        expect(creator.manufacturer).toEqual(manufacturer);
        done();
      });

      it('should recognize a known Wahoo device', done => {
        const manufacturer = 'wahoo_fitness';
        const expectedName = 'Wahoo ELEMNT BOLT';
        const productId = 31;
        const fitDataObject = generateFitDeviceDataObject(manufacturer, productId);

        // When
        const creator = EventImporterFIT.getCreatorFromFitDataObject(fitDataObject);

        // Then
        expect(creator.isRecognized).toBeTruthy();

        expect(creator.name).toEqual(expectedName);
        expect(creator.manufacturer).toEqual(manufacturer);
        done();
      });

      it('should recognize a known hammerhead device', done => {
        const manufacturer = 'hammerhead';
        const expectedName = 'Hammerhead Karoo 2';
        const productId = 2;
        const fitDataObject = generateFitDeviceDataObject(manufacturer, productId);

        // When
        const creator = EventImporterFIT.getCreatorFromFitDataObject(fitDataObject);

        // Then
        expect(creator.isRecognized).toBeTruthy();

        expect(creator.name).toEqual(expectedName);
        expect(creator.manufacturer).toEqual(manufacturer);
        done();
      });

      it('should recognize a known SRM device', done => {
        const manufacturer = 'srm';
        const expectedName = 'Srm PC8';
        const productId = 8;
        const fitDataObject = generateFitDeviceDataObject(manufacturer, productId);

        // When
        const creator = EventImporterFIT.getCreatorFromFitDataObject(fitDataObject);

        // Then
        expect(creator.isRecognized).toBeTruthy();

        expect(creator.name).toEqual(expectedName);
        expect(creator.manufacturer).toEqual(manufacturer);
        done();
      });

      it('should recognize a known zwift virtual device', done => {
        const manufacturer = 'zwift';
        const expectedName = 'Zwift';
        const fitDataObject = generateFitDeviceDataObject(manufacturer);

        // When
        const creator = EventImporterFIT.getCreatorFromFitDataObject(fitDataObject);

        // Then
        expect(creator.isRecognized).toBeTruthy();

        expect(creator.name).toEqual(expectedName);
        expect(creator.manufacturer).toEqual(manufacturer);
        done();
      });

      it('should recognize a known Rouvy virtual device', done => {
        const manufacturer = 'virtualtraining';
        const expectedName = 'Rouvy';
        const fitDataObject = generateFitDeviceDataObject(manufacturer, 1);

        // When
        const creator = EventImporterFIT.getCreatorFromFitDataObject(fitDataObject);

        // Then
        expect(creator.isRecognized).toBeTruthy();

        expect(creator.name).toEqual(expectedName);
        expect(creator.manufacturer).toEqual(manufacturer);
        done();
      });

      it('should recognize a known Wahoo SYSTM virtual device', done => {
        const manufacturer = 'the_sufferfest';
        const expectedName = 'Wahoo SYSTM';
        const productId = 1231;
        const fitDataObject = generateFitDeviceDataObject(manufacturer, productId);

        // When
        const creator = EventImporterFIT.getCreatorFromFitDataObject(fitDataObject);

        // Then
        expect(creator.isRecognized).toBeTruthy();

        expect(creator.name).toEqual(expectedName);
        expect(creator.manufacturer).toEqual(manufacturer);
        done();
      });

      it('should recognize a known development device', done => {
        const manufacturer = 'development';
        const expectedName = 'Zwift';
        const productId = 15706;
        const fitDataObject = generateFitDeviceDataObject(manufacturer, productId);

        // When
        const creator = EventImporterFIT.getCreatorFromFitDataObject(fitDataObject);

        // Then
        expect(creator.isRecognized).toBeTruthy();

        expect(creator.name).toEqual(expectedName);
        expect(creator.manufacturer).toEqual(manufacturer);
        done();
      });
    });

    describe('Non recognized', () => {
      describe('Known manufacturer with unknown productId & known product name', () => {
        it('should format a non-recognized development device with known productId & unknown product name', done => {
          const manufacturer = 'development';
          const productId = 42;
          const expectedName = 'Unknown';
          const fitDataObject = generateFitDeviceDataObject(manufacturer, productId);

          // When
          const creator = EventImporterFIT.getCreatorFromFitDataObject(fitDataObject);

          // Then
          expect(creator.isRecognized).toBeTruthy();
          expect(creator.name).toEqual(expectedName);
          expect(creator.manufacturer).toEqual(manufacturer);
          done();
        });
      });

      describe('Known manufacturer with unknown productId & known product name', () => {
        it('should format a non-recognized Coros device with unknown productId & known product name', done => {
          const manufacturer = 'coros';
          const productId = Math.random();
          const productName = 'COROS REFLEX Fake';
          const expectedName = 'Coros REFLEX Fake';
          const fitDataObject = generateFitDeviceDataObject(manufacturer, productId, productName);

          // When
          const creator = EventImporterFIT.getCreatorFromFitDataObject(fitDataObject);

          // Then
          expect(creator.isRecognized).toBeFalsy();
          expect(creator.name).toEqual(expectedName);
          expect(creator.manufacturer).toEqual(manufacturer);
          done();
        });

        it('should format a non-recognized Wahoo device with unknown productId & known product name', done => {
          const manufacturer = 'wahoo_fitness';
          const productId = Math.random();
          const productName = 'Fake';
          const expectedName = 'Wahoo Fake';
          const fitDataObject = generateFitDeviceDataObject(manufacturer, productId, productName);

          // When
          const creator = EventImporterFIT.getCreatorFromFitDataObject(fitDataObject);

          // Then
          expect(creator.isRecognized).toBeFalsy();
          expect(creator.name).toEqual(expectedName);
          expect(creator.manufacturer).toEqual(manufacturer);
          done();
        });
      });

      describe('Known manufacturer with unknown productId & missing product name', () => {
        it('should format a non-recognized Suunto device with unknown productId & missing product name', done => {
          const manufacturer = 'suunto';
          const expectedName = 'Suunto';
          const productId = Math.random();
          const fitDataObject = generateFitDeviceDataObject(manufacturer, productId);

          // When
          const creator = EventImporterFIT.getCreatorFromFitDataObject(fitDataObject);

          // Then
          expect(creator.isRecognized).toBeFalsy();
          expect(creator.name).toEqual(expectedName);
          expect(creator.manufacturer).toEqual(manufacturer);
          done();
        });

        it('should format a non-recognized Garmin device with unknown productId & missing product name', done => {
          const manufacturer = 'garmin';
          const expectedName = 'Garmin';
          const productId = Math.random();
          const fitDataObject = generateFitDeviceDataObject(manufacturer, productId);

          // When
          const creator = EventImporterFIT.getCreatorFromFitDataObject(fitDataObject);

          // Then
          expect(creator.isRecognized).toBeFalsy();
          expect(creator.name).toEqual(expectedName);
          expect(creator.manufacturer).toEqual(manufacturer);
          done();
        });

        it('should format a non-recognized Wahoo device with unknown productId & missing product name', done => {
          const manufacturer = 'wahoo_fitness';
          const expectedName = 'Wahoo';
          const productId = Math.random();
          const fitDataObject = generateFitDeviceDataObject(manufacturer, productId);

          // When
          const creator = EventImporterFIT.getCreatorFromFitDataObject(fitDataObject);

          // Then
          expect(creator.isRecognized).toBeFalsy();
          expect(creator.name).toEqual(expectedName);
          expect(creator.manufacturer).toEqual(manufacturer);
          done();
        });
      });

      describe('Known manufacturer with missing productId & missing product name', () => {
        it('should format a non-recognized Suunto device without productId && product name', done => {
          const manufacturer = 'suunto';
          const expectedName = 'Suunto';
          const fitDataObject = generateFitDeviceDataObject(manufacturer);

          // When
          const creator = EventImporterFIT.getCreatorFromFitDataObject(fitDataObject);

          // Then
          expect(creator.isRecognized).toBeFalsy();
          expect(creator.name).toEqual(expectedName);
          expect(creator.manufacturer).toEqual(manufacturer);
          done();
        });

        it('should format a non-recognized Garmin device without productId && product name', done => {
          const manufacturer = 'garmin';
          const expectedName = 'Garmin';
          const fitDataObject = generateFitDeviceDataObject(manufacturer);

          // When
          const creator = EventImporterFIT.getCreatorFromFitDataObject(fitDataObject);

          // Then
          expect(creator.isRecognized).toBeFalsy();
          expect(creator.name).toEqual(expectedName);
          expect(creator.manufacturer).toEqual(manufacturer);
          done();
        });

        it('should format a non-recognized Garmin device without productId && product name', done => {
          const manufacturer = 'wahoo_fitness';
          const expectedName = 'Wahoo';
          const fitDataObject = generateFitDeviceDataObject(manufacturer);

          // When
          const creator = EventImporterFIT.getCreatorFromFitDataObject(fitDataObject);

          // Then
          expect(creator.isRecognized).toBeFalsy();
          expect(creator.name).toEqual(expectedName);
          expect(creator.manufacturer).toEqual(manufacturer);
          done();
        });
      });

      describe('Unknown manufacturer with missing productId & missing product name', () => {
        it('should format a non-recognized Suunto device without productId && product name', done => {
          const manufacturer = 'reactive';
          const expectedName = 'Reactive';
          const fitDataObject = generateFitDeviceDataObject(manufacturer);

          // When
          const creator = EventImporterFIT.getCreatorFromFitDataObject(fitDataObject);

          // Then
          expect(creator.isRecognized).toBeFalsy();
          expect(creator.name).toEqual(expectedName);
          expect(creator.manufacturer).toEqual(manufacturer);
          done();
        });

        it('should format a non-recognized Garmin device without productId && product name', done => {
          const manufacturer = 'high_cadence_fitness';
          const expectedName = 'High Cadence Fitness';
          const fitDataObject = generateFitDeviceDataObject(manufacturer);

          // When
          const creator = EventImporterFIT.getCreatorFromFitDataObject(fitDataObject);

          // Then
          expect(creator.isRecognized).toBeFalsy();
          expect(creator.name).toEqual(expectedName);
          expect(creator.manufacturer).toEqual(manufacturer);
          done();
        });
      });

      describe('Empty manufacturer with missing productId & missing product name', () => {
        it('should format a non-recognized device without manufacturer, productId && product name (1)', done => {
          const manufacturer = 0;
          const expectedName = 'Unknown';
          const fitDataObject = generateFitDeviceDataObject(manufacturer);

          // When
          const creator = EventImporterFIT.getCreatorFromFitDataObject(fitDataObject);

          // Then
          expect(creator.isRecognized).toBeFalsy();
          expect(creator.name).toEqual(expectedName);
          expect(creator.manufacturer).toEqual(manufacturer);
          done();
        });

        it('should format a non-recognized device without manufacturer, productId && product name (2)', done => {
          const expectedName = 'Unknown';
          const fitDataObject = generateFitDeviceDataObject();

          // When
          const creator = EventImporterFIT.getCreatorFromFitDataObject(fitDataObject);

          // Then
          expect(creator.isRecognized).toBeFalsy();
          expect(creator.name).toEqual(expectedName);
          done();
        });

        it('should not throw for non-zero numeric manufacturer values', done => {
          const manufacturer = 99999;
          const expectedName = 'Unknown';
          const fitDataObject = generateFitDeviceDataObject(manufacturer);

          const creator = EventImporterFIT.getCreatorFromFitDataObject(fitDataObject);

          expect(creator.isRecognized).toBeFalsy();
          expect(creator.name).toEqual(expectedName);
          expect(creator.manufacturer).toEqual(manufacturer);
          done();
        });
      });
    });
  });

  describe('Stream includeTypes filtering', () => {
    const sampleFitPath = path.resolve(__dirname, '../../../../../samples/fit/garmin.fit');

    function toArrayBuffer(fileBuffer: Buffer): ArrayBuffer {
      return fileBuffer.buffer.slice(
        fileBuffer.byteOffset,
        fileBuffer.byteOffset + fileBuffer.byteLength
      ) as ArrayBuffer;
    }

    async function parseSample(options: ActivityParsingOptions): Promise<string[]> {
      const fileBuffer = fs.readFileSync(sampleFitPath);
      const event = await EventImporterFIT.getFromArrayBuffer(toArrayBuffer(fileBuffer), options, 'fit-stream-filter');
      return event
        .getActivities()[0]
        .getAllStreams()
        .map(stream => stream.type);
    }

    it('should keep baseline behavior when includeTypes is empty', async () => {
      const baseOptions = new ActivityParsingOptions({ generateUnitStreams: false });
      const emptyFilterOptions = new ActivityParsingOptions({
        generateUnitStreams: false,
        streams: { includeTypes: [] }
      });

      const baselineTypes = new Set(await parseSample(baseOptions));
      const emptyFilterTypes = new Set(await parseSample(emptyFilterOptions));
      expect(emptyFilterTypes).toEqual(baselineTypes);
    });

    it('should return only requested raw streams', async () => {
      const streamTypes = new Set(
        await parseSample(
          new ActivityParsingOptions({
            streams: { includeTypes: [DataDistance.type, DataHeartRate.type] }
          })
        )
      );

      expect(streamTypes).toEqual(new Set([DataDistance.type, DataHeartRate.type]));
    });

    it('should expose only Stroke Rate when requested for open-water swimming', async () => {
      const swimFitPath = path.resolve(__dirname, '../../../../specs/fixtures/swim/fit/6788312639-1.fit');
      const fileBuffer = fs.readFileSync(swimFitPath);
      const event = await EventImporterFIT.getFromArrayBuffer(
        toArrayBuffer(fileBuffer),
        new ActivityParsingOptions({ streams: { includeTypes: [DataStrokeRate.type] } }),
        'open-water-stroke-rate.fit'
      );
      const activity = event.getFirstActivity();

      expect(activity.type).toBe(ActivityTypes.OpenWaterSwimming);
      expect(activity.getAllStreams().map(stream => stream.type)).toEqual([DataStrokeRate.type]);
      expect(activity.getSquashedStreamData(DataStrokeRate.type).length).toBeGreaterThan(0);
      expect(activity.hasStreamData(DataCadence.type)).toBe(false);
    });

    it('should return only requested derived streams', async () => {
      const streamTypes = new Set(
        await parseSample(
          new ActivityParsingOptions({
            streams: { includeTypes: [DataPace.type] }
          })
        )
      );

      expect(streamTypes).toEqual(new Set([DataPace.type]));
    });

    it('should return only requested mixed raw and derived streams', async () => {
      const streamTypes = new Set(
        await parseSample(
          new ActivityParsingOptions({
            streams: { includeTypes: [DataDistance.type, DataPace.type] }
          })
        )
      );

      expect(streamTypes).toEqual(new Set([DataDistance.type, DataPace.type]));
    });

    it('should preserve stream order after includeTypes pruning', async () => {
      const includeTypes = [DataDistance.type, DataPace.type];
      const baselineStreamTypes = await parseSample(new ActivityParsingOptions({ generateUnitStreams: false }));
      const filteredStreamTypes = await parseSample(
        new ActivityParsingOptions({
          generateUnitStreams: false,
          streams: { includeTypes }
        })
      );

      const expectedOrder = baselineStreamTypes.filter(type => includeTypes.includes(type));
      expect(filteredStreamTypes).toEqual(expectedOrder);
      expect(filteredStreamTypes).toEqual(includeTypes);
    });

    it('should throw when includeTypes contains unknown stream types', async () => {
      await expect(
        parseSample(
          new ActivityParsingOptions({
            streams: { includeTypes: ['Not A Stream Type'] }
          })
        )
      ).rejects.toThrow('Unknown stream includeTypes');
    });
  });
});
