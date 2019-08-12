import {DataNumber} from './data.number';

export class DataVerticalSpeed extends DataNumber {
  static type = 'Vertical Speed';
  static unit = 'm/s';

  getDisplayValue() {
    return this.getValue().toFixed(3);
  }
}

export class DataVerticalSpeedFeetPerSecond extends DataVerticalSpeed {
  static type = 'Vertical speed in feet per second';
  static displayType = DataVerticalSpeed.type;

  static unit = 'ft/s';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataVerticalSpeedMetersPerMinute extends DataVerticalSpeed {
  static type = 'Vertical speed in meters per minute';
  static displayType = DataVerticalSpeed.type;

  static unit = 'm/min';
  getDisplayType(): string {
    return super.getDisplayType();
  }
  getDisplayValue() {
    return this.getValue().toFixed(1);
  }
}

export class DataVerticalSpeedFeetPerMinute extends DataVerticalSpeed {
  static type = 'Vertical speed in feet per minute';
  static displayType = DataVerticalSpeed.type;

  static unit = 'ft/min';
  getDisplayType(): string {
    return super.getDisplayType();
  }
  getDisplayValue() {
    return this.getValue().toFixed(1);
  }
}

export class DataVerticalSpeedMetersPerHour extends DataVerticalSpeed {
  static type = 'Vertical speed in meters per hour';
  static displayType = DataVerticalSpeed.type;

  static unit = 'm/h';
  getDisplayType(): string {
    return super.getDisplayType();
  }
  getDisplayValue() {
    return this.getValue().toFixed(0);
  }
}

export class DataVerticalSpeedFeetPerHour extends DataVerticalSpeed {
  static type = 'Vertical speed in feet per hour';
  static displayType = DataVerticalSpeed.type;

  static unit = 'ft/h';
  getDisplayType(): string {
    return super.getDisplayType();
  }
  getDisplayValue() {
    return this.getValue().toFixed(0);
  }
}


export class DataVerticalSpeedKilometerPerHour extends DataVerticalSpeed {
  static type = 'Vertical speed in kilometers per hour';
  static displayType = DataVerticalSpeed.type;

  static unit = 'km/h';
  getDisplayType(): string {
    return super.getDisplayType();
  }
  getDisplayValue() {
    return this.getValue().toFixed(2);
  }
}

export class DataVerticalSpeedMilesPerHour extends DataVerticalSpeed {
  static type = 'Vertical speed in miles per hour';
  static displayType = DataVerticalSpeed.type;

  static unit = 'mph';
  getDisplayType(): string {
    return super.getDisplayType();
  }
  getDisplayValue() {
    return this.getValue().toFixed(2);
  }
}

