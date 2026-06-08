import * as fs from 'fs';
import * as path from 'path';
import { DOMParser } from '@xmldom/xmldom';
import { ActivityTypes } from '../../../../activities/activity.types';
import { DataAltitude } from '../../../../data/data.altitude';
import { DataAscent } from '../../../../data/data.ascent';
import { DataDescent } from '../../../../data/data.descent';
import { DataDistance } from '../../../../data/data.distance';
import { DataGNSSDistanceMiles } from '../../../../data/data.gnss-distance-miles';
import { DataGrade } from '../../../../data/data.grade';
import { DataGradeAvg } from '../../../../data/data.grade-avg';
import { DataGradeMax } from '../../../../data/data.grade-max';
import { DataGradeMin } from '../../../../data/data.grade-min';
import { DataLatitudeDegrees } from '../../../../data/data.latitude-degrees';
import { DataPace } from '../../../../data/data.pace';
import { DataSpeed } from '../../../../data/data.speed';
import { SportsLib } from '../../../../index';
import { RouteParsingOptions } from '../../../route-parsing-options';
import { RouteExporterGPX } from '../../exporters/exporter.route.gpx';
import { RouteExporterJSON } from '../../exporters/exporter.route.json';
import { RouteImporterJSON } from '../json/importer.route.json';
import { RouteImporterGPX } from './importer.route.gpx';

