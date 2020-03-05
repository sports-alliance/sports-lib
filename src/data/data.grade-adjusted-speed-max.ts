import {
  DataGradeAdjustedSpeed,
  DataGradeAdjustedSpeedFeetPerMinute, DataGradeAdjustedSpeedFeetPerSecond, DataGradeAdjustedSpeedKilometersPerHour,
  DataGradeAdjustedSpeedMetersPerMinute, DataGradeAdjustedSpeedMilesPerHour
} from './data.grade-adjusted-speed';

export class DataGradeAdjustedSpeedMax extends DataGradeAdjustedSpeed {
  static type = 'Maximum Grade Adjusted Speed';
}

export class DataGradeAdjustedSpeedMaxKilometersPerHour extends DataGradeAdjustedSpeedKilometersPerHour {
  static type = 'Maximum Grade Adjusted Speed in kilometers per hour';
  static displayType = DataGradeAdjustedSpeedMax.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataGradeAdjustedSpeedMaxMilesPerHour extends DataGradeAdjustedSpeedMilesPerHour {
  static type = 'Maximum Grade Adjusted Speed in miles per hour';
  static displayType = DataGradeAdjustedSpeedMax.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataGradeAdjustedSpeedMaxFeetPerSecond extends DataGradeAdjustedSpeedFeetPerSecond {
  static type = 'Maximum Grade Adjusted Speed in feet per second';
  static displayType = DataGradeAdjustedSpeedMax.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataGradeAdjustedSpeedMaxMetersPerMinute extends DataGradeAdjustedSpeedMetersPerMinute {
  static type = 'Maximum Grade Adjusted Speed in meters per minute';
  static displayType = DataGradeAdjustedSpeedMax.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataGradeAdjustedSpeedMaxFeetPerMinute extends DataGradeAdjustedSpeedFeetPerMinute {
  static type = 'Maximum Grade Adjusted Speed in feet per minute';
  static displayType = DataGradeAdjustedSpeedMax.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}
