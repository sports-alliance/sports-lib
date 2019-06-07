import { DataJSONInterface } from '../data/data.json.interface';
import { Privacy } from '../privacy/privacy.class.interface';
import { MetaDataJsonInterface } from '../meta-data/meta-data.json.interface';
export interface EventJSONInterface {
    name: string;
    description: string | null;
    privacy: Privacy;
    startDate: number;
    endDate: number;
    stats: DataJSONInterface;
    metaData: MetaDataJsonInterface | null;
}
