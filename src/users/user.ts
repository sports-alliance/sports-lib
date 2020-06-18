import { Privacy } from '../privacy/privacy.class.interface';
import { UserInterface } from './user.interface';
import { UserSettingsInterface } from './settings/user.settings.interface';

export class User implements UserInterface {
  uid: string;
  privacy: Privacy = Privacy.Private;
  acceptedDataPolicy = false;
  acceptedPrivacyPolicy = false;
  acceptedTrackingPolicy = false;
  acceptedDiagnosticsPolicy = false;
  creationDate?: Date;
  lastSignInDate?: Date;
  isCoach?: boolean;

  brandText?: string;
  photoURL?: string;
  displayName?: string;
  description?: string;
  settings?: UserSettingsInterface;
  lastSeenPromo?: number;

  constructor(userID: string, displayName?: string, photoURL?: string, privacy?: Privacy, description?: string) {
    this.uid = userID;
    if (photoURL) {
      this.photoURL = photoURL;
    }
    if (displayName) {
      this.displayName = displayName;
    }
    if (privacy) {
      this.privacy = privacy;
    }
    if (description) {
      this.description = description;
    }
  }

  toJSON() {
    return {
      uid: this.uid,
      privacy: this.privacy,
      acceptedPrivacyPolicy: this.acceptedPrivacyPolicy,
      acceptedDataPolicy: this.acceptedDataPolicy,
      acceptedTrackingPolicy: this.acceptedTrackingPolicy,
      acceptedDiagnosticsPolicy: this.acceptedDiagnosticsPolicy,
      brandText: this.brandText || null,
      photoURL: this.photoURL || null,
      displayName: this.displayName || null,
      description: this.description || null,
      settings: this.settings ? this.settings : null,
    }
  }
}
