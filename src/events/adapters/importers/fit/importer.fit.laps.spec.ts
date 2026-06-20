import * as fs from 'fs';
import * as path from 'path';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { EventImporterFIT } from './importer.fit';

describe('EventImporterFIT lap boundaries', () => {
  const importer = EventImporterFIT as unknown as {
    getActivityFromSessionObject: (sessionObject: any, fitDataObject: any, options: ActivityParsingOptions) => any;
    getLapFromSessionLapObject: (
      sessionLapObject: any,
      activity: any,
      lapIndex: number,
      options: ActivityParsingOptions
    ) => any;
  };

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

  it('should recover inverted session bounds from timer duration when records are missing', () => {
    const options = new ActivityParsingOptions({ generateUnitStreams: false });
    const activity = importer.getActivityFromSessionObject(
      {
        start_time: new Date('2015-10-08T10:19:07.000Z'),
        timestamp: new Date('2015-10-08T10:11:03.000Z'),
        total_timer_time: 3115.3,
        sport: 'running',
        laps: []
      },
      {
        records: [],
        events: [
          { timestamp: new Date('2015-10-08T10:11:03.000Z'), event: 'timer', event_type: 'stop' },
          { timestamp: new Date('2015-10-08T10:19:07.000Z'), event: 'timer', event_type: 'start' }
        ],
        file_ids: []
      },
      options
    );

    expect(activity.startDate.toISOString()).toBe('2015-10-08T10:19:07.000Z');
    expect(activity.endDate.toISOString()).toBe('2015-10-08T11:11:02.300Z');
    expect(activity.endDate > activity.startDate).toBe(true);
  });

  it('should recover inverted lap bounds from the containing activity', () => {
    const options = new ActivityParsingOptions({ generateUnitStreams: false });
    const activity = importer.getActivityFromSessionObject(
      {
        start_time: new Date('2017-07-15T12:52:14.000Z'),
        timestamp: new Date('2017-07-15T22:30:51.000Z'),
        total_elapsed_time: 34717,
        total_timer_time: 34717,
        sport: 'running',
        laps: []
      },
      {
        records: [
          { timestamp: new Date('2017-07-15T12:52:14.000Z') },
          { timestamp: new Date('2017-07-15T17:30:57.000Z') }
        ],
        events: [],
        file_ids: []
      },
      options
    );

    const lap = importer.getLapFromSessionLapObject(
      {
        timestamp: new Date('2017-07-15T17:30:57.000Z'),
        start_time: new Date('2017-07-15T21:17:07.000Z'),
        lap_trigger: 'manual'
      },
      activity,
      0,
      options
    );

    expect(lap.startDate.toISOString()).toBe('2017-07-15T12:52:14.000Z');
    expect(lap.endDate.toISOString()).toBe('2017-07-15T17:30:57.000Z');
    expect(lap.endDate > lap.startDate).toBe(true);
    expect(() => lap.toJSON(activity)).not.toThrow();
  });
});
