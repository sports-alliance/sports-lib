import { decode, encode } from '@googlemaps/polyline-codec';
import { RouteFileInterface } from './route-file.interface';
import { RouteInterface } from './route.interface';
import {
  RoutePreviewBoundsInterface,
  RoutePreviewCoordinateInterface,
  RoutePreviewRouteFileSourceInterface,
  RoutePreviewJSONInterface,
  RoutePreviewOptions,
  RoutePreviewRouteSourceInterface,
  RoutePreviewSegmentJSONInterface
} from './route-preview.interface';

export const ROUTE_PREVIEW_VERSION = 1 as const;
export const ROUTE_PREVIEW_ENCODING = 'polyline5' as const;
export const ROUTE_PREVIEW_POLYLINE_PRECISION = 5 as const;
export const ROUTE_PREVIEW_DEFAULT_MAX_POINTS_PER_SEGMENT = 300;
export const ROUTE_PREVIEW_DEFAULT_MAX_POINTS_PER_ROUTE = 1200;

interface RoutePreviewSegmentSource {
  id?: string;
  name?: string | null;
  activityType?: string | null;
  sourcePointCount: number;
  validPoints: RoutePreviewCoordinateInterface[];
}

interface IndexedAreaNode {
  index: number;
  area: number;
  version: number;
}

export interface CoordinatePairSimplificationOptions {
  keepRatio?: number;
  maxPoints?: number;
  minInputPoints?: number;
  minPointsToKeep?: number;
}

export interface CoordinatePairSimplificationResult {
  coordinates: number[][];
  inputPointCount: number;
  outputPointCount: number;
  simplified: boolean;
}

export class RoutePreviewUtilities {
  static buildRouteFilePreview(
    routeFile: RouteFileInterface | RoutePreviewRouteFileSourceInterface | null | undefined,
    options: RoutePreviewOptions = {}
  ): RoutePreviewJSONInterface | null {
    const maxPointsPerSegment = this.normalizePointLimit(
      options.maxPointsPerSegment,
      ROUTE_PREVIEW_DEFAULT_MAX_POINTS_PER_SEGMENT
    );
    const maxPointsPerRoute = this.normalizePointLimit(
      options.maxPointsPerRoute,
      ROUTE_PREVIEW_DEFAULT_MAX_POINTS_PER_ROUTE
    );

    const sources = this.resolveRouteSources(routeFile)
      .filter(source => source.validPoints.length >= 2);
    if (!sources.length || maxPointsPerRoute < 2) {
      return null;
    }

    const targetCounts = this.allocateSegmentTargetCounts(
      sources.map(source => source.validPoints.length),
      maxPointsPerSegment,
      maxPointsPerRoute
    );

    const segments = sources.reduce<RoutePreviewSegmentJSONInterface[]>((result, source, index) => {
      const targetCount = targetCounts[index] || 0;
      if (targetCount < 2) {
        return result;
      }

      const simplifiedPoints = this.simplifyPolyline(source.validPoints, { maxPoints: targetCount });
      if (simplifiedPoints.length < 2) {
        return result;
      }

      const encodedPolyline = encodeRoutePolyline5(simplifiedPoints);
      if (!encodedPolyline) {
        return result;
      }

      result.push(this.removeUndefined({
        id: source.id,
        name: source.name ?? null,
        activityType: source.activityType ?? null,
        sourcePointCount: source.sourcePointCount,
        pointCount: simplifiedPoints.length,
        encodedPolyline,
        bounds: buildRoutePreviewBounds(simplifiedPoints)
      }));
      return result;
    }, []);

    if (!segments.length) {
      return null;
    }

    return this.removeUndefined({
      version: ROUTE_PREVIEW_VERSION,
      encoding: ROUTE_PREVIEW_ENCODING,
      precision: ROUTE_PREVIEW_POLYLINE_PRECISION,
      sourcePointCount: sources.reduce((sum, source) => sum + source.sourcePointCount, 0),
      pointCount: segments.reduce((sum, segment) => sum + segment.pointCount, 0),
      bounds: mergeRoutePreviewBounds(segments.map(segment => segment.bounds)),
      segments
    });
  }

