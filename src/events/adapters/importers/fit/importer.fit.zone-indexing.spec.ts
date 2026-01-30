import { EventImporterFIT } from './importer.fit';
import { DataHeartRateZoneOneDuration } from '../../../../data/data.heart-rate-zone-one-duration';
import { DataHeartRateZoneTwoDuration } from '../../../../data/data.heart-rate-zone-two-duration';
import { DataPowerZoneOneDuration } from '../../../../data/data.power-zone-one-duration';
import { DataPowerZoneTwoDuration } from '../../../../data/data.power-zone-two-duration';
import { DataPowerZoneSixDuration } from '../../../../data/data.power-zone-six-duration';
import { DataPowerZoneSevenDuration } from '../../../../data/data.power-zone-seven-duration';
import fs from 'fs';
import path from 'path';

describe('EventImporterFIT Zone Indexing (Garmin vs Suunto)', () => {
    it('should correctly map Heart Rate and Power zones from Garmin FIT files (1-indexed)', async () => {
        const filePath = path.join(__dirname, '../../../../../samples/fit/file-with-zones.fit');
        // Note: file-with-zones.fit is a Garmin file confirmed to have 1-indexed zones
        const arrayBuffer = fs.readFileSync(filePath).buffer;

        const event = await EventImporterFIT.getFromArrayBuffer(arrayBuffer);
        const activity = event.getActivities()[0];

        const hrZone1 = activity.getStat(DataHeartRateZoneOneDuration.type);
        const powerZone1 = activity.getStat(DataPowerZoneOneDuration.type);
        const powerZone2 = activity.getStat(DataPowerZoneTwoDuration.type);
        const powerZone6 = activity.getStat(DataPowerZoneSixDuration.type);
        const powerZone7 = activity.getStat(DataPowerZoneSevenDuration.type);

        // Verification of Garmin 1-indexed mapping (offset = 1)
        expect(powerZone1).toBeDefined();
        expect(powerZone1?.getValue()).toBeCloseTo(2939.995, 2);
        expect(powerZone2?.getValue()).toBeCloseTo(2690.028, 2);
        expect(powerZone6?.getValue()).toBeCloseTo(49.991, 2);
        expect(powerZone7?.getValue()).toBeCloseTo(14.008, 2);

        expect(hrZone1).toBeDefined();
        // Garmin HR Zone 1 in this file is index 1 with offset 1 (value 716.01)
        expect(hrZone1?.getValue()).toBeCloseTo(716.01, 2);
    });

    it('should correctly map Heart Rate and Power zones from Suunto FIT files (0-indexed)', async () => {
        const filePath = path.join(__dirname, '../../../../specs/fixtures/runs/fit/6909950168.fit');
        // Note: 6909950168.fit is a Suunto file with time_in_hr_zone: [ 79.086, 1999.014... ]
        const arrayBuffer = fs.readFileSync(filePath).buffer;

        const event = await EventImporterFIT.getFromArrayBuffer(arrayBuffer);
        const activity = event.getActivities()[0];

        const hrZone1 = activity.getStat(DataHeartRateZoneOneDuration.type);
        const hrZone2 = activity.getStat(DataHeartRateZoneTwoDuration.type);

        // Verification of Suunto 0-indexed mapping (offset = 0)
        expect(hrZone1).toBeDefined();
        expect(hrZone1?.getValue()).toBeCloseTo(79.086, 3);
        expect(hrZone2?.getValue()).toBeCloseTo(1999.014, 3);
    });
});
