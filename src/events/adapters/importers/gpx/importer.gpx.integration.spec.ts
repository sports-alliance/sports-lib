import * as fs from 'fs';
import * as path from 'path';
import { DOMParser } from '@xmldom/xmldom';
import { EventImporterGPX } from './importer.gpx';

describe('EventImporterGPX Integration', () => {
    // Go up 5 levels from src/events/adapters/importers/gpx -> sports-lib root
    const samplesDir = path.resolve(__dirname, '../../../../../samples/gpx');

    it('should parse all sample gpx files', async () => {
        if (!fs.existsSync(samplesDir)) {
            console.warn(`Samples directory not found at ${samplesDir}. Skipping integration tests.`);
            return;
        }

        const files = fs.readdirSync(samplesDir).filter(f => f.endsWith('.gpx'));

        if (files.length === 0) {
            console.warn('No .gpx files found in samples directory.');
            return;
        }

        console.log(`Found ${files.length} .gpx files to test:`, files);

        for (const file of files) {
            const filePath = path.join(samplesDir, file);
            const fileString = fs.readFileSync(filePath, 'utf-8');

            try {
                // Pass DOMParser constructor as 2nd argument
                const event = await EventImporterGPX.getFromString(fileString, DOMParser, undefined, file);
                expect(event).toBeDefined();
                expect(event.getActivities().length).toBeGreaterThan(0);
                console.log(`✅ Successfully parsed ${file}`);
            } catch (error) {
                console.error(`❌ Failed to parse ${file}:`, error);
                throw error;
            }
        }
    });
});