  static normalizeCoordinates(
    coordinates: readonly RoutePreviewCoordinateInterface[] | null | undefined
  ): RoutePreviewCoordinateInterface[] {
    if (!Array.isArray(coordinates)) {
      return [];
    }

    return coordinates
      .map(point => ({
        latitudeDegrees: toFiniteNumber(point?.latitudeDegrees),
        longitudeDegrees: toFiniteNumber(point?.longitudeDegrees)
      }))
      .filter((point): point is RoutePreviewCoordinateInterface => (
        point.latitudeDegrees !== null
        && point.longitudeDegrees !== null
        && point.latitudeDegrees >= -90
        && point.latitudeDegrees <= 90
        && point.longitudeDegrees >= -180
        && point.longitudeDegrees <= 180
        && (point.latitudeDegrees !== 0 || point.longitudeDegrees !== 0)
      ));
  }

  static simplifyPolyline(
    coordinates: readonly RoutePreviewCoordinateInterface[] | null | undefined,
    options: { maxPoints?: number; keepRatio?: number; minPointsToKeep?: number } = {}
  ): RoutePreviewCoordinateInterface[] {
    const points = this.normalizeCoordinates(coordinates);
    if (points.length <= 2) {
      return points;
    }

    const targetPointCount = this.resolveSimplificationTarget(points.length, options);
    if (targetPointCount >= points.length) {
      return points;
    }

    return this.runVisvalingamWhyatt(points, targetPointCount);
  }

  private static resolveRouteSources(
    routeFile: RouteFileInterface | RoutePreviewRouteFileSourceInterface | null | undefined
  ): RoutePreviewSegmentSource[] {
    if (!routeFile) {
      return [];
    }

    if (typeof (routeFile as RouteFileInterface).getRoutes === 'function') {
      return ((routeFile as RouteFileInterface).getRoutes() || []).map(route => this.routeClassToSource(route));
    }

    const previewRouteFile = routeFile as RoutePreviewRouteFileSourceInterface;
    const routes = Array.isArray(previewRouteFile.routes) ? previewRouteFile.routes : [];
    return routes.map(route => this.routeJsonToSource(route));
  }

  private static routeClassToSource(route: RouteInterface): RoutePreviewSegmentSource {
    const points = route.getPointData?.() || [];
    return {
      id: route.getID?.() || undefined,
      name: route.name ?? null,
      activityType: route.activityType ? `${route.activityType}` : null,
      sourcePointCount: points.length,
      validPoints: this.normalizeCoordinates(points)
    };
  }

  private static routeJsonToSource(route: RoutePreviewRouteSourceInterface): RoutePreviewSegmentSource {
    const points = Array.isArray(route.points) ? route.points : [];
    return {
      id: route.id,
      name: route.name ?? null,
      activityType: route.activityType ? `${route.activityType}` : null,
      sourcePointCount: points.length,
      validPoints: this.normalizeCoordinates(points)
    };
  }

  private static allocateSegmentTargetCounts(
    sourceCounts: number[],
    maxPointsPerSegment: number,
    maxPointsPerRoute: number
  ): number[] {
    const rawTargets = sourceCounts.map(count => Math.min(count, maxPointsPerSegment));
    const rawTotal = rawTargets.reduce((sum, count) => sum + count, 0);
    if (rawTotal <= maxPointsPerRoute) {
      return rawTargets;
    }

    const minimumTotal = rawTargets.length * 2;
    if (minimumTotal > maxPointsPerRoute) {
      let remaining = maxPointsPerRoute;
      return rawTargets.map(() => {
        if (remaining >= 2) {
          remaining -= 2;
          return 2;
        }
        return 0;
      });
    }

    const extraBudget = maxPointsPerRoute - minimumTotal;
    const rawExtras = rawTargets.map(target => Math.max(0, target - 2));
    const rawExtraTotal = rawExtras.reduce((sum, count) => sum + count, 0);
    if (rawExtraTotal <= 0) {
      return rawTargets.map(() => 2);
    }

    const allocations = rawExtras.map((extra, index) => {
      const exact = (extra / rawExtraTotal) * extraBudget;
      const floor = Math.floor(exact);
      return {
        index,
        count: 2 + floor,
        remainder: exact - floor,
        max: rawTargets[index]
      };
    });

    let distributedTotal = allocations.reduce((sum, allocation) => sum + allocation.count, 0);
    allocations
      .sort((left, right) => right.remainder - left.remainder || left.index - right.index)
      .forEach((allocation) => {
        if (distributedTotal >= maxPointsPerRoute || allocation.count >= allocation.max) {
          return;
        }
        allocation.count += 1;
        distributedTotal += 1;
      });

    return allocations
      .sort((left, right) => left.index - right.index)
      .map(allocation => allocation.count);
  }

