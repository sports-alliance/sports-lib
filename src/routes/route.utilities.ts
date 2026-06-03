import { DataAscent } from '../data/data.ascent';
import { DataDescent } from '../data/data.descent';
import { DataDistance } from '../data/data.distance';
import { DataAltitude } from '../data/data.altitude';
import { DataAltitudeAvg } from '../data/data.altitude-avg';
import { DataAltitudeMax } from '../data/data.altitude-max';
import { DataAltitudeMin } from '../data/data.altitude-min';
import { DataAltitudeSmooth } from '../data/data.altitude-smooth';
import { DataEndAltitude } from '../data/data.end-altitude';
import { DataGNSSDistance } from '../data/data.gnss-distance';
import { DataGrade } from '../data/data.grade';
import { DataGradeAvg } from '../data/data.grade-avg';
import { DataGradeMax } from '../data/data.grade-max';
import { DataGradeMin } from '../data/data.grade-min';
import { DataGradeSmooth } from '../data/data.grade-smooth';
import { DataLatitudeDegrees } from '../data/data.latitude-degrees';
import { DataLongitudeDegrees } from '../data/data.longitude-degrees';
import { DataPositionInterface } from '../data/data.position.interface';
import { DataStartAltitude } from '../data/data.start-altitude';
import { DynamicDataLoader } from '../data/data.store';
import { ParsingEventLibError } from '../errors/parsing-event-lib.error';
import { GeoLibAdapter } from '../geodesy/adapters/geolib.adapter';
import { GradeCalculator } from '../events/utilities/grade-calculator/grade-calculator';
import { isNumber, medianFilter } from '../events/utilities/helpers';
import { LowPassFilter } from '../events/utilities/grade-calculator/low-pass-filter';
import { RouteInterface } from './route.interface';
import { RouteStream } from './route-stream';

const ALTITUDE_SPIKES_FILTER_WIN = 3;

export class RouteUtilities {
  private static readonly geoLibAdapter = new GeoLibAdapter();

  private static readonly baseRouteStreamTypes = new Set([
    DataLatitudeDegrees.type,
    DataLongitudeDegrees.type,
    DataAltitude.type,
    DataAltitudeSmooth.type,
    DataDistance.type,
    DataGNSSDistance.type,
    DataGrade.type,
    DataGradeSmooth.type
  ]);

  private static readonly routeUnitBaseStreamTypes = new Set([DataDistance.type, DataGNSSDistance.type]);

  static generateMissingStreamsAndStatsForRoute(route: RouteInterface): RouteInterface {
    this.createDerivedStreams(route);
    this.createDistanceStreams(route);
    this.createGradeStreams(route);

    if (route.parseOptions.generateUnitStreams) {
      route.addStreams(this.createUnitStreams(route));
    }

    this.generateStats(route);

    if (route.parseOptions.generateUnitStreams) {
      this.generateUnitStats(route);
    }

    this.pruneStreamsByIncludeTypes(route);
    return route;
  }

  static getSupportedRouteStreamTypes(): string[] {
    const unitTypes = Array.from(this.routeUnitBaseStreamTypes).reduce((accu: string[], baseStreamType) => {
      return accu.concat(Object.keys(DynamicDataLoader.dataTypeUnitGroups[baseStreamType] || {}));
    }, []);
    return Array.from(new Set([...Array.from(this.baseRouteStreamTypes), ...unitTypes]));
  }

  private static createDerivedStreams(route: RouteInterface): void {
    if (
      route.parseOptions?.streams?.smooth?.altitudeSmooth &&
      route.hasStreamData(DataAltitude.type) &&
      !route.hasStreamData(DataAltitudeSmooth.type)
    ) {
      route.addStream(new RouteStream(DataAltitudeSmooth.type, Array.from(route.getStreamData(DataAltitude.type))));
      this.shapeStream(route, DataAltitudeSmooth.type, squashedAltData => {
        squashedAltData = medianFilter(squashedAltData, ALTITUDE_SPIKES_FILTER_WIN);
        return LowPassFilter.smooth(squashedAltData) as number[];
      });
    }
  }

  private static createDistanceStreams(route: RouteInterface): void {
    if (
      route.hasStreamData(DataLatitudeDegrees.type) &&
      route.hasStreamData(DataLongitudeDegrees.type) &&
      (!route.hasStreamData(DataDistance.type) || !route.hasStreamData(DataGNSSDistance.type))
    ) {
      const streamData = Array(route.getPointCount()).fill(null);
      let distance = 0;
      let previousPosition: DataPositionInterface | null = null;

      route.getPositionData().forEach((position, index) => {
        if (!position) {
          return;
        }

        if (previousPosition) {
          distance += this.geoLibAdapter.getDistance([previousPosition, position]);
        }
        streamData[index] = this.round(distance, 2);
        previousPosition = position;
      });

      if (!route.hasStreamData(DataDistance.type)) {
        route.addStream(new RouteStream(DataDistance.type, streamData));
      }

      if (!route.hasStreamData(DataGNSSDistance.type)) {
        route.addStream(new RouteStream(DataGNSSDistance.type, streamData));
      }
    }
  }

