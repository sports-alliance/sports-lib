export interface DeviceJsonInterface {
    type: string;
    name: string | null;
    index: number | null;
    batteryStatus: string | null;
    batteryVoltage: number | null;
    manufacturer: string | null;
    serialNumber: string | null;
    product: number | null;
    swInfo: string | null;
    hwInfo: string | null;
    antDeviceNumber: number | null;
    antTransmissionType: number | null;
    antNetwork: string | null;
    sourceType: string | null;
    cumOperatingTime: number | null;
}