  private static resolveSimplificationTarget(
    inputPointCount: number,
    options: { maxPoints?: number; keepRatio?: number; minPointsToKeep?: number }
  ): number {
    const maxPoints = Number.isFinite(options.maxPoints)
      ? Math.max(2, Math.floor(options.maxPoints as number))
      : inputPointCount;
    const keepRatio = Number.isFinite(options.keepRatio) && (options.keepRatio as number) > 0
      ? Math.min(1, options.keepRatio as number)
      : 1;
    const minPointsToKeep = Number.isFinite(options.minPointsToKeep)
      ? Math.max(2, Math.floor(options.minPointsToKeep as number))
      : 2;
    const ratioTarget = Math.round(inputPointCount * keepRatio);
    return Math.min(inputPointCount, Math.max(minPointsToKeep, Math.min(maxPoints, ratioTarget)));
  }

  private static runVisvalingamWhyatt(
    points: RoutePreviewCoordinateInterface[],
    targetPointCount: number
  ): RoutePreviewCoordinateInterface[] {
    const length = points.length;
    const previous = Array.from({ length }, (_, index) => index - 1);
    const next = Array.from({ length }, (_, index) => index + 1);
    next[length - 1] = -1;

    const removed = Array(length).fill(false);
    const versions = Array(length).fill(0);
    const heap = new AreaMinHeap();

    for (let index = 1; index < length - 1; index += 1) {
      heap.push({
        index,
        area: calculateTriangleArea(points[previous[index]], points[index], points[next[index]]),
        version: versions[index]
      });
    }

    let remaining = length;
    while (remaining > targetPointCount && heap.size > 0) {
      const candidate = heap.pop();
      if (!candidate || removed[candidate.index] || candidate.version !== versions[candidate.index]) {
        continue;
      }

      const previousIndex = previous[candidate.index];
      const nextIndex = next[candidate.index];
      if (previousIndex < 0 || nextIndex < 0) {
        continue;
      }

      removed[candidate.index] = true;
      next[previousIndex] = nextIndex;
      previous[nextIndex] = previousIndex;
      remaining -= 1;

      [previousIndex, nextIndex].forEach((neighborIndex) => {
        if (neighborIndex <= 0 || neighborIndex >= length - 1 || removed[neighborIndex]) {
          return;
        }
        versions[neighborIndex] += 1;
        heap.push({
          index: neighborIndex,
          area: calculateTriangleArea(points[previous[neighborIndex]], points[neighborIndex], points[next[neighborIndex]]),
          version: versions[neighborIndex]
        });
      });
    }

    return points.filter((_point, index) => !removed[index]);
  }

  private static normalizePointLimit(value: number | undefined, fallback: number): number {
    if (!Number.isFinite(value)) {
      return fallback;
    }
    return Math.max(2, Math.floor(value as number));
  }

  private static removeUndefined<T extends Record<string, unknown>>(value: T): T {
    Object.keys(value).forEach((key) => {
      if (value[key] === undefined) {
        delete value[key];
      }
    });
    return value;
  }
}

export function simplifyCoordinatePairsVisvalingamWhyatt(
  coordinates: readonly (readonly number[])[] | null | undefined,
  options: CoordinatePairSimplificationOptions = {}
): CoordinatePairSimplificationResult {
  const coordinatePairs = normalizeCoordinatePairs(coordinates);
  const inputPointCount = coordinatePairs.length;
  const minInputPoints = Number.isFinite(options.minInputPoints)
    ? Math.max(0, Math.floor(options.minInputPoints as number))
    : 0;

  if (inputPointCount < 3 || inputPointCount < minInputPoints) {
    return {
      coordinates: coordinatePairs,
      inputPointCount,
      outputPointCount: inputPointCount,
      simplified: false
    };
  }

  const targetPointCount = resolveCoordinatePairSimplificationTarget(inputPointCount, options);
  if (targetPointCount >= inputPointCount) {
    return {
      coordinates: coordinatePairs,
      inputPointCount,
      outputPointCount: inputPointCount,
      simplified: false
    };
  }

  const simplifiedCoordinates = runVisvalingamWhyattCoordinatePairs(coordinatePairs, targetPointCount);
  return {
    coordinates: simplifiedCoordinates,
    inputPointCount,
    outputPointCount: simplifiedCoordinates.length,
    simplified: simplifiedCoordinates.length < inputPointCount
  };
}

