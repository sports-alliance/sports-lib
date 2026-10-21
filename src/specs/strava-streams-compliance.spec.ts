import fs from 'fs';
import { SportsLib } from '../index';
import { EventInterface } from '../events/event.interface';
import * as strava_3156040843 from './fixtures/streams/strava/runs/3156040843.json';
import * as strava_3182900697 from './fixtures/streams/strava/runs/3182900697.json';
import * as strava_2451375851 from './fixtures/streams/strava/runs/2451375851.json';
import * as strava_3183465494 from './fixtures/streams/strava/runs/3183465494.json';
import * as strava_3183490558 from './fixtures/streams/strava/runs/3183490558.json';
import * as strava_2709634581 from './fixtures/streams/strava/runs/2709634581.json';
import * as strava_343080886 from './fixtures/streams/strava/rides/343080886.json';
import * as strava_5910143591 from './fixtures/streams/strava/rides/5910143591.json';
import * as strava_3171438371_gpx from './fixtures/streams/strava/rides/3171472783.json';
import * as strava_3171487458_tcx from './fixtures/streams/strava/rides/3171487458.json';
import { DataAltitude } from '../data/data.altitude';
import { DataHeartRate } from '../data/data.heart-rate';
import { DataCadence } from '../data/data.cadence';
import { DataTemperature } from '../data/data.temperature';
import { DataPower } from '../data/data.power';
import { DataDistance } from '../data/data.distance';
import xmldom from '@xmldom/xmldom';
import { DataGrade } from '../data/data.grade';
import { compareStreamAtTimes } from './helpers/stream-reference-comparison';

export const GRADE_TOLERANCE = 1.7;

function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