describe('RouteImporterGPX', () => {
  const samplesDir = path.resolve(__dirname, '../../../../../samples/gpx');
  const routeSamplePath = path.join(samplesDir, 'route.gpx');

  function readRouteSample(): string {
    return fs.readFileSync(routeSamplePath, 'utf-8');
  }

  it('parses route.gpx as a first-class route file', async () => {
    const result = await RouteImporterGPX.getFromString(readRouteSample(), DOMParser);

    expect(result.name).toEqual('TEST');
    expect(result.getRoutes()).toHaveLength(1);
    expect(result.getWaypoints()).toHaveLength(8);

    const route = result.getFirstRoute();
    expect(route.activityType).toBeNull();
    expect(route.getPointCount()).toBe(2987);
    expect(route.hasStreamData(DataLatitudeDegrees.type)).toBe(true);
    expect(route.hasStreamData(DataAltitude.type)).toBe(true);
    expect(route.hasStreamData(DataGrade.type)).toBe(true);
    expect(route.hasStreamData(DataSpeed.type)).toBe(false);
    expect(route.hasStreamData(DataPace.type)).toBe(false);

    expect(route.getStat(DataDistance.type)!.getValue()).toBeGreaterThan(0);
    expect(route.getStat(DataAscent.type)!.getValue()).toBeGreaterThan(0);
    expect(route.getStat(DataGradeAvg.type)).toBeDefined();

    expect(result.getStat(DataDistance.type)!.getValue()).toEqual(route.getStat(DataDistance.type)!.getValue());
    expect(result.getStat(DataAscent.type)!.getValue()).toEqual(route.getStat(DataAscent.type)!.getValue());
    expect(result.getStat(DataDescent.type)!.getValue()).toEqual(route.getStat(DataDescent.type)!.getValue());
    expect(result.getStat(DataGradeMin.type)!.getValue()).toEqual(route.getStat(DataGradeMin.type)!.getValue());
    expect(result.getStat(DataGradeMax.type)!.getValue()).toEqual(route.getStat(DataGradeMax.type)!.getValue());
    expect(result.getStat(DataGradeAvg.type)!.getValue()).toEqual(route.getStat(DataGradeAvg.type)!.getValue());
  });

  it('keeps metadata time on the route file rather than fabricating activity dates', async () => {
    const gpxString = `<?xml version="1.0" encoding="UTF-8"?>
      <gpx creator="Garmin Connect" version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
        <metadata>
          <name>Route Collection</name>
          <time>2019-09-29T13:58:25.000Z</time>
        </metadata>
        <rte>
          <name>Route A</name>
          <type>Hiking</type>
          <rtept lat="1" lon="2"><ele>10</ele></rtept>
          <rtept lat="1.1" lon="2.1"><ele>20</ele></rtept>
        </rte>
      </gpx>`;

    const result = await RouteImporterGPX.getFromString(gpxString, DOMParser);

    expect(result.createdAt!.toISOString()).toEqual('2019-09-29T13:58:25.000Z');
    expect(result.getFirstRoute().name).toEqual('Route A');
    expect(result.getFirstRoute().activityType).toEqual(ActivityTypes.Hiking);
  });

  it('parses untimed GPX tracks as first-class routes', async () => {
    const gpxString = `<?xml version="1.0" encoding="UTF-8"?>
      <gpx creator="Garmin Connect" version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
        <trk>
          <name>Untimed Track Route</name>
          <type>Running</type>
          <trkseg>
            <trkpt lat="1" lon="2"><ele>10</ele></trkpt>
            <trkpt lat="1.1" lon="2.1"><ele>20</ele></trkpt>
          </trkseg>
        </trk>
      </gpx>`;

    const result = await RouteImporterGPX.getFromString(gpxString, DOMParser);

    expect(result.getRoutes()).toHaveLength(1);
    expect(result.getFirstRoute().name).toEqual('Untimed Track Route');
    expect(result.getFirstRoute().activityType).toEqual(ActivityTypes.Running);
    expect(result.getFirstRoute().getPointCount()).toEqual(2);
  });

  it('dedupes compatibility GPX files that encode the same route as rte and untimed trk', async () => {
    const gpxString = `<?xml version="1.0" encoding="UTF-8"?>
      <gpx creator="Garmin Connect" version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
        <rte>
          <name>Compatibility Route</name>
          <rtept lat="1" lon="2"><ele>10</ele></rtept>
          <rtept lat="1.1" lon="2.1"><ele>20</ele></rtept>
        </rte>
        <trk>
          <name>Compatibility Track</name>
          <trkseg>
            <trkpt lat="1" lon="2"><ele>10</ele></trkpt>
            <trkpt lat="1.1" lon="2.1"><ele>20</ele></trkpt>
          </trkseg>
        </trk>
      </gpx>`;

    const result = await RouteImporterGPX.getFromString(gpxString, DOMParser);

    expect(result.getRoutes()).toHaveLength(1);
    expect(result.getFirstRoute().name).toEqual('Compatibility Route');
  });

  it('round-trips GPX route and point metadata that the route model supports', async () => {
    const gpxString = `<?xml version="1.0" encoding="UTF-8"?>
      <gpx creator="Garmin Connect" version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
        <rte>
          <name>Metadata Route</name>
          <cmt>route comment</cmt>
          <desc>route description</desc>
          <number>7</number>
          <link href="https://example.test/route"><text>Route link</text><type>text/html</type></link>
          <type>Hiking</type>
          <extensions><cue><value>left</value></cue></extensions>
          <rtept lat="1" lon="2">
            <ele>10</ele>
            <name>Point 1</name>
            <cmt>point comment</cmt>
            <desc>point description</desc>
            <sym>Flag</sym>
            <type>Waypoint</type>
            <link href="https://example.test/point"><text>Point link</text></link>
          </rtept>
          <rtept lat="1.1" lon="2.1"><ele>20</ele></rtept>
        </rte>
      </gpx>`;

    const routeFile = await RouteImporterGPX.getFromString(gpxString, DOMParser);
    const route = routeFile.getFirstRoute();
    const firstPoint = route.getPointData()[0];

    expect(route.comment).toEqual('route comment');
    expect(route.description).toEqual('route description');
    expect(route.number).toEqual(7);
    expect(route.links).toEqual([{ href: 'https://example.test/route', text: 'Route link', type: 'text/html' }]);
    expect(firstPoint.comment).toEqual('point comment');
    expect(firstPoint.symbol).toEqual('Flag');
    expect(firstPoint.links).toEqual([{ href: 'https://example.test/point', text: 'Point link', type: null }]);

    const exportedGPX = await RouteExporterGPX.getAsString(routeFile);
    expect(exportedGPX).toContain('<cmt>route comment</cmt>');
    expect(exportedGPX).toContain('<number>7</number>');
    expect(exportedGPX).toContain('<sym>Flag</sym>');
    expect(exportedGPX).toContain('<extensions><cue><value>left</value></cue></extensions>');

    const reparsed = await RouteImporterGPX.getFromString(exportedGPX, DOMParser);
    expect(reparsed.getFirstRoute().comment).toEqual('route comment');
    expect(reparsed.getFirstRoute().getPointData()[0].symbol).toEqual('Flag');
  });

  it('supports route stream includeTypes for route-safe derived streams', async () => {
    const result = await RouteImporterGPX.getFromString(
      readRouteSample(),
      DOMParser,
      new RouteParsingOptions({
        streams: { includeTypes: [DataDistance.type, DataGNSSDistanceMiles.type] }
      })
    );

    const streamTypes = result
      .getFirstRoute()
      .getAllStreams()
      .map(stream => stream.type);
    expect(new Set(streamTypes)).toEqual(new Set([DataDistance.type, DataGNSSDistanceMiles.type]));
  });

  it('rejects unsupported activity-only includeTypes for routes', async () => {
    await expect(
      RouteImporterGPX.getFromString(
        readRouteSample(),
        DOMParser,
        new RouteParsingOptions({ streams: { includeTypes: [DataSpeed.type] } })
      )
    ).rejects.toThrow('Unsupported route stream includeTypes');
  });

  it('rejects unknown includeTypes for routes', async () => {
    await expect(
      RouteImporterGPX.getFromString(
        readRouteSample(),
        DOMParser,
        new RouteParsingOptions({ streams: { includeTypes: ['Not A Stream Type'] } })
      )
    ).rejects.toThrow('Unknown route stream includeTypes');
  });

  it('round-trips route files through native JSON', async () => {
    const routeFile = await SportsLib.importRoutesFromGPX(readRouteSample(), DOMParser);
    routeFile.setID('route-file-id');
    routeFile.getFirstRoute().setID('route-id');
    const json = RouteExporterJSON.export(routeFile);
    const importedRouteFile = RouteImporterJSON.getRouteFileFromJSON(json);

    expect(json.id).toEqual('route-file-id');
    expect(json.routes[0].id).toEqual('route-id');
    expect(json.stats![DataDistance.type]).toEqual(routeFile.getStat(DataDistance.type)!.getValue());
    expect(importedRouteFile.toJSON()).toEqual(json);
  });

  it('preserves route file stats from native JSON when present', async () => {
    const routeFile = await SportsLib.importRoutesFromGPX(readRouteSample(), DOMParser);
    const json = RouteExporterJSON.export(routeFile);
    json.stats![DataDistance.type] = 12345;

    const importedRouteFile = RouteImporterJSON.getRouteFileFromJSON(json);

    expect(importedRouteFile.getStat(DataDistance.type)!.getValue()).toBe(12345);
    expect(importedRouteFile.toJSON().stats![DataDistance.type]).toBe(12345);
  });

  it('regenerates route file stats from routes when native JSON has an empty stats object', async () => {
    const routeFile = await SportsLib.importRoutesFromGPX(readRouteSample(), DOMParser);
    const json = RouteExporterJSON.export(routeFile);
    json.stats = {};

    const importedRouteFile = RouteImporterJSON.getRouteFileFromJSON(json);

    expect(importedRouteFile.getStat(DataDistance.type)!.getValue()).toEqual(
      importedRouteFile.getFirstRoute().getStat(DataDistance.type)!.getValue()
    );
    expect(importedRouteFile.toJSON().stats![DataDistance.type]).toBeDefined();
  });

  it('regenerates route file stats from routes for older native JSON payloads', async () => {
    const routeFile = await SportsLib.importRoutesFromGPX(readRouteSample(), DOMParser);
    const json = RouteExporterJSON.export(routeFile);
    delete (json as Partial<typeof json>).stats;

    const importedRouteFile = RouteImporterJSON.getRouteFileFromJSON(json);

    expect(importedRouteFile.getStat(DataDistance.type)!.getValue()).toEqual(
      importedRouteFile.getFirstRoute().getStat(DataDistance.type)!.getValue()
    );
    expect(importedRouteFile.toJSON().stats![DataDistance.type]).toBeDefined();
  });

  it('rejects route JSON when point geometry conflicts with geometry streams', async () => {
    const routeFile = await SportsLib.importRoutesFromGPX(readRouteSample(), DOMParser);
    const json = RouteExporterJSON.export(routeFile);
    const latitudeStream = Array.isArray(json.routes[0].streams)
      ? json.routes[0].streams.find(stream => stream.type === DataLatitudeDegrees.type)
      : null;

    latitudeStream!.data[0] = (latitudeStream!.data[0] as number) + 1;

    expect(() => RouteImporterJSON.getRouteFileFromJSON(json)).toThrow('Route JSON geometry conflict');
  });

  it('exports routes to GPX rte/rtept elements without activity tracks', async () => {
    const routeFile = await RouteImporterGPX.getFromString(readRouteSample(), DOMParser);
    const gpxString = await RouteExporterGPX.getAsString(routeFile);

    expect(gpxString).toContain('<rte>');
    expect(gpxString).toContain('<rtept');
    expect(gpxString).not.toContain('<trk>');

    const parsedExport = await RouteImporterGPX.getFromString(gpxString, DOMParser);
    expect(parsedExport.getFirstRoute().getPointCount()).toEqual(routeFile.getFirstRoute().getPointCount());
  });
});
