import * as fs from 'fs';
import { QuantifiedSelfLib } from '../src';
import { EventInterface } from '../src/events/event.interface';
import { DataHeartRate } from '../src/data/data.heart-rate';
import { DataLongitudeDegrees } from '../src/data/data.longitude-degrees';
import { DataLatitudeDegrees } from '../src/data/data.latitude-degrees';
import { DataDistance } from '../src/data/data.distance';
import { DataSpeed } from '../src/data/data.speed';
import { DataCadence } from '../src/data/data.cadence';
import { DataPower } from '../src/data/data.power';
import { DataAltitude } from '../src/data/data.altitude';
import { DataPace } from '../lib/data/data.pace';
import * as xmldom from 'xmldom';
import { ActivityTypes } from '../src/activities/activity.types';

describe('Integration tests with native & custom dom parser', () => {

  describe('Native DOMParser', () => {

    let domParser: DOMParser;

    beforeEach(() => {
      domParser = new DOMParser();
    });

    describe('From Garmin', () => {

      it('should parse a TCX file (ride)', done => {

        // Given
        const path = __dirname + '/fixtures/rides/garmin_export/20190815_ride_3953195468.tcx';
        const doc = domParser.parseFromString(fs.readFileSync(path).toString(), 'application/xml');
        const expectedSamplesLength = 3179;

        // When
        const eventInterfacePromise = QuantifiedSelfLib.importFromTCX(doc);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(event.getFirstActivity().type).toEqual(ActivityTypes.cycling);
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

      describe('Parse GPX', () => {

        it('should parse a GPX string', done => {

          // Given
          const gpxString = `
                      <?xml version="1.0" encoding="UTF-8"?>
                      <gpx creator="Garmin Connect" version="1.1"
                        xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/11.xsd"
                        xmlns:ns3="http://www.garmin.com/xmlschemas/TrackPointExtension/v1"
                        xmlns="http://www.topografix.com/GPX/1/1"
                        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns2="http://www.garmin.com/xmlschemas/GpxExtensions/v3">
                        <metadata>
                          <link href="connect.garmin.com">
                            <text>Garmin Connect</text>
                          </link>
                          <time>2019-09-29T13:58:25.000Z</time>
                        </metadata>
                        <trk>
                          <name>Meylan Road Cycling</name>
                          <type>road_biking</type>
                          <trkseg>
                            <trkpt lat="45.199617706239223480224609375" lon="5.77009744942188262939453125">
                              <ele>109.1999969482421875</ele>
                              <time>2019-09-29T13:58:25.000Z</time>
                              <extensions>
                                <ns3:TrackPointExtension>
                                  <ns3:atemp>24.0</ns3:atemp>
                                  <ns3:hr>136</ns3:hr>
                                  <ns3:cad>72</ns3:cad>
                                </ns3:TrackPointExtension>
                              </extensions>
                            </trkpt>
                            <trkpt lat="45.19955039955675601959228515625" lon="5.77004539780318737030029296875">
                              <ele>109</ele>
                              <time>2019-09-29T13:58:26.000Z</time>
                              <extensions>
                                <ns3:TrackPointExtension>
                                  <ns3:atemp>24.0</ns3:atemp>
                                  <ns3:hr>136</ns3:hr>
                                  <ns3:cad>71</ns3:cad>
                                </ns3:TrackPointExtension>
                              </extensions>
                            </trkpt>
                          </trkseg>
                        </trk>
                      </gpx> `;

          const expectedSamplesLength = 2;

          // When
          const eventInterfacePromise = QuantifiedSelfLib.importFromGPX(gpxString);

          // Then
          eventInterfacePromise.then((event: EventInterface) => {
            expect(event.getFirstActivity().type).toEqual(ActivityTypes.cycling);
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

        it('should parse a GPX file (ride)', done => {

          // Given
          const path = __dirname + '/fixtures/rides/garmin_export/20190929_ride_4108490848.gpx';
          const gpxString = fs.readFileSync(path).toString();
          const expectedSamplesLength = 1817;

          // When
          const eventInterfacePromise = QuantifiedSelfLib.importFromGPX(gpxString);

          // Then
          eventInterfacePromise.then((event: EventInterface) => {
            expect(event.getFirstActivity().type).toEqual(ActivityTypes.cycling);
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

      it('should parse a FIT file (ride)', done => {

        // Given
        const path = __dirname + '/fixtures/rides/garmin_export/20190811_ride_3939576645.fit';
        const buffer = fs.readFileSync(path);
        const expectedSamplesLength = 2547;

        // When
        const eventInterfacePromise = QuantifiedSelfLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(event.getFirstActivity().type).toEqual(ActivityTypes.cycling);
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

    describe('From Strava', () => {

      it('should parse a TCX file (run)', done => {

        // Given
        const path = __dirname + '/fixtures/runs/strava_export/20160911_run_708752345.tcx';
        const doc = domParser.parseFromString(fs.readFileSync(path).toString(), 'application/xml');
        const expectedSamplesLength = 1495;

        // When
        const eventInterfacePromise = QuantifiedSelfLib.importFromTCX(doc);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(event.getFirstActivity().type).toEqual(ActivityTypes.run);
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

      describe('Parse GPX', () => {

        it('should parse a GPX file (run)', done => {

          // Given
          const path = __dirname + '/fixtures/runs/strava_export/20170319_run_906581465.gpx';
          const gpxString = fs.readFileSync(path).toString();
          const expectedSamplesLength = 1495;

          // When
          const eventInterfacePromise = QuantifiedSelfLib.importFromGPX(gpxString);

          // Then
          eventInterfacePromise.then((event: EventInterface) => {

            /*
            TODO
            How to fix the below assertion error:
            Strava provide type as "<type>{number}</type>" in GPX
            So if number, we find have to find the type from a mapping (to be defined)
            1 = Ride
            9 = Run
            ... TO BE DONE ...
             */
            expect(event.getFirstActivity().type).toEqual(ActivityTypes.run);

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

        it('should parse a GPX file (virtualride)', done => {

          // Given
          const path = __dirname + '/fixtures/virtual_rides/strava_export/20160422_virtualride_553573871.gpx';
          const gpxString = fs.readFileSync(path).toString();
          const expectedSamplesLength = 1817;

          // When
          const eventInterfacePromise = QuantifiedSelfLib.importFromGPX(gpxString);

          // Then
          eventInterfacePromise.then((event: EventInterface) => {
            expect(event.getFirstActivity().type).toEqual(ActivityTypes.cycling_virtual_activity);
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

  });

  describe('Custom DOMParser', () => {

    let domParser: DOMParser;

    beforeEach(() => {
      domParser = new xmldom.DOMParser();
    });

    describe('From Garmin', () => {

      it('should parse a TCX file (ride)', done => {

        // Given
        const path = __dirname + '/fixtures/rides/garmin_export/20190815_ride_3953195468.tcx';
        const doc = domParser.parseFromString(fs.readFileSync(path).toString(), 'application/xml');
        const expectedSamplesLength = 3179;

        // When
        const eventInterfacePromise = QuantifiedSelfLib.importFromTCX(doc);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(event.getFirstActivity().type).toEqual(ActivityTypes.cycling);
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

      describe('Parse GPX', () => {

        it('should parse a GPX string', done => {

          // Given
          const gpxString = `
            <?xml version="1.0" encoding="UTF-8"?>
            <gpx creator="Garmin Connect" version="1.1"
              xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/11.xsd"
              xmlns:ns3="http://www.garmin.com/xmlschemas/TrackPointExtension/v1"
              xmlns="http://www.topografix.com/GPX/1/1"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns2="http://www.garmin.com/xmlschemas/GpxExtensions/v3">
              <metadata>
                <link href="connect.garmin.com">
                  <text>Garmin Connect</text>
                </link>
                <time>2019-09-29T13:58:25.000Z</time>
              </metadata>
              <trk>
                <name>Meylan Road Cycling</name>
                <type>road_biking</type>
                <trkseg>
                  <trkpt lat="45.199617706239223480224609375" lon="5.77009744942188262939453125">
                    <ele>109.1999969482421875</ele>
                    <time>2019-09-29T13:58:25.000Z</time>
                    <extensions>
                      <ns3:TrackPointExtension>
                        <ns3:atemp>24.0</ns3:atemp>
                        <ns3:hr>136</ns3:hr>
                        <ns3:cad>72</ns3:cad>
                      </ns3:TrackPointExtension>
                    </extensions>
                  </trkpt>
                  <trkpt lat="45.19955039955675601959228515625" lon="5.77004539780318737030029296875">
                    <ele>109</ele>
                    <time>2019-09-29T13:58:26.000Z</time>
                    <extensions>
                      <ns3:TrackPointExtension>
                        <ns3:atemp>24.0</ns3:atemp>
                        <ns3:hr>136</ns3:hr>
                        <ns3:cad>71</ns3:cad>
                      </ns3:TrackPointExtension>
                    </extensions>
                  </trkpt>
                </trkseg>
              </trk>
            </gpx> `;

          const expectedSamplesLength = 2;

          // When
          const eventInterfacePromise = QuantifiedSelfLib.importFromGPX(gpxString, xmldom.DOMParser);

          // Then
          eventInterfacePromise.then((event: EventInterface) => {
            expect(event.getFirstActivity().type).toEqual(ActivityTypes.cycling);
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

        it('should parse a GPX file (ride)', done => {

          // Given
          const path = __dirname + '/fixtures/rides/garmin_export/20190929_ride_4108490848.gpx';
          const gpxString = fs.readFileSync(path).toString();
          const expectedSamplesLength = 1817;

          // When
          const eventInterfacePromise = QuantifiedSelfLib.importFromGPX(gpxString, xmldom.DOMParser);

          // Then
          eventInterfacePromise.then((event: EventInterface) => {
            expect(event.getFirstActivity().type).toEqual(ActivityTypes.cycling);
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

      it('should parse a FIT file (ride)', done => {

        // Given
        const path = __dirname + '/fixtures/rides/garmin_export/20190811_ride_3939576645.fit';
        const buffer = fs.readFileSync(path);
        const expectedSamplesLength = 2547;

        // When
        const eventInterfacePromise = QuantifiedSelfLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(event.getFirstActivity().type).toEqual(ActivityTypes.cycling);
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

    describe('From Strava', () => {

      it('should parse a TCX file (run)', done => {

        // Given
        const path = __dirname + '/fixtures/runs/strava_export/20160911_run_708752345.tcx';
        const doc = domParser.parseFromString(fs.readFileSync(path).toString(), 'application/xml');
        const expectedSamplesLength = 1495;

        // When
        const eventInterfacePromise = QuantifiedSelfLib.importFromTCX(doc);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(event.getFirstActivity().type).toEqual(ActivityTypes.run);
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
      describe('Parse GPX', () => {

        it('should parse a GPX file (run)', done => {

          // Given
          const path = __dirname + '/fixtures/runs/strava_export/20170319_run_906581465.gpx';
          const gpxString = fs.readFileSync(path).toString();
          const expectedSamplesLength = 1495;

          // When
          const eventInterfacePromise = QuantifiedSelfLib.importFromGPX(gpxString);

          // Then
          eventInterfacePromise.then((event: EventInterface) => {
            expect(event.getFirstActivity().type).toEqual(ActivityTypes.run);
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

        it('should parse a GPX file (virtualride)', done => {

          // Given
          const path = __dirname + '/fixtures/virtual_rides/strava_export/20160422_virtualride_553573871.gpx';
          const gpxString = fs.readFileSync(path).toString();
          const expectedSamplesLength = 1817;

          // When
          const eventInterfacePromise = QuantifiedSelfLib.importFromGPX(gpxString);

          // Then
          eventInterfacePromise.then((event: EventInterface) => {
            expect(event.getFirstActivity().type).toEqual(ActivityTypes.cycling_virtual_activity);
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
  });
});
