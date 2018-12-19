import {EventImporterGPX} from './events/adapters/importers/gpx/importer.gpx';
import {EventInterface} from './events/event.interface';
import {EventImporterTCX} from './events/adapters/importers/tcx/importer.tcx';
import {EventImporterFIT} from './events/adapters/importers/fit/importer.fit';
import {EventImporterSuuntoJSON} from './events/adapters/importers/suunto/importer.suunto.json';
import {EventImporterJSON} from './events/adapters/importers/json/importer.json';
import {EventExporterTCX} from './events/adapters/exporters/exporter.tcx';
import {EventJSONInterface} from './events/event.json.interface';

export class QuantifiedSelfLib {

  /**
   * Parses and returns an event using GPX format
   * @param gpxString
   */
  public static importFromGPX(gpxString: string): Promise<EventInterface> {
    return EventImporterGPX.getFromString(gpxString);
  };

  /**
   * Parses and returns an event using TCX format
   * @param xmlDocument
   */
  public static importFromTCX(xmlDocument: XMLDocument): Promise<EventInterface> {
    return EventImporterTCX.getFromXML(xmlDocument);
  };

  /**
   * Parses and returns an event using FIT format
   * @param arrayBuffer
   */
  public static importFromFit(arrayBuffer: ArrayBuffer): Promise<EventInterface> {
    return EventImporterFIT.getFromArrayBuffer(arrayBuffer);
  };

  /**
   * Parses and returns an event using Suunto format
   * @param jsonString
   */
  public static importFromSuunto(jsonString: string): Promise<EventInterface> {
    return EventImporterSuuntoJSON.getFromJSONString(jsonString);
  }

  /**
   * Parses and returns an event using native format (QuantifiedSelfLib exported format)
   * @param json EventJSONInterface
   */
  public static importFromJSON(json: EventJSONInterface): EventInterface {
    return EventImporterJSON.getEventFromJSON(json);
  }

  /**
   * Exports an event as a TCX string
   * @param event
   */
  public static exportToTCX(event: EventInterface): Promise<string> {
    return EventExporterTCX.getAsString(event);
  }
}
