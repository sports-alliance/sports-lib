import * as fs from 'fs';
import * as path from 'path';
import { EventImporterSuuntoJSON } from './importer.suunto.json';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { DataDistance } from '../../../../data/data.distance';
import { DataGroundContactTime } from '../../../../data/data.ground-contact-time';
import { DataGroundContactTimeAvg } from '../../../../data/data.ground-contact-time-avg';
import { DataGroundContactTimeMax } from '../../../../data/data.ground-contact-time-max';
import { DataGroundContactTimeMin } from '../../../../data/data.ground-contact-time-min';
import { DataVerticalOscillation } from '../../../../data/data.vertical-oscillation';
import { DataVerticalOscillationAvg } from '../../../../data/data.vertical-oscillation-avg';
import { DataVerticalOscillationMax } from '../../../../data/data.vertical-oscillation-max';
import { DataVerticalOscillationMin } from '../../../../data/data.vertical-oscillation-min';
import { DataFitnessAge } from '../../../../data/data.fitness-age';
import { DataMaxHRSetting } from '../../../../data/data.max-hr-setting';
import { DataHeartRate } from '../../../../data/data.heart-rate';
import { DataBatteryCharge } from '../../../../data/data.battery-charge';
import { DataBatteryCurrent } from '../../../../data/data.battery-current';
import { DataBatteryVoltage } from '../../../../data/data.battery-voltage';
import {
  getDuplicateStreamTypes,
  getPrimaryActivityForStreamRegression,
  getUniqueStreamTypes
} from '../integration/stream-regression.helper';

