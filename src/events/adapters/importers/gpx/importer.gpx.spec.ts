import {EventImporterGPX} from './importer.gpx';

const movescountGPX = require('../../../../../samples/gpx/movescount.gpx.json');
const amazfitGPX = require('../../../../../samples/gpx/amazfit.gpx.json');
const garminGPX = require('../../../../../samples/gpx/garmin.gpx.json');
const stravaGPX = require('../../../../../samples/gpx/strava.gpx.json');
const sportsTrackerGPX = require('../../../../../samples/gpx/sports-tracker.gpx.json');

describe('EventImporterGPX', () => {


  beforeEach(() => {
  });

  it('should import from GPX correctly', () => {
    EventImporterGPX.getFromString(sportsTrackerGPX.gpx);
  });
});
