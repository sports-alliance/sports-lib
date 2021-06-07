import {
  DataGradeAdjustedSpeed,
  DataGradeAdjustedSpeedFeetPerMinute,
  DataGradeAdjustedSpeedFeetPerSecond,
  DataGradeAdjustedSpeedKilometersPerHour,
  DataGradeAdjustedSpeedKnots,
  DataGradeAdjustedSpeedMetersPerMinute,
  DataGradeAdjustedSpeedMilesPerHour
} from './data.grade-adjusted-speed';

export class DataGradeAdjustedSpeedAvg extends DataGradeAdjustedSpeed {
  static type = 'Average Grade Adjusted Speed';
}

export class DataGradeAdjustedSpeedAvgKilometersPerHour extends DataGradeAdjustedSpeedKilometersPerHour {
  static type = 'Average Grade Adjusted Speed in kilometers per hour';
  static displayType = DataGradeAdjustedSpeedAvg.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataGradeAdjustedSpeedAvgMilesPerHour extends DataGradeAdjustedSpeedMilesPerHour {
  static type = 'Average Grade Adjusted Speed in miles per hour';
  static displayType = DataGradeAdjustedSpeedAvg.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataGradeAdjustedSpeedAvgFeetPerSecond extends DataGradeAdjustedSpeedFeetPerSecond {
  static type = 'Average Grade Adjusted Speed in feet per second';
  static displayType = DataGradeAdjustedSpeedAvg.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataGradeAdjustedSpeedAvgMetersPerMinute extends DataGradeAdjustedSpeedMetersPerMinute {
  static type = 'Average Grade Adjusted Speed in meters per minute';
  static displayType = DataGradeAdjustedSpeedAvg.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataGradeAdjustedSpeedAvgFeetPerMinute extends DataGradeAdjustedSpeedFeetPerMinute {
  static type = 'Average Grade Adjusted Speed in feet per minute';
  static displayType = DataGradeAdjustedSpeedAvg.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataGradeAdjustedSpeedAvgKnots extends DataGradeAdjustedSpeedKnots {
  static type = 'Average Grade Adjusted Speed in knots';
  static displayType = DataGradeAdjustedSpeedAvg.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}
