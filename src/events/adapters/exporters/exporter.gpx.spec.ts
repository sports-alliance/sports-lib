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
import xmldom from '@xmldom/xmldom';
import { DataSpeed } from '../../../data/data.speed';
import { DataHeartRate } from '../../../data/data.heart-rate';
import { DataCadence } from '../../../data/data.cadence';
import { DataTemperature } from '../../../data/data.temperature';
import { DataPower } from '../../../data/data.power';
import { EventImporterGPX } from '../importers/gpx/importer.gpx';
import { EventImporterJSON } from '../importers/json/importer.json';
import { ActivityUtilities } from '../../utilities/activity.utilities';

const trackPointNamespace = 'http://www.garmin.com/xmlschemas/TrackPointExtension/v2';
function speedEvent(values: (number | null)[]): Event {
  const event = new Event('Synthetic speed', new Date(0), new Date((values.length - 1) * 1000), FileType.FIT);
  const activity = new Activity(event.startDate, event.endDate, ActivityTypes.Running, new Creator('Synthetic'));
  activity.addStream(
    new Stream(
      DataLatitudeDegrees.type,
      values.map((_v, i) => 1 + i * 0.00001)
    )
  );
  activity.addStream(
    new Stream(
      DataLongitudeDegrees.type,
      values.map(() => 2)
    )
  );
  activity.addStream(new Stream(DataSpeed.type, values));
  event.addActivity(activity);
  return event;
}

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

  it.each([
    [2, 0, 3],
    [0, 0, 0],
    [2, null, 3],
    [2, 3, 4]
  ])('round-trips canonical speeds %j including zero and gaps', async (...values) => {
    const event = speedEvent(values);
    const before = event.toJSON();
    const xml = await new EventExporterGPX().getAsString(event);
    const doc = new xmldom.DOMParser().parseFromString(xml, 'text/xml');
    expect(doc.documentElement.getAttribute('xmlns:gpxtpx')).toBe(trackPointNamespace);
    const schema = doc.documentElement.getAttribute('xsi:schemaLocation');
    expect(schema).toContain(`${trackPointNamespace} http://www.garmin.com/xmlschemas/TrackPointExtensionv2.xsd`);
    expect(schema).not.toContain('TrackPointExtension/v1');
    const restored = await EventImporterGPX.getFromString(xml, xmldom.DOMParser);
    const native = EventImporterJSON.getEventFromJSON(JSON.parse(JSON.stringify(restored.toJSON())));
    expect(native.getFirstActivity().getStreamData(DataSpeed.type)).toEqual(values);
    ActivityUtilities.generateMissingStreamsForActivity(native.getFirstActivity());
    expect(native.getFirstActivity().getStreamData(DataSpeed.type)).toEqual(values);
    expect(event.toJSON()).toEqual(before);
  });

  it.each([NaN, Infinity, -1, null])('omits invalid speed %s while retaining independent sensors', async value => {
    const event = speedEvent([2, value, 3]);
    event.getFirstActivity().addStream(new Stream(DataHeartRate.type, [120, 121, 122]));
    const xml = await new EventExporterGPX().getAsString(event);
    const doc = new xmldom.DOMParser().parseFromString(xml, 'text/xml');
    const points = doc.getElementsByTagName('trkpt');
    expect(points[1].getElementsByTagNameNS(trackPointNamespace, 'speed').length).toBe(0);
    expect(points[1].getElementsByTagNameNS(trackPointNamespace, 'hr')[0].textContent).toBe('121');
  });

  it('keeps independent extensions and emits sensor fields in v2 schema sequence', async () => {
    const event = speedEvent([0, 3]);
    const a = event.getFirstActivity();
    a.addStream(new Stream(DataTemperature.type, [20, 21]));
    a.addStream(new Stream(DataHeartRate.type, [120, 121]));
    a.addStream(new Stream(DataCadence.type, [80, 81]));
    a.addStream(new Stream(DataPower.type, [100, 110]));
    const xml = await new EventExporterGPX().getAsString(event);
    const doc = new xmldom.DOMParser().parseFromString(xml, 'text/xml');
    const block = doc.getElementsByTagNameNS(trackPointNamespace, 'TrackPointExtension')[0];
    expect(
      Array.from(block.childNodes)
        .filter(n => n.nodeType === 1)
        .map(n => n.nodeName)
    ).toEqual(['gpxtpx:atemp', 'gpxtpx:hr', 'gpxtpx:cad', 'gpxtpx:speed']);
    const restored = (await EventImporterGPX.getFromString(xml, xmldom.DOMParser)).getFirstActivity();
    for (const type of [DataSpeed.type, DataHeartRate.type, DataCadence.type, DataTemperature.type, DataPower.type]) {
      expect(restored.getStreamData(type)).toEqual(a.getStreamData(type));
    }
  });
});
