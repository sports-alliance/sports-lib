import * as fs from 'fs';
import * as path from 'path';
import { EventImporterFIT } from './importer.fit';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { DataDistance } from '../../../../data/data.distance';
import { DataGNSSDistanceMiles } from '../../../../data/data.gnss-distance-miles';
import { DataPace } from '../../../../data/data.pace';
import { DataPower } from '../../../../data/data.power';
import { DataEffortPace } from '../../../../data/data.effort-pace';
import { DataStepLength } from '../../../../data/data.step-length';
import { DataGroundContactTime } from '../../../../data/data.ground-contact-time';
import { DataVerticalOscillation } from '../../../../data/data.vertical-oscillation';
import {
  getDuplicateStreamTypes,
  getPrimaryActivityForStreamRegression,
  getUniqueStreamTypes
} from '../integration/stream-regression.helper';

describe('EventImporterFIT Integration', () => {
  // Go up 5 levels from src/events/adapters/importers/fit -> sports-lib root
  const samplesDir = path.resolve(__dirname, '../../../../../samples/fit');
  // TODO(sports-lib): add a committed FIT regression fixture that previously produced duplicate
  // speed/distance-family streams (for example the Suunto case seen in QS diagnostics) and
  // assert canonical single-stream output directly in this suite.
  const extraSampleFits = [
    {
      filePath: path.resolve(__dirname, '../../../../../samples/coros/step-effort.fit'),
      requiredTypes: [DataEffortPace.type, DataStepLength.type, DataDistance.type, DataGNSSDistanceMiles.type]
    }
  ];

  async function parseFitFile(filePath: string, options?: ActivityParsingOptions) {
    const fileBuffer = fs.readFileSync(filePath);
    const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);
    return EventImporterFIT.getFromArrayBuffer(arrayBuffer, options, path.basename(filePath));
  }

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

      try {
        const event = await parseFitFile(filePath);
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

  it('should preserve stream-type regression coverage for curated FIT samples', async () => {
    const expectations: { filePath: string; requiredTypes: string[] }[] = [
      {
        filePath: path.join(samplesDir, 'garmin.fit'),
        requiredTypes: [DataDistance.type, DataPace.type, DataGNSSDistanceMiles.type]
      },
      {
        filePath: path.join(samplesDir, 'road-with-power.fit'),
        requiredTypes: [DataDistance.type, DataPower.type, DataGNSSDistanceMiles.type]
      },
      {
        filePath: path.join(samplesDir, '2026-01-31_10-51_1.fit'),
        requiredTypes: [DataGroundContactTime.type, DataVerticalOscillation.type, DataGNSSDistanceMiles.type]
      },
      {
        filePath: path.join(samplesDir, '2026-01-31_10-51_2.fit'),
        requiredTypes: [DataEffortPace.type, DataStepLength.type, DataGNSSDistanceMiles.type]
      },
      ...extraSampleFits
    ];

    for (const expectation of expectations) {
      if (!fs.existsSync(expectation.filePath)) {
        console.warn(`Regression sample not found at ${expectation.filePath}. Skipping.`);
        continue;
      }

      const event = await parseFitFile(expectation.filePath, new ActivityParsingOptions({ generateUnitStreams: true }));
      const activity = getPrimaryActivityForStreamRegression(event);
      const streamTypes = new Set(activity.getAllStreams().map(stream => stream.type));

      expectation.requiredTypes.forEach(streamType => {
        expect(streamTypes.has(streamType)).toBe(true);
      });
      expect(getDuplicateStreamTypes(activity)).toEqual([]);
    }
  });
});
