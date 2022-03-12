import { DataJSONInterface } from '../data/data.json.interface';

export interface LapJSONInterface {
  lapId: number;
  startDate: number;
  endDate: number;
  startIndex: number | null;
  endIndex: number | null;
  type: string;
  stats: DataJSONInterface;
}
