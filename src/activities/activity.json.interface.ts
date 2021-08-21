import { CreatorJSONInterface } from '../creators/creator.json.interface';
import { IntensityZonesJSONInterface } from '../intensity-zones/intensity-zones.json.interface';
import { LapJSONInterface } from '../laps/lap.json.interface';
import { DataJSONInterface } from '../data/data.json.interface';
import { StreamJSONInterface } from '../streams/stream';
import { ActivityTypes } from './activity.types';

export interface ActivityJSONInterface {
  id?: string;
  name: string | null;
  startDate: number;
  endDate: number;
  type: ActivityTypes;
  powerMeter: boolean;
  trainer: boolean;
  stats: DataJSONInterface;
  streams: StreamJSONInterface[];
  laps: LapJSONInterface[];
  creator: CreatorJSONInterface;
  intensityZones: IntensityZonesJSONInterface[];
  events: DataJSONInterface[];
}
