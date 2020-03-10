import fs from 'fs';
import { SportsLib } from '../src';
import { EventInterface } from '../src/events/event.interface';
import * as strava_3156040843 from './fixtures/strava-streams-compliance/suunto_export/strava_3156040843.json';
import * as strava_343080886 from './fixtures/strava-streams-compliance/garmin_export/strava_343080886.json';
import * as strava_3171438371_gpx from './fixtures/strava-streams-compliance/garmin_export/strava_3171472783_gpx.json';
import * as strava_3171487458_tcx from './fixtures/strava-streams-compliance/garmin_export/strava_3171487458_tcx.json';
import { DataAltitude } from '../src/data/data.altitude';
import { DataHeartRate } from '../src/data/data.heart-rate';
import { DataCadence } from '../src/data/data.cadence';
import { DataTemperature } from '../src/data/data.temperature';
import { DataPower } from '../src/data/data.power';
import { DataDistance } from '../src/data/data.distance';
import { DataGrade } from '../src/data/data.grade';
import { DataTime } from '../src/data/data.time';

function clone(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

describe('Strava data compliance', () => {

  const averageDeltaBetweenStreams = (actualStream: number[], expectedStream: number[]) => {
    let deltaSum = 0;
    actualStream.forEach((value, index) => {
      deltaSum += Math.abs(value - expectedStream[index]);
    });
    return deltaSum / actualStream.length;
  };

  describe('Compliance with suunto export (flat activity)', () => {

    const path = __dirname + '/fixtures/strava-streams-compliance/suunto_export/5e5fde38c2de24635a30d383.fit';
    const buffer = fs.readFileSync(path);

    it('should match time', done => {

      // Given
      const stravaCadenceStream = clone(strava_3156040843.time);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise.then((event: EventInterface) => {
        // const a = event.getFirstActivity().getSquashedStreamData(DataTime.type);
        expect(stravaCadenceStream.length).toEqual(event.getFirstActivity().getSquashedStreamData(DataTime.type).length);
        expect(stravaCadenceStream).toEqual(event.getFirstActivity().getSquashedStreamData(DataTime.type));
        done();
      });
    });

    it('should match altitude', done => {

      // Given
      const stravaAltitudeStream = clone(strava_3156040843.altitude);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise.then((event: EventInterface) => {
        expect(stravaAltitudeStream.length).toEqual(event.getFirstActivity().getStreamData(DataAltitude.type).length);
        // @todo Thomas do you think that this precision change should happen library wise?
        expect(stravaAltitudeStream).toEqual(event.getFirstActivity().getStreamData(DataAltitude.type).map(value => value === null ? null : Math.round(value * 10) / 10));
        done();
      });
    });

    it('should match heart rate', done => {

      // Given
      const stravaHeartRateStream = clone(strava_3156040843.heartrate);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise.then((event: EventInterface) => {
        expect(stravaHeartRateStream.length).toEqual(event.getFirstActivity().getStreamData(DataHeartRate.type).length);
        expect(stravaHeartRateStream).toEqual(event.getFirstActivity().getStreamData(DataHeartRate.type).map(value => value === null ? null : Math.round(value * 10) / 10));
        done();
      });
    });

    it('should match cadence', done => {

      // Given
      const stravaCadenceStream = clone(strava_3156040843.cadence);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise.then((event: EventInterface) => {
        expect(stravaCadenceStream.length).toEqual(event.getFirstActivity().getStreamData(DataCadence.type).length);
        expect(stravaCadenceStream).toEqual(event.getFirstActivity().getStreamData(DataCadence.type).map(value => value === null ? null : Math.round(value * 10) / 10));
        done();
      });
    });

    it('should match temperature', done => {
      // Given
      const stravaTemperatureStream = clone(strava_3156040843.temp);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise.then((event: EventInterface) => {
        expect(stravaTemperatureStream.length).toEqual(event.getFirstActivity().getStreamData(DataTemperature.type).length);
        expect(stravaTemperatureStream).toEqual(event.getFirstActivity().getStreamData(DataTemperature.type).map(value => value === null ? null : Math.round(value * 10) / 10));
        done();
      });
    });

    it('should match power', done => {

      // Given
      const stravaPowerStream = clone(strava_3156040843.watts);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise.then((event: EventInterface) => {
        expect(stravaPowerStream.length).toEqual(event.getFirstActivity().getStreamData(DataPower.type).length);
        expect(stravaPowerStream).toEqual(event.getFirstActivity().getStreamData(DataPower.type).map(value => value === null ? null : Math.round(value * 10) / 10));
        done();
      });
    });

    it('should match distance with x% error max', done => {

      // Given
      const tolerance = 0.6; // percent

      const stravaDistanceStream = clone(strava_3156040843.distance);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise.then((event: EventInterface) => {
        expect(stravaDistanceStream.length).toEqual(event.getFirstActivity().getStreamData(DataDistance.type).length);
        const distanceStreamData = event.getFirstActivity().getStreamData(DataDistance.type).map(value => value === null ? null : Math.round(value * 10) / 10);
        const commonCount = stravaDistanceStream
          .filter((value: (number | null)) => distanceStreamData.indexOf(value) !== -1).length;
        // We find the common then add the % tolerance and we check if its more than equal to the "strava" stream
        expect(commonCount + Math.ceil((stravaDistanceStream.length * tolerance) / 100)).toBeGreaterThanOrEqual(stravaDistanceStream.length);
        // expect(stravaDistanceStream).toEqual(distanceStreamData);
        done();
      });
    });

    it('should have an average grade diff lower than 1.5%', done => {

      // Given
      const toleranceAvgGradeDelta = 1.5;

      const stravaGradeStream = clone(strava_3156040843.grade_smooth);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise.then((event: EventInterface) => {
        expect(stravaGradeStream.length).toEqual(event.getFirstActivity().getStreamData(DataGrade.type).length);
        const streamData = <number[]>event.getFirstActivity().getStreamData(DataGrade.type).map(value => value === null ? null : Math.round(value * 10) / 10);
        const deltaBetweenStreams = averageDeltaBetweenStreams(streamData, stravaGradeStream);
        expect(deltaBetweenStreams).toBeLessThan(toleranceAvgGradeDelta);
        done();
      });
    });

  });

  describe('Compliance with garmin export (hilly activity: https://connect.garmin.com/modern/activity/828989227 / https://www.strava.com/activities/343080886)', () => {

    describe('Fit file version', () => {
      const path = __dirname + '/fixtures/strava-streams-compliance/garmin_export/garmin_828989227.fit';
      const buffer = fs.readFileSync(path);

      it('should match time', done => {

        // Given
        const stravaCadenceStream = clone(strava_343080886.time);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          // const a = event.getFirstActivity().getSquashedStreamData(DataTime.type);
          expect(stravaCadenceStream.length).toEqual(event.getFirstActivity().getSquashedStreamData(DataTime.type).length);
          expect(stravaCadenceStream).toEqual(event.getFirstActivity().getSquashedStreamData(DataTime.type));
          done();
        });
      });

      it('should match altitude', done => {

        // Given
        const stravaAltitudeStream = clone(strava_343080886.altitude);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(stravaAltitudeStream.length).toEqual(event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length);
          expect(stravaAltitudeStream).toEqual(event.getFirstActivity().getSquashedStreamData(DataAltitude.type).map(value => value === null ? null : Math.round(value * 10) / 10));
          done();
        });
      });

      it('should match heart rate', done => {

        // Given
        const stravaHeartRateStream = clone(strava_343080886.heartrate);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(stravaHeartRateStream.length).toEqual(event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length);
          expect(stravaHeartRateStream).toEqual(event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).map(value => value === null ? null : Math.round(value * 10) / 10));
          done();
        });
      });

      it('should match cadence', done => {

        // Given
        const stravaCadenceStream = clone(strava_343080886.cadence);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(stravaCadenceStream.length).toEqual(event.getFirstActivity().getSquashedStreamData(DataCadence.type).length);
          expect(stravaCadenceStream).toEqual(event.getFirstActivity().getSquashedStreamData(DataCadence.type).map(value => value === null ? null : Math.round(value * 10) / 10));
          done();
        });
      });

      it('should match distance with x% error max', done => {

        // Given
        const tolerance = 0.00; // percent

        const stravaDistanceStream = clone(strava_343080886.distance);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(stravaDistanceStream.length).toEqual(event.getFirstActivity().getSquashedStreamData(DataDistance.type).length);
          const distanceStreamData = event.getFirstActivity().getStreamData(DataDistance.type).map(value => value === null ? null : Math.round(value * 10) / 10);
          expect(stravaDistanceStream).toEqual(distanceStreamData)
          done();
        });
      });

      it('should have an average grade diff lower than 1.5%', done => {

        // Given
        const toleranceAvgGradeDelta = 1.5;
        const stravaGradeStream = clone(strava_343080886.grade_smooth);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(stravaGradeStream.length).toEqual(event.getFirstActivity().getStreamData(DataGrade.type).length);
          const gradeStreamData = <number[]>event.getFirstActivity().getStreamData(DataGrade.type).map(value => value === null ? null : Math.round(value * 10) / 10);
          const deltaBetweenStreams = averageDeltaBetweenStreams(gradeStreamData, stravaGradeStream);
          expect(deltaBetweenStreams).toBeLessThan(toleranceAvgGradeDelta);
          done();
        });
      });

    });

    describe('Tcx file version', () => {

      const path = __dirname + '/fixtures/strava-streams-compliance/garmin_export/garmin_828989227.tcx';
      const doc = new DOMParser().parseFromString(fs.readFileSync(path).toString(), 'application/xml');

      it('should match time', done => {

        // Given
        const stravaCadenceStream = clone(strava_3171487458_tcx.time);

        // When
        const eventInterfacePromise = SportsLib.importFromTCX(doc);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(stravaCadenceStream.length).toEqual(event.getFirstActivity().getSquashedStreamData(DataTime.type).length);
          expect(stravaCadenceStream).toEqual(event.getFirstActivity().getSquashedStreamData(DataTime.type));
          done();
        });
      });

      it('should match altitude', done => {

        // Given
        const stravaAltitudeStream = clone(strava_3171487458_tcx.altitude);

        // When
        const eventInterfacePromise = SportsLib.importFromTCX(doc);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(stravaAltitudeStream.length).toEqual(event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length);
          expect(stravaAltitudeStream).toEqual(event.getFirstActivity().getSquashedStreamData(DataAltitude.type).map(value => value === null ? null : Math.round(value * 10) / 10));
          done();
        });
      });

      it('should match heart rate', done => {

        // Given
        const stravaHeartRateStream = clone(strava_3171487458_tcx.heartrate);

        // When
        const eventInterfacePromise = SportsLib.importFromTCX(doc);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(stravaHeartRateStream.length).toEqual(event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length);
          expect(stravaHeartRateStream).toEqual(event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).map(value => value === null ? null : Math.round(value * 10) / 10));
          done();
        });
      });

      it('should match cadence', done => {

        // Given
        const stravaCadenceStream = clone(strava_3171487458_tcx.cadence);

        // When
        const eventInterfacePromise = SportsLib.importFromTCX(doc);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(stravaCadenceStream.length).toEqual(event.getFirstActivity().getSquashedStreamData(DataCadence.type).length);
          expect(stravaCadenceStream).toEqual(event.getFirstActivity().getSquashedStreamData(DataCadence.type).map(value => value === null ? null : Math.round(value * 10) / 10));
          done();
        });
      });

      it('should match distance with x% error max', done => {

        // Given
        const tolerance = 2.6; // percent
        const toleranceDelta = 0.1;


        const stravaDistanceStream = clone(strava_3171487458_tcx.distance);

        // When
        const eventInterfacePromise = SportsLib.importFromTCX(doc);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(stravaDistanceStream.length).toEqual(event.getFirstActivity().getStreamData(DataDistance.type).length);
          const distanceStreamData = <number[]>event.getFirstActivity().getStreamData(DataDistance.type).map(value => value === null ? null : Math.round(value * 10) / 10);
          // const commonCount = stravaDistanceStream
          //   .filter((value: number) => distanceStreamData.indexOf(value) !== -1).length;
          // We find the common then add the % tolerance and we check if its more than equal to the "strava" stream
          // expect(commonCount + Math.ceil((stravaDistanceStream.length * tolerance) / 100)).toBeGreaterThanOrEqual(stravaDistanceStream.length);
          expect(stravaDistanceStream).toMatchObject(distanceStreamData);
          // const deltaBetweenStreams = averageDeltaBetweenStreams(distanceStreamData, stravaDistanceStream);
          // expect(deltaBetweenStreams).toBeLessThan(toleranceDelta);
          done();
        });
      });

      it('should have an average grade diff lower than 1.5%', done => {

        // Given
        const toleranceAvgGradeDelta = 1.5;
        const stravaGradeStream = clone(strava_343080886.grade_smooth);

        // When
        const eventInterfacePromise = SportsLib.importFromTCX(doc);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(stravaGradeStream.length).toEqual(event.getFirstActivity().getStreamData(DataGrade.type).length);
          const streamData = <number[]>event.getFirstActivity().getStreamData(DataGrade.type).map(value => value === null ? null : Math.round(value * 10) / 10);
          const deltaBetweenStreams = averageDeltaBetweenStreams(streamData, stravaGradeStream);
          expect(deltaBetweenStreams).toBeLessThan(toleranceAvgGradeDelta);
          done();
        });
      });

    });

    describe('GPX file version', () => {

      const path = __dirname + '/fixtures/strava-streams-compliance/garmin_export/garmin_828989227.gpx';
      const gpxString = fs.readFileSync(path).toString();

      it('should match time', done => {

        // Given
        const stravaTimeStream = clone(strava_3171438371_gpx.time);

        // When
        const eventInterfacePromise = SportsLib.importFromGPX(gpxString);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(stravaTimeStream.length).toEqual(event.getFirstActivity().getSquashedStreamData(DataTime.type).length);
          expect(stravaTimeStream).toEqual(event.getFirstActivity().getSquashedStreamData(DataTime.type));
          done();
        });
      });

      // Strava adds their own altitude so no go from here
      // it('should match altitude', done => {
      //
      //   // Given
      //   const stravaAltitudeStream = clone(strava_3171438371_gpx.altitude);
      //
      //   // When
      //   const eventInterfacePromise = SportsLib.importFromGPX(gpxString);
      //
      //   // Then
      //   eventInterfacePromise.then((event: EventInterface) => {
      //     expect(stravaAltitudeStream.length).toEqual(event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length);
      //     expect(stravaAltitudeStream).toEqual(event.getFirstActivity().getSquashedStreamData(DataAltitude.type).map(value => value === null ? null : Math.round(value * 10) / 10));
      //     done();
      //   });
      // });

      // we skip this because https://support.strava.com/hc/en-us/community/posts/360054808092-Not-getting-Garmin-heart-rate-data-into-Strava
      // it('should match heart rate', done => {
      //
      //   // Given
      //   const stravaHeartRateStream = clone(strava_3171438371.heartrate);
      //
      //   // When
      //   const eventInterfacePromise = SportsLib.importFromGPX(gpxString);
      //
      //   // Then
      //   eventInterfacePromise.then((event: EventInterface) => {
      //     expect(stravaHeartRateStream.length).toEqual(event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length);
      //     expect(stravaHeartRateStream).toEqual(event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).map(value => value === null ? null : Math.round(value * 10) / 10));
      //     done();
      //   });
      // });

      // we skip this because https://support.strava.com/hc/en-us/community/posts/360054808092-Not-getting-Garmin-heart-rate-data-into-Strava
      // it('should match cadence', done => {
      //
      //   // Given
      //   const stravaCadenceStream = clone(strava_3171438371.cadence);
      //
      //   // When
      //   const eventInterfacePromise = SportsLib.importFromGPX(gpxString);
      //
      //   // Then
      //   eventInterfacePromise.then((event: EventInterface) => {
      //     expect(stravaCadenceStream.length).toEqual(event.getFirstActivity().getSquashedStreamData(DataCadence.type).length);
      //     expect(stravaCadenceStream).toEqual(event.getFirstActivity().getSquashedStreamData(DataCadence.type).map(value => value === null ? null : Math.round(value * 10) / 10));
      //     done();
      //   });
      // });


      it('should match distance with x% error max', done => {

        // Given
        const deltaTolerance = 15; // percent

        const stravaDistanceStream = clone(strava_3171438371_gpx.distance);

        // When
        const eventInterfacePromise = SportsLib.importFromGPX(gpxString);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(stravaDistanceStream.length).toEqual(event.getFirstActivity().getSquashedStreamData(DataDistance.type).length);
          const distanceStreamData = <number[]>event.getFirstActivity().getSquashedStreamData(DataDistance.type).map(value => value === null ? null : Math.round(value * 10) / 10);
          const deltaBetweenStreams = averageDeltaBetweenStreams(distanceStreamData, stravaDistanceStream);
          expect(deltaBetweenStreams).toBeLessThan(deltaTolerance);
          done();
        });
      });

      // Tolerance is higher since distance is different unfortunately
      it('should have an average grade diff lower than 3.2%', done => {

        // Given
        const toleranceAvgGradeDelta = 3.2;
        const stravaGradeStream = clone(strava_3171438371_gpx.grade_smooth);

        // When
        const eventInterfacePromise = SportsLib.importFromGPX(gpxString);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(stravaGradeStream.length).toEqual(event.getFirstActivity().getStreamData(DataGrade.type).length);
          const gradeStreamData = <number[]>event.getFirstActivity().getStreamData(DataGrade.type).map(value => value === null ? null : Math.round(value * 10) / 10);
          const deltaBetweenStreams = averageDeltaBetweenStreams(gradeStreamData, stravaGradeStream);
          expect(deltaBetweenStreams).toBeLessThan(toleranceAvgGradeDelta);
          done();
        });
      });

    });


  });

});
