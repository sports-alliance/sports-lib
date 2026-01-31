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
import { DataDistanceMiles } from './data.distance';

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
        distanceUnits: [],
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
        distanceUnits: [],
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
});
