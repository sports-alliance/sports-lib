import { ActivityTypes, ActivityTypesHelper } from '../../../../activities/activity.types';
import { Creator } from '../../../../creators/creator';
import { DataAltitude } from '../../../../data/data.altitude';
import { DataLatitudeDegrees } from '../../../../data/data.latitude-degrees';
import { DataLongitudeDegrees } from '../../../../data/data.longitude-degrees';
import { FileType } from '../../../../events/adapters/file-type.enum';
import { GXParser } from '../../../../events/adapters/importers/gpx/gx-parser';
import { isNumber } from '../../../../events/utilities/helpers';
import { ParsingEventLibError } from '../../../../errors/parsing-event-lib.error';
import { Route } from '../../../route';
import { RouteFile } from '../../../route-file';
import { RouteFileInterface } from '../../../route-file.interface';
import { RouteFileUtilities } from '../../../route-file.utilities';
import { RouteParsingOptions } from '../../../route-parsing-options';
import { RouteLinkInterface, RouteWaypointInterface } from '../../../route-point.interface';
import { RouteStream } from '../../../route-stream';
import { RouteUtilities } from '../../../route.utilities';

interface GPXRouteCandidate {
  routeNode: any;
  pointNodes: any[];
}

export class RouteImporterGPX {
  static getFromString(
    gpx: string,
    domParser?: any,
    options: RouteParsingOptions = RouteParsingOptions.DEFAULT,
    name = 'New Route File'
  ): Promise<RouteFileInterface> {
    return new Promise((resolve, reject) => {
      const parsedGPX: any = new GXParser(gpx, domParser);
      const creator = new Creator(parsedGPX.creator || 'Unknown Device', undefined, parsedGPX.version);
      const metadata = RouteImporterGPX.toArray(parsedGPX.metadata)[0] || {};
      const routeFileName = RouteImporterGPX.getText(metadata.name) || name;
      const routeFile = new RouteFile(
        routeFileName,
        FileType.GPX,
        creator,
        [],
        RouteImporterGPX.toArray(parsedGPX.wpt).map(waypoint => RouteImporterGPX.getPointFromGPXNode(waypoint)),
        RouteImporterGPX.getDate(metadata.time)
      );

      const routes = RouteImporterGPX.getRouteCandidates(parsedGPX, options)
        .map(routeCandidate => {
          const points = routeCandidate.pointNodes
            .map(routePoint => RouteImporterGPX.getPointFromGPXNode(routePoint))
            .filter(point => isNumber(point.latitudeDegrees) && isNumber(point.longitudeDegrees));

          if (!points.length) {
            return null;
          }

          const route = new Route(
            creator,
            options,
            RouteImporterGPX.getText(routeCandidate.routeNode.name) || null,
            RouteImporterGPX.getActivityType(routeCandidate.routeNode),
            points,
            {
              comment: RouteImporterGPX.getText(routeCandidate.routeNode.cmt),
              description: RouteImporterGPX.getText(routeCandidate.routeNode.desc),
              number: RouteImporterGPX.getNumber(routeCandidate.routeNode.number),
              links: RouteImporterGPX.getLinks(routeCandidate.routeNode.link),
              extensions: routeCandidate.routeNode.extensions
            }
          );

          route.addStream(
            new RouteStream(
              DataLatitudeDegrees.type,
              points.map(point => point.latitudeDegrees)
            )
          );
          route.addStream(
            new RouteStream(
              DataLongitudeDegrees.type,
              points.map(point => point.longitudeDegrees)
            )
          );
          if (points.some(point => isNumber(point.altitude))) {
            route.addStream(
              new RouteStream(
                DataAltitude.type,
                points.map(point => (isNumber(point.altitude) ? <number>point.altitude : null))
              )
            );
          }

          RouteUtilities.generateMissingStreamsAndStatsForRoute(route);
          return route;
        })
        .filter((route): route is Route => route !== null);

      if (!routes.length) {
        reject(new ParsingEventLibError('No routes found in GPX'));
        return;
      }

      routeFile.addRoutes(routes);
      RouteFileUtilities.reGenerateStatsForRouteFile(routeFile);
      resolve(routeFile);
    });
  }

