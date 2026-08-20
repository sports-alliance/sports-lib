import { Activity } from '../../../activities/activity';
import { ActivityTypes } from '../../../activities/activity.types';
import { Creator } from '../../../creators/creator';
import { DataLatitudeDegrees } from '../../../data/data.latitude-degrees';
import { DataLongitudeDegrees } from '../../../data/data.longitude-degrees';
import { DataStrokeRate } from '../../../data/data.stroke-rate';
import { Stream } from '../../../streams/stream';
import { Event } from '../../event';
import { FileType } from '../file-type.enum';
import { EventExporterGPX } from './exporter.gpx';

describe('EventExporterGPX', () => {
  it('exports the activity type as the GPX track type', async () => {
    const event = new Event('TCX running activity', new Date(0), new Date(1000), FileType.TCX);
    const activity = new Activity(new Date(0), new Date(1000), ActivityTypes.Running, new Creator('Test'));
    activity.addStream(new Stream(DataLatitudeDegrees.type, [45.74588, 45.74589]));
    activity.addStream(new Stream(DataLongitudeDegrees.type, [3.075769, 3.07577]));
    event.addActivity(activity);

    const gpx = await new EventExporterGPX().getAsString(event);

    expect(gpx).toContain('<trk>');
    expect(gpx).toContain('<name>Running</name>');
    expect(gpx).toContain('<type>Running</type>');
  });

  it('writes stroke rate through the GPX cadence extension', async () => {
    const event = new Event('Open-water swim', new Date(0), new Date(1000), FileType.FIT);
    const activity = new Activity(new Date(0), new Date(1000), ActivityTypes.OpenWaterSwimming, new Creator('Test'));
    activity.addStream(new Stream(DataLatitudeDegrees.type, [45.74588, 45.74589]));
    activity.addStream(new Stream(DataLongitudeDegrees.type, [3.075769, 3.07577]));
    activity.addStream(new Stream(DataStrokeRate.type, [32, 34]));
    event.addActivity(activity);

    const gpx = await new EventExporterGPX().getAsString(event);

    expect(gpx).toContain('<gpxtpx:cad>32</gpxtpx:cad>');
    expect(gpx).toContain('<gpxtpx:cad>34</gpxtpx:cad>');
  });
});
