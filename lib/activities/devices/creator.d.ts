import { DeviceInterface } from './creator.interface';
import { DeviceJsonInterface } from './creator.json.interface';
export declare class Creator implements DeviceInterface {
    name: string;
    swInfo?: string;
    hwInfo?: string;
    serialNumber?: string;
    constructor(name: string, swInfo?: string, hwInfo?: string, serialNumber?: string);
    toJSON(): DeviceJsonInterface;
}
