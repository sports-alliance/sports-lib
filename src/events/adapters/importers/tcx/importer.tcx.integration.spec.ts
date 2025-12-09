import * as fs from 'fs';
import * as path from 'path';
import { DOMParser } from '@xmldom/xmldom';
import { EventImporterTCX } from './importer.tcx';

describe('EventImporterTCX Integration', () => {
    // Go up 5 levels from src/events/adapters/importers/tcx -> sports-lib root
    const samplesDir = path.resolve(__dirname, '../../../../../samples/tcx');

    it('should parse all sample tcx files', async () => {
        if (!fs.existsSync(samplesDir)) {
            console.warn(`Samples directory not found at ${samplesDir}. Skipping integration tests.`);
            return;
        }

        const files = fs.readdirSync(samplesDir).filter(f => f.endsWith('.tcx'));

        if (files.length === 0) {
            console.warn('No .tcx files found in samples directory.');
            return;
        }

        console.log(`Found ${files.length} .tcx files to test:`, files);

        const parser = new DOMParser();

        for (const file of files) {
            const filePath = path.join(samplesDir, file);
            const fileString = fs.readFileSync(filePath, 'utf-8');

            try {
                // Parse string to XML Document
                const xmlDoc = parser.parseFromString(fileString, 'text/xml');
                const event = await EventImporterTCX.getFromXML(xmlDoc, undefined, file);
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
