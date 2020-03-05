import {
  DataGradeAdjustedSpeed,
  DataGradeAdjustedSpeedFeetPerMinute, DataGradeAdjustedSpeedFeetPerSecond,
  DataGradeAdjustedSpeedKilometersPerHour, DataGradeAdjustedSpeedMetersPerMinute, DataGradeAdjustedSpeedMilesPerHour
} from './data.grade-adjusted-speed';

export class DataGradeAdjustedSpeedMin extends DataGradeAdjustedSpeed {
  static type = 'Minimum Grade Adjusted Speed';
}

export class DataGradeAdjustedSpeedMinKilometersPerHour extends DataGradeAdjustedSpeedKilometersPerHour {
  static type = 'Minimum Grade Adjusted Speed in kilometers per hour';
  static displayType = DataGradeAdjustedSpeedMin.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataGradeAdjustedSpeedMinMilesPerHour extends DataGradeAdjustedSpeedMilesPerHour {
  static type = 'Minimum Grade Adjusted Speed in miles per hour';
  static displayType = DataGradeAdjustedSpeedMin.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataGradeAdjustedSpeedMinFeetPerSecond extends DataGradeAdjustedSpeedFeetPerSecond {
  static type = 'Minimum Grade Adjusted Speed in feet per second';
  static displayType = DataGradeAdjustedSpeedMin.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataGradeAdjustedSpeedMinMetersPerMinute extends DataGradeAdjustedSpeedMetersPerMinute {
  static type = 'Minimum Grade Adjusted Speed in meters per minute';
  static displayType = DataGradeAdjustedSpeedMin.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataGradeAdjustedSpeedMinFeetPerMinute extends DataGradeAdjustedSpeedFeetPerMinute {
  static type = 'Minimum Grade Adjusted Speed in feet per minute';
  static displayType = DataGradeAdjustedSpeedMin.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}
