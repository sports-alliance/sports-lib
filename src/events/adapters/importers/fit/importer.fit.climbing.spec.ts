import * as fs from 'fs';
import * as path from 'path';
import { EventImporterFIT } from './importer.fit';
import { ActivityTypes } from '../../../../activities/activity.types';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';

describe('EventImporterFIT Indoor Climbing', () => {
  const fitFilePath = path.join(__dirname, '../../../../specs/fixtures/others/indoor-climbing.fit');

  it('should parse indoor climbing FIT file and detect Indoor Climbing activity type', async () => {
    const fileContent = fs.readFileSync(fitFilePath);
    const arrayBuffer = fileContent.buffer.slice(
      fileContent.byteOffset,
      fileContent.byteOffset + fileContent.byteLength
    );

    const options = new ActivityParsingOptions({ generateUnitStreams: false });
    const event = await EventImporterFIT.getFromArrayBuffer(arrayBuffer, options, 'Indoor Climbing Test');
    const activity = event.getFirstActivity();

    // The FIT file has sport="rock_climbing" and sub_sport=68 ("indoor_climbing").
    // Previously this path could not resolve sub_sport correctly and ended up as unknown.
    expect(activity.type).toBe(ActivityTypes.IndoorClimbing);
    expect(activity.type).not.toBe(ActivityTypes.unknown);
    expect(event.getActivityTypesAsString()).toBe(ActivityTypes['Indoor Climbing']);
  });
});
