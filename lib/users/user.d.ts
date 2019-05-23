import { Privacy } from '../privacy/privacy.class.interface';
import { UserInterface } from './user.interface';
import { UserSettingsInterface } from './user.settings.interface';
export declare class User implements UserInterface {
    uid: string;
    privacy: Privacy;
    acceptedDataPolicy: boolean;
    acceptedPrivacyPolicy: boolean;
    acceptedTrackingPolicy: boolean;
    acceptedDiagnosticsPolicy: boolean;
    photoURL?: string;
    displayName?: string;
    description?: string;
    settings?: UserSettingsInterface;
    constructor(userID: string, displayName?: string, photoURL?: string, privacy?: Privacy, description?: string);
    toJSON(): {
        uid: string;
        privacy: Privacy;
        acceptedPrivacyPolicy: boolean;
        acceptedDataPolicy: boolean;
        acceptedTrackingPolicy: boolean;
        acceptedDiagnosticsPolicy: boolean;
        photoURL: string | null;
        displayName: string | null;
        description: string | null;
        settings: UserSettingsInterface | null;
    };
}
