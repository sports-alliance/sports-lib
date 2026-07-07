import type { ActivityTypes } from '../activities/activity.types';

export interface RoutePreviewCoordinateInterface {
  latitudeDegrees: number;
  longitudeDegrees: number;
}

export interface RoutePreviewRouteSourceInterface {
  id?: string;
  name?: string | null;
  activityType?: string | null;
  points?: readonly RoutePreviewCoordinateInterface[] | null;
}

export interface RoutePreviewRouteFileSourceInterface {
  routes?: readonly RoutePreviewRouteSourceInterface[] | null;
}

export interface RoutePreviewBoundsInterface {
  minLatitudeDegrees: number;
  maxLatitudeDegrees: number;
  minLongitudeDegrees: number;
  maxLongitudeDegrees: number;
}

export interface RoutePreviewSegmentJSONInterface {
  id?: string;
  name?: string | null;
  activityType?: ActivityTypes | string | null;
  sourcePointCount: number;
  pointCount: number;
  encodedPolyline: string;
  bounds?: RoutePreviewBoundsInterface;
}

export interface RoutePreviewJSONInterface {
  version: 1;
  encoding: 'polyline5';
  precision: 5;
  sourcePointCount: number;
  pointCount: number;
  bounds?: RoutePreviewBoundsInterface;
  segments: RoutePreviewSegmentJSONInterface[];
}

export interface RoutePreviewOptions {
  maxPointsPerSegment?: number;
  maxPointsPerRoute?: number;
}
