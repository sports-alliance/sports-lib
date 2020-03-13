import {
  DataSpeedFeetPerMinute,
  DataSpeedFeetPerSecond,
  DataSpeedKilometersPerHour, DataSpeedMetersPerMinute,
  DataSpeedMilesPerHour
} from './data.speed';
import { DataPace, DataPaceMinutesPerMile } from './data.pace';
import { DataSwimPace, DataSwimPaceMinutesPer100Yard } from './data.swim-pace';
import {
  DataGradeAdjustedSpeedFeetPerMinute, DataGradeAdjustedSpeedFeetPerSecond,
  DataGradeAdjustedSpeedKilometersPerHour, DataGradeAdjustedSpeedMetersPerMinute,
  DataGradeAdjustedSpeedMilesPerHour
} from './data.grade-adjusted-speed';
import { DataGradeAdjustedPace, DataGradeAdjustedPaceMinutesPerMile } from './data.grade-adjusted-pace';
import {
  DataVerticalSpeedFeetPerHour, DataVerticalSpeedFeetPerMinute,
  DataVerticalSpeedFeetPerSecond, DataVerticalSpeedKilometerPerHour, DataVerticalSpeedMetersPerHour,
  DataVerticalSpeedMetersPerMinute, DataVerticalSpeedMilesPerHour
} from './data.vertical-speed';
import { DataStore, DynamicDataLoader } from './data.store';

describe('DataStore', () => {


  const unitDerivedDataTypes = [
    DataSpeedKilometersPerHour.type,
    DataSpeedMilesPerHour.type,
    DataSpeedFeetPerSecond.type,
    DataSpeedFeetPerMinute.type,
    DataSpeedMetersPerMinute.type,
    DataPaceMinutesPerMile.type,
    DataSwimPaceMinutesPer100Yard.type,
    DataGradeAdjustedSpeedKilometersPerHour.type,
    DataGradeAdjustedSpeedMilesPerHour.type,
    DataGradeAdjustedSpeedFeetPerSecond.type,
    DataGradeAdjustedSpeedFeetPerMinute.type,
    DataGradeAdjustedSpeedMetersPerMinute.type,
    DataGradeAdjustedPaceMinutesPerMile.type,
    DataVerticalSpeedFeetPerSecond.type,
    DataVerticalSpeedMetersPerMinute.type,
    DataVerticalSpeedFeetPerMinute.type,
    DataVerticalSpeedMetersPerHour.type,
    DataVerticalSpeedFeetPerHour.type,
    DataVerticalSpeedKilometerPerHour.type,
    DataVerticalSpeedMilesPerHour.type,
  ];

  const speedDerivedDataTypes = [
    DataPace.type,
    DataGradeAdjustedPace.type,
    DataSwimPace.type,
  ]

  it('should get the correct unitbased datatypes', () => {
    // @todo here we should think
    expect(DynamicDataLoader.allUnitDerivedDataTypes.sort()).toEqual(unitDerivedDataTypes.sort())
  });

});
