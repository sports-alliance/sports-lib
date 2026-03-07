import * as fs from 'fs';
import * as path from 'path';
import { EventImporterFIT } from './importer.fit';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { ActivityTypes } from '../../../../activities/activity.types';
import { DataDistance } from '../../../../data/data.distance';
import { DataHeartRate } from '../../../../data/data.heart-rate';
import { DataPace } from '../../../../data/data.pace';

describe('EventImporterFIT', () => {
  describe('HRV handling', () => {
    it('should preserve elapsed time after invalid HRV sentinel values', () => {
      const ibiData = (EventImporterFIT as any).getIBIDataForActivity(
        [{ time: [1, 65.535, 1] }],
        new Date(0),
        {
          startDate: new Date(50000),
          endDate: new Date(70000)
        }
      );

      expect(ibiData).toEqual([1000]);
    });
  });

  describe('Activity type resolution', () => {
    it('should map Garmin snorkeling sport id to canonical Snorkeling activity type', () => {
      const activityType = (EventImporterFIT as any).getActivityTypeFromSessionObject({
        sport: 82
      });

      expect(activityType).toEqual(ActivityTypes.Snorkeling);
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
