import { EventImporterGPX } from './events/adapters/importers/gpx/importer.gpx';
import { EventInterface } from './events/event.interface';
import { EventImporterTCX } from './events/adapters/importers/tcx/importer.tcx';
import { EventImporterFIT } from './events/adapters/importers/fit/importer.fit';
import { EventImporterSuuntoJSON } from './events/adapters/importers/suunto/importer.suunto.json';
import { EventImporterJSON } from './events/adapters/importers/json/importer.json';
import { EventJSONInterface } from './events/event.json.interface';
import { ActivityParsingOptions } from './activities/activity-parsing-options';
import { RouteImporterGPX } from './routes/adapters/importers/gpx/importer.route.gpx';
import { RouteImporterJSON } from './routes/adapters/importers/json/importer.route.json';
import { RouteImporterFIT } from './routes/adapters/importers/fit/importer.route.fit';
import { RouteExporterGPX } from './routes/adapters/exporters/exporter.route.gpx';
import { RouteExporterFIT } from './routes/adapters/exporters/exporter.route.fit';
import { RouteParsingOptions } from './routes/route-parsing-options';
import { RouteFileInterface } from './routes/route-file.interface';
import { RouteFileJSONInterface } from './routes/route-file.json.interface';

export { readFITWorkoutReferences } from './fit/fit-workout-references';
export { parseFITWahooWorkoutReferences } from './fit/wahoo-workout-references';
export type { FITWahooWorkoutReference } from './fit/wahoo-workout-references';
export type {
  FITWorkoutReferenceDiagnostic,
  FITWorkoutReferenceSession,
  FITWorkoutReferencesResult
} from './fit/fit-workout-references';

/**
 * Primary facade for importing activities and routes, exporting route files, and restoring
 * Sports Lib's native JSON representation.
 */
export class SportsLib {
  /**
   * Parses and returns an event using GPX format, including namespace-qualified ClueTrust GPXDATA heart rate.
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
   * Parses and returns an event using FIT format.
   * Credible session timestamps remain authoritative without duration summaries. Record-based date recovery
   * is scoped to the session; whole-file record bounds are used only when there is a sole session.
   * Pool length endpoints and generated samples respect the resolved lap/session bounds and active timer limits.
   * Explicit non-activity file types are rejected; missing file types retain legacy activity recovery.
   * Completed activity_summary files require recorded sessions and do not use sessionless recovery.
   * Use importRoutesFromFit for FIT courses.
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
   * Parses and returns an event using Suunto format. Mixed-sport pace calibration must belong to the individual leg;
   * unscoped header speed-zone boundaries are retained only for files with one resolved sport type.
   * Retains source endurance summaries and supports selective streams.
   * EnduranceDistance source values are in metres and are retained without scaling.
   * @param jsonString
   * @param options
   */
  public static importFromSuunto(jsonString: string, options?: ActivityParsingOptions): Promise<EventInterface> {
    return EventImporterSuuntoJSON.getFromJSONString(jsonString, options);
  }

  /**
   * Restores an event from Sports Lib's native JSON format.
   *
   * Finite explicit stats are preserved except terrain summaries excluded for Diving activities. Legacy null or
   * non-finite scalar summaries are skipped without changing null stream gaps. Missing pace, swim-pace,
   * and grade-adjusted-pace summaries are hydrated from compatible speed summaries on the event, its activities,
   * and their laps.
   *
   * @param json Sports Lib's native event representation.
   * @returns The restored event with canonical stat keys and additive speed-derived summaries.
   */
  public static importFromJSON(json: EventJSONInterface): EventInterface {
    return EventImporterJSON.getEventFromJSON(json);
  }

  /**
   * Parses and returns first-class routes using GPX format.
   * @param gpxString
   * @param domParser custom DOMParser (case of NodeJs usage)
   * @param options
   */
  public static importRoutesFromGPX(
    gpxString: string,
    domParser?: any,
    options?: RouteParsingOptions
  ): Promise<RouteFileInterface> {
    return RouteImporterGPX.getFromString(gpxString, domParser, options);
  }

  /**
   * Parses and returns first-class routes using FIT course format.
   * @param arrayBuffer
   * @param options
   */
  public static importRoutesFromFit(
    arrayBuffer: ArrayBuffer | Buffer<ArrayBuffer>,
    options?: RouteParsingOptions
  ): Promise<RouteFileInterface> {
    return RouteImporterFIT.getFromArrayBuffer(arrayBuffer, options);
  }

  /**
   * Parses and returns first-class routes using native format (SportsLib exported format).
   * Skips legacy null/non-finite scalar summaries. When no valid file summary remains,
   * restores it using the existing child-route aggregation; geometry validation is unchanged.
   * @param json RouteFileJSONInterface
   */
  public static importRoutesFromJSON(json: RouteFileJSONInterface): RouteFileInterface {
    return RouteImporterJSON.getRouteFileFromJSON(json);
  }

