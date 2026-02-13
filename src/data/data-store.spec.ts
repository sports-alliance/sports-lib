import {
  DataSpeedFeetPerMinute,
  DataSpeedFeetPerSecond,
  DataSpeedKilometersPerHour,
  DataSpeedKnots,
  DataSpeedMetersPerMinute,
  DataSpeedMilesPerHour,
  DataSpeed
} from './data.speed';
import { DataPace, DataPaceMinutesPerMile } from './data.pace';
import { DataEffortPace, DataEffortPaceMinutesPerMile } from './data.effort-pace';
import { DataEffortPaceAvg, DataEffortPaceAvgMinutesPerMile } from './data.effort-pace-avg';
import { DataEffortPaceMin, DataEffortPaceMinMinutesPerMile } from './data.effort-pace-min';
import { DataEffortPaceMax, DataEffortPaceMaxMinutesPerMile } from './data.effort-pace-max';
import { DataSwimPace, DataSwimPaceMinutesPer100Yard } from './data.swim-pace';
import {
  DataGradeAdjustedSpeedFeetPerMinute,
  DataGradeAdjustedSpeedFeetPerSecond,
  DataGradeAdjustedSpeedKilometersPerHour,
  DataGradeAdjustedSpeedKnots,
  DataGradeAdjustedSpeedMetersPerMinute,
  DataGradeAdjustedSpeedMilesPerHour
} from './data.grade-adjusted-speed';
import { DataGradeAdjustedPace, DataGradeAdjustedPaceMinutesPerMile } from './data.grade-adjusted-pace';
import {
  DataVerticalSpeedFeetPerHour,
  DataVerticalSpeedFeetPerMinute,
  DataVerticalSpeedFeetPerSecond,
  DataVerticalSpeedKilometerPerHour,
  DataVerticalSpeedMetersPerHour,
  DataVerticalSpeedMetersPerMinute,
  DataVerticalSpeedMilesPerHour
} from './data.vertical-speed';
import { DataStore as _DataStore, DynamicDataLoader } from './data.store';
import { DataDistance, DataDistanceMiles } from './data.distance';
import {
  DataJumpDistanceAvg,
  DataJumpSpeedAvg,
  DataJumpSpeedAvgFeetPerMinute,
  DataJumpSpeedAvgFeetPerSecond,
  DataJumpSpeedAvgKilometersPerHour,
  DataJumpSpeedAvgKnots,
  DataJumpSpeedAvgMetersPerMinute,
  DataJumpSpeedAvgMilesPerHour,
  DataJumpSpeedMax,
  DataJumpSpeedMaxFeetPerMinute,
  DataJumpSpeedMaxFeetPerSecond,
  DataJumpSpeedMaxKilometersPerHour,
  DataJumpSpeedMaxKnots,
  DataJumpSpeedMaxMetersPerMinute,
  DataJumpSpeedMaxMilesPerHour,
  DataJumpSpeedMin,
  DataJumpSpeedMinFeetPerMinute,
  DataJumpSpeedMinFeetPerSecond,
  DataJumpSpeedMinKilometersPerHour,
  DataJumpSpeedMinKnots,
  DataJumpSpeedMinMetersPerMinute,
  DataJumpSpeedMinMilesPerHour
} from './data.jump-stats';
import { DataGNSSDistance } from './data.gnss-distance';
import { DataStepLength } from './data.step-length';
import { convertMetersToMiles, convertSpeedToSpeedInMilesPerHour } from '../events/utilities/helpers';
import { DistanceUnits } from '../users/settings/user.unit.settings.interface';
import { DataSpeedAvg, DataSpeedAvgMilesPerHour } from './data.speed-avg';

