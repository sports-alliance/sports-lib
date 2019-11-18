import {DataNumber} from './data.number';
import {
  convertSpeedToSpeedInFeetPerHour,
  convertSpeedToSpeedInFeetPerMinute,
  convertSpeedToSpeedInFeetPerSecond,
  convertSpeedToSpeedInKilometersPerHour, convertSpeedToSpeedInMetersPerHour, convertSpeedToSpeedInMetersPerMinute,
  convertSpeedToSpeedInMilesPerHour, isNumberOrString
} from '../events/utilities/helpers';

export class DataVerticalSpeed extends DataNumber {
  static type = 'Vertical Speed';
  static unit = 'm/s';

  getValue(formatForDataType?: string) {
    if (!isNumberOrString(formatForDataType)) {
      return super.getValue(formatForDataType);
    }
    switch (formatForDataType) {
      // Vertical speed cases conversions
      case this.getType():
        return this.value;
      case DataVerticalSpeedKilometerPerHour.type:
        return convertSpeedToSpeedInKilometersPerHour(this.value);
      case DataVerticalSpeedMilesPerHour.type:
        return convertSpeedToSpeedInMilesPerHour(this.value);
      case DataVerticalSpeedFeetPerSecond.type:
        return convertSpeedToSpeedInFeetPerSecond(this.value);
      case DataVerticalSpeedMetersPerMinute.type:
        return convertSpeedToSpeedInMetersPerMinute(this.value);
      case DataVerticalSpeedFeetPerMinute.type:
        return convertSpeedToSpeedInFeetPerMinute(this.value);
      case DataVerticalSpeedFeetPerHour.type:
        return convertSpeedToSpeedInFeetPerHour(this.value);
      case DataVerticalSpeedMetersPerHour.type:
        return convertSpeedToSpeedInMetersPerHour(this.value);
      default:
        throw new Error(`Not implemented for ${formatForDataType}`)
    }
  }

  getDisplayValue() {
    return this.getValue().toFixed(2);
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

