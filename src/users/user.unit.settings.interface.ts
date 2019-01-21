
export interface UserUnitSettingsInterface{
  speedSettings: SpeedUnits[],
  paceSettings: PaceUnits[],
}


export enum SpeedUnits {
  KilometersPerHour = 'Kilometers per hour',
  MilesPerHour = 'Miles per hour',
  MetersPerSecond = 'Meters per second',
  FeetPerSecond = 'Feet per second',
  MetersPerMinute = 'Meters per minute',
  FeetPerMinute = 'Feet per minute',
}


export enum PaceUnits {
  MinutesPerKilometer = 'Minutes per kilometer',
  MinutesPerMile = 'Minutes per mile',
}
