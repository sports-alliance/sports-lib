export interface RouteLinkInterface {
  href: string;
  text?: string | null;
  type?: string | null;
}

export interface RoutePointInterface {
  latitudeDegrees: number;
  longitudeDegrees: number;
  altitude?: number | null;
  name?: string | null;
  comment?: string | null;
  description?: string | null;
  symbol?: string | null;
  type?: string | null;
  links?: RouteLinkInterface[];
  extensions?: unknown;
}

export interface RouteWaypointInterface extends RoutePointInterface {
  distance?: number | null;
  routeIndex?: number | null;
  routePointIndex?: number | null;
}

export interface RouteMetadataInterface {
  comment?: string | null;
  description?: string | null;
  number?: number | null;
  links?: RouteLinkInterface[];
  extensions?: unknown;
}
