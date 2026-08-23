import { CreatorJSONInterface } from '../creators/creator.json.interface';
import { IntensityZonesJSONInterface } from '../intensity-zones/intensity-zones.json.interface';
import { LapJSONInterface } from '../laps/lap.json.interface';
import { DataJSONInterface } from '../data/data.json.interface';
import { StreamJSONInterface } from '../streams/stream';
import { ActivityTypes } from './activity.types';
import { SwimLengthJSONInterface } from '../swim-lengths/swim-length.json.interface';
import type { DiveSourceRecordsJSONInterface } from './dive-source-records';

export interface ActivityJSONInterface {
  id?: string;
  name: string | null;
  startDate: number;
  endDate: number;
  type: ActivityTypes;
  powerMeter: boolean;
  trainer: boolean;
  powerCurve?: DataJSONInterface | null;
  stats: DataJSONInterface;
  streams: StreamJSONInterface[] | { [key: string]: (number | null)[] };
  laps: LapJSONInterface[];
  swimLengths?: SwimLengthJSONInterface[];
  creator: CreatorJSONInterface;
  intensityZones: IntensityZonesJSONInterface[];
  events: DataJSONInterface[];
  /** Structured FIT gas and tank records, when the activity includes them. */
  diveSourceRecords?: DiveSourceRecordsJSONInterface;
}
