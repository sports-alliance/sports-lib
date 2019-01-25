import {
  DataVerticalSpeed, DataVerticalSpeedFeetPerHour, DataVerticalSpeedFeetPerMinute,
  DataVerticalSpeedFeetPerSecond, DataVerticalSpeedKilometerPerHour, DataVerticalSpeedMetersPerHour,
  DataVerticalSpeedMetersPerMinute, DataVerticalSpeedMilesPerHour
} from './data.vertical-speed';

export class DataVerticalSpeedMin extends DataVerticalSpeed {
  static type = 'Minimum Vertical Speed';
}

export class DataVerticalSpeedMinFeetPerSecond extends DataVerticalSpeedFeetPerSecond {
  static type = 'Minimum vertical speed in feet per second';
  static displayType = DataVerticalSpeedMin.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataVerticalSpeedMinMetersPerMinute extends DataVerticalSpeedMetersPerMinute {
  static type = 'Minimum vertical speed in meters per minute';
  static displayType = DataVerticalSpeedMin.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataVerticalSpeedMinFeetPerMinute extends DataVerticalSpeedFeetPerMinute {
  static type = 'Minimum vertical speed in feet per minute';
  static displayType = DataVerticalSpeedMin.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataVerticalSpeedMinMetersPerHour extends DataVerticalSpeedMetersPerHour {
  static type = 'Minimum vertical speed in meters per hour';
  static displayType = DataVerticalSpeedMin.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataVerticalSpeedMinFeetPerHour extends DataVerticalSpeedFeetPerHour {
  static type = 'Minimum vertical speed in feet per hour';
  static displayType = DataVerticalSpeedMin.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataVerticalSpeedMinKilometerPerHour extends DataVerticalSpeedKilometerPerHour {
  static type = 'Minimum vertical speed in kilometers per hour';
  static displayType = DataVerticalSpeedMin.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataVerticalSpeedMinMilesPerHour extends DataVerticalSpeedMilesPerHour {
  static type = 'Minimum vertical speed in miles per hour';
  static displayType = DataVerticalSpeedMin.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}
