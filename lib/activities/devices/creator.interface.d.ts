import { SerializableClassInterface } from '../serializable/serializable.class.interface';
import { CreatorJSONInterface } from './creator.json.interface';
export interface CreatorInterface extends SerializableClassInterface {
    name: string;
    serialNumber?: string;
    swInfo?: string;
    hwInfo?: string;
    toJSON(): CreatorJSONInterface;
}
