import * as fs from 'fs';
import * as path from 'path';
import { DOMParser } from '@xmldom/xmldom';
import { EventImporterTCX } from './importer.tcx';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { DataDistance } from '../../../../data/data.distance';
import { DataHeartRate } from '../../../../data/data.heart-rate';
import { DataPace } from '../../../../data/data.pace';

describe('EventImporterTCX Integration', () => {
  // Go up 5 levels from src/events/adapters/importers/tcx -> sports-lib root
  const samplesDir = path.resolve(__dirname, '../../../../../samples/tcx');
  const sampleTcxFile = path.join(samplesDir, 'garmin.tcx');

  async function parseSample(options: ActivityParsingOptions): Promise<string[]> {
    const parser = new DOMParser();
    const fileString = fs.readFileSync(sampleTcxFile, 'utf-8');
    const xmlDoc = parser.parseFromString(fileString, 'text/xml');
    const event = await EventImporterTCX.getFromXML(xmlDoc, options, 'tcx-stream-filter');
    return event.getActivities()[0].getAllStreams().map(stream => stream.type);
  }

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

  it('should keep baseline behavior when includeTypes is empty', async () => {
    if (!fs.existsSync(sampleTcxFile)) {
      console.warn(`Sample file not found at ${sampleTcxFile}. Skipping stream includeTypes test.`);
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
    if (!fs.existsSync(sampleTcxFile)) {
      console.warn(`Sample file not found at ${sampleTcxFile}. Skipping stream includeTypes test.`);
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
    if (!fs.existsSync(sampleTcxFile)) {
      console.warn(`Sample file not found at ${sampleTcxFile}. Skipping stream includeTypes test.`);
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
    if (!fs.existsSync(sampleTcxFile)) {
      console.warn(`Sample file not found at ${sampleTcxFile}. Skipping stream includeTypes test.`);
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
    if (!fs.existsSync(sampleTcxFile)) {
      console.warn(`Sample file not found at ${sampleTcxFile}. Skipping stream includeTypes test.`);
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
