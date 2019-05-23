import {DataJSONInterface} from '../data/data.json.interface';
import {Privacy} from '../privacy/privacy.class.interface';
import {MetaDataJsonInterface} from '../meta-data/meta-data.json.interface';

export interface EventJSONInterface {
  name: string,
  privacy: Privacy,
  startDate: string,
  endDate: string,
  stats: DataJSONInterface,
  metaData: MetaDataJsonInterface | null
}
