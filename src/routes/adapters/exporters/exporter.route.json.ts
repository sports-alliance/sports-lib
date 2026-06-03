import { RouteFileJSONInterface } from '../../route-file.json.interface';
import { RouteFileInterface } from '../../route-file.interface';

export class RouteExporterJSON {
  fileType = 'application/json';
  fileExtension = 'json';

  static export(routeFile: RouteFileInterface): RouteFileJSONInterface {
    return new RouteExporterJSON().export(routeFile);
  }

  static getAsString(routeFile: RouteFileInterface): Promise<string> {
    return new RouteExporterJSON().getAsString(routeFile);
  }

  export(routeFile: RouteFileInterface): RouteFileJSONInterface {
    return routeFile.toJSON();
  }

  getAsString(routeFile: RouteFileInterface): Promise<string> {
    return new Promise(resolve => {
      resolve(JSON.stringify(this.export(routeFile)));
    });
  }
}
