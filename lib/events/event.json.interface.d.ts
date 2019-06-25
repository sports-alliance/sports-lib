import { DataJSONInterface } from '../data/data.json.interface';
import { Privacy } from '../privacy/privacy.class.interface';
export interface EventJSONInterface {
    name: string;
    description: string | null;
    privacy: Privacy;
    startDate: number;
    endDate: number;
    stats: DataJSONInterface;
}