  private static createGradeStreams(route: RouteInterface): void {
    if (
      route.parseOptions?.streams?.smooth?.grade &&
      route.hasStreamData(DataDistance.type) &&
      (route.hasStreamData(DataAltitudeSmooth.type) || route.hasStreamData(DataAltitude.type)) &&
      !route.hasStreamData(DataGrade.type)
    ) {
      const altitudeStreamType = route.hasStreamData(DataAltitudeSmooth.type)
        ? DataAltitudeSmooth.type
        : DataAltitude.type;
      const gradeStreamData = GradeCalculator.computeGradeStreamByDistance(
        route.getStreamData(DataDistance.type),
        route.getStreamData(altitudeStreamType)
      );
      route.addStream(new RouteStream(DataGrade.type, gradeStreamData));

      if (route.parseOptions?.streams?.smooth?.gradeSmooth) {
        route.addStream(new RouteStream(DataGradeSmooth.type, Array.from(gradeStreamData)));
        this.shapeStream(route, DataGradeSmooth.type, squashedGradeData => {
          return LowPassFilter.smooth(squashedGradeData) as number[];
        });
      }
    }
  }

  private static createUnitStreams(route: RouteInterface): RouteStream[] {
    const existingStreamTypes = new Set(route.getAllStreams().map(stream => stream.type));
    return Array.from(this.routeUnitBaseStreamTypes).reduce((streams: RouteStream[], baseDataType) => {
      if (!route.hasStreamData(baseDataType)) {
        return streams;
      }

      Object.keys(DynamicDataLoader.dataTypeUnitGroups[baseDataType] || {}).forEach(unitBasedDataType => {
        if (existingStreamTypes.has(unitBasedDataType)) {
          return;
        }

        streams.push(
          new RouteStream(
            unitBasedDataType,
            route.getStreamData(baseDataType).map(dataValue => {
              if (!isNumber(dataValue)) {
                return null;
              }
              return DynamicDataLoader.dataTypeUnitGroups[baseDataType][unitBasedDataType](<number>dataValue);
            })
          )
        );
      });

      return streams;
    }, []);
  }

  private static generateStats(route: RouteInterface): void {
    if (!route.getStat(DataDistance.type) && route.hasStreamData(DataDistance.type)) {
      const lastDistance = this.getDataTypeLast(route, DataDistance.type);
      if (lastDistance !== null) {
        route.addStat(new DataDistance(lastDistance));
      }
    }

    if (!route.getStat(DataGNSSDistance.type) && route.hasStreamData(DataGNSSDistance.type)) {
      const lastDistance = this.getDataTypeLast(route, DataGNSSDistance.type);
      if (lastDistance !== null) {
        route.addStat(new DataGNSSDistance(lastDistance));
      }
    }

    const altitudeStreamType = route.hasStreamData(DataAltitudeSmooth.type)
      ? DataAltitudeSmooth.type
      : route.hasStreamData(DataAltitude.type)
        ? DataAltitude.type
        : null;

    if (altitudeStreamType && this.hasNumericData(route, altitudeStreamType)) {
      if (!route.getStat(DataAscent.type)) {
        route.addStat(new DataAscent(this.getDataTypeGain(route, altitudeStreamType)));
      }
      if (!route.getStat(DataDescent.type)) {
        route.addStat(new DataDescent(this.getDataTypeLoss(route, altitudeStreamType)));
      }
      if (!route.getStat(DataAltitudeMax.type)) {
        route.addStat(new DataAltitudeMax(this.getDataTypeMax(route, altitudeStreamType)));
      }
      if (!route.getStat(DataAltitudeMin.type)) {
        route.addStat(new DataAltitudeMin(this.getDataTypeMin(route, altitudeStreamType)));
      }
      if (!route.getStat(DataAltitudeAvg.type)) {
        route.addStat(new DataAltitudeAvg(this.getDataTypeAvg(route, altitudeStreamType)));
      }
      if (!route.getStat(DataStartAltitude.type)) {
        const startAltitude = this.getDataTypeFirst(route, altitudeStreamType);
        if (startAltitude !== null) {
          route.addStat(new DataStartAltitude(startAltitude));
        }
      }
      if (!route.getStat(DataEndAltitude.type)) {
        const endAltitude = this.getDataTypeLast(route, altitudeStreamType);
        if (endAltitude !== null) {
          route.addStat(new DataEndAltitude(endAltitude));
        }
      }
    }

    const gradeStreamType = route.hasStreamData(DataGradeSmooth.type)
      ? DataGradeSmooth.type
      : route.hasStreamData(DataGrade.type)
        ? DataGrade.type
        : null;
    if (gradeStreamType && this.hasNumericData(route, gradeStreamType)) {
      if (!route.getStat(DataGradeMax.type)) {
        route.addStat(new DataGradeMax(this.getDataTypeMax(route, gradeStreamType)));
      }
      if (!route.getStat(DataGradeMin.type)) {
        route.addStat(new DataGradeMin(this.getDataTypeMin(route, gradeStreamType)));
      }
      if (!route.getStat(DataGradeAvg.type)) {
        route.addStat(new DataGradeAvg(this.getDataTypeAvg(route, gradeStreamType)));
      }
    }
  }

