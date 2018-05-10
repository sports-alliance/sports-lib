import { LapInterface } from './lap.interface';
import { DurationClassAbstract } from '../duration/duration.class.abstract';
import { LapTypes } from './lap.types';
export declare class Lap extends DurationClassAbstract implements LapInterface {
    type: LapTypes;
    constructor(startDate: Date, endDate: Date, type: LapTypes);
    toJSON(): any;
}
