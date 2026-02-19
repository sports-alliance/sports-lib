import * as fs from 'fs';
import * as path from 'path';
import { DOMParser } from '@xmldom/xmldom';
import { EventImporterGPX } from './importer.gpx';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { DataDistance } from '../../../../data/data.distance';
import { DataHeartRate } from '../../../../data/data.heart-rate';
import { DataPace } from '../../../../data/data.pace';

describe('EventImporterGPX Integration', () => {
  // Go up 5 levels from src/events/adapters/importers/gpx -> sports-lib root
  const samplesDir = path.resolve(__dirname, '../../../../../samples/gpx');
  const sampleGpxFile = path.join(samplesDir, 'garmin.gpx');

  async function parseSample(options: ActivityParsingOptions): Promise<string[]> {
    const fileString = fs.readFileSync(sampleGpxFile, 'utf-8');
    const event = await EventImporterGPX.getFromString(fileString, DOMParser, options, 'gpx-stream-filter');
    return event.getActivities()[0].getAllStreams().map(stream => stream.type);
  }

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

  it('should keep baseline behavior when includeTypes is empty', async () => {
    if (!fs.existsSync(sampleGpxFile)) {
      console.warn(`Sample file not found at ${sampleGpxFile}. Skipping stream includeTypes test.`);
      return;
    }

    const baselineTypes = new Set(await parseSample(new ActivityParsingOptions({ generateUnitStreams: false })));
    const emptyFilterTypes = new Set(
      await parseSample(
        new ActivityParsingOptions({
          generateUnitStreams: false,
          streams: { includeTypes: [] }
        })
      )
    );
    expect(emptyFilterTypes).toEqual(baselineTypes);
  });

  it('should return only requested raw streams', async () => {
    if (!fs.existsSync(sampleGpxFile)) {
      console.warn(`Sample file not found at ${sampleGpxFile}. Skipping stream includeTypes test.`);
      return;
    }

    const streamTypes = new Set(
      await parseSample(
        new ActivityParsingOptions({
          streams: { includeTypes: [DataDistance.type, DataHeartRate.type] }
        })
      )
    );
    expect(streamTypes).toEqual(new Set([DataDistance.type, DataHeartRate.type]));
  });

  it('should return only requested derived streams', async () => {
    if (!fs.existsSync(sampleGpxFile)) {
      console.warn(`Sample file not found at ${sampleGpxFile}. Skipping stream includeTypes test.`);
      return;
    }

    const streamTypes = new Set(
      await parseSample(
        new ActivityParsingOptions({
          streams: { includeTypes: [DataPace.type] }
        })
      )
    );
    expect(streamTypes).toEqual(new Set([DataPace.type]));
  });

  it('should return only requested mixed raw and derived streams', async () => {
    if (!fs.existsSync(sampleGpxFile)) {
      console.warn(`Sample file not found at ${sampleGpxFile}. Skipping stream includeTypes test.`);
      return;
    }

    const streamTypes = new Set(
      await parseSample(
        new ActivityParsingOptions({
          streams: { includeTypes: [DataDistance.type, DataPace.type] }
        })
      )
    );
    expect(streamTypes).toEqual(new Set([DataDistance.type, DataPace.type]));
  });

  it('should throw when includeTypes contains unknown stream types', async () => {
    if (!fs.existsSync(sampleGpxFile)) {
      console.warn(`Sample file not found at ${sampleGpxFile}. Skipping stream includeTypes test.`);
      return;
    }

    await expect(
      parseSample(
        new ActivityParsingOptions({
          streams: { includeTypes: ['Not A Stream Type'] }
        })
      )
    ).rejects.toThrow('Unknown stream includeTypes');
  });
});
