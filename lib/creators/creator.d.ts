import { CreatorInterface } from './creator.interface';
import { CreatorJSONInterface } from './creator.json.interface';
export declare class Creator implements CreatorInterface {
    name: string;
    swInfo?: string;
    hwInfo?: string;
    serialNumber?: string;
    constructor(name: string, swInfo?: string, hwInfo?: string, serialNumber?: string);
    toJSON(): CreatorJSONInterface;
}
