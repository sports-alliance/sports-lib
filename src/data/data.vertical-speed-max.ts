import {
  DataVerticalSpeed, DataVerticalSpeedFeetPerHour, DataVerticalSpeedFeetPerMinute,
  DataVerticalSpeedFeetPerSecond, DataVerticalSpeedKilometerPerHour, DataVerticalSpeedMetersPerHour,
  DataVerticalSpeedMetersPerMinute, DataVerticalSpeedMilesPerHour
} from './data.vertical-speed';

export class DataVerticalSpeedMax extends DataVerticalSpeed {
  static type = 'Maximum Vertical Speed';
}

export class DataVerticalSpeedMaxFeetPerSecond extends DataVerticalSpeedFeetPerSecond {
  static type = 'Maximum vertical speed in feet per second';
  static displayType = DataVerticalSpeedMax.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataVerticalSpeedMaxMetersPerMinute extends DataVerticalSpeedMetersPerMinute {
  static type = 'Maximum vertical speed in meters per minute';
  static displayType = DataVerticalSpeedMax.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataVerticalSpeedMaxFeetPerMinute extends DataVerticalSpeedFeetPerMinute {
  static type = 'Maximum vertical speed in feet per minute';
  static displayType = DataVerticalSpeedMax.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataVerticalSpeedMaxMetersPerHour extends DataVerticalSpeedMetersPerHour {
  static type = 'Maximum vertical speed in meters per hour';
  static displayType = DataVerticalSpeedMax.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataVerticalSpeedMaxFeetPerHour extends DataVerticalSpeedFeetPerHour {
  static type = 'Maximum vertical speed in feet per hour';
  static displayType = DataVerticalSpeedMax.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataVerticalSpeedMaxKilometerPerHour extends DataVerticalSpeedKilometerPerHour {
  static type = 'Maximum vertical speed in kilometers per hour';
  static displayType = DataVerticalSpeedMax.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataVerticalSpeedMaxMilesPerHour extends DataVerticalSpeedMilesPerHour {
  static type = 'Maximum vertical speed in miles per hour';
  static displayType = DataVerticalSpeedMax.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}
