import { DOMParser } from '@xmldom/xmldom';
import { Creator } from '../../../creators/creator';
import { DataDistance } from '../../../data/data.distance';
import { ParsingEventLibError } from '../../../errors/parsing-event-lib.error';
import { SportsLib } from '../../../index';
import { Route } from '../../route';
import { RouteFile } from '../../route-file';
import { FITRouteSportMapper } from '../fit-route-sport.mapper';
import { RouteExporterFIT } from './exporter.route.fit';

const GPX_ROUTE = `<?xml version="1.0" encoding="UTF-8"?>
  <gpx creator="Route Builder" version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
    <metadata><name>Route File Name</name><time>2020-01-01T00:00:00.000Z</time></metadata>
    <wpt lat="1.1" lon="2.1"><name>Water stop</name><type>rest_area</type></wpt>
    <rte>
      <name>Morning Ride</name><type>Cycling</type>
      <rtept lat="1" lon="2"><ele>10</ele></rtept>
      <rtept lat="1.1" lon="2.1"><ele>20</ele></rtept>
    </rte>
  </gpx>`;

describe('RouteExporterFIT', () => {
  it('exports a valid FIT Course which the route importer can read back', async () => {
    const source = await SportsLib.importRoutesFromGPX(GPX_ROUTE, DOMParser);

    const fit = RouteExporterFIT.export(source);
    const header = new Uint8Array(fit.slice(8, 12));
    expect(Array.from(header)).toEqual([0x2e, 0x46, 0x49, 0x54]);

    const roundTripped = await SportsLib.importRoutesFromFit(fit);
    const route = roundTripped.getFirstRoute();

    expect(roundTripped.name).toBe('Morning Ride');
    expect(roundTripped.createdAt?.toISOString()).toBe('2020-01-01T00:00:00.000Z');
    expect(route.getPointCount()).toBe(2);
    expect(route.activityType).toBe('Cycling');
    expect(route.getPointData()).toMatchObject([
      { latitudeDegrees: expect.closeTo(1, 6), longitudeDegrees: expect.closeTo(2, 6), altitude: 10 },
      { latitudeDegrees: expect.closeTo(1.1, 6), longitudeDegrees: expect.closeTo(2.1, 6), altitude: 20 }
    ]);
    expect(route.getStreamData(DataDistance.type)[0]).toBe(0);
    expect(route.getStreamData(DataDistance.type)[1]).toBeGreaterThan(0);
    expect(roundTripped.getWaypoints()).toMatchObject([
      { name: 'Water stop', type: 'rest_area', routeIndex: 0, routePointIndex: 1 }
    ]);
  });

  it('is exposed through the core and direct GPX/FIT conversion APIs', async () => {
    const source = await SportsLib.importRoutesFromGPX(GPX_ROUTE, DOMParser);

    await expect(SportsLib.exportRoutesToFit(source)).resolves.toEqual(RouteExporterFIT.export(source));

    const fit = await SportsLib.convertRoutesFromGPXToFit(GPX_ROUTE, DOMParser);
    const gpx = await SportsLib.convertRoutesFromFitToGPX(fit);
    const roundTripped = await SportsLib.importRoutesFromGPX(gpx, DOMParser);

    expect(gpx).toContain('<rte>');
    expect(roundTripped.getFirstRoute().getPointCount()).toBe(2);
  });

  it('uses a generic FIT course-point type when a GPX waypoint type is not mapped', async () => {
    const source = await SportsLib.importRoutesFromGPX(GPX_ROUTE.replace('rest_area', 'custom_gpx_marker'), DOMParser);

    const roundTripped = await SportsLib.importRoutesFromFit(RouteExporterFIT.export(source));

    expect(roundTripped.getWaypoints()[0].type).toBe('generic');
  });

  it.each([
    ['Generic', { sport: 0 }, 'generic', undefined],
    ['Treadmill', { sport: 1, subSport: 1 }, 'running', 'treadmill'],
    ['Open Water Swimming', { sport: 5, subSport: 18 }, 'swimming', 'open_water'],
    ['Indoor Cycling', { sport: 2, subSport: 6 }, 'cycling', 'indoor_cycling'],
    ['Virtual Running', { sport: 1, subSport: 58 }, 'running', 'virtual_activity']
  ])('maps FIT sport variants for %s', (activityType, expectedFitSport, sport, subSport) => {
    expect(FITRouteSportMapper.toFIT(activityType)).toEqual(expectedFitSport);
    expect(FITRouteSportMapper.fromFIT(sport, subSport)).toBe(activityType);
  });

  it('uses canonical FIT sport defaults when variants are not available', () => {
    expect(FITRouteSportMapper.toFIT('Cricket')).toEqual({ sport: 71 });
    expect(FITRouteSportMapper.fromFIT(73)).toBe('Ice Hockey');
  });

  it('rejects coordinates outside FIT geographic bounds', () => {
    const creator = new Creator('Test');
    const route = new Route(creator, undefined, 'Invalid coordinates', null, [
      { latitudeDegrees: 91, longitudeDegrees: 2 }
    ]);
    const source = new RouteFile('Invalid coordinates', undefined, creator, [route]);

    expect(() => RouteExporterFIT.export(source)).toThrow(
      'FIT route export requires at least one route point with valid coordinates'
    );
  });

  it('calculates distance when route points and distance streams do not align', async () => {
    const creator = new Creator('Test');
    const route = new Route(creator, undefined, 'Malformed route', null, [
      { latitudeDegrees: 1, longitudeDegrees: 2 },
      { latitudeDegrees: Number.NaN, longitudeDegrees: Number.NaN },
      { latitudeDegrees: 1.1, longitudeDegrees: 2.1 }
    ]);
    route.addStream(route.createStream(DataDistance.type, 3).setData([0, 10, 20]));
    const source = new RouteFile('Malformed route', undefined, creator, [route]);

    const roundTripped = await SportsLib.importRoutesFromFit(RouteExporterFIT.export(source));

    expect(roundTripped.getFirstRoute().getStreamData(DataDistance.type)[1]).toBeGreaterThan(10_000);
  });

  it('rejects route files which cannot be represented by one FIT Course', () => {
    const creator = new Creator('Test');
    const firstRoute = new Route(creator);
    const secondRoute = new Route(creator);
    const multipleRoutes = new RouteFile('Multiple', undefined, creator, [firstRoute, secondRoute]);
    const emptyRoute = new RouteFile('Empty', undefined, creator, [firstRoute]);

    expect(() => RouteExporterFIT.export(multipleRoutes)).toThrow(ParsingEventLibError);
    expect(() => RouteExporterFIT.export(emptyRoute)).toThrow(
      'FIT route export requires at least one route point with valid coordinates'
    );
  });
});
