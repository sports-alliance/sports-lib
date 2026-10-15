import { TimingValidity } from '../duration/timing-validity';
import { DataJSONInterface } from '../data/data.json.interface';

export interface LapJSONInterface {
  /** Rejected source timing, retained independently of usable values. */
  timingValidity?: TimingValidity;
  /** Source identifier, preserved by native JSON hydration when a nonnegative safe integer; not a row ordinal. */
  lapId: number;
  startDate: number;
  endDate: number;
  startIndex: number | null;
  endIndex: number | null;
  type: string;
  stats: DataJSONInterface;
}
