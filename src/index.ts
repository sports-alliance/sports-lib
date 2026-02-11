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
export * from './data/data-aerobic-training-effect';
export * from './data/data.absolute-pressure';
export * from './data/data.absolute-pressure-avg';
export * from './data/data.absolute-pressure-max';
export * from './data/data.absolute-pressure-min';
export * from './data/data.accumulated-power';
export * from './data/data.activity-types';
export * from './data/data.air-power';
export * from './data/data.altitude';
export * from './data/data.altitude-avg';
export * from './data/data.altitude-gps';
export * from './data/data.altitude-max';
export * from './data/data.altitude-min';
export * from './data/data.ascent';
export * from './data/data.cadence-avg';
export * from './data/data.cadence-max';
export * from './data/data.cadence-min';
export * from './data/data.descent';
export * from './data/data.description';
export * from './data/data.device-names';
export * from './data/data.distance';
export * from './data/data.duration';
export * from './data/data.ehpe';
export * from './data/data.energy';
export * from './data/data.epoc';
export * from './data/data.evpe';
export * from './data/data.avg-stroke-count';
export * from './data/data.avg-stroke-distance';
export * from './data/data.feeling';
export * from './data/data.ftp';
export * from './data/data.grade-adjusted-pace';
export * from './data/data.grade-adjusted-pace-avg';
export * from './data/data.grade-adjusted-speed';
export * from './data/data.grade-adjusted-speed-avg';
export * from './data/data.heart-rate';
export * from './data/data.heart-rate-avg';
export * from './data/data.heart-rate-max';
export * from './data/data.heart-rate-min';
export * from './data/data.ibi';
export * from './data/data.event';
export * from './data/data.jump-event';
export * from './data/data.interface';
export * from './data/data.latitude-degrees';
export * from './data/data.left-balance';
export * from './data/data.left-pedal-smoothness';
export * from './data/data.left-torque-effectiveness';
export * from './data/data.longitude-degrees';
export * from './data/data.moving-time';
export * from './data/data.pace';
export * from './data/data.pace-avg';
export * from './data/data.peak-epoc';
export * from './data/data.peak-training-effect';
export * from './data/data.position.interface';
export * from './data/data.power';
export * from './data/data.power-avg';
export * from './data/data.power-left';
export * from './data/data.power-max';
export * from './data/data.power-min';
export * from './data/data.power-right';
export * from './data/data.recovery-time';
export * from './data/data.right-balance';
export * from './data/data.right-pedal-smoothness';
export * from './data/data.right-torque-effectiveness';
export * from './data/data.rpe';
export * from './data/data.sea-level-pressure';
export * from './data/data.speed';
export * from './data/data.speed-avg';
export * from './data/data.speed-max';
export * from './data/data.speed-min';
export * from './data/data.start-position';
export * from './data/data.store';
export * from './data/data.stryd-altitude';
export * from './data/data.stryd-distance';
export * from './data/data.stryd-speed';
export * from './data/data.swim-pace';
export * from './data/data.swim-pace-avg';
export * from './data/data.swim-pace-max';
export * from './data/data.temperature';
export * from './data/data.temperature-avg';
export * from './data/data.temperature-max';
export * from './data/data.temperature-min';
export * from './data/data.vertical-speed';
export * from './data/data.vertical-speed-avg';
export * from './data/data.vo2-max';
export * from './data/ibi/data.ibi';
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
