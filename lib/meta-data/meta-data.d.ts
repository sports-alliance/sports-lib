import { MetaDataInterface, ServiceNames } from './meta-data.interface';
import { MetaDataJsonInterface } from './meta-data.json.interface';
export declare class MetaData implements MetaDataInterface {
    date: Date;
    id: string;
    serviceName: ServiceNames;
    serviceUser: string;
    constructor(service: ServiceNames, id: string, serviceUser: string, date: Date);
    toJSON(): MetaDataJsonInterface;
}
