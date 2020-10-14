import * as fs from 'fs';
import { SportsLib } from '../src';
import { EventInterface } from '../src/events/event.interface';
import { DataHeartRate } from '../src/data/data.heart-rate';
import { DataLongitudeDegrees } from '../src/data/data.longitude-degrees';
import { DataLatitudeDegrees } from '../src/data/data.latitude-degrees';
import { DataDistance } from '../src/data/data.distance';
import { DataSpeed } from '../src/data/data.speed';
import { DataCadence } from '../src/data/data.cadence';
import { DataPower } from '../src/data/data.power';
import { DataAltitude } from '../src/data/data.altitude';
import * as xmldom from 'xmldom';
import { ActivityTypes } from '../src/activities/activity.types';
import { DataPace } from '../src/data/data.pace';
import { DataAscent } from '../src/data/data.ascent';
import { EmptyEventLibError } from '../src/errors/empty-event-sports-libs.error';
import { DataMovingTime } from '../src/data/data.moving-time';

const expectTolerance = (actual: number, expected: number, tolerance: number) => {
  expect(actual).toBeGreaterThanOrEqual(expected - tolerance);
  expect(actual).toBeLessThanOrEqual(expected + tolerance);
};

const MOVING_TIME_TOLERANCE = 0.06; // 6% of tolerance

