import { DeviceInterface } from "./device.interface";
import { DeviceJsonInterface } from "./device.json.interface";
export declare class Device implements DeviceInterface {
    type: string;
    name?: string;
    index?: number;
    batteryStatus?: string;
    batteryVoltage?: number;
    manufacturer?: string;
    serialNumber?: string;
    product?: number;
    swInfo?: string;
    hwInfo?: string;
    antDeviceNumber?: number;
    antTransmissionType?: number;
    antNetwork?: string;
    sourceType?: string;
    cumOperatingTime?: number;
    constructor(type: string);
    toJSON(): DeviceJsonInterface;
}