  private static getRouteCandidates(parsedGPX: any, options: RouteParsingOptions): GPXRouteCandidate[] {
    const explicitRoutes = RouteImporterGPX.toArray(parsedGPX.rte).map(routeNode => ({
      routeNode,
      pointNodes: RouteImporterGPX.toArray(routeNode.rtept)
    }));

    const importTimedTracksAsRoutes = options.gpx.importTimedTracksAsRoutes && explicitRoutes.length === 0;
    const trackRoutes = RouteImporterGPX.toArray(parsedGPX.trk)
      .map(routeNode => {
        const pointNodes = RouteImporterGPX.toArray(routeNode.trkseg).reduce((points: any[], trkseg: any) => {
          return points.concat(RouteImporterGPX.toArray(trkseg.trkpt));
        }, []);

        if (!pointNodes.length) {
          return null;
        }

        const hasTimedPoints = pointNodes.some(point => RouteImporterGPX.toArray(point.time).length > 0);
        if (hasTimedPoints && !importTimedTracksAsRoutes) {
          return null;
        }

        return {
          routeNode,
          pointNodes
        };
      })
      .filter((routeCandidate): routeCandidate is GPXRouteCandidate => routeCandidate !== null);

    return RouteImporterGPX.dedupeRouteCandidates(explicitRoutes.concat(trackRoutes));
  }

  private static dedupeRouteCandidates(routeCandidates: GPXRouteCandidate[]): GPXRouteCandidate[] {
    const seenSignatures = new Set<string>();
    return routeCandidates.filter(routeCandidate => {
      const signature = RouteImporterGPX.getRouteCandidateSignature(routeCandidate);
      if (seenSignatures.has(signature)) {
        return false;
      }
      seenSignatures.add(signature);
      return true;
    });
  }

  private static getRouteCandidateSignature(routeCandidate: GPXRouteCandidate): string {
    return routeCandidate.pointNodes
      .map(pointNode => {
        const latitude = Number.parseFloat(pointNode.lat);
        const longitude = Number.parseFloat(pointNode.lon);
        const altitude = RouteImporterGPX.getNumber(pointNode.ele);
        return [
          Number.isFinite(latitude) ? latitude.toFixed(7) : '',
          Number.isFinite(longitude) ? longitude.toFixed(7) : '',
          altitude === null ? '' : altitude.toFixed(2)
        ].join(',');
      })
      .join('|');
  }

  private static getPointFromGPXNode(pointNode: any): RouteWaypointInterface {
    return {
      latitudeDegrees: parseFloat(pointNode.lat),
      longitudeDegrees: parseFloat(pointNode.lon),
      altitude: RouteImporterGPX.getNumber(pointNode.ele),
      name: RouteImporterGPX.getText(pointNode.name),
      comment: RouteImporterGPX.getText(pointNode.cmt),
      description: RouteImporterGPX.getText(pointNode.desc),
      symbol: RouteImporterGPX.getText(pointNode.sym),
      type: RouteImporterGPX.getText(pointNode.type),
      links: RouteImporterGPX.getLinks(pointNode.link),
      extensions: pointNode.extensions
    };
  }

  private static getActivityType(routeNode: any): ActivityTypes | null {
    return ActivityTypesHelper.resolveActivityType(RouteImporterGPX.getText(routeNode.type));
  }

  private static getText(value: any): string | null {
    const textValue = RouteImporterGPX.toArray(value)[0];
    if (textValue === null || textValue === undefined) {
      return null;
    }
    const stringValue = String(textValue);
    return stringValue.length ? stringValue : null;
  }

  private static getNumber(value: any): number | null {
    const textValue = RouteImporterGPX.getText(value);
    if (textValue === null) {
      return null;
    }
    const numberValue = parseFloat(textValue);
    return Number.isFinite(numberValue) ? numberValue : null;
  }

  private static getDate(value: any): Date | null {
    const textValue = RouteImporterGPX.getText(value);
    if (textValue === null) {
      return null;
    }
    const date = new Date(textValue);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private static getLinks(value: any): RouteLinkInterface[] {
    return RouteImporterGPX.toArray(value)
      .map((linkNode): RouteLinkInterface | null => {
        const href = RouteImporterGPX.getText(linkNode.href) || linkNode.href;
        if (!href) {
          return null;
        }
        return {
          href: String(href),
          text: RouteImporterGPX.getText(linkNode.text),
          type: RouteImporterGPX.getText(linkNode.type)
        };
      })
      .filter((link): link is RouteLinkInterface => link !== null);
  }

  private static toArray<T>(value: T | T[] | undefined | null): T[] {
    if (value === undefined || value === null) {
      return [];
    }
    return Array.isArray(value) ? value : [value];
  }
}
