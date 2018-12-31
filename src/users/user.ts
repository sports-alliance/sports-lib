import {Privacy} from '../privacy/privacy.class.interface';
import {UserInterface} from './user.interface';

export class User implements UserInterface {
  uid: string;
  email?: string | null;
  privacy: Privacy = Privacy.public;
  photoURL?: string;
  displayName?: string;

  constructor(userID: string, email?: string, displayName?: string, photoURL?: string, privacy?: Privacy) {
    this.uid = userID;
    if (email) {
      this.email = email;
    }
    if (photoURL) {
      this.photoURL = photoURL;
    }
    if (displayName) {
      this.displayName = displayName;
    }
    if (privacy) {
      this.privacy = privacy;
    }
  }
}
