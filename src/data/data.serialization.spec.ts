import { DataStore } from './data.store';
import { DataDuration } from './data.duration';
import { DataPower } from './data.power';
import { DataPowerCurve } from './data.power-curve';
import { DataRiderPositionChangeEvent } from './data.rider-position-change-event';
import { RiderPosition } from './data.cycling-position';
import { DataSportProfileName } from './data.sport-profile-name';

describe('Data Serialization Safety', () => {

    // Map of classes that require specific constructor arguments or complex data
    const knownProviders = new Map<any, any[]>([
        [DataPowerCurve, [[{ duration: new DataDuration(1), power: new DataPower(100) }]]],
        [DataRiderPositionChangeEvent, [1, RiderPosition.SEATED]],
        [DataSportProfileName, ['TestProfile']],
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

        // Skip if it's not a function (constructor)
        if (typeof DataClass !== 'function') return;

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