describe('Integration tests with native & custom dom parser', () => {

  const ASCENT_ELEVATION_TOLERANCE = 8;

  describe('Native DOMParser', () => {

    let domParser: DOMParser;

    beforeEach(() => {
      domParser = new DOMParser();
    });

    describe('From Garmin', () => {

      it('should parse a TCX file (ride)', done => {

        // Given
        const path = __dirname + '/fixtures/rides/garmin_export/20190815_ride_3953195468.tcx'; // @ https://connect.garmin.com/modern/activity/3953195468
        const doc = domParser.parseFromString(fs.readFileSync(path).toString(), 'application/xml');
        const expectedSamplesLength = 3179;
        const expectedElapsedTime = 10514; // 2:55:15 or 10514s
        const expectedMovingTime = 9874; // 2:44:34 or 9874s
        const expectedElevationGain = 690;

        // When
        const eventInterfacePromise = SportsLib.importFromTCX(doc);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(event.getFirstActivity().type).toEqual(ActivityTypes.cycling);
          expect(event.getFirstActivity().hasPowerMeter()).toEqual(false);
          expect(event.getFirstActivity().isTrainer()).toEqual(false);
          expect(event.getFirstActivity().generateTimeStream([DataDistance.type]).getData(true).length)
            .toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataLongitudeDegrees.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataLatitudeDegrees.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataDistance.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataSpeed.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataCadence.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataPace.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getDuration().getValue()).toEqual(expectedElapsedTime);
          const movingTime = (<DataMovingTime>event.getFirstActivity().getStat(DataMovingTime.type)).getValue()
          expectTolerance(movingTime, expectedMovingTime, expectedMovingTime * MOVING_TIME_TOLERANCE);
          expectTolerance(<number>event.getFirstActivity().getStats().get(DataAscent.type)?.getValue(), expectedElevationGain, ASCENT_ELEVATION_TOLERANCE);

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
          const gpxString = `<?xml version="1.0" encoding="UTF-8"?>
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
                              <ele>109</ele>
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
                              <ele>129</ele>
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
          const expectedElapsedTime = 1;
          const expectedMovingTime = 1;
          const expectedElevationGain = 20;

          // When
          const eventInterfacePromise = SportsLib.importFromGPX(gpxString);

          // Then
          eventInterfacePromise.then((event: EventInterface) => {
            expect(event.getFirstActivity().type).toEqual(ActivityTypes.cycling);
            expect(event.getFirstActivity().hasPowerMeter()).toEqual(false);
            expect(event.getFirstActivity().isTrainer()).toEqual(false);
            expect(event.getFirstActivity().generateTimeStream([DataDistance.type]).getData(true).length)
              .toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataLongitudeDegrees.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataLatitudeDegrees.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataDistance.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataSpeed.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataCadence.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getDuration().getValue()).toEqual(expectedElapsedTime);
            const movingTime = (<DataMovingTime>event.getFirstActivity().getStat(DataMovingTime.type)).getValue()
            expectTolerance(movingTime, expectedMovingTime, expectedMovingTime * MOVING_TIME_TOLERANCE);
            expectTolerance(<number>event.getFirstActivity().getStats().get(DataAscent.type)?.getValue(), expectedElevationGain, ASCENT_ELEVATION_TOLERANCE);

            const missingStreamCall = () => {
              event.getFirstActivity().getSquashedStreamData(DataPower.type);
            };
            expect(missingStreamCall).toThrow();

            done();
          });

        });

        it('should parse a GPX file (ride)', done => {

          // Given
          const path = __dirname + '/fixtures/rides/garmin_export/20190929_ride_4108490848.gpx';  // @ https://connect.garmin.com/modern/activity/4108490848
          const gpxString = fs.readFileSync(path).toString();
          const expectedSamplesLength = 1817;
          const expectedElapsedTime = 6560;
          const expectedMovingTime = 6433; // 1:47:13 or 6433s
          const expectedElevationGain = 310;

          // When
          const eventInterfacePromise = SportsLib.importFromGPX(gpxString);

          // Then
          eventInterfacePromise.then((event: EventInterface) => {
            expect(event.getFirstActivity().type).toEqual(ActivityTypes.cycling);
            expect(event.getFirstActivity().generateTimeStream([DataDistance.type]).getData(true).length)
              .toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().hasPowerMeter()).toEqual(false);
            expect(event.getFirstActivity().isTrainer()).toEqual(false);
            expect(event.getFirstActivity().getSquashedStreamData(DataLongitudeDegrees.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataLatitudeDegrees.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataDistance.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataSpeed.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataCadence.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getDuration().getValue()).toEqual(expectedElapsedTime);
            const movingTime = (<DataMovingTime>event.getFirstActivity().getStat(DataMovingTime.type)).getValue()
            expectTolerance(movingTime, expectedMovingTime, expectedMovingTime * MOVING_TIME_TOLERANCE);

            // Remove because the number you have looks its from stravas data
            // expectTolerance(<number>event.getFirstActivity().getStats().get(DataAscent.type)?.getValue(), expectedElevationGain, ASCENT_ELEVATION_TOLERANCE);


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
        const path = __dirname + '/fixtures/rides/garmin_export/20190811_ride_3939576645.fit'; // @ https://connect.garmin.com/modern/activity/3939576645
        const buffer = fs.readFileSync(path);
        const expectedSamplesLength = 2547;
        const expectedElapsedTime = 7264; // 2:01:04 or 7264
        const expectedMovingTime = 7242; // 2:00:42 or 7242s
        const expectedElevationGain = 668;

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(event.getFirstActivity().type).toEqual(ActivityTypes.cycling);
          expect(event.getFirstActivity().generateTimeStream([DataDistance.type]).getData(true).length)
            .toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().hasPowerMeter()).toEqual(false);
          expect(event.getFirstActivity().isTrainer()).toEqual(false);
          expect(event.getFirstActivity().getSquashedStreamData(DataLongitudeDegrees.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataLatitudeDegrees.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataDistance.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataSpeed.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataCadence.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length).toEqual(expectedSamplesLength);
          expect(Math.round(event.getFirstActivity().getDuration().getValue())).toEqual(expectedElapsedTime);
          const movingTime = (<DataMovingTime>event.getFirstActivity().getStat(DataMovingTime.type)).getValue();
          expectTolerance(movingTime, expectedMovingTime, expectedMovingTime * MOVING_TIME_TOLERANCE);
          expectTolerance(<number>event.getFirstActivity().getStats().get(DataAscent.type)?.getValue(), expectedElevationGain, ASCENT_ELEVATION_TOLERANCE);

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
        const path = __dirname + '/fixtures/runs/strava_export/20160911_run_708752345.tcx'; // @ https://www.strava.com/activities/708752345
        const doc = domParser.parseFromString(fs.readFileSync(path).toString(), 'application/xml');
        const expectedSamplesLength = 1495;

        const expectedElapsedTime = 4070; // 1:07:50 or 4070s
        const expectedMovingTime = 3369; // 00:56:09 or 3369s
        const expectedElevationGain = 343;

        // When
        const eventInterfacePromise = SportsLib.importFromTCX(doc);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(event.getFirstActivity().type).toEqual(ActivityTypes.run);
          expect(event.getFirstActivity().generateTimeStream([DataDistance.type]).getData(true).length)
            .toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().hasPowerMeter()).toEqual(false);
          expect(event.getFirstActivity().isTrainer()).toEqual(false);
          expect(event.getFirstActivity().getSquashedStreamData(DataLongitudeDegrees.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataLatitudeDegrees.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataDistance.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataSpeed.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataCadence.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataPace.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getDuration().getValue()).toEqual(expectedElapsedTime);
          const movingTime = (<DataMovingTime>event.getFirstActivity().getStat(DataMovingTime.type)).getValue()
          expectTolerance(movingTime, expectedMovingTime, expectedMovingTime * MOVING_TIME_TOLERANCE);
          // This is from strava data not file data
          // expectTolerance(<number>event.getFirstActivity().getStats().get(DataAscent.type)?.getValue(), expectedElevationGain, ASCENT_ELEVATION_TOLERANCE);

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
          const path = __dirname + '/fixtures/runs/strava_export/20170319_run_906581465.gpx'; // @ https://www.strava.com/activities/906581465
          const gpxString = fs.readFileSync(path).toString();
          const expectedSamplesLength = 1038;
          const expectedElapsedTime = 1958; // 00:32:38 or 1958s
          const expectedMovingTime = 1887; // 00:31:27 or 1887s
          const expectedElevationGain = 16;

          // When
          const eventInterfacePromise = SportsLib.importFromGPX(gpxString);

          // Then
          eventInterfacePromise.then((event: EventInterface) => {

            // expect(event.getFirstActivity().type).toEqual(ActivityTypes.run);
            expect(event.getFirstActivity().generateTimeStream([DataDistance.type]).getData(true).length)
              .toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().hasPowerMeter()).toEqual(false);
            expect(event.getFirstActivity().isTrainer()).toEqual(false);
            expect(event.getFirstActivity().getSquashedStreamData(DataLongitudeDegrees.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataLatitudeDegrees.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataDistance.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataSpeed.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataCadence.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length).toEqual(expectedSamplesLength);
            // expect(event.getFirstActivity().getSquashedStreamData(DataPace.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getDuration().getValue()).toEqual(expectedElapsedTime);
            const movingTime = (<DataMovingTime>event.getFirstActivity().getStat(DataMovingTime.type)).getValue()
            expectTolerance(movingTime, expectedMovingTime, expectedMovingTime * MOVING_TIME_TOLERANCE);

            // Remove because the number you have looks its from stravas data
            // expectTolerance(<number>event.getFirstActivity().getStats().get(DataAscent.type)?.getValue(), expectedElevationGain, ASCENT_ELEVATION_TOLERANCE);

            const missingStreamCall = () => {
              event.getFirstActivity().getSquashedStreamData(DataPower.type);
            };
            expect(missingStreamCall).toThrow();

            done();
          });

        });

        it('should parse a GPX file (virtualride)', done => {

          // Given
          const path = __dirname + '/fixtures/virtual_rides/strava_export/20160422_virtualride_553573871.gpx'; // @ https://www.strava.com/activities/553573871
          const gpxString = fs.readFileSync(path).toString();
          const expectedSamplesLength = 3790;
          const expectedElapsedTime = 3789; // 1:03:09 or 3789s
          const expectedMovingTime = 3789; // 1:03:09 or 3789s
          const expectedElevationGain = 262;

          // When
          const eventInterfacePromise = SportsLib.importFromGPX(gpxString);

          // Then
          eventInterfacePromise.then((event: EventInterface) => {
            // expect(event.getFirstActivity().type).toEqual(ActivityTypes.VirtualRide);
            expect(event.getFirstActivity().hasPowerMeter()).toEqual(true);
            // expect(event.getFirstActivity().isTrainer()).toEqual(true);
            expect(event.getFirstActivity().generateTimeStream([DataDistance.type]).getData(true).length)
              .toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataLongitudeDegrees.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataLatitudeDegrees.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataDistance.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataSpeed.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataCadence.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataPower.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getDuration().getValue()).toEqual(expectedElapsedTime);
            expect(event.getFirstActivity().getPause().getValue()).toEqual(expectedElapsedTime - expectedMovingTime);
            expectTolerance(<number>event.getFirstActivity().getStats().get(DataAscent.type)?.getValue(), expectedElevationGain, ASCENT_ELEVATION_TOLERANCE);

            done();
          });

        });

      });
    });

    describe('From others sources', () => {

      it('should parse a FIT file (ride)', done => {

        // Given
        const path = __dirname + '/fixtures/rides/others_export/2020-01-09_virtualride.fit';
        const buffer = fs.readFileSync(path);
        const expectedSamplesLength = 1746;
        const expectedStartDate = '2020-01-09T17:49:07.000Z';
        const expectedEndDate = '2020-01-09T18:18:12.000Z';
        const expectedElapsedTime = 1745; // 29:05
        const expectedMovingTime = expectedElapsedTime; // Same
        const expectedPauseTime = expectedElapsedTime - expectedMovingTime; // No pause, should be 0s

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {

          expect(event.startDate.toISOString()).toEqual(expectedStartDate);
          expect(event.endDate.toISOString()).toEqual(expectedEndDate);
          expect(event.getFirstActivity().type).toEqual(ActivityTypes.VirtualCycling);
          expect(event.getFirstActivity().generateTimeStream([DataDistance.type]).getData().length)
            .toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().hasPowerMeter()).toEqual(true);
          expect(event.getFirstActivity().isTrainer()).toEqual(true);
          expect(event.getFirstActivity().getStreamData(DataLongitudeDegrees.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getStreamData(DataLatitudeDegrees.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getStreamData(DataDistance.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getStreamData(DataAltitude.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getStreamData(DataSpeed.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getStreamData(DataCadence.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getStreamData(DataHeartRate.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getStreamData(DataPower.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getDuration().getValue()).toEqual(expectedElapsedTime);
          // console.log(event.getFirstActivity().getDuration().getValue() === expectedElapsedTime)
          //
          const movingTime = (<DataMovingTime>event.getFirstActivity().getStat(DataMovingTime.type)).getValue()
          expectTolerance(movingTime, expectedMovingTime, expectedMovingTime * MOVING_TIME_TOLERANCE);
          done();
        });

      });

      it('should parse a .FIT Triathlon IronMan w/ 3 activities (swim + ride + run) ', done => {

        // Given
        const path = __dirname + '/fixtures/others/20181013_kona_ironman.fit';
        const buffer = fs.readFileSync(path);
        const activitiesCount = 5;

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {

          expect(event.getActivities().length).toEqual(activitiesCount);

          const swimActivity = event.getActivities()[0];
          expect(swimActivity.type).toEqual(ActivityTypes.OpenWaterSwimming);
          expect(swimActivity.getStreamData(DataSpeed.type).length).toEqual(3689);
          expect(swimActivity.getDuration().getValue()).toEqual(3688.603);
          expect(swimActivity.getDistance().getValue()).toEqual(3933.3);
          expect(swimActivity.startDate.toISOString()).toEqual('2018-10-13T17:05:01.000Z');
          expect(swimActivity.endDate.toISOString()).toEqual('2018-10-13T18:06:29.000Z');

          let transition = event.getActivities()[1];
          expect(transition.type).toEqual(ActivityTypes.Transition);

          const cyclingActivity = event.getActivities()[2];
          expect(cyclingActivity.type).toEqual(ActivityTypes.Cycling);
          expect(cyclingActivity.getStreamData(DataSpeed.type).length).toEqual(17250);
          expect(cyclingActivity.getDuration().getValue()).toEqual(17248.55);
          expect(cyclingActivity.getDistance().getValue()).toEqual(180301.58);
          expect(cyclingActivity.startDate.toISOString()).toEqual('2018-10-13T18:10:15.000Z');
          expect(cyclingActivity.endDate.toISOString()).toEqual('2018-10-13T22:57:44.000Z');

          transition = event.getActivities()[3];
          expect(transition.type).toEqual(ActivityTypes.Transition);

          const runningActivity = event.getActivities()[4];
          expect(runningActivity.type).toEqual(ActivityTypes.Running);
          expect(runningActivity.getStreamData(DataSpeed.type).length).toEqual(13479);
          expect(runningActivity.getDuration().getValue()).toEqual(13092.969);
          expect(runningActivity.getDistance().getValue()).toEqual(42563.91);
          expect(runningActivity.startDate.toISOString()).toEqual('2018-10-13T22:57:45.000Z');
          expect(runningActivity.endDate.toISOString()).toEqual('2018-10-14T02:42:23.000Z');

          done();
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
        const eventInterfacePromise = SportsLib.importFromTCX(doc);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(event.getFirstActivity().type).toEqual(ActivityTypes.cycling);
          expect(event.getFirstActivity().generateTimeStream([DataDistance.type]).getData(true).length)
            .toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataLongitudeDegrees.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataLatitudeDegrees.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataDistance.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataSpeed.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataCadence.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length).toEqual(expectedSamplesLength);

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
          const eventInterfacePromise = SportsLib.importFromGPX(gpxString, xmldom.DOMParser);

          // Then
          eventInterfacePromise.then((event: EventInterface) => {
            expect(event.getFirstActivity().type).toEqual(ActivityTypes.cycling);
            expect(event.getFirstActivity().name).toEqual('Meylan Road Cycling');
            expect(event.getFirstActivity().generateTimeStream([DataDistance.type]).getData(true).length)
              .toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataLongitudeDegrees.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataLatitudeDegrees.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataDistance.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataSpeed.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataCadence.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length).toEqual(expectedSamplesLength);

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
          const eventInterfacePromise = SportsLib.importFromGPX(gpxString, xmldom.DOMParser);

          // Then
          eventInterfacePromise.then((event: EventInterface) => {
            expect(event.getFirstActivity().type).toEqual(ActivityTypes.cycling);
            expect(event.getFirstActivity().name).toEqual('Meylan Road Cycling');
            expect(event.getFirstActivity().generateTimeStream([DataDistance.type]).getData(true).length)
              .toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataLongitudeDegrees.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataLatitudeDegrees.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataDistance.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataSpeed.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataCadence.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length).toEqual(expectedSamplesLength);

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
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(event.getFirstActivity().type).toEqual(ActivityTypes.cycling);
          expect(event.getFirstActivity().generateTimeStream([DataDistance.type]).getData(true).length)
            .toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataLongitudeDegrees.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataLatitudeDegrees.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataDistance.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataSpeed.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataCadence.type).length).toEqual(expectedSamplesLength);
          expect(event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length).toEqual(expectedSamplesLength);

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
        const eventInterfacePromise = SportsLib.importFromTCX(doc);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(event.getFirstActivity().type).toEqual(ActivityTypes.run);
          expect(event.getFirstActivity().generateTimeStream([DataDistance.type]).getData(true).length)
            .toEqual(expectedSamplesLength);
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
          const expectedSamplesLength = 1038;

          // When
          const eventInterfacePromise = SportsLib.importFromGPX(gpxString);

          // Then
          eventInterfacePromise.then((event: EventInterface) => {
            // expect(event.getFirstActivity().type).toEqual(ActivityTypes.run);
            expect(event.getFirstActivity().generateTimeStream([DataDistance.type]).getData(true).length)
              .toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataLongitudeDegrees.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataLatitudeDegrees.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataDistance.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataSpeed.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataCadence.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length).toEqual(expectedSamplesLength);
            // expect(event.getFirstActivity().getSquashedStreamData(DataPace.type).length).toEqual(expectedSamplesLength);

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
          const expectedSamplesLength = 3790;

          // When
          const eventInterfacePromise = SportsLib.importFromGPX(gpxString);

          // Then
          eventInterfacePromise.then((event: EventInterface) => {
            // expect(event.getFirstActivity().type).toEqual(ActivityTypes.cycling_virtual_activity);
            expect(event.getFirstActivity().hasPowerMeter()).toEqual(true);
            // expect(event.getFirstActivity().isTrainer()).toEqual(true);
            expect(event.getFirstActivity().generateTimeStream([DataDistance.type]).getData(true).length)
              .toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataLongitudeDegrees.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataLatitudeDegrees.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataDistance.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataSpeed.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataCadence.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length).toEqual(expectedSamplesLength);
            expect(event.getFirstActivity().getSquashedStreamData(DataPower.type).length).toEqual(expectedSamplesLength);

            done();
          });

        });

      });
    });
  });

  it('should parse a MyTrail GPX file', done => {

    // Given
    const path = __dirname + '/fixtures/others/mytrail_export.gpx';
    const gpxString = fs.readFileSync(path).toString();

    // When
    const eventInterfacePromise = SportsLib.importFromGPX(gpxString);

    // Then
    eventInterfacePromise.then((event: EventInterface) => {
      expect(event.getFirstActivity().type).toBeDefined();
      done();
    });
  })

  describe('Other', () => {

    it('should reject parsing of broken fit file (empty)', done => {

      // Given
      const path = __dirname + '/fixtures/others/broken.fit';
      const buffer = fs.readFileSync(path);
      const expectedErrorMessage = 'Empty fit file';
      const expectedErrorClassName = 'EmptyEventLibError';

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise.then(() => {
        throw new Error('Should not be resolved...');
      }, err => {
        expect(err.constructor.name).toEqual(expectedErrorClassName);
        expect(err.message).toEqual(expectedErrorMessage);
        expect(err.event).toBeNull();
        done();
      });
    });

  });

});