export function encodeRoutePolyline5(points: readonly RoutePreviewCoordinateInterface[] | null | undefined): string {
  const normalizedPoints = RoutePreviewUtilities.normalizeCoordinates(points);
  if (!normalizedPoints.length) {
    return '';
  }

  return encode(
    normalizedPoints.map(point => [point.latitudeDegrees, point.longitudeDegrees]),
    ROUTE_PREVIEW_POLYLINE_PRECISION
  );
}

export function decodeRoutePolyline5(encodedPolyline: string | null | undefined): RoutePreviewCoordinateInterface[] {
  if (typeof encodedPolyline !== 'string' || encodedPolyline.length === 0) {
    return [];
  }

  try {
    return RoutePreviewUtilities.normalizeCoordinates(
      decode(encodedPolyline, ROUTE_PREVIEW_POLYLINE_PRECISION)
        .map(([latitudeDegrees, longitudeDegrees]) => ({ latitudeDegrees, longitudeDegrees }))
    );
  } catch (_error) {
    return [];
  }
}

export function buildRoutePreviewBounds(
  points: readonly RoutePreviewCoordinateInterface[] | null | undefined
): RoutePreviewBoundsInterface | undefined {
  const normalizedPoints = RoutePreviewUtilities.normalizeCoordinates(points);
  if (!normalizedPoints.length) {
    return undefined;
  }

  return normalizedPoints.reduce<RoutePreviewBoundsInterface>((bounds, point) => ({
    minLatitudeDegrees: Math.min(bounds.minLatitudeDegrees, point.latitudeDegrees),
    maxLatitudeDegrees: Math.max(bounds.maxLatitudeDegrees, point.latitudeDegrees),
    minLongitudeDegrees: Math.min(bounds.minLongitudeDegrees, point.longitudeDegrees),
    maxLongitudeDegrees: Math.max(bounds.maxLongitudeDegrees, point.longitudeDegrees)
  }), {
    minLatitudeDegrees: normalizedPoints[0].latitudeDegrees,
    maxLatitudeDegrees: normalizedPoints[0].latitudeDegrees,
    minLongitudeDegrees: normalizedPoints[0].longitudeDegrees,
    maxLongitudeDegrees: normalizedPoints[0].longitudeDegrees
  });
}

export function mergeRoutePreviewBounds(
  boundsList: readonly (RoutePreviewBoundsInterface | undefined)[] | null | undefined
): RoutePreviewBoundsInterface | undefined {
  const validBounds = (boundsList || []).filter((bounds): bounds is RoutePreviewBoundsInterface => !!bounds);
  if (!validBounds.length) {
    return undefined;
  }

  return validBounds.reduce<RoutePreviewBoundsInterface>((merged, bounds) => ({
    minLatitudeDegrees: Math.min(merged.minLatitudeDegrees, bounds.minLatitudeDegrees),
    maxLatitudeDegrees: Math.max(merged.maxLatitudeDegrees, bounds.maxLatitudeDegrees),
    minLongitudeDegrees: Math.min(merged.minLongitudeDegrees, bounds.minLongitudeDegrees),
    maxLongitudeDegrees: Math.max(merged.maxLongitudeDegrees, bounds.maxLongitudeDegrees)
  }), validBounds[0]);
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string' && value.trim()) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
  }
  return null;
}

function normalizeCoordinatePairs(
  coordinates: readonly (readonly number[])[] | null | undefined
): number[][] {
  if (!Array.isArray(coordinates)) {
    return [];
  }

  return coordinates
    .map((coordinate) => {
      if (!Array.isArray(coordinate) || coordinate.length < 2) {
        return null;
      }
      const first = toFiniteNumber(coordinate[0]);
      const second = toFiniteNumber(coordinate[1]);
      return first === null || second === null ? null : [first, second];
    })
    .filter((coordinate): coordinate is number[] => !!coordinate);
}

function resolveCoordinatePairSimplificationTarget(
  inputPointCount: number,
  options: CoordinatePairSimplificationOptions
): number {
  const maxPoints = Number.isFinite(options.maxPoints)
    ? Math.max(2, Math.floor(options.maxPoints as number))
    : inputPointCount;
  const keepRatio = Number.isFinite(options.keepRatio) && (options.keepRatio as number) > 0
    ? Math.min(1, options.keepRatio as number)
    : 1;
  const minPointsToKeep = Number.isFinite(options.minPointsToKeep)
    ? Math.max(2, Math.floor(options.minPointsToKeep as number))
    : 2;
  const ratioTarget = Math.round(inputPointCount * keepRatio);
  return Math.min(inputPointCount, Math.max(minPointsToKeep, Math.min(maxPoints, ratioTarget)));
}

