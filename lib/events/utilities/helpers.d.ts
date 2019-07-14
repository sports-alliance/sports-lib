export declare function isNumberOrString(property: any): boolean;
export declare function isNumber(property: any): boolean;
/**
 * Converts speed from m/s to pace as of seconds per km
 * @param {number} number
 * @return {number}
 */
export declare function convertSpeedToPace(number: number): number;
/**
 * Converts m/s to seconds per 100m
 * @param number
 */
export declare function convertSpeedToSwimPace(number: number): number;
export declare function convertSpeedToSpeedInKilometersPerHour(number: number): number;
export declare function convertSpeedToSpeedInMilesPerHour(number: number): number;
export declare function convertSpeedToSpeedInFeetPerSecond(number: number): number;
export declare function convertSpeedToSpeedInMetersPerMinute(number: number): number;
export declare function convertSpeedToSpeedInFeetPerMinute(number: number): number;
export declare function convertSpeedToSpeedInFeetPerHour(number: number): number;
export declare function convertSpeedToSpeedInMetersPerHour(number: number): number;
export declare function convertPaceToPaceInMinutesPerMile(number: number): number;
/**
 * Converts m/s to seconds per 100m
 * @param number
 */
export declare function convertSwimPaceToSwimPacePer100Yard(number: number): number;
export declare function getSize(obj: any): string;
