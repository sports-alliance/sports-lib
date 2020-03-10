import fs from 'fs';
import { SportsLib } from '../src';
import { EventInterface } from '../src/events/event.interface';
import * as strava_3156040843 from './fixtures/strava-streams-compliance/suunto_export/strava_3156040843.json';
import * as strava_343080886 from './fixtures/strava-streams-compliance/garmin_export/strava_343080886.json';
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
        const suuntoDistanceStreamData = event.getFirstActivity().getStreamData(DataDistance.type).map(value => value === null ? null : Math.round(value * 10) / 10);
        const commonCount = stravaDistanceStream
          .filter((value: (number | null)) => suuntoDistanceStreamData.indexOf(value) !== -1).length;
        // We find the common then add the % tolerance and we check if its more than equal to the "strava" stream
        expect(commonCount + Math.ceil((stravaDistanceStream.length * tolerance) / 100)).toBeGreaterThanOrEqual(stravaDistanceStream.length);
        // expect(stravaDistanceStream).toEqual(suuntoDistanceStreamData);
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
        const suuntoGradeStreamData = <number[]>event.getFirstActivity().getStreamData(DataGrade.type).map(value => value === null ? null : Math.round(value * 10) / 10);
        const deltaBetweenStreams = averageDeltaBetweenStreams(suuntoGradeStreamData, stravaGradeStream);
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
          const garminDistanceStreamData = event.getFirstActivity().getStreamData(DataDistance.type).map(value => value === null ? null : Math.round(value * 10) / 10);
          expect(stravaDistanceStream).toEqual(garminDistanceStreamData)
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
          const suuntoGradeStreamData = <number[]>event.getFirstActivity().getStreamData(DataGrade.type).map(value => value === null ? null : Math.round(value * 10) / 10);
          const deltaBetweenStreams = averageDeltaBetweenStreams(suuntoGradeStreamData, stravaGradeStream);
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
        const stravaCadenceStream = clone(strava_343080886.time);

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
        const stravaAltitudeStream = clone(strava_343080886.altitude);

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
        const stravaHeartRateStream = clone(strava_343080886.heartrate);

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
        const stravaCadenceStream = clone(strava_343080886.cadence);

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
        const tolerance = 0.00; // percent

        const stravaDistanceStream = clone(strava_343080886.distance);

        // When
        const eventInterfacePromise = SportsLib.importFromTCX(doc);

        // Then
        eventInterfacePromise.then((event: EventInterface) => {
          expect(stravaDistanceStream.length).toEqual(event.getFirstActivity().getSquashedStreamData(DataDistance.type).length);
          const garminDistanceStreamData = event.getFirstActivity().getStreamData(DataDistance.type).map(value => value === null ? null : value);
          expect(stravaDistanceStream).toEqual(garminDistanceStreamData)
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
          const suuntoGradeStreamData = <number[]>event.getFirstActivity().getStreamData(DataGrade.type).map(value => value === null ? null : Math.round(value * 10) / 10);
          const deltaBetweenStreams = averageDeltaBetweenStreams(suuntoGradeStreamData, stravaGradeStream);
          expect(deltaBetweenStreams).toBeLessThan(toleranceAvgGradeDelta);
          done();
        });
      });

    });

  });

});
