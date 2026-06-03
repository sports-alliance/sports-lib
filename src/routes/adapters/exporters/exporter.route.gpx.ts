import { ActivityTypes } from '../../../activities/activity.types';
import { RouteFileInterface } from '../../route-file.interface';
import { RoutePointInterface, RouteWaypointInterface } from '../../route-point.interface';

export class RouteExporterGPX {
  fileType = 'application/gpx+xml';
  fileExtension = 'gpx';

  static getAsString(routeFile: RouteFileInterface): Promise<string> {
    return new RouteExporterGPX().getAsString(routeFile);
  }

  getAsString(routeFile: RouteFileInterface): Promise<string> {
    return new Promise(resolve => {
      resolve(this.export(routeFile));
    });
  }

  export(routeFile: RouteFileInterface): string {
    const metadataTime = routeFile.createdAt ? `<time>${this.escapeXml(routeFile.createdAt.toISOString())}</time>` : '';
    const waypoints = routeFile
      .getWaypoints()
      .map(waypoint => this.getWaypointXml(waypoint, 'wpt'))
      .join('');
    const routes = routeFile
      .getRoutes()
      .map(route => {
        const name = route.name ? `<name>${this.escapeXml(route.name)}</name>` : '';
        const comment = route.comment ? `<cmt>${this.escapeXml(route.comment)}</cmt>` : '';
        const description = route.description ? `<desc>${this.escapeXml(route.description)}</desc>` : '';
        const number = route.number !== null ? `<number>${route.number}</number>` : '';
        const links = route.links.map(link => this.getLinkXml(link)).join('');
        const type =
          route.activityType && route.activityType !== ActivityTypes.route
            ? `<type>${this.escapeXml(route.activityType)}</type>`
            : '';
        const extensions = this.getExtensionsXml(route.extensions);
        const points = route
          .getPointData()
          .map(point => this.getWaypointXml(point, 'rtept'))
          .join('');
        return `<rte>${name}${comment}${description}${number}${links}${type}${extensions}${points}</rte>`;
      })
      .join('');

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      `<gpx creator="${this.escapeXml(routeFile.creator.name)}" version="1.1" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">`,
      `<metadata><name>${this.escapeXml(routeFile.name)}</name>${metadataTime}</metadata>`,
      waypoints,
      routes,
      '</gpx>'
    ].join('');
  }

  private getWaypointXml(point: RoutePointInterface | RouteWaypointInterface, tagName: 'wpt' | 'rtept'): string {
    const altitude = Number.isFinite(point.altitude) ? `<ele>${point.altitude}</ele>` : '';
    const name = point.name ? `<name>${this.escapeXml(point.name)}</name>` : '';
    const comment = point.comment ? `<cmt>${this.escapeXml(point.comment)}</cmt>` : '';
    const description = point.description ? `<desc>${this.escapeXml(point.description)}</desc>` : '';
    const symbol = point.symbol ? `<sym>${this.escapeXml(point.symbol)}</sym>` : '';
    const type = point.type ? `<type>${this.escapeXml(point.type)}</type>` : '';
    const links = (point.links || []).map(link => this.getLinkXml(link)).join('');
    const extensions = this.getExtensionsXml(point.extensions);
    return `<${tagName} lat="${point.latitudeDegrees}" lon="${point.longitudeDegrees}">${altitude}${name}${comment}${description}${symbol}${type}${links}${extensions}</${tagName}>`;
  }

  private getLinkXml(link: { href: string; text?: string | null; type?: string | null }): string {
    const text = link.text ? `<text>${this.escapeXml(link.text)}</text>` : '';
    const type = link.type ? `<type>${this.escapeXml(link.type)}</type>` : '';
    return `<link href="${this.escapeXml(link.href)}">${text}${type}</link>`;
  }

  private getExtensionsXml(extensions: unknown): string {
    const innerXml = this.getUnknownExtensionXml(extensions);
    return innerXml ? `<extensions>${innerXml}</extensions>` : '';
  }

  private getUnknownExtensionXml(value: unknown, tagName?: string): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (Array.isArray(value)) {
      return value.map(item => this.getUnknownExtensionXml(item, tagName)).join('');
    }

    if (typeof value !== 'object') {
      return tagName ? `<${tagName}>${this.escapeXml(String(value))}</${tagName}>` : '';
    }

    const children = Object.keys(value as Record<string, unknown>)
      .map(key => {
        const childValue = (value as Record<string, unknown>)[key];
        if (!Array.isArray(childValue)) {
          return '';
        }
        return childValue.map(item => this.getUnknownExtensionXml(item, key)).join('');
      })
      .join('');

    return tagName ? `<${tagName}>${children}</${tagName}>` : children;
  }

  private escapeXml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
