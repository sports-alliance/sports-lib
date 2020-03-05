import fs from 'fs';
import { SportsLib } from '../src';
import { EventInterface } from '../src/events/event.interface';
import * as strava_3156040843 from './fixtures/strava_compliance/suunto_export/strava_3156040843.json';
import { DataAltitude } from '../src/data/data.altitude';
import { DataHeartRate } from '../src/data/data.heart-rate';

function clone(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

describe('Strava data compliance', () => {

  it('should match altitude', done => {

    // Given
    const path = __dirname + '/fixtures/strava_compliance/suunto_export/5e5fde38c2de24635a30d383.fit';
    const buffer = fs.readFileSync(path);

    const altitudeStream = clone(strava_3156040843.altitude);

    // When
    const eventInterfacePromise = SportsLib.importFromFit(buffer);

    // Then
    eventInterfacePromise.then((event: EventInterface) => {
      expect(altitudeStream.length).toEqual(event.getFirstActivity().getStreamData(DataAltitude.type).length);
      // @todo Thomas do you think that this precision change should happen library wise?
      expect(altitudeStream).toEqual(event.getFirstActivity().getStreamData(DataAltitude.type).map(altitude => altitude === null ? null :  Math.round(altitude * 10) / 10));
      done();
    });
  });

  it('should match heart rate', done => {

    // Given
    const path = __dirname + '/fixtures/strava_compliance/suunto_export/5e5fde38c2de24635a30d383.fit';
    const buffer = fs.readFileSync(path);

    const heartRateStream = clone(strava_3156040843.heartrate);

    // When
    const eventInterfacePromise = SportsLib.importFromFit(buffer);

    // Then
    eventInterfacePromise.then((event: EventInterface) => {
      expect(heartRateStream.length).toEqual(event.getFirstActivity().getStreamData(DataHeartRate.type).length);
      expect(heartRateStream).toEqual(event.getFirstActivity().getStreamData(DataHeartRate.type).map(altitude => altitude === null ? null :  Math.round(altitude * 10) / 10));
      done();
    });
  });
});
