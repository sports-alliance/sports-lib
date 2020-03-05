import {
  convertPaceToPaceInMinutesPerMile,
  convertSpeedToPace,
  convertSpeedToSpeedInFeetPerMinute,
  convertSpeedToSpeedInFeetPerSecond,
  convertSpeedToSpeedInKilometersPerHour,
  convertSpeedToSpeedInMetersPerMinute,
  convertSpeedToSpeedInMilesPerHour,
} from '../events/utilities/helpers';
import { DataGradeAdjustedPace, DataGradeAdjustedPaceMinutesPerMile } from './data.grade-adjusted-pace';
import { DataSpeed } from './data.speed';

export class DataGradeAdjustedSpeed extends DataSpeed {
  static type = 'Grade Adjusted Speed';

  getValue(formatForDataType?: string): number {
    switch (formatForDataType) {
      // Speed cases conversions
      case DataGradeAdjustedSpeedKilometersPerHour.type:
        return convertSpeedToSpeedInKilometersPerHour(this.value);
      case DataGradeAdjustedSpeedMilesPerHour.type:
        return convertSpeedToSpeedInMilesPerHour(this.value);
      case DataGradeAdjustedSpeedFeetPerSecond.type:
        return convertSpeedToSpeedInFeetPerSecond(this.value);
      case DataGradeAdjustedSpeedMetersPerMinute.type:
        return convertSpeedToSpeedInMetersPerMinute(this.value);
      case DataGradeAdjustedSpeedFeetPerMinute.type:
        return convertSpeedToSpeedInFeetPerMinute(this.value);
      // Pace
      case DataGradeAdjustedPace.type:
        return convertSpeedToPace(this.value);
      case DataGradeAdjustedPaceMinutesPerMile.type:
        return convertPaceToPaceInMinutesPerMile(convertSpeedToPace(this.value));
      default:
        return super.getValue(formatForDataType);
    }
  }
}

export class DataGradeAdjustedSpeedKilometersPerHour extends DataGradeAdjustedSpeed {
  static type = 'Grade Adjusted Speed in kilometers per hour';
  static displayType = DataGradeAdjustedSpeed.type;
  static unit = 'km/h';

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataGradeAdjustedSpeedMilesPerHour extends DataGradeAdjustedSpeed {
  static type = 'Grade Adjusted Speed in miles per hour';
  static displayType = DataGradeAdjustedSpeed.type;
  static unit = 'mph';

  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataGradeAdjustedSpeedFeetPerSecond extends DataGradeAdjustedSpeed {
  static type = 'Grade Adjusted Speed in feet per second';
  static displayType = DataGradeAdjustedSpeed.type;
  static unit = 'ft/s';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataGradeAdjustedSpeedMetersPerMinute extends DataGradeAdjustedSpeed {
  static type = 'Grade Adjusted Speed in meters per minute';
  static displayType = DataGradeAdjustedSpeed.type;
  static unit = 'm/min';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}

export class DataGradeAdjustedSpeedFeetPerMinute extends DataGradeAdjustedSpeed {
  static type = 'Grade Adjusted Speed in feet per minute';
  static displayType = DataGradeAdjustedSpeed.type;
  static unit = 'ft/min';
  getDisplayType(): string {
    return super.getDisplayType();
  }
}
