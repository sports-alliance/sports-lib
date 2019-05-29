import { DataJSONInterface } from '../data/data.json.interface';
export interface LapJSONInterface {
    startDate: number;
    endDate: number;
    type: string;
    stats: DataJSONInterface;
}
