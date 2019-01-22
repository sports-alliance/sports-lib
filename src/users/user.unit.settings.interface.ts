
export interface UserUnitSettingsInterface{
  speedUnits: SpeedUnits[],
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


export enum PaceUnits {
  MinutesPerKilometer = 'Pace',
  MinutesPerMile = 'Pace in minutes per mile',
}
