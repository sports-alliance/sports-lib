import { CreatorInterface } from './creator.interface';
import { CreatorJSONInterface } from './creator.json.interface';
import { DeviceInterface } from '../activities/devices/device.interface';
export declare class Creator implements CreatorInterface {
    name: string;
    swInfo?: string;
    hwInfo?: string;
    serialNumber?: string;
    devices: DeviceInterface[];
    constructor(name: string, swInfo?: string, hwInfo?: string, serialNumber?: string);
    toJSON(): CreatorJSONInterface;
}
