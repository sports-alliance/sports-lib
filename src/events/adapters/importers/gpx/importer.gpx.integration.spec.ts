import * as fs from 'fs';
import * as path from 'path';
import { DOMParser } from '@xmldom/xmldom';
import { EventImporterGPX } from './importer.gpx';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { DataDistance } from '../../../../data/data.distance';
import { DataGNSSDistanceMiles } from '../../../../data/data.gnss-distance-miles';
import { DataHeartRate } from '../../../../data/data.heart-rate';
import { DataPace } from '../../../../data/data.pace';
import {
  getDuplicateStreamTypes,
  getPrimaryActivityForStreamRegression,
  getUniqueStreamTypes
} from '../integration/stream-regression.helper';

describe('EventImporterGPX Integration', () => {
  // Go up 5 levels from src/events/adapters/importers/gpx -> sports-lib root
  const samplesDir = path.resolve(__dirname, '../../../../../samples/gpx');
  // TODO(sports-lib): add a committed GPX regression fixture for mixed extension namespaces/units
  // and assert canonical single-stream output for speed/distance families.
  const sampleGpxFile = path.join(samplesDir, 'garmin.gpx');

  async function parseGpxFile(filePath: string, options?: ActivityParsingOptions) {
    const fileString = fs.readFileSync(filePath, 'utf-8');
    return EventImporterGPX.getFromString(fileString, DOMParser, options, path.basename(filePath));
  }

  async function parseSample(options: ActivityParsingOptions): Promise<string[]> {
    const event = await parseGpxFile(sampleGpxFile, options);
    return event
      .getActivities()[0]
      .getAllStreams()
      .map(stream => stream.type);
  }

  it('should parse all sample gpx files', async () => {
    if (!fs.existsSync(samplesDir)) {
      console.warn(`Samples directory not found at ${samplesDir}. Skipping integration tests.`);
      return;
    }

    const files = fs.readdirSync(samplesDir).filter(f => f.endsWith('.gpx') && f !== 'route.gpx');

    if (files.length === 0) {
      console.warn('No .gpx files found in samples directory.');
      return;
    }

    console.log(`Found ${files.length} .gpx files to test:`, files);

    for (const file of files) {
      const filePath = path.join(samplesDir, file);

      try {
        const event = await parseGpxFile(filePath);
        expect(event).toBeDefined();
        expect(event.getActivities().length).toBeGreaterThan(0);
        event.getActivities().forEach(activity => {
          expect(getDuplicateStreamTypes(activity)).toEqual([]);
          expect(getUniqueStreamTypes(activity).length).toBeGreaterThan(0);
        });
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

  it('should preserve stream-type regression coverage for curated GPX samples', async () => {
    const expectations: { fileName: string; requiredTypes: string[] }[] = [
      {
        fileName: 'garmin.gpx',
        requiredTypes: [DataDistance.type, DataPace.type, DataGNSSDistanceMiles.type]
      },
      {
        fileName: 'amazfit.gpx',
        requiredTypes: [DataDistance.type, DataPace.type, DataGNSSDistanceMiles.type]
      }
    ];

    for (const expectation of expectations) {
      const filePath = path.join(samplesDir, expectation.fileName);
      if (!fs.existsSync(filePath)) {
        console.warn(`Regression sample not found at ${filePath}. Skipping.`);
        continue;
      }

      const event = await parseGpxFile(filePath, new ActivityParsingOptions({ generateUnitStreams: true }));
      const activity = getPrimaryActivityForStreamRegression(event);
      const streamTypes = new Set(activity.getAllStreams().map(stream => stream.type));
      expectation.requiredTypes.forEach(streamType => {
        expect(streamTypes.has(streamType)).toBe(true);
      });
      expect(getDuplicateStreamTypes(activity)).toEqual([]);
    }
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

  it('should reject when includeTypes contains unknown stream types', async () => {
    if (!fs.existsSync(sampleGpxFile)) {
      console.warn(`Sample file not found at ${sampleGpxFile}. Skipping stream includeTypes test.`);
      return;
    }

    const parseResult = parseGpxFile(
      sampleGpxFile,
      new ActivityParsingOptions({
        streams: { includeTypes: ['Not A Stream Type'] }
      })
    );

    expect(parseResult).toBeInstanceOf(Promise);
    await expect(parseResult).rejects.toThrow('Unknown stream includeTypes');
  });

  it('should reject route-only GPX through the activity importer', async () => {
    const routeFile = path.join(samplesDir, 'route.gpx');
    if (!fs.existsSync(routeFile)) {
      console.warn(`Route sample not found at ${routeFile}. Skipping.`);
      return;
    }

    await expect(parseGpxFile(routeFile)).rejects.toThrow('use importRoutesFromGPX');
  });
});