  /**
   * Exports first-class routes using GPX 1.1 route format, with metadata in schema order.
   * @param routeFile
   */
  public static exportRoutesToGPX(routeFile: RouteFileInterface): Promise<string> {
    return RouteExporterGPX.getAsString(routeFile);
  }

  /**
   * Exports a single first-class route as a FIT course file.
   * @param routeFile
   */
  public static exportRoutesToFit(routeFile: RouteFileInterface): Promise<ArrayBuffer> {
    return RouteExporterFIT.getAsArrayBuffer(routeFile);
  }

  /**
   * Converts a GPX route file to a FIT course file.
   * @param gpxString
   * @param domParser custom DOMParser (case of NodeJs usage)
   * @param options
   */
  public static async convertRoutesFromGPXToFit(
    gpxString: string,
    domParser?: any,
    options?: RouteParsingOptions
  ): Promise<ArrayBuffer> {
    return this.exportRoutesToFit(await this.importRoutesFromGPX(gpxString, domParser, options));
  }

  /**
   * Converts a FIT course file to a GPX route file.
   * @param arrayBuffer
   * @param options
   */
  public static async convertRoutesFromFitToGPX(
    arrayBuffer: ArrayBuffer | Buffer<ArrayBuffer>,
    options?: RouteParsingOptions
  ): Promise<string> {
    return this.exportRoutesToGPX(await this.importRoutesFromFit(arrayBuffer, options));
  }
}

export * from './activities/activity.interface';
export { normalizeActivityMetricSemanticsForStats } from './activities/activity.metric-semantics';
export * from './activities/activity-parsing-options';
export * from './activities/activity.json.interface';
export * from './activities/activity.types';
export type {
  DiveGasMode,
  DiveGasJSONInterface,
  DiveGasRecord,
  DiveGasStatus,
  DiveMessageIndex,
  DiveSourceRecordsJSONInterface,
  DiveSourceRecords,
  DiveSourceRecordsInput,
  DiveTankSummaryJSONInterface,
  DiveTankSummaryRecord,
  DiveTankUpdateJSONInterface,
  DiveTankUpdateRecord
} from './activities/dive-source-records';
export * from './activities/devices/device.interface';
export * from './activities/devices/device.json.interface';
export * from './constants/constants';
export * from './creators/creator.interface';
export * from './creators/creator.json.interface';
export * from './data';
export * from './duration/duration.class.interface';
export * from './events/adapters/exporters/exporter.gpx';
export * from './events/adapters/exporters/exporter.interface';
export * from './events/adapters/exporters/exporter.json';
export * from './events/adapters/file-type.enum';
export * from './events/adapters/importers/fit/importer.fit';
export * from './events/adapters/importers/gpx/importer.gpx';
export * from './events/adapters/importers/json/importer.json';
export * from './events/adapters/importers/suunto/importer.suunto.json';
export * from './events/adapters/importers/suunto/importer.suunto.sml';
export * from './events/adapters/importers/tcx/importer.tcx';
export * from './events/event.interface';
export * from './events/event.json.interface';
export * from './events/utilities/activity.utilities';
export * from './events/utilities/activity-durability';
export * from './events/utilities/event.utilities';
export * from './events/utilities/power-curve-sampling';
export * from './events/utilities/three-dimensional-capacity';
export * from './events/utilities/three-dimensional-impulse-response';
export * from './events/utilities/three-dimensional-impulse-response-calibration';
export * from './events/utilities/helpers';
export * from './geodesy/adapters/geolib.adapter';
export * from './id/id.class.interface';
export * from './intensity-zones/intensity-zones.interface';
export * from './intensity-zones/intensity-zones.json.interface';
export * from './laps/lap.interface';
export * from './laps/lap.json.interface';
export * from './laps/lap.types';
export * from './meta-data/event-meta-data.interface';
export * from './meta-data/meta-data';
export * from './privacy/privacy.class.interface';
export * from './routes';
export * from './serializable/serializable.class.interface';
export * from './service-tokens/oauth1-service-token.interface';
export * from './service-tokens/oauth2-service-token.interface';
export * from './stats/stats.class.interface';
export * from './stats/stats.utilities';
export * from './streams/compressed.stream.interface';
export * from './streams/stream.filter.interface';
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

export type { TrainingStressScorePreference, TrainingStressScoreReason, TrainingStressScoreEvaluation, TrainingStressScoreEvaluations } from './events/utilities/tss/tss-evaluation';

export * from './duration/timing-validity';
