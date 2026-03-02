import * as fs from 'fs';
import * as path from 'path';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { EventImporterFIT } from './importer.fit';

describe('EventImporterFIT lap boundaries', () => {
  it('should recover valid lap boundaries when lap timestamps point to the activity start', async () => {
    const fitFilePath = path.join(__dirname, '../../../../../samples/fit/laps-issue.fit');
    const fileContent = fs.readFileSync(fitFilePath);
    const arrayBuffer = fileContent.buffer.slice(
      fileContent.byteOffset,
      fileContent.byteOffset + fileContent.byteLength
    );

    const options = new ActivityParsingOptions({ generateUnitStreams: false });
    const event = await EventImporterFIT.getFromArrayBuffer(arrayBuffer, options, 'laps-issue.fit');
    const activity = event.getFirstActivity();
    const laps = activity.getLaps();

    expect(laps).toHaveLength(3);

    expect(laps.map(lap => lap.startDate.toISOString())).toEqual([
      '2025-11-02T08:30:37.000Z',
      '2025-11-02T12:52:18.000Z',
      '2025-11-02T12:57:42.000Z'
    ]);

    expect(laps.map(lap => lap.endDate.toISOString())).toEqual([
      '2025-11-02T12:52:17.000Z',
      '2025-11-02T12:57:41.000Z',
      '2025-11-02T14:34:56.000Z'
    ]);

    expect(laps.every(lap => lap.endDate > lap.startDate)).toBe(true);
    expect(laps[0].endDate <= laps[1].startDate).toBe(true);
    expect(laps[1].endDate <= laps[2].startDate).toBe(true);
  });
});
