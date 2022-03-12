import { EventImporterGPX } from './events/adapters/importers/gpx/importer.gpx';
import { EventInterface } from './events/event.interface';
import { EventImporterTCX } from './events/adapters/importers/tcx/importer.tcx';
import { EventImporterFIT } from './events/adapters/importers/fit/importer.fit';
import { EventImporterSuuntoJSON } from './events/adapters/importers/suunto/importer.suunto.json';
import { EventImporterJSON } from './events/adapters/importers/json/importer.json';
import { EventJSONInterface } from './events/event.json.interface';
import { ActivityParsingOptions } from './activities/activity-parsing-options';

export class SportsLib {
  /**
   * Parses and returns an event using GPX format
   * @param gpxString
   * @param options
   * @param domParser custom DOMParser (case of NodeJs usage)
   */
  public static importFromGPX(
    gpxString: string,
    domParser?: any,
    options?: ActivityParsingOptions
  ): Promise<EventInterface> {
    return EventImporterGPX.getFromString(gpxString, domParser, options);
  }

  /**
   * Parses and returns an event using TCX format
   * @param xmlDocument
   * @param options
   */
  public static importFromTCX(xmlDocument: XMLDocument, options?: ActivityParsingOptions): Promise<EventInterface> {
    return EventImporterTCX.getFromXML(xmlDocument, options);
  }

  /**
   * Parses and returns an event using FIT format
   * @param arrayBuffer
   * @param options
   */
  public static importFromFit(arrayBuffer: ArrayBuffer, options?: ActivityParsingOptions): Promise<EventInterface> {
    return EventImporterFIT.getFromArrayBuffer(arrayBuffer, options);
  }

  /**
   * Parses and returns an event using Suunto format
   * @param jsonString
   * @param options
   */
  public static importFromSuunto(jsonString: string, options?: ActivityParsingOptions): Promise<EventInterface> {
    return EventImporterSuuntoJSON.getFromJSONString(jsonString, options);
  }

  /**
   * Parses and returns an event using native format (SportsLib exported format)
   * @param json EventJSONInterface
   */
  public static importFromJSON(json: EventJSONInterface): EventInterface {
    return EventImporterJSON.getEventFromJSON(json);
  }
}
