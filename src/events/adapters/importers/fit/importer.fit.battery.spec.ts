import * as fs from 'fs';
import * as path from 'path';
import { EventImporterFIT } from './importer.fit';
import { DataBatteryConsumption } from '../../../../data/data.battery-consumption';
import { DataBatteryLifeEstimation } from '../../../../data/data.battery-life-estimation';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';

describe('EventImporterFIT Battery Stats', () => {
  const fitFilePath = path.join(__dirname, '../../../../../samples/fit/suunto-bat.fit');

  it('should parse suunto-bat.fit and extract battery consumption and life estimation', async () => {
    const fileContent = fs.readFileSync(fitFilePath);
    const arrayBuffer = fileContent.buffer.slice(
      fileContent.byteOffset,
      fileContent.byteOffset + fileContent.byteLength
    );

    // Mock FitFileParser to return raw data if possible, or just use the importer and spy/log
    // Since we can't easily spy on the internal parser callback, we'll assume the importer
    // attaches device info to activity.creator.devices or we can log from within the importer if needed.
    // For now, let's see what the current importer does.
    const options = new ActivityParsingOptions({ generateUnitStreams: false });
    const event = await EventImporterFIT.getFromArrayBuffer(arrayBuffer, options, 'Battery Test Activity');
    const activity = event.getFirstActivity();

    // Check for Battery Consumption
    const consumptionStat = activity.getStat(DataBatteryConsumption.type);
    expect(consumptionStat).toBeDefined();
    if (consumptionStat) {
      // Expect 5% drop based on suunto-bat.fit data
      expect(consumptionStat.getValue()).toBe(5);
    }

    // Check for Battery Life Estimation
    const lifeEstStat = activity.getStat(DataBatteryLifeEstimation.type);
    expect(lifeEstStat).toBeDefined();
    if (lifeEstStat) {
      // Duration and consumption imply approx 25h (90180s)
      // Allow some margin for exact timestamp differences
      const val = lifeEstStat.getValue();
      expect(val).toBeGreaterThan(90000);
      expect(val).toBeLessThan(90500);
    }
  });
});
