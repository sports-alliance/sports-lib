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
import { DataJumpDistanceAvg, DataJumpDistanceMax, DataJumpDistanceMin } from './data.jump-stats';
import { DataJumpDistance } from './data.jump-distance';
import { DataGNSSDistance } from './data.gnss-distance';
import { DataAutoLapDistance } from './data.auto-lap-distance';
import { DataAvgStrokeDistance } from './data.avg-stroke-distance';
import { DataAvgStrideLength } from './data.avg-stride-length';
import { DataStepLength } from './data.step-length';
import { DataTargetDistance } from './data.target-distance';
import { DataStrydDistance } from './data.stryd-distance';
import { convertMetersToMiles } from '../events/utilities/helpers';
import { DistanceUnits } from '../users/settings/user.unit.settings.interface';

describe('DataStore', () => {
  const unitDerivedDataTypes = [
    DataSpeedKilometersPerHour.type,
    DataSpeedMilesPerHour.type,
    DataSpeedFeetPerSecond.type,
    DataSpeedFeetPerMinute.type,
    DataSpeedMetersPerMinute.type,
    DataSpeedKnots.type,
    DataPaceMinutesPerMile.type,
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
    DataDistanceMiles.type
  ];

  const _speedDerivedDataTypes = [DataPace.type, DataGradeAdjustedPace.type, DataSwimPace.type];

  it('should get the correct unitbased datatypes', () => {
    // @todo here we should think
    expect(DynamicDataLoader.allUnitDerivedDataTypes.sort()).toEqual(unitDerivedDataTypes.sort());
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

    const allDistanceTypes = [
      DataDistance.type,
      DataJumpDistance.type,
      DataJumpDistanceAvg.type,
      DataJumpDistanceMin.type,
      DataJumpDistanceMax.type,
      DataGNSSDistance.type,
      DataAutoLapDistance.type,
      DataAvgStrokeDistance.type,
      DataAvgStrideLength.type,
      DataStepLength.type,
      DataTargetDistance.type,
      DataStrydDistance.type
    ];

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
      expect(DynamicDataLoader.getUnitBasedDataTypesFromDataType(DataJumpDistanceAvg.type, missingDistanceSettings)).toEqual([
        DataJumpDistanceAvg.type
      ]);
      expect(DynamicDataLoader.getUnitBasedDataTypesFromDataType(DataGNSSDistance.type, missingDistanceSettings)).toEqual([
        DataGNSSDistance.type
      ]);
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
      ).toEqual(expect.arrayContaining([DataDistance.type, DataJumpDistanceAvg.type, DataGNSSDistance.type, DataStepLength.type]));
    });

    it('returns converted miles data instances for all mapped distance classes in imperial mode', () => {
      const distanceInstances = [
        new DataDistance(1609.344),
        new DataJumpDistanceAvg(1609.344),
        new DataGNSSDistance(1609.344),
        new DataAutoLapDistance(1609.344),
        new DataAvgStrokeDistance(1609.344),
        new DataAvgStrideLength(1609.344),
        new DataStepLength(1609.344),
        new DataTargetDistance(1609.344),
        new DataStrydDistance(1609.344)
      ];

      distanceInstances.forEach(distanceInstance => {
        const converted = DynamicDataLoader.getUnitBasedDataFromDataInstance(distanceInstance, imperialSettings);
        expect(converted).toHaveLength(1);
        expect(converted[0].getType()).toBe(DataDistanceMiles.type);
        expect(converted[0].getValue()).toBeCloseTo(convertMetersToMiles(1609.344), 10);
        expect(converted[0].getDisplayUnit()).toBe('mi');
      });
    });

    it('returns original metric data instances in metric mode and missing-distanceUnits fallback', () => {
      const metricInstances = [
        new DataDistance(1609.344),
        new DataJumpDistanceAvg(1609.344),
        new DataGNSSDistance(1609.344),
        new DataAutoLapDistance(1609.344),
        new DataAvgStrokeDistance(1609.344),
        new DataAvgStrideLength(1609.344),
        new DataStepLength(1609.344),
        new DataTargetDistance(1609.344),
        new DataStrydDistance(1609.344)
      ];

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
});
