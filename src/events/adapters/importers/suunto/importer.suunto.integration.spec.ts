import * as fs from 'fs';
import * as path from 'path';
import { EventImporterSuuntoJSON } from './importer.suunto.json';
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

    for (const file of files) {
      const filePath = path.join(samplesDir, file);
      const fileString = fs.readFileSync(filePath, 'utf-8');

      try {
        // Use getFromJSONString as confirmed by file analysis
        const event = await EventImporterSuuntoJSON.getFromJSONString(fileString);
        expect(event).toBeDefined();
        expect(event.getActivities().length).toBeGreaterThan(0);
      } catch (error) {
        console.error(`❌ Failed to parse ${file}:`, error);
        throw error;
      }
    }
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
      const fileString = fs.readFileSync(filePath, 'utf-8');
      event = await EventImporterSuuntoJSON.getFromJSONString(fileString);

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

      const fileString = fs.readFileSync(filePath, 'utf-8');
      const event = await EventImporterSuuntoJSON.getFromJSONString(fileString);
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