describe('EventImporterSuuntoJSON Integration', () => {
  // Go up 5 levels from src/events/adapters/importers/suunto -> sports-lib root
  const samplesDir = path.resolve(__dirname, '../../../../../samples/suunto');
  async function parseSuuntoFile(filePath: string, options?: ActivityParsingOptions) {
    const fileString = fs.readFileSync(filePath, 'utf-8');
    return EventImporterSuuntoJSON.getFromJSONString(fileString, options);
  }

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

    for (const file of files) {
      const filePath = path.join(samplesDir, file);

      try {
        const event = await parseSuuntoFile(filePath);
        expect(event).toBeDefined();
        expect(event.getActivities().length).toBeGreaterThan(0);
        event.getActivities().forEach(activity => {
          expect(getDuplicateStreamTypes(activity)).toEqual([]);
          expect(getUniqueStreamTypes(activity).length).toBeGreaterThan(0);
        });
      } catch (error) {
        console.error(`❌ Failed to parse ${file}:`, error);
        throw error;
      }
    }
  });

  it('should preserve stream-type regression coverage for curated suunto samples', async () => {
    const expectations: { fileName: string; requiredTypes: string[] }[] = [
      {
        fileName: 'running-with-extra-data.json',
        requiredTypes: [
          DataDistance.type,
          DataGroundContactTime.type,
          DataVerticalOscillation.type,
          DataBatteryCharge.type,
          DataBatteryCurrent.type,
          DataBatteryVoltage.type
        ]
      },
      {
        fileName: 'missing_hr.json',
        requiredTypes: [DataHeartRate.type, DataBatteryCharge.type, DataBatteryCurrent.type, DataBatteryVoltage.type]
      },
      {
        fileName: '2026-03-06_08-14.json',
        requiredTypes: [
          DataGroundContactTime.type,
          DataVerticalOscillation.type,
          DataBatteryCharge.type,
          DataBatteryCurrent.type,
          DataBatteryVoltage.type
        ]
      }
    ];

    for (const expectation of expectations) {
      const filePath = path.join(samplesDir, expectation.fileName);
      if (!fs.existsSync(filePath)) {
        console.warn(`Regression sample not found at ${filePath}. Skipping.`);
        continue;
      }

      const event = await parseSuuntoFile(filePath);
      const activity = getPrimaryActivityForStreamRegression(event);
      const streamTypes = new Set(activity.getAllStreams().map(stream => stream.type));

      expectation.requiredTypes.forEach(streamType => {
        expect(streamTypes.has(streamType)).toBe(true);
      });
      expect(getDuplicateStreamTypes(activity)).toEqual([]);
    }
  });

  it('should keep stream output unchanged when includeTypes is set (current scope guard)', async () => {
    const filePath = path.join(samplesDir, 'running-with-extra-data.json');
    if (!fs.existsSync(filePath)) {
      console.warn('running-with-extra-data.json not found. Skipping includeTypes scope guard test.');
      return;
    }

    const baselineEvent = await parseSuuntoFile(filePath, new ActivityParsingOptions({ generateUnitStreams: false }));
    const includeFilteredEvent = await parseSuuntoFile(
      filePath,
      new ActivityParsingOptions({
        generateUnitStreams: false,
        streams: { includeTypes: [DataDistance.type] }
      })
    );

    const baselineActivity = baselineEvent
      .getActivities()
      .reduce((prev, current) => (prev.getDuration().getValue() > current.getDuration().getValue() ? prev : current));
    const includeFilteredActivity = includeFilteredEvent
      .getActivities()
      .reduce((prev, current) => (prev.getDuration().getValue() > current.getDuration().getValue() ? prev : current));

    const baselineStreamTypes = baselineActivity.getAllStreams().map(stream => stream.type);
    const includeFilteredStreamTypes = includeFilteredActivity.getAllStreams().map(stream => stream.type);
    expect(includeFilteredStreamTypes).toEqual(baselineStreamTypes);
  });

  describe('running-with-extra-data.json', () => {
    let event: Awaited<ReturnType<typeof EventImporterSuuntoJSON.getFromJSONString>>;
    let activity: ReturnType<typeof event.getActivities>[0];

    beforeAll(async () => {
      const filePath = path.join(samplesDir, 'running-with-extra-data.json');
      if (!fs.existsSync(filePath)) {
        console.warn('running-with-extra-data.json not found. Skipping detailed tests.');
        return;
      }
      event = await parseSuuntoFile(filePath);

      // DEBUG: print one sample's date from the source file just blindly
      // (we can't easily access json here again without parsing, but we can infer from activity)

      // Find the main running activity (longest duration)
      activity = event
        .getActivities()
        .reduce((prev, current) => (prev.getDuration().getValue() > current.getDuration().getValue() ? prev : current));
    });

    it('should parse Ground Contact Time stream', () => {
      if (!activity) return;
      // Depending on the file structure, GCT might be in the first or second activity.
      // We selected the longest one.
      const hasStream = activity.hasStreamData(DataGroundContactTime.type);
      expect(hasStream).toBe(true);
      if (hasStream) {
        const stream = activity.getStreamData(DataGroundContactTime.type);
        expect(stream.length).toBeGreaterThan(0);
      }
    });

    it('should parse Ground Contact Time stats (avg, max, min)', () => {
      if (!activity) return;
      const avgStat = activity.getStat(DataGroundContactTimeAvg.type);
      const maxStat = activity.getStat(DataGroundContactTimeMax.type);
      const minStat = activity.getStat(DataGroundContactTimeMin.type);

      expect(avgStat).toBeDefined();
      expect(avgStat?.getValue()).toBeCloseTo(255.969, 3);
      expect(maxStat).toBeDefined();
      expect(maxStat?.getValue()).toBe(339);
      expect(minStat).toBeDefined();
      expect(minStat?.getValue()).toBe(219);
    });

    it('should parse Vertical Oscillation stream', () => {
      if (!activity) return;
      const hasStream = activity.hasStreamData(DataVerticalOscillation.type);
      expect(hasStream).toBe(true);
    });

    it('should parse Vertical Oscillation stats (avg, max, min)', () => {
      if (!activity) return;
      const avgStat = activity.getStat(DataVerticalOscillationAvg.type);
      const maxStat = activity.getStat(DataVerticalOscillationMax.type);
      const minStat = activity.getStat(DataVerticalOscillationMin.type);

      expect(avgStat).toBeDefined();
      expect(avgStat?.getValue()).toBeCloseTo(74.359, 3);
      expect(maxStat).toBeDefined();
      expect(maxStat?.getValue()).toBe(87);
      expect(minStat).toBeDefined();
      expect(minStat?.getValue()).toBe(42);
    });

    it('should parse Fitness Age from header (Event or Activity)', () => {
      let stat = event.getStat(DataFitnessAge.type);
      if (!stat && activity) {
        stat = activity.getStat(DataFitnessAge.type);
      }

      expect(stat).toBeDefined();
      expect(stat?.getValue()).toBe(25);
    });

    it('should parse Personal MaxHR from header (Event or Activity)', () => {
      let stat = event.getStat(DataMaxHRSetting.type);
      if (!stat && activity) {
        stat = activity.getStat(DataMaxHRSetting.type);
      }

      expect(stat).toBeDefined();
      expect(stat?.getValue()).toBe(171);
    });
  });

  describe('missing_hr.json', () => {
    it('should keep direct HR stream when RR cannot produce enough valid HR samples', async () => {
      const filePath = path.join(samplesDir, 'missing_hr.json');
      if (!fs.existsSync(filePath)) {
        console.warn('missing_hr.json not found. Skipping RR fallback test.');
        return;
      }

      const event = await parseSuuntoFile(filePath);
      const activity = event
        .getActivities()
        .reduce((prev, current) => (prev.getDuration().getValue() > current.getDuration().getValue() ? prev : current));

      expect(activity.hasStreamData(DataHeartRate.type)).toBe(true);

      const hrValues = activity
        .getStreamData(DataHeartRate.type)
        .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

      expect(hrValues.length).toBeGreaterThan(1000);
      expect(Math.min(...hrValues)).toBeGreaterThan(40);
      expect(Math.max(...hrValues)).toBeLessThan(220);
    });
  });
});
