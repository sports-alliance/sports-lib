import { DataJSONInterface } from '../data/data.json.interface';
import { Privacy } from '../privacy/privacy.class.interface';
export interface EventJSONInterface {
    name: string;
    privacy: Privacy;
    startDate: string;
    endDate: string;
    stats: DataJSONInterface;
}
