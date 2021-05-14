import {
  DataVerticalSpeed,
  DataVerticalSpeedFeetPerHour,
  DataVerticalSpeedFeetPerMinute,
  DataVerticalSpeedFeetPerSecond,
  DataVerticalSpeedKilometerPerHour,
  DataVerticalSpeedMetersPerHour,
  DataVerticalSpeedMetersPerMinute,
  DataVerticalSpeedMilesPerHour
} from './data.vertical-speed';

export class DataVerticalSpeedAvg extends DataVerticalSpeed {
  static type = 'Average Vertical Speed';
}

export class DataVerticalSpeedAvgFeetPerSecond extends DataVerticalSpeedFeetPerSecond {
  static type = 'Average vertical speed in feet per second';
  static displayType = DataVerticalSpeedAvg.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataVerticalSpeedAvgMetersPerMinute extends DataVerticalSpeedMetersPerMinute {
  static type = 'Average vertical speed in meters per minute';
  static displayType = DataVerticalSpeedAvg.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataVerticalSpeedAvgFeetPerMinute extends DataVerticalSpeedFeetPerMinute {
  static type = 'Average vertical speed in feet per minute';
  static displayType = DataVerticalSpeedAvg.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataVerticalSpeedAvgMetersPerHour extends DataVerticalSpeedMetersPerHour {
  static type = 'Average vertical speed in meters per hour';
  static displayType = DataVerticalSpeedAvg.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataVerticalSpeedAvgFeetPerHour extends DataVerticalSpeedFeetPerHour {
  static type = 'Average vertical speed in feet per hour';
  static displayType = DataVerticalSpeedAvg.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataVerticalSpeedAvgKilometerPerHour extends DataVerticalSpeedKilometerPerHour {
  static type = 'Average vertical speed in kilometers per hour';
  static displayType = DataVerticalSpeedAvg.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataVerticalSpeedAvgMilesPerHour extends DataVerticalSpeedMilesPerHour {
  static type = 'Average vertical speed in miles per hour';
  static displayType = DataVerticalSpeedAvg.type;

  getDisplayType(): string {
    return super.getDisplayType();
  }
}
