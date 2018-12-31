import {PrivacyClassInterface} from '../privacy/privacy.class.interface';

export interface UserInterface extends PrivacyClassInterface{
  uid: string;
  email?: string | null;
  photoURL?: string;
  displayName?: string;
}
