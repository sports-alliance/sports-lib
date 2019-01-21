import {
  DataSpeed, DataSpeedFeetPerMinute,
  DataSpeedFeetPerSecond,
  DataSpeedKilometersPerHour, DataSpeedMetersPerMinute,
  DataSpeedMetersPerSecond,
  DataSpeedMilesPerHour
} from './data.speed';

export class DataSpeedMax extends DataSpeed {
  static type = 'Maximum Speed';
}

export class DataSpeedMaxKilometersPerHour extends DataSpeedKilometersPerHour {
  static type = 'Maximum speed in kilometers per hour';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedMaxMilesPerHour extends DataSpeedMilesPerHour {
  static type = 'Maximum speed in miles per hour';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedMaxSpeedMetersPerSecond extends DataSpeedMetersPerSecond {
  static type = 'Maximum speed in meters per second';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedMaxFeetPerSecond extends DataSpeedFeetPerSecond {
  static type = 'Maximum speed in feet per second';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedMaxMetersPerMinute extends DataSpeedMetersPerMinute {
  static type = 'Maximum speed in meters per minute';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedMaxFeetPerMinute extends DataSpeedFeetPerMinute {
  static type = 'Maximum speed in feet per minute';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}
