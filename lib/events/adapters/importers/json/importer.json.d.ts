import { EventInterface } from '../../../event.interface';
import { IntensityZones } from '../../../../intensity-zones/intensity-zones';
import { ActivityInterface } from '../../../../activities/activity.interface';
import { EventJSONInterface } from '../../../event.json.interface';
import { CreatorJSONInterface } from '../../../../creators/creator.json.interface';
import { CreatorInterface } from '../../../../creators/creator.interface';
import { LapJSONInterface } from '../../../../laps/lap.json.interface';
import { LapInterface } from '../../../../laps/lap.interface';
import { ActivityJSONInterface } from '../../../../activities/activity.json.interface';
import { IntensityZonesJSONInterface } from '../../../../intensity-zones/intensity-zones.json.interface';
import { StreamInterface } from '../../../../streams/stream.interface';
import { StreamJSONInterface } from '../../../../streams/stream';
import { DeviceJsonInterface } from '../../../../activities/devices/device.json.interface';
import { DeviceInterface } from '../../../../activities/devices/device.interface';
export declare class EventImporterJSON {
    static getEventFromJSON(json: EventJSONInterface): EventInterface;
    static getCreatorFromJSON(json: CreatorJSONInterface): CreatorInterface;
    static getDeviceFromJSON(json: DeviceJsonInterface): DeviceInterface;
    static getLapFromJSON(json: LapJSONInterface): LapInterface;
    static getStreamFromJSON(json: StreamJSONInterface): StreamInterface;
    static getIntensityZonesFromJSON(json: IntensityZonesJSONInterface): IntensityZones;
    static getActivityFromJSON(json: ActivityJSONInterface): ActivityInterface;
}
