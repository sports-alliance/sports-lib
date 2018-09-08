import {EventImporterGPX} from './importer.gpx';
import {Event} from '../../../event';

const movescountGPX = require('../../../../../samples/gpx/movescount.gpx.json');
const amazfitGPX = require('../../../../../samples/gpx/amazfit.gpx.json');
const garminGPX = require('../../../../../samples/gpx/garmin.gpx.json');
const stravaGPX = require('../../../../../samples/gpx/strava.gpx.json');
const sportsTrackerGPX = require('../../../../../samples/gpx/sports-tracker.gpx.json');

describe('EventImporterGPX', () => {


  beforeEach(() => {
  });

  // it('should import from movescount GPX correctly', async () => {
  //   const event = await EventImporterGPX.getFromString(movescountGPX.gpx);
  //   expect(event instanceof Event).toBe(true);
  // });
  //
  // it('should import from amazfit GPX correctly',async () => {
  //   const event = await EventImporterGPX.getFromString(amazfitGPX.gpx);
  //   expect(event instanceof Event).toBe(true);
  // });
  //
  // it('should import from garmin GPX correctly', async () => {
  //   const event = await EventImporterGPX.getFromString(garminGPX.gpx);
  //   expect(event instanceof Event).toBe(true);
  // });
  //
  // it('should import from strava  GPX correctly', async () => {
  //   const event = await EventImporterGPX.getFromString(stravaGPX.gpx) ;
  //   expect(event instanceof Event).toBe(true);
  // });
  //
  // it('should import from sports tracker  GPX correctly', async () => {
  //   const event = await EventImporterGPX.getFromString(sportsTrackerGPX.gpx);
  //   expect(event instanceof Event).toBe(true);
  // });
});
