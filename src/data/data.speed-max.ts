import {
  DataSpeed,
  DataSpeedFeetPerMinute,
  DataSpeedFeetPerSecond,
  DataSpeedKilometersPerHour,
  DataSpeedKnots,
  DataSpeedMetersPerMinute,
  DataSpeedMilesPerHour
} from './data.speed';

export class DataSpeedMax extends DataSpeed {
  static type = 'Maximum Speed';
}

export class DataSpeedMaxKilometersPerHour extends DataSpeedKilometersPerHour {
  static type = 'Maximum speed in kilometers per hour';
  static displayType = DataSpeedMax.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedMaxMilesPerHour extends DataSpeedMilesPerHour {
  static type = 'Maximum speed in miles per hour';
  static displayType = DataSpeedMax.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedMaxFeetPerSecond extends DataSpeedFeetPerSecond {
  static type = 'Maximum speed in feet per second';
  static displayType = DataSpeedMax.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedMaxMetersPerMinute extends DataSpeedMetersPerMinute {
  static type = 'Maximum speed in meters per minute';
  static displayType = DataSpeedMax.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedMaxFeetPerMinute extends DataSpeedFeetPerMinute {
  static type = 'Maximum speed in feet per minute';
  static displayType = DataSpeedMax.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedMaxKnots extends DataSpeedKnots {
  static type = 'Maximum speed in knots';
  static displayType = DataSpeedMax.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}
