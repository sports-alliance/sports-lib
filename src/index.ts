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
  public static importFromFit(
    arrayBuffer: ArrayBuffer | Buffer<ArrayBuffer>,
    options?: ActivityParsingOptions
  ): Promise<EventInterface> {
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

export * from './activities/activity.interface';
export * from './activities/activity-parsing-options';
export * from './activities/activity.json.interface';
export * from './activities/activity.types';
export * from './constants/constants';
export * from './data';
export * from './events/adapters/exporters/exporter.gpx';
export * from './events/adapters/exporters/exporter.json';
export * from './events/adapters/importers/fit/importer.fit';
export * from './events/adapters/importers/gpx/importer.gpx';
export * from './events/adapters/importers/json/importer.json';
export * from './events/adapters/importers/suunto/importer.suunto.json';
export * from './events/adapters/importers/suunto/importer.suunto.sml';
export * from './events/adapters/importers/tcx/importer.tcx';
export * from './events/event.interface';
export * from './events/event.json.interface';
export * from './events/utilities/activity.utilities';
export * from './events/utilities/event.utilities';
export * from './events/utilities/helpers';
export * from './geodesy/adapters/geolib.adapter';
export * from './laps/lap.interface';
export * from './laps/lap.types';
export * from './meta-data/event-meta-data.interface';
export * from './meta-data/meta-data';
export * from './privacy/privacy.class.interface';
export * from './service-tokens/oauth1-service-token.interface';
export * from './service-tokens/oauth2-service-token.interface';
export * from './stats/stats.class.interface';
export * from './streams/compressed.stream.interface';
export * from './streams/stream';
export * from './streams/stream.interface';
export * from './swim-lengths/swim-length';
export * from './swim-lengths/swim-length.interface';
export * from './swim-lengths/swim-length.json.interface';
export * from './tiles/tile.settings.interface';
export * from './users/settings/dashboard/user.dashboard.settings.interface';
export * from './users/settings/user.app.settings.interface';
export * from './users/settings/user.chart.settings.interface';
export * from './users/settings/user.map.settings.interface';
export * from './users/settings/user.my-tracks.settings.interface';
export * from './users/settings/user.settings.interface';
export * from './users/settings/user.summaries.settings.interface';
export * from './users/settings/user.unit.settings.interface';
export * from './users/user';
export * from './users/user.export-to-csv.settings.interface';
export * from './users/user.service.meta.interface';
