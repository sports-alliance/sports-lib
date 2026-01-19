/* eslint-disable @typescript-eslint/no-var-requires */
import * as fs from 'fs';
import * as path from 'path';
import { EventImporterFIT } from './importer.fit';
import { DataLeftTorqueEffectiveness } from '../../../../data/data.left-torque-effectiveness';
import { DataRightTorqueEffectiveness } from '../../../../data/data.right-torque-effectiveness';
import { DataLeftPedalSmoothness } from '../../../../data/data.left-pedal-smoothness';
import { DataRightPedalSmoothness } from '../../../../data/data.right-pedal-smoothness';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';

describe('EventImporterFIT Road with Power', () => {
    const fitFilePath = path.join(__dirname, '../../../../../samples/fit/road-with-power.fit');

    it('should parse road-with-power.fit and extract torque effectiveness and pedal smoothness', async () => {
        const fileContent = fs.readFileSync(fitFilePath);
        const arrayBuffer = fileContent.buffer.slice(fileContent.byteOffset, fileContent.byteOffset + fileContent.byteLength);

        const options = new ActivityParsingOptions({ generateUnitStreams: false });
        const event = await EventImporterFIT.getFromArrayBuffer(arrayBuffer, options, 'Test Road Activity');
        const activity = event.getFirstActivity();

        // Check for Left Torque Effectiveness
        const leftTEStream = activity.getStreamData(DataLeftTorqueEffectiveness.type);
        expect(leftTEStream).toBeDefined();
        expect(leftTEStream.some((val: number | null) => val !== null && val > 0)).toBe(true);
        // data contains 82
        expect(leftTEStream.find((val: number | null) => val === 82)).toBe(82);

        // Check for Right Torque Effectiveness
        const rightTEStream = activity.getStreamData(DataRightTorqueEffectiveness.type);
        expect(rightTEStream).toBeDefined();
        // Right side having data (can be 0)
        expect(rightTEStream.length).toBeGreaterThan(0);

        // Check for Left Pedal Smoothness
        const leftPSStream = activity.getStreamData(DataLeftPedalSmoothness.type);
        expect(leftPSStream).toBeDefined();
        expect(leftPSStream.some((val: number | null) => val !== null && val > 0)).toBe(true);
        // data contains 24.5
        expect(leftPSStream.find((val: number | null) => val === 24.5)).toBe(24.5);

        // Check for Right Pedal Smoothness
        const rightPSStream = activity.getStreamData(DataRightPedalSmoothness.type);
        expect(rightPSStream).toBeDefined();
        // Just check we have data points
        expect(rightPSStream.length).toBeGreaterThan(0);
    });
});
