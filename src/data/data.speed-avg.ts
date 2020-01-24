import {
  DataSpeed,
  DataSpeedFeetPerMinute,
  DataSpeedFeetPerSecond,
  DataSpeedKilometersPerHour,
  DataSpeedMetersPerMinute,
  DataSpeedMilesPerHour
} from './data.speed';

export class DataSpeedAvg extends DataSpeed {
  static type = 'Average Speed';
}

export class DataSpeedAvgKilometersPerHour extends DataSpeedKilometersPerHour {
  static type = 'Average speed in kilometers per hour';
  static displayType = DataSpeedAvg.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedAvgMilesPerHour extends DataSpeedMilesPerHour {
  static type = 'Average speed in miles per hour';
  static displayType = DataSpeedAvg.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedAvgFeetPerSecond extends DataSpeedFeetPerSecond {
  static type = 'Average speed in feet per second';
  static displayType = DataSpeedAvg.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedAvgMetersPerMinute extends DataSpeedMetersPerMinute {
  static type = 'Average speed in meters per minute';
  static displayType = DataSpeedAvg.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedAvgFeetPerMinute extends DataSpeedFeetPerMinute {
  static type = 'Average speed in feet per minute';
  static displayType = DataSpeedAvg.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}
