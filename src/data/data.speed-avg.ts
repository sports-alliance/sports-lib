import {
  DataSpeed, DataSpeedFeetPerMinute,
  DataSpeedFeetPerSecond,
  DataSpeedKilometersPerHour, DataSpeedMetersPerMinute,
  DataSpeedMetersPerSecond,
  DataSpeedMilesPerHour
} from './data.speed';

export class DataSpeedAvg extends DataSpeed {
  static type = 'Average Speed';
}

export class DataSpeedAvgKilometersPerHour extends DataSpeedKilometersPerHour {
  static type = 'Average speed in kilometers per hour';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedAvgMilesPerHour extends DataSpeedMilesPerHour {
  static type = 'Average speed in miles per hour';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedAvgSpeedMetersPerSecond extends DataSpeedMetersPerSecond {
  static type = 'Average speed in meters per second';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedAvgFeetPerSecond extends DataSpeedFeetPerSecond {
  static type = 'Average speed in feet per second';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedAvgMetersPerMinute extends DataSpeedMetersPerMinute {
  static type = 'Average speed in meters per minute';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedAvgFeetPerMinute extends DataSpeedFeetPerMinute {
  static type = 'Average speed in feet per minute';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}
