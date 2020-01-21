import * as fs from 'fs';
import * as xmldom from 'xmldom';
import {QuantifiedSelfLib} from '../../../src';
import {EventInterface} from '../../../src/events/event.interface';
import {DataHeartRate} from '../../../src/data/data.heart-rate';
import {DataLongitudeDegrees} from '../../../src/data/data.longitude-degrees';
import {DataLatitudeDegrees} from '../../../src/data/data.latitude-degrees';
import {DataDistance} from '../../../src/data/data.distance';
import {DataSpeed} from '../../../src/data/data.speed';
import {DataCadence} from '../../../src/data/data.cadence';
import {DataPower} from '../../../src/data/data.power';
import {DataAltitude} from '../../../src/data/data.altitude';
import {DataPace} from '../../../src/data/data.pace';

describe('Integration tests of TCX files parsing', () => {

  describe('Using native browser DOMParser', () => {

    let browserDomParser: DOMParser;

    beforeEach(() => {
      browserDomParser = new DOMParser();
    });

    it('should parse ride tcx activity (from https://www.strava.com/activities/617435476) with browser DOMParser', done => {

      // Given
      const tcxPath = __dirname + '/fixtures/strava_ride_617435476.tcx';
      const doc = browserDomParser.parseFromString(fs.readFileSync(tcxPath).toString(), 'application/xml');
      const expectedSamplesLength = 1716;

      // When
      const eventInterfacePromise = QuantifiedSelfLib.importFromTCX(doc);

      // Then
      eventInterfacePromise.then((event: EventInterface) => {
        expect(event.getDistance().getValue()).toEqual(28491.7);
        expect(event.getDuration().getValue()).toEqual(4540);
        expect(event.getFirstActivity().getSquashedStreamData(DataLongitudeDegrees.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataLatitudeDegrees.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataDistance.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataSpeed.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataCadence.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataPace.type).length).toEqual(expectedSamplesLength);

        const missingStreamCall = () => {
          event.getFirstActivity().getSquashedStreamData(DataPower.type);
        };
        expect(missingStreamCall).toThrow();

        done();
      });

    });

    it('should parse virtual-ride tcx activity (from https://www.strava.com/activities/436621314) with browser DOMParser', done => {

      // Given
      const tcxPath = __dirname + '/fixtures/strava_virtualride_436621314.tcx';
      const doc = browserDomParser.parseFromString(fs.readFileSync(tcxPath).toString(), 'application/xml');
      const expectedSamplesLength = 8067;

      // When
      const eventInterfacePromise = QuantifiedSelfLib.importFromTCX(doc);

      // Then
      eventInterfacePromise.then((event) => {

        expect(event.getFirstActivity().getSquashedStreamData(DataLongitudeDegrees.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataLatitudeDegrees.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataDistance.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataSpeed.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataCadence.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataPower.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataPace.type).length).toEqual(expectedSamplesLength);

        done();
      });

    });

    it('should parse garmin run tcx activity (from https://connect.garmin.com/modern/activity/3106033902) with browser DOMParser', done => {

      // Given
      const tcxPath = __dirname + '/fixtures/garmin_run_3106033902.tcx';
      const doc = browserDomParser.parseFromString(fs.readFileSync(tcxPath).toString(), 'application/xml');
      const expectedSamplesLength = 422;

      // When
      const eventInterfacePromise = QuantifiedSelfLib.importFromTCX(doc);

      // Then
      eventInterfacePromise.then((event) => {

        expect(event.getFirstActivity().getSquashedStreamData(DataLongitudeDegrees.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataLatitudeDegrees.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataDistance.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataSpeed.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataCadence.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataPace.type).length).toEqual(expectedSamplesLength);

        const missingStreamCall = () => {
          event.getFirstActivity().getSquashedStreamData(DataPower.type);
        };
        expect(missingStreamCall).toThrow();

        done();
      });

    });

  });

  describe('Using a NodeJS DOMParser (xmldom)', () => {

    let customDomParser: DOMParser;

    beforeEach(() => {
      customDomParser = new xmldom.DOMParser();
    });

    it('should parse ride tcx activity (from https://www.strava.com/activities/617435476) with a NodeJS DOMParser', done => {

      // Given
      const tcxPath = __dirname + '/fixtures/strava_ride_617435476.tcx';
      const doc = customDomParser.parseFromString(fs.readFileSync(tcxPath).toString(), 'application/xml');
      const expectedSamplesLength = 1716;

      // When
      const eventInterfacePromise = QuantifiedSelfLib.importFromTCX(doc);

      // Then
      eventInterfacePromise.then((event: EventInterface) => {
        expect(event.getDistance().getValue()).toEqual(28491.7);
        expect(event.getDuration().getValue()).toEqual(4540);
        expect(event.getFirstActivity().getSquashedStreamData(DataLongitudeDegrees.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataLatitudeDegrees.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataDistance.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataSpeed.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataCadence.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataPace.type).length).toEqual(expectedSamplesLength);

        const missingStreamCall = () => {
          event.getFirstActivity().getSquashedStreamData(DataPower.type);
        };
        expect(missingStreamCall).toThrow();

        done();
      });
    });

    it('should parse virtual-ride tcx activity (from https://www.strava.com/activities/436621314) with a NodeJS DOMParser', done => {

      // Given
      const tcxPath = __dirname + '/fixtures/strava_virtualride_436621314.tcx';
      const doc = customDomParser.parseFromString(fs.readFileSync(tcxPath).toString(), 'application/xml');
      const expectedSamplesLength = 8067;

      // When
      const eventInterfacePromise = QuantifiedSelfLib.importFromTCX(doc);

      // Then
      eventInterfacePromise.then((event) => {

        expect(event.getFirstActivity().getSquashedStreamData(DataLongitudeDegrees.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataLatitudeDegrees.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataDistance.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataSpeed.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataCadence.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataPower.type).length).toEqual(expectedSamplesLength);
        expect(event.getFirstActivity().getSquashedStreamData(DataPace.type).length).toEqual(expectedSamplesLength);

        done();
      });

    });

    it('should parse garmin run tcx activity (from https://connect.garmin.com/modern/activity/3106033902) with a NodeJS DOMParser',
      done => {

        // Given
        const tcxPath = __dirname + '/fixtures/garmin_run_3106033902.tcx';
        const doc = customDomParser.parseFromString(fs.readFileSync(tcxPath).toString(), 'application/xml');
        const expectedSamplesLength = 422;

        // When
        const eventInterfacePromise = QuantifiedSelfLib.importFromTCX(doc);

        // Then
        eventInterfacePromise.then((event) => {

          expect(event.getFirstActivity().getSquashedStreamData(DataLongitudeDegrees.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataLatitudeDegrees.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataDistance.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataSpeed.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataCadence.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataPace.type).length).toEqual(expectedSamplesLength);

          const missingStreamCall = () => {
            event.getFirstActivity().getSquashedStreamData(DataPower.type);
          };
          expect(missingStreamCall).toThrow();

          done();
        });

      });

  });
});
