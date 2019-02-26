import { LapInterface } from './lap.interface';
import { DurationClassAbstract } from '../duration/duration.class.abstract';
import { LapTypes } from './lap.types';
import { LapJSONInterface } from './lap.json.interface';
export declare class Lap extends DurationClassAbstract implements LapInterface {
    type: LapTypes;
    constructor(startDate: Date, endDate: Date, type: LapTypes);
    toJSON(): LapJSONInterface;
}
