import { SerializableClassInterface } from '../../serializable/serializable.class.interface';
export declare class IBIData implements SerializableClassInterface {
    static type: string;
    /**
     * Key is time time since start of the array
     * value is the ibi
     * @type {Map<number, number>}
     */
    private ibiDataMap;
    constructor(ibiDataArray?: Array<number>);
    /**
     * Parses an IBI data array
     * eg: [600, 600, 100] becomes a map of {600:600, 1200: 600, 1300:100}
     * @param {Array<number>} ibiArray
     */
    parseIBIArray(ibiArray: Array<number>): void;
    /**
     * Sets the ibi for the specific time
     * @param time
     * @param ibi
     */
    setIBI(time: number, ibi: number): void;
    /**
     * Gets the IBI data map
     * @return {Map<number, number>}
     */
    getIBIDataMap(): Map<number, number>;
    /**
     * Gets the IBI data map but uses BPM units instead of IBI
     * @return {Map<number, number>}
     */
    getAsBPM(): Map<number, number>;
    getAsArray(): number[];
    /**
     * Low Limit filter. Removes all hr values above limit
     * @param {number} bpmLowLimit in BPM
     */
    lowLimitBPMFilter(bpmLowLimit?: number): IBIData;
    /**
     * High limit filter. Removes all hr values above limit
     * @param bpmHighLimit
     */
    highLimitBPMFilter(bpmHighLimit?: number): IBIData;
    /**
     *  Low pass filter
     * @param windowSize
     */
    lowPassFilter(windowSize?: number): IBIData;
    /**
     * Moving median filter
     * @param {number} windowSize
     * @return {this}
     */
    movingMedianFilter(windowSize?: number): this;
    toJSON(): any;
}
