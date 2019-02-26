export interface UserUnitSettingsInterface {
    speedUnits: SpeedUnits[];
    verticalSpeedUnits: VerticalSpeedUnits[];
    paceUnits: PaceUnits[];
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