  private static generateUnitStats(route: RouteInterface): void {
    Array.from(this.routeUnitBaseStreamTypes).forEach(baseDataType => {
      const stat = route.getStat(baseDataType);
      if (!stat) {
        return;
      }

      Object.keys(DynamicDataLoader.dataTypeUnitGroups[baseDataType] || {}).forEach(unitBasedDataType => {
        if (route.getStat(unitBasedDataType)) {
          return;
        }
        route.addStat(
          DynamicDataLoader.getDataInstanceFromDataType(
            unitBasedDataType,
            DynamicDataLoader.dataTypeUnitGroups[baseDataType][unitBasedDataType](<number>stat.getValue())
          )
        );
      });
    });
  }

  private static pruneStreamsByIncludeTypes(route: RouteInterface): void {
    const includeTypes = route.parseOptions?.streams?.includeTypes || [];
    if (!includeTypes.length) {
      return;
    }

    this.assertSupportedIncludeTypes(includeTypes);

    route
      .getAllStreams()
      .slice()
      .forEach(stream => {
        if (includeTypes.indexOf(stream.type) === -1) {
          route.removeStream(stream);
        }
      });
  }

  private static assertSupportedIncludeTypes(includeTypes: string[]): void {
    const unknownTypes = includeTypes.filter(streamType => !this.isKnownDataType(streamType));
    if (unknownTypes.length) {
      throw new ParsingEventLibError(`Unknown route stream includeTypes: ${unknownTypes.join(', ')}`);
    }

    const supportedTypes = new Set(this.getSupportedRouteStreamTypes());
    const unsupportedTypes = includeTypes.filter(streamType => !supportedTypes.has(streamType));
    if (unsupportedTypes.length) {
      throw new ParsingEventLibError(`Unsupported route stream includeTypes: ${unsupportedTypes.join(', ')}`);
    }
  }

  private static isKnownDataType(streamType: string): boolean {
    try {
      DynamicDataLoader.getDataClassFromDataType(streamType);
      return true;
    } catch (_e) {
      return false;
    }
  }

  private static shapeStream(route: RouteInterface, streamType: string, shape: (data: number[]) => number[]): void {
    const data = route.getStreamData(streamType);
    const numericIndexes: number[] = [];
    const squashedData = data.reduce((accu: number[], value, index) => {
      if (!isNumber(value)) {
        return accu;
      }
      numericIndexes.push(index);
      accu.push(<number>value);
      return accu;
    }, []);

    const shapedData = shape(squashedData);
    numericIndexes.forEach((sourceIndex, shapedIndex) => {
      data[sourceIndex] = this.round(shapedData[shapedIndex], 2);
    });
  }

  private static getNumericData(route: RouteInterface, dataType: string): number[] {
    return route.getSquashedStreamData(dataType).filter(Number.isFinite);
  }

  private static hasNumericData(route: RouteInterface, dataType: string): boolean {
    return this.getNumericData(route, dataType).length > 0;
  }

  private static getDataTypeMax(route: RouteInterface, dataType: string): number {
    return Math.max(...this.getNumericData(route, dataType));
  }

  private static getDataTypeMin(route: RouteInterface, dataType: string): number {
    return Math.min(...this.getNumericData(route, dataType));
  }

  private static getDataTypeAvg(route: RouteInterface, dataType: string): number {
    const data = this.getNumericData(route, dataType);
    return this.round(data.reduce((sum, value) => sum + value, 0) / data.length, 2);
  }

  private static getDataTypeFirst(route: RouteInterface, dataType: string): number | null {
    return this.getNumericData(route, dataType)[0] ?? null;
  }

  private static getDataTypeLast(route: RouteInterface, dataType: string): number | null {
    const data = this.getNumericData(route, dataType);
    return data[data.length - 1] ?? null;
  }

  private static getDataTypeGain(route: RouteInterface, dataType: string): number {
    return this.getDataTypeDeltaSum(route, dataType, delta => delta > 0);
  }

  private static getDataTypeLoss(route: RouteInterface, dataType: string): number {
    return this.getDataTypeDeltaSum(route, dataType, delta => delta < 0);
  }

  private static getDataTypeDeltaSum(
    route: RouteInterface,
    dataType: string,
    predicate: (delta: number) => boolean
  ): number {
    const data = this.getNumericData(route, dataType);
    return this.round(
      data.reduce((sum, value, index) => {
        if (index === 0) {
          return sum;
        }
        const delta = value - data[index - 1];
        return predicate(delta) ? sum + Math.abs(delta) : sum;
      }, 0),
      2
    );
  }

  private static round(value: number, precision = 2): number {
    const factor = 10 ** precision;
    return Math.round(value * factor) / factor;
  }
}
