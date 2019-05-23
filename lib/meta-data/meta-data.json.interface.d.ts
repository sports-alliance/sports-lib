import { ServiceNames } from './meta-data.interface';
export interface MetaDataJsonInterface {
    service: ServiceNames;
    id: string;
    date: string;
}
