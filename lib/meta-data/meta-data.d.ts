import { MetaDataInterface, ServiceNames } from './meta-data.interface';
import { MetaDataJsonInterface } from './meta-data.json.interface';
export declare class MetaData implements MetaDataInterface {
    date: Date;
    id: string;
    serviceNames: ServiceNames;
    constructor(service: ServiceNames, id: string, date: Date);
    toJSON(): MetaDataJsonInterface;
}
