import { SerializableClassInterface } from '../serializable/serializable.class.interface';
import { MetaDataJsonInterface } from './meta-data.json.interface';
export interface MetaDataInterface extends SerializableClassInterface {
    serviceNames: ServiceNames;
    id: string;
    date: Date;
    toJSON(): MetaDataJsonInterface;
}
export declare enum ServiceNames {
    SuuntoApp = "suuntoApp"
}
