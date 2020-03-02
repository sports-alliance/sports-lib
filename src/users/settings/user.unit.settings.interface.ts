export interface UserUnitSettingsInterface {
  speedUnits: SpeedUnits[],
  gradeAdjustedSpeedUnits: GradeAdjustedSpeedUnits[],
  verticalSpeedUnits: VerticalSpeedUnits[],
  paceUnits: PaceUnits[],
  gradeAdjustedPaceUnits: PaceUnits[],
  swimPaceUnits: SwimPaceUnits[],
  startOfTheWeek: DaysOfTheWeek,
}

export enum GradeAdjustedSpeedUnits {
  KilometersPerHour = 'Grade Adjusted Speed in kilometers per hour',
  MilesPerHour = 'Grade Adjusted Speed in miles per hour',
  MetersPerSecond = 'Grade Adjusted Speed',
  FeetPerSecond = 'Grade Adjusted Speed in feet per second',
  // MetersPerMinute = 'Meters per minute',
  // FeetPerMinute = 'Feet per minute',
}

export enum SpeedUnits {
  KilometersPerHour = 'Speed in kilometers per hour',
  MilesPerHour = 'Speed in miles per hour',
  MetersPerSecond = 'Speed',
  FeetPerSecond = 'Speed in feet per second',
  // MetersPerMinute = 'Meters per minute',
  // FeetPerMinute = 'Feet per minute',
}

export enum VerticalSpeedUnits {
  MetersPerSecond = 'Vertical Speed',
  FeetPerSecond = 'Vertical speed in feet per second',
  MetersPerMinute = 'Vertical speed in meters per minute',
  FeetPerMinute = 'Vertical speed in feet per minute',
  MetersPerHour = 'Vertical speed in meters per hour',
  FeetPerHour = 'Vertical speed in feet per hour',
  KilometersPerHour = 'Vertical speed in kilometers per hour',
  MilesPerHour = 'Vertical speed in miles per hour',

}

export enum PaceUnits {
  MinutesPerKilometer = 'Pace',
  MinutesPerMile = 'Pace in minutes per mile',
}

export enum GradeAdjustedPaceUnits {
  MinutesPerKilometer = 'Grade Adjusted Pace',
  MinutesPerMile = 'Grade Adjusted Pace in minutes per mile',
}

export enum SwimPaceUnits {
  MinutesPer100Meter = 'Swim Pace',
  MinutesPer100Yard = 'Swim Pace in minutes per 100 yard',
}

export enum DaysOfTheWeek {
  Sunday,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
}
