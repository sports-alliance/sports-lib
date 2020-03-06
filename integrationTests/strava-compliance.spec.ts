import fs from 'fs';
import { SportsLib } from '../src';
import { EventInterface } from '../src/events/event.interface';
import * as strava_3156040843 from './fixtures/strava_compliance/suunto_export/strava_3156040843.json';
import { DataAltitude } from '../src/data/data.altitude';
import { DataHeartRate } from '../src/data/data.heart-rate';
import { DataCadence } from '../src/data/data.cadence';
import { DataTemperature } from '../src/data/data.temperature';
import { DataPower } from '../src/data/data.power';
import { DataDistance } from '../src/data/data.distance';
import { DataGrade } from '../src/data/data.grade';

function clone(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

describe('Strava data compliance', () => {

  it('should match altitude', done => {

    // Given
    const path = __dirname + '/fixtures/strava_compliance/suunto_export/5e5fde38c2de24635a30d383.fit';
    const buffer = fs.readFileSync(path);

    const stravaAltitudeStream = clone(strava_3156040843.altitude);

    // When
    const eventInterfacePromise = SportsLib.importFromFit(buffer);

    // Then
    eventInterfacePromise.then((event: EventInterface) => {
      expect(stravaAltitudeStream.length).toEqual(event.getFirstActivity().getStreamData(DataAltitude.type).length);
      // @todo Thomas do you think that this precision change should happen library wise?
      expect(stravaAltitudeStream).toEqual(event.getFirstActivity().getStreamData(DataAltitude.type).map(value => value === null ? null :  Math.round(value * 10) / 10));
      done();
    });
  });

  it('should match heart rate', done => {

    // Given
    const path = __dirname + '/fixtures/strava_compliance/suunto_export/5e5fde38c2de24635a30d383.fit';
    const buffer = fs.readFileSync(path);

    const straveHeartRateStream = clone(strava_3156040843.heartrate);

    // When
    const eventInterfacePromise = SportsLib.importFromFit(buffer);

    // Then
    eventInterfacePromise.then((event: EventInterface) => {
      expect(straveHeartRateStream.length).toEqual(event.getFirstActivity().getStreamData(DataHeartRate.type).length);
      expect(straveHeartRateStream).toEqual(event.getFirstActivity().getStreamData(DataHeartRate.type).map(value => value === null ? null :  Math.round(value * 10) / 10));
      done();
    });
  });

  it('should match cadence', done => {

    // Given
    const path = __dirname + '/fixtures/strava_compliance/suunto_export/5e5fde38c2de24635a30d383.fit';
    const buffer = fs.readFileSync(path);

    const stravaCadenceStream = clone(strava_3156040843.cadence);

    // When
    const eventInterfacePromise = SportsLib.importFromFit(buffer);

    // Then
    eventInterfacePromise.then((event: EventInterface) => {
      expect(stravaCadenceStream.length).toEqual(event.getFirstActivity().getStreamData(DataCadence.type).length);
      expect(stravaCadenceStream).toEqual(event.getFirstActivity().getStreamData(DataCadence.type).map(value => value === null ? null :  Math.round(value * 10) / 10));
      done();
    });
  });

  it('should match temperature', done => {

    // Given
    const path = __dirname + '/fixtures/strava_compliance/suunto_export/5e5fde38c2de24635a30d383.fit';
    const buffer = fs.readFileSync(path);

    const stravaTemperatureStream = clone(strava_3156040843.temp);

    // When
    const eventInterfacePromise = SportsLib.importFromFit(buffer);

    // Then
    eventInterfacePromise.then((event: EventInterface) => {
      expect(stravaTemperatureStream.length).toEqual(event.getFirstActivity().getStreamData(DataTemperature.type).length);
      expect(stravaTemperatureStream).toEqual(event.getFirstActivity().getStreamData(DataTemperature.type).map(value => value === null ? null :  Math.round(value * 10) / 10));
      done();
    });
  });

  it('should match power', done => {

    // Given
    const path = __dirname + '/fixtures/strava_compliance/suunto_export/5e5fde38c2de24635a30d383.fit';
    const buffer = fs.readFileSync(path);

    const stravaPowerStream = clone(strava_3156040843.watts);

    // When
    const eventInterfacePromise = SportsLib.importFromFit(buffer);

    // Then
    eventInterfacePromise.then((event: EventInterface) => {
      expect(stravaPowerStream.length).toEqual(event.getFirstActivity().getStreamData(DataPower.type).length);
      expect(stravaPowerStream).toEqual(event.getFirstActivity().getStreamData(DataPower.type).map(value => value === null ? null :  Math.round(value * 10) / 10));
      done();
    });
  });

  it('should match distance with x% error max', done => {

    // Given
    const path = __dirname + '/fixtures/strava_compliance/suunto_export/5e5fde38c2de24635a30d383.fit';
    const buffer = fs.readFileSync(path);
    const tolerance = 0.60; // percent

    const stravaDistanceStream = clone(strava_3156040843.distance);

    // When
    const eventInterfacePromise = SportsLib.importFromFit(buffer);

    // Then
    eventInterfacePromise.then((event: EventInterface) => {
      expect(stravaDistanceStream.length).toEqual(event.getFirstActivity().getStreamData(DataDistance.type).length);
      const suuntoDistanceStreamData = event.getFirstActivity().getStreamData(DataDistance.type).map(value => value === null ? null :  Math.round(value * 10) / 10)
      const commonCount = stravaDistanceStream
        .filter((value: (number|null)) => suuntoDistanceStreamData.indexOf(value) !== -1).length;
      // We find the common then add the % tolerance and we check if its more than equal to the "strava" stream
      expect(commonCount + Math.ceil((stravaDistanceStream.length * tolerance) / 100)).toBeGreaterThanOrEqual(stravaDistanceStream.length);
      done();
    });
  });

  it('should match grade with 0.20% error max', done => {

    // Given
    const path = __dirname + '/fixtures/strava_compliance/suunto_export/5e5fde38c2de24635a30d383.fit';
    const buffer = fs.readFileSync(path);
    const tolerance = 0.20; // percent

    const stravaGradeStream = clone(strava_3156040843.grade_smooth);

    // When
    const eventInterfacePromise = SportsLib.importFromFit(buffer);

    // Then
    eventInterfacePromise.then((event: EventInterface) => {
      expect(stravaGradeStream.length).toEqual(event.getFirstActivity().getStreamData(DataGrade.type).length);
      const suuntoGradeStreamData = event.getFirstActivity().getStreamData(DataGrade.type).map(value => value === null ? null :  Math.round(value * 10) / 10)
      const commonCount = stravaGradeStream
        .filter((value: (number|null)) => suuntoGradeStreamData.indexOf(value) !== -1).length;
      // We find the common then add the % tolerance and we check if its more than equal to the "strava" stream
      expect(commonCount + Math.ceil((stravaGradeStream.length * tolerance) / 100)).toBeGreaterThanOrEqual(stravaGradeStream.length);
      done();
    });
  });
});
