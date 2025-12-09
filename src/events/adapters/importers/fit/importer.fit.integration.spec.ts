import * as fs from 'fs';
import * as path from 'path';
import { EventImporterFIT } from './importer.fit';

describe('EventImporterFIT Integration', () => {
    // Go up 5 levels from src/events/adapters/importers/fit -> sports-lib root
    const samplesDir = path.resolve(__dirname, '../../../../../samples/fit');

    it('should parse all sample fit files', async () => {
        if (!fs.existsSync(samplesDir)) {
            console.warn(`Samples directory not found at ${samplesDir}. Skipping integration tests.`);
            return;
        }

        const files = fs.readdirSync(samplesDir).filter(f => f.endsWith('.fit'));

        if (files.length === 0) {
            console.warn('No .fit files found in samples directory.');
            return;
        }

        console.log(`Found ${files.length} .fit files to test:`, files);

        for (const file of files) {
            const filePath = path.join(samplesDir, file);
            const fileBuffer = fs.readFileSync(filePath);
            // Convert Node Buffer to ArrayBuffer
            const arrayBuffer = fileBuffer.buffer.slice(
                fileBuffer.byteOffset,
                fileBuffer.byteOffset + fileBuffer.byteLength
            );

            try {
                const event = await EventImporterFIT.getFromArrayBuffer(arrayBuffer, undefined, file);
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