describe('Strava stream compliance', () => {
  const domParser = new xmldom.DOMParser();

  // Fixture-specific missing-point budgets pin coverage independently of the error bound.
  const averageDeltaAtTimes = (actual: (number | null)[], expected: number[], times: number[], maxMissing: number) => {
    const comparison = compareStreamAtTimes(actual, expected, times);
    expect(comparison.missingTimes.length).toBeLessThanOrEqual(maxMissing);
    expect(comparison.matchedCount).toBeGreaterThan(0);
    return comparison.meanAbsoluteError as number;
  };

  describe('Compliance with garmin edge export (hilly activity)', () => {
    // Given https://connect.garmin.com/modern/activity/7432332116 OR https://www.strava.com/activities/5910143591 (FTP 201 w @ Weight 78.3 kg)
    const path = __dirname + '/fixtures/rides/fit/7432332116.fit';
    const buffer = fs.readFileSync(path);

    it(`should have a grade MAE lower than ${GRADE_TOLERANCE} percentage points`, done => {
      // Given
      const toleranceAvgGradeDelta = GRADE_TOLERANCE;

      const stravaGradeStream = clone(strava_5910143591.grade_smooth);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          const streamData = <number[]>event
            .getFirstActivity()
            .getStreamData(DataGrade.type)
            .map(value => (value === null ? null : Math.round(value * 10) / 10));
          const deltaBetweenStreams = averageDeltaAtTimes(
            streamData,
            stravaGradeStream,
            clone(strava_5910143591.time),
            12
          );
          console.log(`Delta is ${deltaBetweenStreams}`);
          expect(deltaBetweenStreams).toBeLessThan(toleranceAvgGradeDelta);
          done();
        })
        .catch(done);
    });
  });

  describe('Compliance with garmin Forerunner 945 export (hilly activity)', () => {
    // Given: https://connect.garmin.com/modern/activity/6782987395 OR https://www.strava.com/activities/2451375851
    const path = __dirname + '/fixtures/runs/fit/6782987395.fit';
    const buffer = fs.readFileSync(path);

    it(`should have a grade MAE lower than 2.1 percentage points`, done => {
      // Given
      const toleranceAvgGradeDelta = 2.1;

      const stravaGradeStream = clone(strava_2451375851.grade_smooth);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          const streamData = <number[]>event
            .getFirstActivity()
            .getStreamData(DataGrade.type)
            .map(value => (value === null ? null : Math.round(value * 10) / 10));
          const deltaBetweenStreams = averageDeltaAtTimes(
            streamData,
            stravaGradeStream,
            clone(strava_2451375851.time),
            1
          );
          console.log(`Delta is ${deltaBetweenStreams}`);
          expect(deltaBetweenStreams).toBeLessThan(toleranceAvgGradeDelta);
          done();
        })
        .catch(done);
    });
  });

  describe('Compliance with suunto export (flat activity)', () => {
    // Given FIT Source (Suunto export): https://connect.garmin.com/modern/activity/6909950168 OR https://www.strava.com/activities/5423646653
    const path = __dirname + '/fixtures/runs/fit/6909950168.fit';
    const buffer = fs.readFileSync(path);

    it(`should match time`, done => {
      // Given
      const stravaCadenceStream = clone(strava_3156040843.time);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          expect(stravaCadenceStream.length).toEqual(
            event.getFirstActivity().generateTimeStream([DataDistance.type, DataAltitude.type]).getData(true).length
          );
          expect(stravaCadenceStream).toEqual(
            event.getFirstActivity().generateTimeStream([DataDistance.type, DataAltitude.type]).getData(true)
          );
          done();
        })
        .catch(done);
    });

    it(`should match altitude`, done => {
      // Given
      const stravaAltitudeStream = clone(strava_3156040843.altitude);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          expect(stravaAltitudeStream.length).toEqual(event.getFirstActivity().getStreamData(DataAltitude.type).length);
          expect(stravaAltitudeStream).toEqual(
            event
              .getFirstActivity()
              .getStreamData(DataAltitude.type)
              .map(value => (value === null ? null : Math.round(value * 10) / 10))
          );
          done();
        })
        .catch(done);
    });

    it(`should match heart rate`, done => {
      // Given
      const stravaHeartRateStream = clone(strava_3156040843.heartrate);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          expect(stravaHeartRateStream.length).toEqual(
            event.getFirstActivity().getStreamData(DataHeartRate.type).length
          );
          expect(stravaHeartRateStream).toEqual(
            event
              .getFirstActivity()
              .getStreamData(DataHeartRate.type)
              .map(value => (value === null ? null : Math.round(value * 10) / 10))
          );
          done();
        })
        .catch(done);
    });

    it(`should match cadence`, done => {
      // Given
      const stravaCadenceStream = clone(strava_3156040843.cadence);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          expect(stravaCadenceStream.length).toEqual(event.getFirstActivity().getStreamData(DataCadence.type).length);
          expect(stravaCadenceStream).toEqual(
            event
              .getFirstActivity()
              .getStreamData(DataCadence.type)
              .map(value => (value === null ? null : Math.round(value * 10) / 10))
          );
          done();
        })
        .catch(done);
    });

    it(`should match temperature`, done => {
      // Given
      const stravaTemperatureStream = clone(strava_3156040843.temp);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          expect(stravaTemperatureStream.length).toEqual(
            event.getFirstActivity().getStreamData(DataTemperature.type).length
          );
          expect(stravaTemperatureStream).toEqual(
            event
              .getFirstActivity()
              .getStreamData(DataTemperature.type)
              .map(value => (value === null ? null : Math.round(value * 10) / 10))
          );
          done();
        })
        .catch(done);
    });

    // The saved Strava reference has null power samples. Normalize this comparison to the existing
    // Sports Lib zero-power read policy without shifting or dropping those timestamps.
    it(`should match power including the reference's null-as-zero samples`, done => {
      // Given
      const stravaPowerStream = clone(strava_3156040843.watts).map((value: number | null) =>
        value === null ? 0 : value
      );

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          expect(stravaPowerStream.length).toEqual(event.getFirstActivity().getStreamData(DataPower.type).length);
          expect(stravaPowerStream).toEqual(
            event
              .getFirstActivity()
              .getStreamData(DataPower.type)
              .map(value => (value === null ? null : Math.round(value * 10) / 10))
          );
          done();
        })
        .catch(done);
    });

    it(`should match distance with x% error max`, done => {
      // Given
      const tolerance = 0.6; // percent

      const stravaDistanceStream = clone(strava_3156040843.distance);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          const streamData = event
            .getFirstActivity()
            .getStreamData(DataDistance.type)
            .map(value => (value === null ? null : Math.round(value * 10) / 10));
          const comparison = compareStreamAtTimes(streamData, stravaDistanceStream, strava_3156040843.time);
          expect(comparison.missingTimes).toHaveLength(48);
          expect(
            comparison.withinToleranceCount + Math.ceil((comparison.matchedCount * tolerance) / 100)
          ).toBeGreaterThanOrEqual(comparison.matchedCount);
          done();
        })
        .catch(done);
    });

    it(`should have a grade MAE lower than ${GRADE_TOLERANCE} percentage points`, done => {
      // Given
      const toleranceAvgGradeDelta = GRADE_TOLERANCE;

      const stravaGradeStream = clone(strava_3156040843.grade_smooth);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          const streamData = <number[]>event
            .getFirstActivity()
            .getStreamData(DataGrade.type)
            .map(value => (value === null ? null : Math.round(value * 10) / 10));
          const deltaBetweenStreams = averageDeltaAtTimes(
            streamData,
            stravaGradeStream,
            clone(strava_3156040843.time),
            52
          );
          console.log(`Delta is ${deltaBetweenStreams}`);
          expect(deltaBetweenStreams).toBeLessThan(toleranceAvgGradeDelta);
          done();
        })
        .catch(done);
    });
  });

  describe('Compliance with suunto export (flat activity) without paused records', () => {
    // Given FIT Source (Suunto export): https://connect.garmin.com/modern/activity/6909950168 OR https://www.strava.com/activities/5423646653
    const path = __dirname + '/fixtures/runs/fit/6909950168-no-pause-records.fit';
    const buffer = fs.readFileSync(path);

    it(`should match time`, done => {
      // Given
      const stravaCadenceStream = clone(strava_3182900697.time);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          expect(stravaCadenceStream.length).toEqual(
            event.getFirstActivity().generateTimeStream([DataDistance.type, DataAltitude.type]).getData(true).length
          );
          expect(stravaCadenceStream).toEqual(
            event.getFirstActivity().generateTimeStream([DataDistance.type, DataAltitude.type]).getData(true)
          );
          done();
        })
        .catch(done);
    });

    it(`should match altitude`, done => {
      // Given
      const stravaAltitudeStream = clone(strava_3182900697.altitude);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          expect(stravaAltitudeStream.length).toEqual(
            event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length
          );
          expect(stravaAltitudeStream).toEqual(
            event
              .getFirstActivity()
              .getSquashedStreamData(DataAltitude.type)
              .map(value => (value === null ? null : Math.round(value * 10) / 10))
          );
          done();
        })
        .catch(done);
    });

    it(`should match heart rate`, done => {
      // Given
      const stravaHeartRateStream = clone(strava_3182900697.heartrate);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          expect(stravaHeartRateStream.length).toEqual(
            event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length
          );
          expect(stravaHeartRateStream).toEqual(
            event
              .getFirstActivity()
              .getSquashedStreamData(DataHeartRate.type)
              .map(value => (value === null ? null : Math.round(value * 10) / 10))
          );
          done();
        })
        .catch(done);
    });

    it(`should match cadence`, done => {
      // Given
      const stravaCadenceStream = clone(strava_3182900697.cadence);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          expect(stravaCadenceStream.length).toEqual(
            event.getFirstActivity().getSquashedStreamData(DataCadence.type).length
          );
          expect(stravaCadenceStream).toEqual(
            event
              .getFirstActivity()
              .getSquashedStreamData(DataCadence.type)
              .map(value => (value === null ? null : Math.round(value * 10) / 10))
          );
          done();
        })
        .catch(done);
    });

    it(`should match distance with x% error max`, done => {
      // Given
      const tolerance = 0.6; // percent

      const stravaDistanceStream = clone(strava_3182900697.distance);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          const streamData = event
            .getFirstActivity()
            .getStreamData(DataDistance.type)
            .map(value => (value === null ? null : Math.round(value * 10) / 10));
          const comparison = compareStreamAtTimes(streamData, stravaDistanceStream, strava_3182900697.time);
          expect(comparison.missingTimes).toHaveLength(14);
          expect(
            comparison.withinToleranceCount + Math.ceil((comparison.matchedCount * tolerance) / 100)
          ).toBeGreaterThanOrEqual(comparison.matchedCount);
          done();
        })
        .catch(done);
    });

    it(`should have a grade MAE lower than ${GRADE_TOLERANCE} percentage points`, done => {
      // Given
      const toleranceAvgGradeDelta = GRADE_TOLERANCE;

      const stravaGradeStream = clone(strava_3182900697.grade_smooth);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          const streamData = <number[]>event
            .getFirstActivity()
            .getStreamData(DataGrade.type)
            .map(value => (value === null ? null : Math.round(value * 10) / 10));
          const deltaBetweenStreams = averageDeltaAtTimes(
            streamData,
            stravaGradeStream,
            clone(strava_3182900697.time),
            18
          );
          console.log(`Delta is ${deltaBetweenStreams}`);
          expect(deltaBetweenStreams).toBeLessThan(toleranceAvgGradeDelta);
          done();
        })
        .catch(done);
    });
  });

  describe('Compliance with suunto export (uphill 1800 activity) without paused records ', () => {
    // Given FIT Source (Suunto export): https://connect.garmin.com/modern/activity/6910052863 OR https://www.strava.com/activities/5423660493
    const path = __dirname + '/fixtures/runs/fit/6910052863.fit';
    const buffer = fs.readFileSync(path);

    it(`should match time`, done => {
      // Given
      const stravaCadenceStream = clone(strava_2709634581.time);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          expect(stravaCadenceStream.length).toEqual(
            event.getFirstActivity().generateTimeStream().getData(true).length
          );
          expect(stravaCadenceStream).toEqual(
            event.getFirstActivity().generateTimeStream([DataDistance.type, DataAltitude.type]).getData(true)
          );
          done();
        })
        .catch(done);
    });

    it(`should match altitude`, done => {
      // Given
      const stravaAltitudeStream = clone(strava_2709634581.altitude);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          expect(stravaAltitudeStream.length).toEqual(
            event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length
          );
          expect(stravaAltitudeStream).toEqual(
            event
              .getFirstActivity()
              .getSquashedStreamData(DataAltitude.type)
              .map(value => (value === null ? null : Math.round(value * 10) / 10))
          );
          done();
        })
        .catch(done);
    });

    it(`should match heart rate`, done => {
      // Given
      const stravaHeartRateStream = clone(strava_2709634581.heartrate);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          expect(stravaHeartRateStream.length).toEqual(
            event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length
          );
          expect(stravaHeartRateStream).toEqual(
            event
              .getFirstActivity()
              .getSquashedStreamData(DataHeartRate.type)
              .map(value => (value === null ? null : Math.round(value * 10) / 10))
          );
          done();
        })
        .catch(done);
    });

    it(`should match cadence`, done => {
      // Given
      const stravaCadenceStream = clone(strava_2709634581.cadence);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          expect(stravaCadenceStream.length).toEqual(
            event.getFirstActivity().getSquashedStreamData(DataCadence.type).length
          );
          expect(stravaCadenceStream).toEqual(
            event
              .getFirstActivity()
              .getSquashedStreamData(DataCadence.type)
              .map(value => (value === null ? null : Math.round(value * 10) / 10))
          );
          done();
        })
        .catch(done);
    });

    it.skip(`known Suunto uphill discrepancy: Strava distance is not identical to recorded distance`, done => {
      // Given
      const _tolerance = 0.6; // percent

      const stravaDistanceStream = clone(strava_2709634581.distance);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          const streamData = event
            .getFirstActivity()
            .getSquashedStreamData(DataDistance.type)
            .map(value => (value === null ? null : Math.round(value * 10) / 10));
          // expect(stravaDistanceStream.length).toEqual(streamData.length);
          const _commonCount = stravaDistanceStream.filter(
            (value: number | null) => streamData.indexOf(value) !== -1
          ).length;
          // expect(commonCount + Math.ceil((stravaDistanceStream.length * tolerance) / 100)).toBeGreaterThanOrEqual(stravaDistanceStream.length);
          expect(stravaDistanceStream).toEqual(streamData);
          done();
        })
        .catch(done);
    });

    it.skip(`known Suunto uphill discrepancy: grade MAE exceeds ${GRADE_TOLERANCE} percentage points`, done => {
      // Given
      const toleranceAvgGradeDelta = GRADE_TOLERANCE;

      const stravaGradeStream = clone(strava_2709634581.grade_smooth);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          const streamData = <number[]>event
            .getFirstActivity()
            .getStreamData(DataGrade.type)
            .map(value => (value === null ? null : Math.round(value * 10) / 10));
          const deltaBetweenStreams = averageDeltaAtTimes(
            streamData,
            stravaGradeStream,
            clone(strava_2709634581.time),
            28
          );
          console.log(`Delta is ${deltaBetweenStreams}`);
          expect(deltaBetweenStreams).toBeLessThan(toleranceAvgGradeDelta);
          done();
        })
        .catch(done);
    });
  });

  describe('Compliance with COROS export', () => {
    // Given FIT Source (Coros export): https://connect.garmin.com/modern/activity/6916663933 OR https://www.strava.com/activities/5429996380
    const path = __dirname + '/fixtures/runs/fit/6916663933.fit';
    const buffer = fs.readFileSync(path);

    it(`should match time`, done => {
      // Given
      const stravaCadenceStream = clone(strava_3183465494.time);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          expect(stravaCadenceStream.length).toEqual(
            event.getFirstActivity().generateTimeStream([DataDistance.type, DataAltitude.type]).getData(true).length
          );
          expect(stravaCadenceStream).toEqual(
            event.getFirstActivity().generateTimeStream([DataDistance.type, DataAltitude.type]).getData(true)
          );
          done();
        })
        .catch(done);
    });

    it(`should match altitude`, done => {
      // Given
      const stravaAltitudeStream = clone(strava_3183465494.altitude);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          expect(stravaAltitudeStream.length).toEqual(
            event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length
          );
          expect(stravaAltitudeStream).toEqual(
            event
              .getFirstActivity()
              .getSquashedStreamData(DataAltitude.type)
              .map(value => (value === null ? null : Math.round(value * 10) / 10))
          );
          done();
        })
        .catch(done);
    });

    it(`should match heart rate`, done => {
      // Given
      const stravaHeartRateStream = clone(strava_3183465494.heartrate);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          expect(stravaHeartRateStream.length).toEqual(
            event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length
          );
          expect(stravaHeartRateStream).toEqual(
            event
              .getFirstActivity()
              .getSquashedStreamData(DataHeartRate.type)
              .map(value => (value === null ? null : Math.round(value * 10) / 10))
          );
          done();
        })
        .catch(done);
    });

    it(`should match cadence`, done => {
      // Given
      const stravaCadenceStream = clone(strava_3183465494.cadence);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          expect(stravaCadenceStream.length).toEqual(
            event.getFirstActivity().getSquashedStreamData(DataCadence.type).length
          );
          expect(stravaCadenceStream).toEqual(
            event
              .getFirstActivity()
              .getSquashedStreamData(DataCadence.type)
              .map(value => (value === null ? null : Math.round(value * 10) / 10))
          );
          done();
        })
        .catch(done);
    });

    it(`should match distance`, done => {
      // Given
      const _tolerance = 0.6; // percent

      const stravaDistanceStream = clone(strava_3183465494.distance);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          const streamData = event
            .getFirstActivity()
            .getSquashedStreamData(DataDistance.type)
            .map(value => (value === null ? null : Math.round(value * 10) / 10));
          expect(stravaDistanceStream.length).toEqual(streamData.length);
          expect(stravaDistanceStream).toEqual(streamData);
          done();
        })
        .catch(done);
    });

    it(`should have a grade MAE lower than ${GRADE_TOLERANCE} percentage points`, done => {
      // Given
      const toleranceAvgGradeDelta = GRADE_TOLERANCE;

      const stravaGradeStream = clone(strava_3183465494.grade_smooth);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          const streamData = <number[]>event
            .getFirstActivity()
            .getStreamData(DataGrade.type)
            .map(value => (value === null ? null : Math.round(value * 10) / 10));
          const deltaBetweenStreams = averageDeltaAtTimes(
            streamData,
            stravaGradeStream,
            clone(strava_3183465494.time),
            11
          );
          console.log(`Delta is ${deltaBetweenStreams}`);
          expect(deltaBetweenStreams).toBeLessThan(toleranceAvgGradeDelta);
          done();
        })
        .catch(done);
    });
  });

  describe('Compliance with COROS export trail', () => {
    // Given FIT Source (Coros export): https://connect.garmin.com/modern/activity/6916728382 OR https://www.strava.com/activities/5430055225
    const path = __dirname + '/fixtures/runs/fit/6916728382.fit';
    const buffer = fs.readFileSync(path);

    it(`should match time`, done => {
      // Given
      const stravaCadenceStream = clone(strava_3183490558.time);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          expect(stravaCadenceStream.length).toEqual(
            event.getFirstActivity().generateTimeStream([DataDistance.type, DataAltitude.type]).getData(true).length
          );
          expect(stravaCadenceStream).toEqual(
            event.getFirstActivity().generateTimeStream([DataDistance.type, DataAltitude.type]).getData(true)
          );
          done();
        })
        .catch(done);
    });

    it(`should match altitude`, done => {
      // Given
      const stravaAltitudeStream = clone(strava_3183490558.altitude);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          expect(stravaAltitudeStream.length).toEqual(
            event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length
          );
          expect(stravaAltitudeStream).toEqual(
            event
              .getFirstActivity()
              .getSquashedStreamData(DataAltitude.type)
              .map(value => (value === null ? null : Math.round(value * 10) / 10))
          );
          done();
        })
        .catch(done);
    });

    it(`should match heart rate`, done => {
      // Given
      const stravaHeartRateStream = clone(strava_3183490558.heartrate);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          expect(stravaHeartRateStream.length).toEqual(
            event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length
          );
          expect(stravaHeartRateStream).toEqual(
            event
              .getFirstActivity()
              .getSquashedStreamData(DataHeartRate.type)
              .map(value => (value === null ? null : Math.round(value * 10) / 10))
          );
          done();
        })
        .catch(done);
    });

    it(`should match cadence`, done => {
      // Given
      const stravaCadenceStream = clone(strava_3183490558.cadence);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          expect(stravaCadenceStream.length).toEqual(
            event.getFirstActivity().getSquashedStreamData(DataCadence.type).length
          );
          // @todo leaving this to fail to investigate how to fill linear as seen with Suunto
          expect(stravaCadenceStream).toEqual(
            event
              .getFirstActivity()
              .getSquashedStreamData(DataCadence.type)
              .map(value => (value === null ? null : Math.round(value * 10) / 10))
          );
          done();
        })
        .catch(done);
    });

    it.skip(`known COROS trail discrepancy: Strava changes six startup distance observations`, done => {
      // Given
      const _tolerance = 0.6; // percent

      const stravaDistanceStream = clone(strava_3183490558.distance);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          const streamData = event
            .getFirstActivity()
            .getSquashedStreamData(DataDistance.type)
            .map(value => (value === null ? null : Math.round(value * 10) / 10));
          expect(stravaDistanceStream.length).toEqual(streamData.length);
          expect(stravaDistanceStream).toEqual(streamData);
          done();
        })
        .catch(done);
    });

    it.skip(`should have a grade MAE lower than ${GRADE_TOLERANCE} percentage points`, done => {
      // Given
      const toleranceAvgGradeDelta = GRADE_TOLERANCE;

      const stravaGradeStream = clone(strava_3183490558.grade_smooth);

      // When
      const eventInterfacePromise = SportsLib.importFromFit(buffer);

      // Then
      eventInterfacePromise
        .then((event: EventInterface) => {
          const streamData = <number[]>event
            .getFirstActivity()
            .getStreamData(DataGrade.type)
            .map(value => (value === null ? null : Math.round(value * 10) / 10));
          const deltaBetweenStreams = averageDeltaAtTimes(
            streamData,
            stravaGradeStream,
            clone(strava_3183490558.time),
            13
          );
          console.log(`Delta is ${deltaBetweenStreams}`);
          expect(deltaBetweenStreams).toBeLessThan(toleranceAvgGradeDelta);
          done();
        })
        .catch(done);
    });
  });

  describe('Compliance with garmin export (hilly activity: https://connect.garmin.com/modern/activity/828989227 / https://www.strava.com/activities/343080886)', () => {
    describe('Fit file version', () => {
      // Given FIT Source: https://connect.garmin.com/modern/activity/828989227 OR https://www.strava.com/activities/343080886
      const path = __dirname + '/fixtures/rides/fit/828989227.fit';
      const buffer = fs.readFileSync(path);

      it(`should match time`, done => {
        // Given
        const stravaCadenceStream = clone(strava_343080886.time);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise
          .then((event: EventInterface) => {
            expect(stravaCadenceStream.length).toEqual(
              event.getFirstActivity().generateTimeStream([DataDistance.type, DataAltitude.type]).getData(true).length
            );
            expect(stravaCadenceStream).toEqual(
              event.getFirstActivity().generateTimeStream([DataDistance.type, DataAltitude.type]).getData(true)
            );
            done();
          })
          .catch(done);
      });

      it(`should match altitude`, done => {
        // Given
        const stravaAltitudeStream = clone(strava_343080886.altitude);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise
          .then((event: EventInterface) => {
            expect(stravaAltitudeStream.length).toEqual(
              event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length
            );
            expect(stravaAltitudeStream).toEqual(
              event
                .getFirstActivity()
                .getSquashedStreamData(DataAltitude.type)
                .map(value => (value === null ? null : Math.round(value * 10) / 10))
            );
            done();
          })
          .catch(done);
      });

      it(`should match heart rate`, done => {
        // Given
        const stravaHeartRateStream = clone(strava_343080886.heartrate);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise
          .then((event: EventInterface) => {
            expect(stravaHeartRateStream.length).toEqual(
              event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length
            );
            expect(stravaHeartRateStream).toEqual(
              event
                .getFirstActivity()
                .getSquashedStreamData(DataHeartRate.type)
                .map(value => (value === null ? null : Math.round(value * 10) / 10))
            );
            done();
          })
          .catch(done);
      });

      it(`should match cadence`, done => {
        // Given
        const stravaCadenceStream = clone(strava_343080886.cadence);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise
          .then((event: EventInterface) => {
            expect(stravaCadenceStream.length).toEqual(
              event.getFirstActivity().getSquashedStreamData(DataCadence.type).length
            );
            expect(stravaCadenceStream).toEqual(
              event
                .getFirstActivity()
                .getSquashedStreamData(DataCadence.type)
                .map(value => (value === null ? null : Math.round(value * 10) / 10))
            );
            done();
          })
          .catch(done);
      });

      it(`should match distance with x% error max`, done => {
        // Given
        const _tolerance = 0.0; // percent

        const stravaDistanceStream = clone(strava_343080886.distance);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise
          .then((event: EventInterface) => {
            expect(stravaDistanceStream.length).toEqual(
              event.getFirstActivity().getSquashedStreamData(DataDistance.type).length
            );
            const streamData = event
              .getFirstActivity()
              .getSquashedStreamData(DataDistance.type)
              .map(value => (value === null ? null : Math.round(value * 10) / 10));
            expect(stravaDistanceStream).toEqual(streamData);
            done();
          })
          .catch(done);
      });

      it(`should have a grade MAE lower than ${GRADE_TOLERANCE} percentage points`, done => {
        // Given
        const toleranceAvgGradeDelta = GRADE_TOLERANCE;
        const stravaGradeStream = clone(strava_343080886.grade_smooth);

        // When
        const eventInterfacePromise = SportsLib.importFromFit(buffer);

        // Then
        eventInterfacePromise
          .then((event: EventInterface) => {
            const streamData = <number[]>event
              .getFirstActivity()
              .getStreamData(DataGrade.type)
              .map(value => (value === null ? null : Math.round(value * 10) / 10));
            const deltaBetweenStreams = averageDeltaAtTimes(
              streamData,
              stravaGradeStream,
              clone(strava_343080886.time),
              28
            );
            console.log(`Delta is ${deltaBetweenStreams}`);
            expect(deltaBetweenStreams).toBeLessThan(toleranceAvgGradeDelta);
            done();
          })
          .catch(done);
      });
    });

    describe('Tcx file version', () => {
      // Given FIT Source: https://connect.garmin.com/modern/activity/828989227 OR https://www.strava.com/activities/343080886
      const path = __dirname + '/fixtures/rides/tcx/828989227.tcx';
      const doc = domParser.parseFromString(fs.readFileSync(path).toString(), 'application/xml');

      it(`should match time`, done => {
        // Given
        const stravaCadenceStream = clone(strava_3171487458_tcx.time);

        // When
        const eventInterfacePromise = SportsLib.importFromTCX(doc);

        // Then
        eventInterfacePromise
          .then((event: EventInterface) => {
            expect(stravaCadenceStream.length).toEqual(
              event.getFirstActivity().generateTimeStream([DataDistance.type, DataAltitude.type]).getData(true).length
            );
            expect(stravaCadenceStream).toEqual(
              event.getFirstActivity().generateTimeStream([DataDistance.type, DataAltitude.type]).getData(true)
            );
            done();
          })
          .catch(done);
      });

      it(`should match altitude`, done => {
        // Given
        const stravaAltitudeStream = clone(strava_3171487458_tcx.altitude);

        // When
        const eventInterfacePromise = SportsLib.importFromTCX(doc);

        // Then
        eventInterfacePromise
          .then((event: EventInterface) => {
            expect(stravaAltitudeStream.length).toEqual(
              event.getFirstActivity().getSquashedStreamData(DataAltitude.type).length
            );
            expect(stravaAltitudeStream).toEqual(
              event
                .getFirstActivity()
                .getSquashedStreamData(DataAltitude.type)
                .map(value => (value === null ? null : Math.round(value * 10) / 10))
            );
            done();
          })
          .catch(done);
      });

      it(`should match heart rate`, done => {
        // Given
        const stravaHeartRateStream = clone(strava_3171487458_tcx.heartrate);

        // When
        const eventInterfacePromise = SportsLib.importFromTCX(doc);

        // Then
        eventInterfacePromise
          .then((event: EventInterface) => {
            expect(stravaHeartRateStream.length).toEqual(
              event.getFirstActivity().getSquashedStreamData(DataHeartRate.type).length
            );
            expect(stravaHeartRateStream).toEqual(
              event
                .getFirstActivity()
                .getSquashedStreamData(DataHeartRate.type)
                .map(value => (value === null ? null : Math.round(value * 10) / 10))
            );
            done();
          })
          .catch(done);
      });

      it(`should match cadence`, done => {
        // Given
        const stravaCadenceStream = clone(strava_3171487458_tcx.cadence);

        // When
        const eventInterfacePromise = SportsLib.importFromTCX(doc);

        // Then
        eventInterfacePromise
          .then((event: EventInterface) => {
            expect(stravaCadenceStream.length).toEqual(
              event.getFirstActivity().getSquashedStreamData(DataCadence.type).length
            );
            expect(stravaCadenceStream).toEqual(
              event
                .getFirstActivity()
                .getSquashedStreamData(DataCadence.type)
                .map(value => (value === null ? null : Math.round(value * 10) / 10))
            );
            done();
          })
          .catch(done);
      });

      it(`should match distance with x% error max`, done => {
        // Given
        const _tolerance = 2.6; // percent
        const _toleranceDelta = 0.1;

        const stravaDistanceStream = clone(strava_3171487458_tcx.distance);

        // When
        const eventInterfacePromise = SportsLib.importFromTCX(doc);

        // Then
        eventInterfacePromise
          .then((event: EventInterface) => {
            const streamData = <number[]>event
              .getFirstActivity()
              .getSquashedStreamData(DataDistance.type)
              .map(value => (value === null ? null : Math.round(value * 10) / 10));
            expect(stravaDistanceStream.length).toEqual(streamData.length);
            // const commonCount = stravaDistanceStream
            //   .filter((value: number) => streamData.indexOf(value) !== -1).length;
            // We find the common then add the % tolerance and we check if its more than equal to the "strava" stream
            // expect(commonCount + Math.ceil((stravaDistanceStream.length * tolerance) / 100)).toBeGreaterThanOrEqual(stravaDistanceStream.length);
            expect(stravaDistanceStream).toMatchObject(streamData);
            // const deltaBetweenStreams = averageDeltaBetweenStreams(streamData, stravaDistanceStream);
            // expect(deltaBetweenStreams).toBeLessThan(toleranceDelta);
            done();
          })
          .catch(done);
      });

      it(`should have a grade MAE lower than ${GRADE_TOLERANCE} percentage points`, done => {
        // Given
        const toleranceAvgGradeDelta = GRADE_TOLERANCE;
        const stravaGradeStream = clone(strava_3171487458_tcx.grade_smooth);

        // When
        const eventInterfacePromise = SportsLib.importFromTCX(doc);

        // Then
        eventInterfacePromise
          .then((event: EventInterface) => {
            const streamData = <number[]>event
              .getFirstActivity()
              .getStreamData(DataGrade.type)
              .map(value => (value === null ? null : Math.round(value * 10) / 10));
            const deltaBetweenStreams = averageDeltaAtTimes(
              streamData,
              stravaGradeStream,
              clone(strava_3171487458_tcx.time),
              1
            );
            console.log(`Delta is ${deltaBetweenStreams}`);
            expect(deltaBetweenStreams).toBeLessThan(toleranceAvgGradeDelta);
            done();
          })
          .catch(done);
      });
    });

    describe('GPX file version', () => {
      // Given GPX Source: https://connect.garmin.com/modern/activity/6870692308 OR https://www.strava.com/activities/5385683390
      // Given FIT Source: https://connect.garmin.com/modern/activity/828989227 OR https://www.strava.com/activities/343080886
      const path = __dirname + '/fixtures/rides/gpx/828989227.gpx';
      const gpxString = fs.readFileSync(path).toString();

      it(`should match time`, done => {
        // Given
        const stravaTimeStream = clone(strava_3171438371_gpx.time);

        // When
        const eventInterfacePromise = SportsLib.importFromGPX(gpxString, xmldom.DOMParser);

        // Then
        eventInterfacePromise
          .then((event: EventInterface) => {
            expect(stravaTimeStream.length).toEqual(
              event.getFirstActivity().generateTimeStream([DataDistance.type, DataAltitude.type]).getData(true).length
            );
            expect(stravaTimeStream).toEqual(
              event.getFirstActivity().generateTimeStream([DataDistance.type, DataAltitude.type]).getData(true)
            );
            done();
          })
          .catch(done);
      });

      // Strava adds their own altitude so no go from here
      // it(`should match altitude`, done => {
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
      // it(`should match heart rate`, done => {
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
      // it(`should match cadence`, done => {
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

      // @todo try different geolib adapters etc to make this diff smaller or investigate more on how strava
      // Bumps the distance
      it(`should match distance with x% error max`, done => {
        // Given
        const deltaTolerance = 15; // metres of mean absolute distance difference

        const stravaDistanceStream = clone(strava_3171438371_gpx.distance);

        // When
        const eventInterfacePromise = SportsLib.importFromGPX(gpxString, xmldom.DOMParser);

        // Then
        eventInterfacePromise
          .then((event: EventInterface) => {
            const streamData = <number[]>event
              .getFirstActivity()
              .getStreamData(DataDistance.type)
              .map(value => (value === null ? null : Math.round(value * 10) / 10));
            const deltaBetweenStreams = averageDeltaAtTimes(
              streamData,
              stravaDistanceStream,
              clone(strava_3171438371_gpx.time),
              0
            );
            expect(deltaBetweenStreams).toBeLessThan(deltaTolerance);
            done();
          })
          .catch(done);
      });

      // Tolerance is higher since distance is different unfortunately (see above test)
      it(`should have a grade MAE lower than 3.2 percentage points`, done => {
        // Given
        const toleranceAvgGradeDelta = 3.2;
        const stravaGradeStream = clone(strava_3171438371_gpx.grade_smooth);

        // When
        const eventInterfacePromise = SportsLib.importFromGPX(gpxString, xmldom.DOMParser);

        // Then
        eventInterfacePromise
          .then((event: EventInterface) => {
            const streamData = <number[]>event
              .getFirstActivity()
              .getStreamData(DataGrade.type)
              .map(value => (value === null ? null : Math.round(value * 10) / 10));
            const deltaBetweenStreams = averageDeltaAtTimes(
              streamData,
              stravaGradeStream,
              clone(strava_3171438371_gpx.time),
              1
            );
            console.log(`Delta is ${deltaBetweenStreams}`);
            expect(deltaBetweenStreams).toBeLessThan(toleranceAvgGradeDelta);
            done();
          })
          .catch(done);
      });
    });
  });
});
