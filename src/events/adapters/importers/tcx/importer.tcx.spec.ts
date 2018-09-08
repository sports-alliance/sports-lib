import {EventImporterTCX} from './importer.tcx';
import {Event} from '../../../event';

const movescountTCXJSON = require('../../../../../samples/tcx/movescount.tcx.json');
const polarTCXJSON = require('../../../../../samples/tcx/polar.tcx.json');
const garminTCXJSON = require('../../../../../samples/tcx/garmin.tcx.json');

describe('EventImporterTCX', () => {

  beforeEach(() => {

  });

  // it('should be able to decode tcx from Movescount', async () => {
  //   const event = await EventImporterTCX.getFromXML((new DOMParser()).parseFromString(movescountTCXJSON.tcx, 'application/xml'));
  //   expect(event instanceof Event).toBe(true);
  // });
  //
  // it('should be able to decode tcx from Polar', async () => {
  //   const event = await EventImporterTCX.getFromXML((new DOMParser()).parseFromString(polarTCXJSON.tcx, 'application/xml'));
  //   expect(event instanceof Event).toBe(true);
  // });
  //
  // it('should be able to decode tcx from Garmin', async () => {
  //   const event = await  EventImporterTCX.getFromXML((new DOMParser()).parseFromString(garminTCXJSON.tcx, 'application/xml'));
  //   expect(event instanceof Event).toBe(true);
  // });

});
