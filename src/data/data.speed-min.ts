import {
  DataSpeed,
  DataSpeedFeetPerMinute,
  DataSpeedFeetPerSecond,
  DataSpeedKilometersPerHour,
  DataSpeedKnots,
  DataSpeedMetersPerMinute,
  DataSpeedMilesPerHour
} from './data.speed';

export class DataSpeedMin extends DataSpeed {
  static type = 'Minimum Speed';
}

export class DataSpeedMinKilometersPerHour extends DataSpeedKilometersPerHour {
  static type = 'Minimum speed in kilometers per hour';
  static displayType = DataSpeedMin.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedMinMilesPerHour extends DataSpeedMilesPerHour {
  static type = 'Minimum speed in miles per hour';
  static displayType = DataSpeedMin.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedMinFeetPerSecond extends DataSpeedFeetPerSecond {
  static type = 'Minimum speed in feet per second';
  static displayType = DataSpeedMin.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedMinMetersPerMinute extends DataSpeedMetersPerMinute {
  static type = 'Minimum speed in meters per minute';
  static displayType = DataSpeedMin.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedMinFeetPerMinute extends DataSpeedFeetPerMinute {
  static type = 'Minimum speed in feet per minute';
  static displayType = DataSpeedMin.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedMinKnots extends DataSpeedKnots {
  static type = 'Minimum speed in knot';
  static displayType = DataSpeedMin.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}
