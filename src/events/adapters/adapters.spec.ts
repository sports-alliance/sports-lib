import {EventImporterSuuntoJSON} from './importers/suunto/importer.suunto.json';
import {EventImporterJSON} from './importers/json/importer.json';
import {EventExporterTCX} from "./exporters/exporter.tcx";
import {EventImporterTCX} from "./importers/tcx/importer.tcx";
import {Event} from "../event.ts";

const suuntoJSON = require('../../../samples/suunto/suunto.json');
const garminTCX = require('../../../samples/tcx/garmin.tcx.json');

describe('EventAdapters', () => {

  beforeEach(() => {

  });

  it('should import and export correctly from Suunto adapter', () => {
    // First get it from adapter 1
    const event1 = EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(suuntoJSON));
    const event2 = EventImporterJSON.getFromJSONString(JSON.stringify(event1));

    event1.name = event2.name;
    expect(event1).toEqual(event2);
  });

  it('should import and export correctly some tcx', () => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(garminTCX.tcx,"text/xml");
    // const event = EventImporterTCX.getFromXML(xmlDoc).then((result) => {
    //   debugger;
    // });
    expect.assertions(1);
    return expect(EventImporterTCX.getFromXML(xmlDoc)).resolves.toBeInstanceOf(Event);
    // console.log(event)
  });
});
