import { CreatorJSONInterface } from '../creators/creator.json.interface';
import { IntensityZonesJSONInterface } from '../intensity-zones/intensity-zones.json.interface';
import { LapJSONInterface } from '../laps/lap.json.interface';
import { DataJSONInterface } from '../data/data.json.interface';
export interface ActivityJSONInterface {
    startDate: number;
    endDate: number;
    type: string;
    stats: DataJSONInterface;
    laps: LapJSONInterface[];
    creator: CreatorJSONInterface;
    intensityZones: IntensityZonesJSONInterface[];
}
