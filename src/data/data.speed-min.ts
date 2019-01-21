import {
  DataSpeed, DataSpeedFeetPerMinute,
  DataSpeedFeetPerSecond,
  DataSpeedKilometersPerHour, DataSpeedMetersPerMinute,
  DataSpeedMetersPerSecond,
  DataSpeedMilesPerHour
} from './data.speed';

export class DataSpeedMin extends DataSpeed {
  static type = 'Minimum Speed';
}

export class DataSpeedMinKilometersPerHour extends DataSpeedKilometersPerHour {
  static type = 'Minimum speed in kilometers per hour';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedMinMilesPerHour extends DataSpeedMilesPerHour {
  static type = 'Minimum speed in miles per hour';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedMinSpeedMetersPerSecond extends DataSpeedMetersPerSecond {
  static type = 'Minimum speed in meters per second';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedMinFeetPerSecond extends DataSpeedFeetPerSecond {
  static type = 'Minimum speed in feet per second';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedMinMetersPerMinute extends DataSpeedMetersPerMinute {
  static type = 'Minimum speed in meters per minute';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedMinFeetPerMinute extends DataSpeedFeetPerMinute {
  static type = 'Minimum speed in feet per minute';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}