describe('DataStore', () => {
  const unitDerivedDataTypes = [
    DataSpeedKilometersPerHour.type,
    DataSpeedMilesPerHour.type,
    DataSpeedFeetPerSecond.type,
    DataSpeedFeetPerMinute.type,
    DataSpeedMetersPerMinute.type,
    DataSpeedKnots.type,
    DataPaceMinutesPerMile.type,
    DataEffortPaceMinutesPerMile.type,
    DataEffortPaceAvgMinutesPerMile.type,
    DataEffortPaceMinMinutesPerMile.type,
    DataEffortPaceMaxMinutesPerMile.type,
    DataSwimPaceMinutesPer100Yard.type,
    DataGradeAdjustedSpeedKilometersPerHour.type,
    DataGradeAdjustedSpeedMilesPerHour.type,
    DataGradeAdjustedSpeedFeetPerSecond.type,
    DataGradeAdjustedSpeedFeetPerMinute.type,
    DataGradeAdjustedSpeedMetersPerMinute.type,
    DataGradeAdjustedSpeedKnots.type,
    DataGradeAdjustedPaceMinutesPerMile.type,
    DataVerticalSpeedFeetPerSecond.type,
    DataVerticalSpeedMetersPerMinute.type,
    DataVerticalSpeedFeetPerMinute.type,
    DataVerticalSpeedMetersPerHour.type,
    DataVerticalSpeedFeetPerHour.type,
    DataVerticalSpeedKilometerPerHour.type,
    DataVerticalSpeedMilesPerHour.type,
    DataJumpSpeedAvgKilometersPerHour.type,
    DataJumpSpeedAvgMilesPerHour.type,
    DataJumpSpeedAvgFeetPerSecond.type,
    DataJumpSpeedAvgMetersPerMinute.type,
    DataJumpSpeedAvgFeetPerMinute.type,
    DataJumpSpeedAvgKnots.type,
    DataJumpSpeedMinKilometersPerHour.type,
    DataJumpSpeedMinMilesPerHour.type,
    DataJumpSpeedMinFeetPerSecond.type,
    DataJumpSpeedMinMetersPerMinute.type,
    DataJumpSpeedMinFeetPerMinute.type,
    DataJumpSpeedMinKnots.type,
    DataJumpSpeedMaxKilometersPerHour.type,
    DataJumpSpeedMaxMilesPerHour.type,
    DataJumpSpeedMaxFeetPerSecond.type,
    DataJumpSpeedMaxMetersPerMinute.type,
    DataJumpSpeedMaxFeetPerMinute.type,
    DataJumpSpeedMaxKnots.type,
    DataDistanceMiles.type
  ];

  const _speedDerivedDataTypes = [DataPace.type, DataGradeAdjustedPace.type, DataSwimPace.type];

  it('should get the correct unitbased datatypes', () => {
    // @todo here we should think
    expect(DynamicDataLoader.allUnitDerivedDataTypes.sort()).toEqual(unitDerivedDataTypes.sort());
  });

  it('keeps GNSS distance blacklisted for stream-generation only', () => {
    expect(DynamicDataLoader.isBlackListedStream(DataGNSSDistance.type)).toBe(true);
    expect(DynamicDataLoader.isBlackListedStream(DataDistance.type)).toBe(false);
    expect(DynamicDataLoader.isBlackListedStream(DataStepLength.type)).toBe(false);
  });

  describe('getUnitBasedDataTypesFromDataTypes', () => {
    it('should include derived types by default', () => {
      const _types = [DataSpeedKilometersPerHour.type, DataPace.type];
      const settings: any = {
        speedUnits: [DataSpeedKilometersPerHour.type],
        swimPaceUnits: [],
        paceUnits: [DataPaceMinutesPerMile.type],
        gradeAdjustedSpeedUnits: [],
        gradeAdjustedPaceUnits: [],
        verticalSpeedUnits: [],
        distanceUnits: DistanceUnits.Metric,
        elevationUnits: [],
        temperatureUnits: [],
        weightUnits: []
      };

      const result = DynamicDataLoader.getUnitBasedDataTypesFromDataTypes([DataSpeed.type], settings);
      expect(result).toContain(DataPaceMinutesPerMile.type);
    });

    it('should exclude derived types when includeDerivedTypes is false', () => {
      const settings: any = {
        speedUnits: [DataSpeedKilometersPerHour.type],
        swimPaceUnits: [],
        paceUnits: [DataPaceMinutesPerMile.type],
        gradeAdjustedSpeedUnits: [],
        gradeAdjustedPaceUnits: [],
        verticalSpeedUnits: [],
        distanceUnits: DistanceUnits.Metric,
        elevationUnits: [],
        temperatureUnits: [],
        weightUnits: []
      };

      const result = DynamicDataLoader.getUnitBasedDataTypesFromDataTypes([DataSpeed.type], settings, {
        includeDerivedTypes: false
      });
      expect(result).toContain(DataSpeedKilometersPerHour.type);
      expect(result).not.toContain(DataPaceMinutesPerMile.type);
    });

    it('should include jump speed unit variant data types for selected speed units', () => {
      const settings: any = {
        speedUnits: [DataSpeedMilesPerHour.type, DataSpeedKilometersPerHour.type],
        swimPaceUnits: [],
        paceUnits: [],
        gradeAdjustedSpeedUnits: [],
        gradeAdjustedPaceUnits: [],
        verticalSpeedUnits: [],
        distanceUnits: DistanceUnits.Metric,
        elevationUnits: [],
        temperatureUnits: [],
        weightUnits: []
      };

      const result = DynamicDataLoader.getUnitBasedDataTypesFromDataTypes(
        [DataJumpSpeedAvg.type, DataJumpSpeedMin.type, DataJumpSpeedMax.type],
        settings
      );

      expect(result).toEqual([
        DataJumpSpeedAvgMilesPerHour.type,
        DataJumpSpeedAvgKilometersPerHour.type,
        DataJumpSpeedMinMilesPerHour.type,
        DataJumpSpeedMinKilometersPerHour.type,
        DataJumpSpeedMaxMilesPerHour.type,
        DataJumpSpeedMaxKilometersPerHour.type
      ]);
    });

    it('should include effort pace unit variant data types from paceUnits', () => {
      const settings: any = {
        speedUnits: [],
        swimPaceUnits: [],
        paceUnits: [DataPace.type, DataPaceMinutesPerMile.type],
        gradeAdjustedSpeedUnits: [],
        gradeAdjustedPaceUnits: [],
        verticalSpeedUnits: [],
        distanceUnits: DistanceUnits.Metric,
        elevationUnits: [],
        temperatureUnits: [],
        weightUnits: []
      };

      const result = DynamicDataLoader.getUnitBasedDataTypesFromDataTypes(
        [DataEffortPace.type, DataEffortPaceAvg.type, DataEffortPaceMin.type, DataEffortPaceMax.type],
        settings
      );

      expect(result).toEqual([
        DataEffortPace.type,
        DataEffortPaceMinutesPerMile.type,
        DataEffortPaceAvg.type,
        DataEffortPaceAvgMinutesPerMile.type,
        DataEffortPaceMin.type,
        DataEffortPaceMinMinutesPerMile.type,
        DataEffortPaceMax.type,
        DataEffortPaceMaxMinutesPerMile.type
      ]);
    });
  });

  describe('distanceUnits-based conversion', () => {
    const imperialSettings: any = {
      speedUnits: [DataSpeed.type],
      swimPaceUnits: [],
      paceUnits: [],
      gradeAdjustedSpeedUnits: [],
      gradeAdjustedPaceUnits: [],
      verticalSpeedUnits: [],
      distanceUnits: DistanceUnits.Imperial,
      elevationUnits: [],
      temperatureUnits: [],
      weightUnits: []
    };

    const metricSettings: any = {
      speedUnits: [DataSpeedMilesPerHour.type],
      swimPaceUnits: [],
      paceUnits: [],
      gradeAdjustedSpeedUnits: [],
      gradeAdjustedPaceUnits: [],
      verticalSpeedUnits: [],
      distanceUnits: DistanceUnits.Metric,
      elevationUnits: [],
      temperatureUnits: [],
      weightUnits: []
    };

    const missingDistanceSettings: any = {
      speedUnits: [DataSpeedMilesPerHour.type],
      swimPaceUnits: [],
      paceUnits: [],
      gradeAdjustedSpeedUnits: [],
      gradeAdjustedPaceUnits: [],
      verticalSpeedUnits: [],
      elevationUnits: [],
      temperatureUnits: [],
      weightUnits: []
    };

    const allDistanceTypes = Object.values(_DataStore)
      .filter((DataClass: any) => typeof DataClass === 'function')
      .filter((DataClass: any) => DataClass === DataDistance || DataClass.prototype instanceof DataDistance)
      .map((DataClass: any) => DataClass.type as string)
      .filter((dataType: string) => dataType !== DataDistanceMiles.type);

    it('has miles mappings for every DataStore class extending DataDistance (except DataDistanceMiles)', () => {
      expect(allDistanceTypes.length).toBeGreaterThan(0);
      allDistanceTypes.forEach(dataType => {
        expect(DynamicDataLoader.dataTypeUnitGroups[dataType]).toBeDefined();
        expect(DynamicDataLoader.dataTypeUnitGroups[dataType][DataDistanceMiles.type]).toBeDefined();
      });
    });

    it('returns miles unit type for all mapped distance-capable data types in imperial mode', () => {
      allDistanceTypes.forEach(dataType => {
        expect(DynamicDataLoader.getUnitBasedDataTypesFromDataType(dataType, imperialSettings)).toEqual([
          DataDistanceMiles.type
        ]);
      });
    });

    it('returns metric base type for all mapped distance-capable data types in metric mode', () => {
      allDistanceTypes.forEach(dataType => {
        expect(DynamicDataLoader.getUnitBasedDataTypesFromDataType(dataType, metricSettings)).toEqual([dataType]);
      });
    });

    it('defaults to metric when distanceUnits is missing', () => {
      expect(DynamicDataLoader.getUnitBasedDataTypesFromDataType(DataDistance.type, missingDistanceSettings)).toEqual([
        DataDistance.type
      ]);
      expect(
        DynamicDataLoader.getUnitBasedDataTypesFromDataType(DataJumpDistanceAvg.type, missingDistanceSettings)
      ).toEqual([DataJumpDistanceAvg.type]);
      expect(
        DynamicDataLoader.getUnitBasedDataTypesFromDataType(DataGNSSDistance.type, missingDistanceSettings)
      ).toEqual([DataGNSSDistance.type]);
    });

    it('includes distance-derived types from getUnitBasedDataTypesFromDataTypes based on distanceUnits', () => {
      expect(
        DynamicDataLoader.getUnitBasedDataTypesFromDataTypes(
          [DataDistance.type, DataJumpDistanceAvg.type, DataGNSSDistance.type, DataStepLength.type],
          imperialSettings
        )
      ).toEqual(expect.arrayContaining([DataDistanceMiles.type]));
      expect(
        DynamicDataLoader.getUnitBasedDataTypesFromDataTypes(
          [DataDistance.type, DataJumpDistanceAvg.type, DataGNSSDistance.type, DataStepLength.type],
          metricSettings
        )
      ).toEqual(
        expect.arrayContaining([
          DataDistance.type,
          DataJumpDistanceAvg.type,
          DataGNSSDistance.type,
          DataStepLength.type
        ])
      );
    });

    it('returns converted miles data instances for all mapped distance classes in imperial mode', () => {
      const distanceInstances = allDistanceTypes.map(dataType =>
        DynamicDataLoader.getDataInstanceFromDataType(dataType, 1609.344)
      );

      distanceInstances.forEach(distanceInstance => {
        const converted = DynamicDataLoader.getUnitBasedDataFromDataInstance(distanceInstance, imperialSettings);
        expect(converted).toHaveLength(1);
        expect(converted[0].getType()).toBe(DataDistanceMiles.type);
        expect(converted[0].getValue()).toBeCloseTo(convertMetersToMiles(1609.344), 10);
        expect(converted[0].getDisplayUnit()).toBe('mi');
      });
    });

    it('returns original metric data instances in metric mode and missing-distanceUnits fallback', () => {
      const metricInstances = allDistanceTypes.map(dataType =>
        DynamicDataLoader.getDataInstanceFromDataType(dataType, 1609.344)
      );

      metricInstances.forEach(instance => {
        const metricConverted = DynamicDataLoader.getUnitBasedDataFromDataInstance(instance, metricSettings);
        expect(metricConverted).toHaveLength(1);
        expect(metricConverted[0].getType()).toBe(instance.getType());

        const fallbackConverted = DynamicDataLoader.getUnitBasedDataFromDataInstance(instance, missingDistanceSettings);
        expect(fallbackConverted).toHaveLength(1);
        expect(fallbackConverted[0].getType()).toBe(instance.getType());
      });
    });
  });

  describe('jump speed unit conversion', () => {
    const mphSettings: any = {
      speedUnits: [DataSpeedMilesPerHour.type],
      swimPaceUnits: [],
      paceUnits: [],
      gradeAdjustedSpeedUnits: [],
      gradeAdjustedPaceUnits: [],
      verticalSpeedUnits: [],
      distanceUnits: DistanceUnits.Metric,
      elevationUnits: [],
      temperatureUnits: [],
      weightUnits: []
    };

    const metricSpeedSettings: any = {
      ...mphSettings,
      speedUnits: [DataSpeed.type]
    };

    it('maps jump speed avg/min/max to speed unit variant types for selected speed units', () => {
      expect(DynamicDataLoader.getUnitBasedDataTypesFromDataType(DataJumpSpeedAvg.type, mphSettings)).toEqual([
        DataJumpSpeedAvgMilesPerHour.type
      ]);
      expect(DynamicDataLoader.getUnitBasedDataTypesFromDataType(DataJumpSpeedMin.type, mphSettings)).toEqual([
        DataJumpSpeedMinMilesPerHour.type
      ]);
      expect(DynamicDataLoader.getUnitBasedDataTypesFromDataType(DataJumpSpeedMax.type, mphSettings)).toEqual([
        DataJumpSpeedMaxMilesPerHour.type
      ]);
    });

    it('keeps jump speed canonical types when selected speed unit is metric m/s', () => {
      expect(DynamicDataLoader.getUnitBasedDataTypesFromDataType(DataJumpSpeedAvg.type, metricSpeedSettings)).toEqual([
        DataJumpSpeedAvg.type
      ]);
      expect(DynamicDataLoader.getUnitBasedDataTypesFromDataType(DataJumpSpeedMin.type, metricSpeedSettings)).toEqual([
        DataJumpSpeedMin.type
      ]);
      expect(DynamicDataLoader.getUnitBasedDataTypesFromDataType(DataJumpSpeedMax.type, metricSpeedSettings)).toEqual([
        DataJumpSpeedMax.type
      ]);
    });

    it('returns converted jump speed data instances with selected speed unit display variants', () => {
      const convertedAvg = DynamicDataLoader.getUnitBasedDataFromDataInstance(new DataJumpSpeedAvg(5), mphSettings);
      const convertedMin = DynamicDataLoader.getUnitBasedDataFromDataInstance(new DataJumpSpeedMin(5), mphSettings);
      const convertedMax = DynamicDataLoader.getUnitBasedDataFromDataInstance(new DataJumpSpeedMax(5), mphSettings);

      expect(convertedAvg).toHaveLength(1);
      expect(convertedAvg[0].getType()).toBe(DataJumpSpeedAvgMilesPerHour.type);
      expect(convertedAvg[0].getValue()).toBeCloseTo(convertSpeedToSpeedInMilesPerHour(5), 10);
      expect(convertedAvg[0].getDisplayUnit()).toBe('mph');

      expect(convertedMin).toHaveLength(1);
      expect(convertedMin[0].getType()).toBe(DataJumpSpeedMinMilesPerHour.type);
      expect(convertedMin[0].getValue()).toBeCloseTo(convertSpeedToSpeedInMilesPerHour(5), 10);
      expect(convertedMin[0].getDisplayUnit()).toBe('mph');

      expect(convertedMax).toHaveLength(1);
      expect(convertedMax[0].getType()).toBe(DataJumpSpeedMaxMilesPerHour.type);
      expect(convertedMax[0].getValue()).toBeCloseTo(convertSpeedToSpeedInMilesPerHour(5), 10);
      expect(convertedMax[0].getDisplayUnit()).toBe('mph');
    });

    it('returns jump speed data instances for multiple selected speed units in order', () => {
      const multiSpeedSettings: any = {
        ...mphSettings,
        speedUnits: [DataSpeedMilesPerHour.type, DataSpeedKilometersPerHour.type]
      };

      const convertedAvg = DynamicDataLoader.getUnitBasedDataFromDataInstance(
        new DataJumpSpeedAvg(5),
        multiSpeedSettings
      );
      expect(convertedAvg).toHaveLength(2);
      expect(convertedAvg[0].getType()).toBe(DataJumpSpeedAvgMilesPerHour.type);
      expect(convertedAvg[1].getType()).toBe(DataJumpSpeedAvgKilometersPerHour.type);
      expect(convertedAvg[0].getDisplayUnit()).toBe('mph');
      expect(convertedAvg[1].getDisplayUnit()).toBe('km/h');
    });

    it('keeps jump speed derived variants distinct from regular speed derived variants', () => {
      const regularSpeedConverted = DynamicDataLoader.getUnitBasedDataFromDataInstance(
        new DataSpeedAvg(5),
        mphSettings
      );
      const jumpSpeedConverted = DynamicDataLoader.getUnitBasedDataFromDataInstance(
        new DataJumpSpeedAvg(5),
        mphSettings
      );

      expect(regularSpeedConverted).toHaveLength(1);
      expect(jumpSpeedConverted).toHaveLength(1);

      expect(regularSpeedConverted[0].getType()).toBe(DataSpeedAvgMilesPerHour.type);
      expect(jumpSpeedConverted[0].getType()).toBe(DataJumpSpeedAvgMilesPerHour.type);
      expect(regularSpeedConverted[0].getType()).not.toBe(jumpSpeedConverted[0].getType());
    });

    it('resolves jump speed unit-derived aliases to canonical unit types', () => {
      expect(DynamicDataLoader.getDataInstanceFromDataType('Jump Speed Avg in miles per hour', 5).getType()).toBe(
        DataJumpSpeedAvgMilesPerHour.type
      );
      expect(DynamicDataLoader.getDataInstanceFromDataType('Jump Speed Min in miles per hour', 5).getType()).toBe(
        DataJumpSpeedMinMilesPerHour.type
      );
      expect(DynamicDataLoader.getDataInstanceFromDataType('Jump Speed Max in miles per hour', 5).getType()).toBe(
        DataJumpSpeedMaxMilesPerHour.type
      );
    });
  });

  describe('effort pace unit conversion', () => {
    const paceSettings: any = {
      speedUnits: [],
      swimPaceUnits: [],
      paceUnits: [DataPace.type, DataPaceMinutesPerMile.type],
      gradeAdjustedSpeedUnits: [],
      gradeAdjustedPaceUnits: [],
      verticalSpeedUnits: [],
      distanceUnits: DistanceUnits.Metric,
      elevationUnits: [],
      temperatureUnits: [],
      weightUnits: []
    };

    it('maps effort pace family to pace-based unit variants', () => {
      expect(DynamicDataLoader.getUnitBasedDataTypesFromDataType(DataEffortPace.type, paceSettings)).toEqual([
        DataEffortPace.type,
        DataEffortPaceMinutesPerMile.type
      ]);
      expect(DynamicDataLoader.getUnitBasedDataTypesFromDataType(DataEffortPaceAvg.type, paceSettings)).toEqual([
        DataEffortPaceAvg.type,
        DataEffortPaceAvgMinutesPerMile.type
      ]);
      expect(DynamicDataLoader.getUnitBasedDataTypesFromDataType(DataEffortPaceMin.type, paceSettings)).toEqual([
        DataEffortPaceMin.type,
        DataEffortPaceMinMinutesPerMile.type
      ]);
      expect(DynamicDataLoader.getUnitBasedDataTypesFromDataType(DataEffortPaceMax.type, paceSettings)).toEqual([
        DataEffortPaceMax.type,
        DataEffortPaceMaxMinutesPerMile.type
      ]);
    });

    it('returns effort pace avg unit-based data instances using paceUnits', () => {
      const converted = DynamicDataLoader.getUnitBasedDataFromDataInstance(new DataEffortPaceAvg(300), paceSettings);

      expect(converted).toHaveLength(2);
      expect(converted[0].getType()).toBe(DataEffortPaceAvg.type);
      expect(converted[1].getType()).toBe(DataEffortPaceAvgMinutesPerMile.type);
      expect(converted[0].getDisplayUnit()).toBe('min/km');
      expect(converted[1].getDisplayUnit()).toBe('min/m');
    });
  });
});