function runVisvalingamWhyattCoordinatePairs(
  coordinates: number[][],
  targetPointCount: number
): number[][] {
  const length = coordinates.length;
  const previous = Array.from({ length }, (_, index) => index - 1);
  const next = Array.from({ length }, (_, index) => index + 1);
  next[length - 1] = -1;

  const removed = Array(length).fill(false);
  const versions = Array(length).fill(0);
  const heap = new AreaMinHeap();

  for (let index = 1; index < length - 1; index += 1) {
    heap.push({
      index,
      area: calculateCoordinatePairTriangleArea(coordinates[previous[index]], coordinates[index], coordinates[next[index]]),
      version: versions[index]
    });
  }

  let remaining = length;
  while (remaining > targetPointCount && heap.size > 0) {
    const candidate = heap.pop();
    if (!candidate || removed[candidate.index] || candidate.version !== versions[candidate.index]) {
      continue;
    }

    const previousIndex = previous[candidate.index];
    const nextIndex = next[candidate.index];
    if (previousIndex < 0 || nextIndex < 0) {
      continue;
    }

    removed[candidate.index] = true;
    next[previousIndex] = nextIndex;
    previous[nextIndex] = previousIndex;
    remaining -= 1;

    [previousIndex, nextIndex].forEach((neighborIndex) => {
      if (neighborIndex <= 0 || neighborIndex >= length - 1 || removed[neighborIndex]) {
        return;
      }
      versions[neighborIndex] += 1;
      heap.push({
        index: neighborIndex,
        area: calculateCoordinatePairTriangleArea(
          coordinates[previous[neighborIndex]],
          coordinates[neighborIndex],
          coordinates[next[neighborIndex]]
        ),
        version: versions[neighborIndex]
      });
    });
  }

  return coordinates.filter((_coordinate, index) => !removed[index]);
}

function calculateTriangleArea(
  first: RoutePreviewCoordinateInterface,
  second: RoutePreviewCoordinateInterface,
  third: RoutePreviewCoordinateInterface
): number {
  return Math.abs(
    ((first.longitudeDegrees * (second.latitudeDegrees - third.latitudeDegrees))
      + (second.longitudeDegrees * (third.latitudeDegrees - first.latitudeDegrees))
      + (third.longitudeDegrees * (first.latitudeDegrees - second.latitudeDegrees))) / 2
  );
}

function calculateCoordinatePairTriangleArea(
  first: readonly number[],
  second: readonly number[],
  third: readonly number[]
): number {
  return Math.abs(
    ((first[0] * (second[1] - third[1]))
      + (second[0] * (third[1] - first[1]))
      + (third[0] * (first[1] - second[1]))) / 2
  );
}

class AreaMinHeap {
  private nodes: IndexedAreaNode[] = [];

  get size(): number {
    return this.nodes.length;
  }

  push(node: IndexedAreaNode): void {
    this.nodes.push(node);
    this.bubbleUp(this.nodes.length - 1);
  }

  pop(): IndexedAreaNode | undefined {
    if (!this.nodes.length) {
      return undefined;
    }
    const root = this.nodes[0];
    const last = this.nodes.pop();
    if (last && this.nodes.length) {
      this.nodes[0] = last;
      this.bubbleDown(0);
    }
    return root;
  }

  private bubbleUp(index: number): void {
    let current = index;
    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);
      if (this.compare(this.nodes[current], this.nodes[parent]) >= 0) {
        break;
      }
      this.swap(current, parent);
      current = parent;
    }
  }

  private bubbleDown(index: number): void {
    let current = index;
    while (true) {
      const left = (current * 2) + 1;
      const right = left + 1;
      let smallest = current;

      if (left < this.nodes.length && this.compare(this.nodes[left], this.nodes[smallest]) < 0) {
        smallest = left;
      }
      if (right < this.nodes.length && this.compare(this.nodes[right], this.nodes[smallest]) < 0) {
        smallest = right;
      }
      if (smallest === current) {
        break;
      }
      this.swap(current, smallest);
      current = smallest;
    }
  }

  private compare(left: IndexedAreaNode, right: IndexedAreaNode): number {
    return left.area - right.area || left.index - right.index;
  }

  private swap(left: number, right: number): void {
    const temp = this.nodes[left];
    this.nodes[left] = this.nodes[right];
    this.nodes[right] = temp;
  }
}
