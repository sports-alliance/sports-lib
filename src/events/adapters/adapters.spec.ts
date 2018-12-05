import {EventImporterSuuntoJSON} from './importers/suunto/importer.suunto.json';
import {EventImporterJSON} from './importers/json/importer.json';

const suuntoJSON = require('../../../samples/suunto/suunto.json');

describe('EventAdapters', () => {

  beforeEach(() => {

  });

  it('should import and export correctly from Suunto adapter', () => {
    // First get it from adapter 1
    const event1 = EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(suuntoJSON));
    const event2 = EventImporterJSON.getFromJSONString(event1);

    event1.name = event2.name;
    expect(event1).toEqual(event2);
  });
});
