import { DataStore } from './data.store';
import { DataDuration } from './data.duration';
import { DataPower } from './data.power';
import { DataPowerCurve } from './data.power-curve';
import { DataRiderPositionChangeEvent } from './data.rider-position-change-event';
import { RiderPosition } from './data.cycling-position';
import { DataSportProfileName } from './data.sport-profile-name';
import { DataFusedLocation } from './data.fused-location';
import { DataFusedAltitude } from './data.fused-altitude';
import { DataAltiBaroProfile } from './data.alti-baro-profile';
import { DataActivityTypes } from './data.activity-types';
import { DataDeviceNames } from './data.device-names';
import { DataDescription } from './data.description';
import { DataPosition } from './data.position';
import { DataActiveLap } from './data-active-lap';
import { DataBalance } from './data.balance';
import { DataTargetPowerZone } from './data.target-power-zone';
import { DataTargetHeartRateZone } from './data.target-heart-rate-zone';
import { DataTargetSpeedZone } from './data.target-speed-zone';
import { DataGender } from './data.gender';
import { DataJumpEvent, DataScore } from './data.jump-event';
import { DataDistance } from './data.distance';
import { DataDeviceLocation } from './data.device-location';
import { DataFootPodUsed } from './data.foot-pod-used';
import { DataAutoPauseUsed } from './data.auto-pause-used';
import { DataAutoLapUsed } from './data.auto-lap-used';
import { DataBikePodUsed } from './data.bike-pod-used';
import { DataEnabledNavigationSystems } from './data.enabled-navigation-systems';
import { DataHeartRateUsed } from './data.heart-rate-used';
import { DataPowerPodUsed } from './data.power-pod-used';
import { DataGroundContactTimeBalance } from './data-ground-contact-time-balance';
import { DataStartPosition } from './data.start-position';
import { DataEndPosition } from './data.end-position';

describe('Data Serialization Safety', () => {

    // Map of classes that require specific constructor arguments or complex data
    const knownProviders = new Map<any, any[]>([
        [DataPowerCurve, [[{ duration: new DataDuration(1), power: new DataPower(100) }]]],
        [DataRiderPositionChangeEvent, [1, RiderPosition.SEATED]],
        [DataSportProfileName, ['TestProfile']],
        [DataFusedLocation, [true]],
        [DataFusedAltitude, [true]],
        [DataAltiBaroProfile, ['TestProfile']],
        [DataActivityTypes, [['Running', 'Cycling']]],
        [DataDeviceNames, [['Garmin', 'Suunto']]],
        [DataDescription, ['Test Description']],
        [DataPosition, [{ latitudeDegrees: 0, longitudeDegrees: 0 }]],
        [DataActiveLap, [true]],
        [DataBalance, [50]],
        [DataTargetPowerZone, ['Zone 1']],
        [DataTargetHeartRateZone, ['Zone 1']],
        [DataTargetSpeedZone, ['Zone 1']],
        [DataGender, ['Male']],
        [DataJumpEvent, [1234567890, { distance: new DataDistance(10), score: new DataScore(5) }]],
        [DataDeviceLocation, ['Wrist']],
        [DataFootPodUsed, [true]],
        [DataAutoPauseUsed, [true]],
        [DataAutoLapUsed, [true]],
        [DataBikePodUsed, [true]],
        [DataEnabledNavigationSystems, ['GPS']],
        [DataHeartRateUsed, [true]],
        [DataPowerPodUsed, [true]],
        [DataStartPosition, [{ latitudeDegrees: 0, longitudeDegrees: 0 }]],
        [DataEndPosition, [{ latitudeDegrees: 0, longitudeDegrees: 0 }]],
    ]);

    // Abstract classes or classes that shouldn't be tested directly
    const ignoredClasses = new Set<string>([
        'DataGroundContactTimeBalance',
        'DataBalance',
    ]);

    /**
     * Recursively checks an object for any values that are custom class instances
     * (i.e. not plain Objects, Arrays, or primitives).
     * Returns a list of error strings describing the location of custom objects.
     */
    const checkForCustomObjects = (obj: any, path: string = ''): string[] => {
        const errors: string[] = [];
        if (obj === null || typeof obj !== 'object') {
            return errors;
        }

        // Check the constructor of the object itself
        if (obj.constructor && obj.constructor.name !== 'Object' && obj.constructor.name !== 'Array') {
            errors.push(`Found custom object at path '${path}': ${obj.constructor.name}. Data classes must serialize to plain JSON objects.`);
        }

        // Recursively check properties
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                errors.push(...checkForCustomObjects(obj[key], path ? `${path}.${key}` : key));
            }
        }
        return errors;
    };

    // Iterate over all data classes registered in the DataStore
    Object.keys(DataStore).forEach((key) => {
        const DataClass = DataStore[key];

        // Skip if it's not a function (constructor) or explicitly ignored
        if (typeof DataClass !== 'function' || ignoredClasses.has(key)) return;

        it(`should serialize ${key} to plain JSON`, () => {
            let instance: any;
            try {
                // Use provided args or default to [123] for most simple data classes
                const args = knownProviders.get(DataClass) || [123];
                instance = new DataClass(...args);
            } catch (e) {
                console.warn(`Failed to instantiate ${key} with default args. Error: ${(e as Error).message}`);
                // We intentionally fail the test if we can't instantiate it, 
                // so the developer adds a provider for the new class.
                throw new Error(`Could not instantiate ${key}. Please add a provider to 'knownProviders' in src/data/data.serialization.spec.ts`);
            }

            const json = instance.toJSON();

            // 1. Check that toJSON returns something
            expect(json).toBeDefined();

            // 2. Check for custom objects in the serialized output
            const errors = checkForCustomObjects(json);

            if (errors.length > 0) {
                fail(`${key}.toJSON() returned invalid JSON structure:\n${errors.join('\n')}`);
            }
        });
    });
});
