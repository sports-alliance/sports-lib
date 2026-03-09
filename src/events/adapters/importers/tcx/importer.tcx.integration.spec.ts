import * as fs from 'fs';
import * as path from 'path';
import { DOMParser } from '@xmldom/xmldom';
import { EventImporterTCX } from './importer.tcx';
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

describe('EventImporterTCX Integration', () => {
  // Go up 5 levels from src/events/adapters/importers/tcx -> sports-lib root
  const samplesDir = path.resolve(__dirname, '../../../../../samples/tcx');
  // TODO(sports-lib): add a committed TCX regression fixture for extension-field unit ambiguity
  // and assert canonical single-stream output for speed/distance families.
  const sampleTcxFile = path.join(samplesDir, 'garmin.tcx');

  async function parseTcxFile(filePath: string, options?: ActivityParsingOptions) {
    const parser = new DOMParser();
    const fileString = fs.readFileSync(filePath, 'utf-8');
    const xmlDoc = parser.parseFromString(fileString, 'text/xml');
    return EventImporterTCX.getFromXML(xmlDoc, options, path.basename(filePath));
  }

  async function parseSample(options: ActivityParsingOptions): Promise<string[]> {
    const event = await parseTcxFile(sampleTcxFile, options);
    return event
      .getActivities()[0]
      .getAllStreams()
      .map(stream => stream.type);
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

    for (const file of files) {
      const filePath = path.join(samplesDir, file);

      try {
        const event = await parseTcxFile(filePath);
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

  it('should not produce duplicate stream types for the parsed activity', async () => {
    if (!fs.existsSync(sampleTcxFile)) {
      console.warn(`Sample file not found at ${sampleTcxFile}. Skipping duplicate stream test.`);
      return;
    }

    const streamTypes = await parseSample(new ActivityParsingOptions({ generateUnitStreams: false }));
    const paceCount = streamTypes.filter(type => type === DataPace.type).length;
    expect(new Set(streamTypes).size).toBe(streamTypes.length);
    expect(paceCount).toBe(1);
  });

  it('should preserve stream-type regression coverage for all TCX samples', async () => {
    if (!fs.existsSync(samplesDir)) {
      console.warn(`Samples directory not found at ${samplesDir}. Skipping TCX stream coverage test.`);
      return;
    }

    const files = fs.readdirSync(samplesDir).filter(file => file.endsWith('.tcx'));
    for (const file of files) {
      const filePath = path.join(samplesDir, file);
      const event = await parseTcxFile(filePath, new ActivityParsingOptions({ generateUnitStreams: true }));
      const activity = getPrimaryActivityForStreamRegression(event);
      const streamTypes = new Set(activity.getAllStreams().map(stream => stream.type));

      expect(streamTypes.has(DataDistance.type)).toBe(true);
      expect(streamTypes.has(DataPace.type)).toBe(true);
      expect(streamTypes.has(DataGNSSDistanceMiles.type)).toBe(true);
      expect(getDuplicateStreamTypes(activity)).toEqual([]);
    }
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

  it('should reject when includeTypes contains unknown stream types', async () => {
    if (!fs.existsSync(sampleTcxFile)) {
      console.warn(`Sample file not found at ${sampleTcxFile}. Skipping stream includeTypes test.`);
      return;
    }

    const parseResult = parseTcxFile(
      sampleTcxFile,
      new ActivityParsingOptions({
        streams: { includeTypes: ['Not A Stream Type'] }
      })
    );

    expect(parseResult).toBeInstanceOf(Promise);
    await expect(parseResult).rejects.toThrow('Unknown stream includeTypes');
  });
});
