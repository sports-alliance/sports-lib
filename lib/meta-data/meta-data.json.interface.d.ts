import { ServiceNames } from './meta-data.interface';
export interface MetaDataJsonInterface {
    serviceName: ServiceNames;
    serviceUserName: string;
    id: string;
    date: string;
}
