import {DataNumber} from './data.number';

export class DataSpeed extends DataNumber {
  static type = 'Speed';
  static unit = 'm/s';

  getDisplayValue() {
    return this.getValue().toFixed(2);
  }
}


export class DataSpeedKilometersPerHour extends DataSpeed {
  static type = 'Speed in kilometers per hour';
  static unit = 'km/h';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedMilesPerHour extends DataSpeed {
  static type = 'Speed in miles per hour';
  static unit = 'mph';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedMetersPerSecond extends DataSpeed {
  static type = 'Speed in meters per second';
  static unit = 'm/s';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedFeetPerSecond extends DataSpeed {
  static type = 'Speed in feet per second';
  static unit = 'ft/s';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedMetersPerMinute extends DataSpeed {
  static type = 'Speed in meters per minute';
  static unit = 'm/min';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedFeetPerMinute extends DataSpeed {
  static type = 'Speed in feet per minute';
  static unit = 'ft/min';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}
