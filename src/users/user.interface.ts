import {PrivacyClassInterface} from '../privacy/privacy.class.interface';
import {SerializableClassInterface} from '../serializable/serializable.class.interface';
import {UserSettingsInterface} from './user.settings.interface';

export interface UserInterface extends PrivacyClassInterface, SerializableClassInterface {
  uid: string;
  acceptedPrivacyPolicy: boolean;
  acceptedDataPolicy: boolean;
  acceptedTrackingPolicy: boolean;
  acceptedDiagnosticsPolicy: boolean;
  brandText?: string
  photoURL?: string;
  displayName?: string;
  description?: string;
  settings?: UserSettingsInterface;
}
