import { ServiceNames } from './meta-data.interface';
export interface MetaDataJsonInterface {
    serviceName: ServiceNames;
    serviceUser: string;
    id: string;
    date: string;
}
