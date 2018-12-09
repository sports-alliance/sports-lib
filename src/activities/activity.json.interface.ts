import {Weather} from '../weather/app.weather';
import {GeoLocationInfo} from '../geo-location-info/geo-location-info';
import {CreatorJSONInterface} from '../creators/creator.json.interface';
import {IntensityZonesJSONInterface} from '../intensity-zones/intensity-zones.json.interface';
import {LapJSONInterface} from '../laps/lap.json.interface';

export interface ActivityJSONInterface {
  id: string;
  startDate: string;
  endDate: string;
  type: string;
  stats: { className: string, value: number }[];
  laps: LapJSONInterface[];
  creator: CreatorJSONInterface;
  intensityZones: IntensityZonesJSONInterface[];
  geoLocationInfo?: GeoLocationInfo;
  weather?: Weather;
}
