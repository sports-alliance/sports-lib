import {PrivacyClassInterface} from '../privacy/privacy.class.interface';
import {SerializableClassInterface} from '../serializable/serializable.class.interface';

export interface UserInterface extends PrivacyClassInterface, SerializableClassInterface{
  uid: string;
  email?: string | null;
  photoURL?: string;
  displayName?: string;
  description?: string;
}
