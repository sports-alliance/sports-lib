export interface UserUnitSettingsInterface {
    speedUnits: SpeedUnits[];
    verticalSpeedUnits: VerticalSpeedUnits[];
    paceUnits: PaceUnits[];
    swimPaceUnits: SwimPaceUnits[];
    startOfTheWeek: DaysOfTheWeek;
}
export declare enum SpeedUnits {
    KilometersPerHour = "Speed in kilometers per hour",
    MilesPerHour = "Speed in miles per hour",
    MetersPerSecond = "Speed",
    FeetPerSecond = "Speed in feet per second"
}
export declare enum VerticalSpeedUnits {
    MetersPerSecond = "Vertical Speed",
    FeetPerSecond = "Vertical speed in feet per second",
    MetersPerMinute = "Vertical speed in meters per minute",
    FeetPerMinute = "Vertical speed in feet per minute",
    MetersPerHour = "Vertical speed in meters per hour",
    FeetPerHour = "Vertical speed in feet per hour",
    KilometersPerHour = "Vertical speed in kilometers per hour",
    MilesPerHour = "Vertical speed in miles per hour"
}
export declare enum PaceUnits {
    MinutesPerKilometer = "Pace",
    MinutesPerMile = "Pace in minutes per mile"
}
export declare enum SwimPaceUnits {
    MinutesPer100Meter = "Swim Pace",
    MinutesPer100Yard = "Swim Pace in minutes per 100 yard"
}
export declare enum DaysOfTheWeek {
    Sunday = 0,
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6
}
