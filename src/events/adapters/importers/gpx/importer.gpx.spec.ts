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

  it('should import from movescount GPX correctly', () => {
    expect(EventImporterGPX.getFromString(movescountGPX.gpx) instanceof Event).toBe(true);
  });

  it('should import from amazfit GPX correctly', () => {
    expect(EventImporterGPX.getFromString(amazfitGPX.gpx) instanceof Event).toBe(true);
  });

  it('should import from garmin GPX correctly', () => {
    expect(EventImporterGPX.getFromString(garminGPX.gpx) instanceof Event).toBe(true);
  });

  it('should import from strava  GPX correctly', () => {
    expect(EventImporterGPX.getFromString(stravaGPX.gpx) instanceof Event).toBe(true);
  });

  it('should import from sports tracker  GPX correctly', () => {
    expect(EventImporterGPX.getFromString(sportsTrackerGPX.gpx) instanceof Event).toBe(true);
  });
});
