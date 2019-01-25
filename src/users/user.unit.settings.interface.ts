
export interface UserUnitSettingsInterface{
  speedUnits: SpeedUnits[],
  verticalSpeedUnits: VerticalSpeedUnits[],
  paceUnits: PaceUnits[],
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
