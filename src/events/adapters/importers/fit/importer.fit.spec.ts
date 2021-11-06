import { EventImporterFIT } from './importer.fit';

describe('EventImporterFIT', () => {
  describe('Handle device creator', () => {
    function generateFitDeviceDataObject(
      manufacturer: string | number | null = null,
      productId = -1,
      productName: string | null = null
    ) {
      const data: any = {};

      if (productId !== null) {
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
        const productId = 2274;
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
    });

    describe('Non recognized', () => {
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
      });

      // TODO Unknown Manufacturer and product name

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
      });
    });
  });
});
