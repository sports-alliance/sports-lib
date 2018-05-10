import { IBIData } from './data.ibi';
/**
 * Collection of filters parsers and converters for IBI (R-R) data
 */
export declare class IBIFilters {
    /**
     * A limit filter. It removes all values outside the limit
     * @param {IBIData} ibiData
     * @param {number} limit
     * @param {boolean} lowLimit
     */
    static limitFilter(ibiData: IBIData, limit: number, lowLimit: boolean): void;
    /**
     * Running median filter
     * @param {IBIData} ibiData
     * @param {number} windowSize
     */
    static movingMedianFilter(ibiData: IBIData, windowSize?: number): void;
    /**
     * Low pass filter
     * @param {IBIData} ibiData
     * @param {number} windowSize
     * @param linearWeight
     */
    static lowPassFilter(ibiData: IBIData, windowSize?: number, linearWeight?: boolean): void;
}
