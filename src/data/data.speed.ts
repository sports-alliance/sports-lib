import {DataNumber} from './data.number';
import {
  convertPaceToPaceInMinutesPerMile,
  convertSpeedToPace,
  convertSpeedToSpeedInFeetPerMinute,
  convertSpeedToSpeedInFeetPerSecond,
  convertSpeedToSpeedInKilometersPerHour,
  convertSpeedToSpeedInMetersPerMinute,
  convertSpeedToSpeedInMilesPerHour, convertSpeedToSwimPace, convertSwimPaceToSwimPacePer100Yard
} from '../events/utilities/helpers';
import {DataPace, DataPaceMinutesPerMile} from './data.pace';
import {DataSwimPace, DataSwimPaceMinutesPer100Yard} from './data.swim-pace';

export class DataSpeed extends DataNumber {
  static type = 'Speed';
  static unit = 'm/s';

  getDisplayValue() {
    return this.getValue().toFixed(2);
  }

  getValue(formatForDataType?: string): number {
    switch (formatForDataType) {
      // Speed cases conversions
      case DataSpeedKilometersPerHour.type:
        return convertSpeedToSpeedInKilometersPerHour(this.value);
      case DataSpeedMilesPerHour.type:
        return convertSpeedToSpeedInMilesPerHour(this.value);
      case DataSpeedFeetPerSecond.type:
        return convertSpeedToSpeedInFeetPerSecond(this.value);
      case DataSpeedMetersPerMinute.type:
        return convertSpeedToSpeedInMetersPerMinute(this.value);
      case DataSpeedFeetPerMinute.type:
        return convertSpeedToSpeedInFeetPerMinute(this.value);
      // Pace
      case DataPace.type:
        return convertSpeedToPace(this.value);
      case DataPaceMinutesPerMile.type:
        return convertPaceToPaceInMinutesPerMile(convertSpeedToPace(this.value));
      // Swim pace
      case DataSwimPace.type:
        return convertSpeedToSwimPace(this.value);
      case DataSwimPaceMinutesPer100Yard.type:
        return convertSwimPaceToSwimPacePer100Yard(convertSpeedToSwimPace(this.value));
      default:
        return super.getValue(formatForDataType);
    }
  }
}

export class DataSpeedKilometersPerHour extends DataSpeed {
  static type = 'Speed in kilometers per hour';
  static displayType = DataSpeed.type;

  static unit = 'km/h';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedMilesPerHour extends DataSpeed {
  static type = 'Speed in miles per hour';
  static displayType = DataSpeed.type;
  static unit = 'mph';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedFeetPerSecond extends DataSpeed {
  static type = 'Speed in feet per second';
  static displayType = DataSpeed.type;
  static unit = 'ft/s';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedMetersPerMinute extends DataSpeed {
  static type = 'Speed in meters per minute';
  static displayType = DataSpeed.type;
  static unit = 'm/min';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataSpeedFeetPerMinute extends DataSpeed {
  static type = 'Speed in feet per minute';
  static displayType = DataSpeed.type;
  static unit = 'ft/min';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}
