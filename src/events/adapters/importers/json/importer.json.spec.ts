import {EventImporterJSON} from './importer.json';
import {Event} from '../../../event';

const json = require('../../../../../samples/json/app.json');

describe('EventImporterJson', () => {

  beforeEach(() => {

  });

  it('should be able to decode json', () => {
    expect(EventImporterJSON.getFromJSONString(JSON.stringify(json)) instanceof Event).toBe(true);
  });
});
