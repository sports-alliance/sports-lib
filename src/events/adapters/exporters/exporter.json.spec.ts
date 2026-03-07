import { Activity } from '../../../activities/activity';
import { ActivityTypes } from '../../../activities/activity.types';
import { Creator } from '../../../creators/creator';
import { DataDistance } from '../../../data/data.distance';
import { Event } from '../../event';
import { FileType } from '../file-type.enum';
import { EventExporterJSON } from './exporter.json';
import { Stream } from '../../../streams/stream';

describe('EventExporterJSON', () => {
  it('should export the same JSON payload as event.toJSON()', () => {
    const event = new Event('json-export', new Date(0), new Date(3000), FileType.FIT);
    const activity = new Activity(new Date(0), new Date(3000), ActivityTypes.Running, new Creator('Test'));
    activity.addStream(new Stream(DataDistance.type, [0, null, null, 30]));
    event.addActivity(activity);

    expect(EventExporterJSON.export(event)).toEqual(event.toJSON());
  });

  it('should stringify exported events without altering their JSON structure', async () => {
    const event = new Event('json-export', new Date(0), new Date(3000), FileType.FIT);
    const activity = new Activity(new Date(0), new Date(3000), ActivityTypes.Running, new Creator('Test'));
    activity.addStream(new Stream(DataDistance.type, [0, 10, 20, 30]));
    event.addActivity(activity);

    const exported = EventExporterJSON.export(event);

    await expect(EventExporterJSON.getAsString(event)).resolves.toEqual(JSON.stringify(exported));
  });
});
