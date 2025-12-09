import * as fs from 'fs';
import * as path from 'path';
import { DataStore } from './data.store';

describe('DataStore Export Verification', () => {
    const dataDir = __dirname;
    const files = fs.readdirSync(dataDir);

    // Files that are not data classes or should be ignored
    const ignoredFiles = [
        'data.store.ts',
        'data.store.spec.ts',
        'data.store.export.spec.ts',
        'data.interface.ts',
        'data.json.interface.ts',
        'data.position.interface.ts',
        'data.spec.ts',
        'data.ts', // Base class
        'data.string.ts', // Base class
        'data.number.ts', // Base class
        'data.boolean.ts', // Base class
        'data.percent.ts', // Base class or abstract?
        'data.array.ts', // Base class
        'data.balance.ts', // interface/base
    ];

    files.forEach(file => {
        // Only verify regular TS files related to data
        if (!file.endsWith('.ts') || file.endsWith('.d.ts') || file.endsWith('.spec.ts')) {
            return;
        }

        // Check if file starts with data
        if (!file.startsWith('data')) {
            return;
        }

        if (ignoredFiles.includes(file)) {
            return;
        }

        it(`should export data classes from ${file} in DataStore`, () => {
            const modulePath = path.join(dataDir, file);
            // Verify file exists before requiring to avoid weird errors
            if (fs.existsSync(modulePath)) {
                const moduleExport = require(modulePath);

                Object.keys(moduleExport).forEach(key => {
                    const ExportedItem = moduleExport[key];

                    // Check if it looks like a Data class
                    // 1. It's a function (class constructor)
                    // 2. Name starts with Data
                    // 3. It is not an abstract class (we use a simple heuristic or explicit ignore list if needed)
                    // Simple heuristic: if it has a static 'type' property, it probably should be in DataStore.

                    if (typeof ExportedItem === 'function' && key.startsWith('Data')) {
                        // Check for static 'type' property which usually indicates a concrete data class
                        if (ExportedItem.type) {
                            expect(DataStore[key]).toBeDefined();
                            // verify it points to the same class
                            expect(DataStore[key]).toBe(ExportedItem);
                        } else {
                            // If it doesn't have a 'type', it acts like a base class (e.g. DataQuantity)
                            // We can log it or ignore it.
                            // For now, let's assume if it's named Data*, it might be relevant, 
                            // but strictly enforcing presence in DataStore usually requires the 'type' to be useful for the loader.
                        }
                    }
                });
            }
        });
    });
});
