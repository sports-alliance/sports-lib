import { DataJSONInterface } from '../data/data.json.interface';
import { Privacy } from '../privacy/privacy.class.interface';
import { ActivityJSONInterface } from '../activities/activity.json.interface';
import { FileType } from './adapters/file-type.enum';

export interface EventJSONInterface {
  id?: string;
  name: string;
  srcFileType: FileType;
  description: string | null;
  isMerge: boolean;
  privacy: Privacy;
  startDate: number;
  endDate: number;
  stats: DataJSONInterface;
  activities: ActivityJSONInterface[];
}
