import * as fs from 'fs';
import * as path from 'path';
import { EventImporterSuuntoJSON } from './importer.suunto.json';

describe('EventImporterSuuntoJSON Integration', () => {
    // Go up 5 levels from src/events/adapters/importers/suunto -> sports-lib root
    const samplesDir = path.resolve(__dirname, '../../../../../samples/suunto');

    it('should parse all sample suunto json files', async () => {
        if (!fs.existsSync(samplesDir)) {
            console.warn(`Samples directory not found at ${samplesDir}. Skipping integration tests.`);
            return;
        }

        const files = fs.readdirSync(samplesDir).filter(f => f.endsWith('.json'));

        if (files.length === 0) {
            console.warn('No .json files found in samples directory.');
            return;
        }

        console.log(`Found ${files.length} .json files to test:`, files);

        for (const file of files) {
            const filePath = path.join(samplesDir, file);
            const fileString = fs.readFileSync(filePath, 'utf-8');

            try {
                // Use getFromJSONString as confirmed by file analysis
                const event = await EventImporterSuuntoJSON.getFromJSONString(fileString);
                expect(event).toBeDefined();
                expect(event.getActivities().length).toBeGreaterThan(0);
                console.log(`✅ Successfully parsed ${file}`);
            } catch (error) {
                console.error(`❌ Failed to parse ${file}:`, error);
                throw error;
            }
        }
    });

    // Note: If SML/XML files existed, we would test EventImporterSuuntoSML here too.
});
