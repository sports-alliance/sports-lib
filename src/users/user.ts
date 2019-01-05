import {Privacy} from '../privacy/privacy.class.interface';
import {UserInterface} from './user.interface';

export class User implements UserInterface {
  uid: string;
  privacy: Privacy = Privacy.private;
  acceptedDataPolicy = false;
  acceptedPrivacyPolicy = false;

  photoURL?: string;
  displayName?: string;
  description?: string;

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
      photoURL: this.photoURL || null,
      displayName: this.displayName || null,
      description: this.description || null,
    }
  }
}
