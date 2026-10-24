import { EventImporterGPX } from './importer.gpx';
import xmldom from '@xmldom/xmldom';
import { EventImporterJSON } from '../json/importer.json';
import { Activity } from '../../../../activities/activity';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { DataLatitudeDegrees } from '../../../../data/data.latitude-degrees';
import { ParsingEventLibError } from '../../../../errors/parsing-event-lib.error';

describe('importer.gpx', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const timedTrack = (times: string[]) => `<gpx version="1.1" creator="Synthetic exporter"
    xmlns="http://www.topografix.com/GPX/1/1"><trk><trkseg>
    ${times.map((time, index) => `<trkpt lat="${1 + index * 0.001}" lon="2"><time>${time}</time></trkpt>`).join('')}
    </trkseg></trk></gpx>`;

  it('imports Unix-millisecond point times without changing their instants or sample placement', async () => {
    const start = Date.UTC(2026, 0, 1, 10, 0, 0, 250);
    const event = await EventImporterGPX.getFromString(
      timedTrack([start, start + 3000, start + 6000].map(String)),
      xmldom.DOMParser
    );
    const activity = event.getFirstActivity();

    expect(event.getActivities()).toHaveLength(1);
    expect(activity.startDate.getTime()).toBe(start);
    expect(activity.endDate.getTime()).toBe(start + 6000);
    expect(activity.getDuration()?.getValue()).toBe(6);
    expect(activity.getStreamData(DataLatitudeDegrees.type)).toEqual([1, null, null, 1.001, null, null, 1.002]);
    const restored = EventImporterJSON.getEventFromJSON(JSON.parse(JSON.stringify(event.toJSON())));
    expect(restored.getFirstActivity().startDate.getTime()).toBe(start);
    expect(restored.getFirstActivity().endDate.getTime()).toBe(start + 6000);
  });

  it('sorts mixed ISO and Unix-millisecond timestamps by their actual instants', async () => {
    const start = Date.UTC(2026, 0, 1, 10);
    const event = await EventImporterGPX.getFromString(
      timedTrack([String(start + 6000), '2026-01-01T12:00:00+02:00', String(start + 3000)]),
      xmldom.DOMParser
    );
    const activity = event.getFirstActivity();

    expect(activity.startDate.getTime()).toBe(start);
    expect(activity.endDate.getTime()).toBe(start + 6000);
    expect(activity.getStreamData(DataLatitudeDegrees.type)).toEqual([1.001, null, null, 1.002, null, null, 1]);
  });

  it.each(['', 'not-a-time', 'NaN', 'Infinity', '1767261600', '99999999999999', '<value>1767261600000</value>'])(
    'rejects an invalid point time before allocating any streams: %s',
    async time => {
      const createStream = jest.spyOn(Activity.prototype, 'createStream');
      const result = EventImporterGPX.getFromString(timedTrack(['2026-01-01T10:00:00Z', time]), xmldom.DOMParser);

      await expect(result).rejects.toBeInstanceOf(ParsingEventLibError);
      await expect(result).rejects.toThrow('GPX track points contain invalid timestamps');
      expect(createStream).not.toHaveBeenCalled();
    }
  );

  it('retains the configured maximum duration for Unix-millisecond tracks', async () => {
    const start = Date.UTC(2026, 0, 1, 10);
    const createStream = jest.spyOn(Activity.prototype, 'createStream');
    await expect(
      EventImporterGPX.getFromString(
        timedTrack([start, start + 2 * 86400_000].map(String)),
        xmldom.DOMParser,
        new ActivityParsingOptions({ maxActivityDurationDays: 1 })
      )
    ).rejects.toThrow('Activity duration exceeds 1 days');
    expect(createStream).not.toHaveBeenCalled();
  });

  it('rejects a time attribute instead of treating its first character as a timestamp', async () => {
    await expect(
      EventImporterGPX.getFromString(
        '<gpx version="1.1"><trk><trkseg><trkpt lat="1" lon="2" time="1767261600000"/></trkseg></trk></gpx>',
        xmldom.DOMParser
      )
    ).rejects.toThrow('GPX track points contain invalid timestamps');
  });

  it.each(['1.0', '1.1'])('keeps the GPX %s exporter without inventing device metadata', async version => {
    const gpxString = `<gpx creator="Example Exporter" version="${version}"
      xmlns="http://www.topografix.com/GPX/${version.replace('.', '/')}">
      <trk><name>Morning walk</name><trkseg>
        <trkpt lat="1" lon="2"><time>2024-01-01T10:00:00Z</time></trkpt>
        <trkpt lat="1.001" lon="2.001"><time>2024-01-01T10:01:00Z</time></trkpt>
      </trkseg></trk>
    </gpx>`;
    const event = await EventImporterGPX.getFromString(gpxString, xmldom.DOMParser);
    const restored = EventImporterJSON.getEventFromJSON(JSON.parse(JSON.stringify(event.toJSON())));
    for (const activity of [event.getFirstActivity(), restored.getFirstActivity()]) {
      expect(activity.creator.name).toBe('Example Exporter');
      expect(activity.creator.manufacturer).toBeUndefined();
      expect(activity.creator.swInfo).toBeUndefined();
      expect(activity.name).toBe('Morning walk');
    }
  });

  it('preserves individual track names separately from the event name through native JSON', async () => {
    const gpxString = `<gpx creator="Example Exporter" version="1.1"
      xmlns="http://www.topografix.com/GPX/1/1">
      <metadata><name>Workout collection</name></metadata>
      <trk><name>Warm-up</name><trkseg>
        <trkpt lat="1" lon="2"><time>2024-01-01T10:00:00Z</time></trkpt>
        <trkpt lat="1.001" lon="2.001"><time>2024-01-01T10:01:00Z</time></trkpt>
      </trkseg></trk>
      <trk><name>Κύριο μέρος</name><trkseg>
        <trkpt lat="1.001" lon="2.001"><time>2024-01-01T10:02:00Z</time></trkpt>
        <trkpt lat="1.002" lon="2.002"><time>2024-01-01T10:03:00Z</time></trkpt>
      </trkseg></trk>
    </gpx>`;
    const event = await EventImporterGPX.getFromString(gpxString, xmldom.DOMParser);
    const restored = EventImporterJSON.getEventFromJSON(JSON.parse(JSON.stringify(event.toJSON())));
    expect(restored.name).toBe(event.name);
    expect(restored.getActivities().map(activity => activity.name)).toEqual(['Warm-up', 'Κύριο μέρος']);
  });

  it('parses gpx without name', async () => {
    const gpxString = `<?xml version="1.0" encoding="UTF-8"?>
        <gpx creator="Garmin Connect" version="1.1"
          xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/11.xsd"
          xmlns:ns3="http://www.garmin.com/xmlschemas/TrackPointExtension/v1"
          xmlns="http://www.topografix.com/GPX/1/1"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns2="http://www.garmin.com/xmlschemas/GpxExtensions/v3">
          <metadata>
            <link href="connect.garmin.com">
              <text>Garmin Connect</text>
            </link>
            <time>2019-09-29T13:58:25.000Z</time>
          </metadata>
          <trk>
            <type>road_biking</type>
            <trkseg>
              <trkpt lat="1" lon="2">
                <time>2019-09-29T13:58:25.000Z</time>
              </trkpt>
            </trkseg>
          </trk>
        </gpx> `;

    const result = await EventImporterGPX.getFromString(gpxString, xmldom.DOMParser);
    expect(result.getFirstActivity().name).toEqual('');
  });

  it('parses gpx with name', async () => {
    const gpxString = `<?xml version="1.0" encoding="UTF-8"?>
        <gpx creator="Garmin Connect" version="1.1"
          xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/11.xsd"
          xmlns:ns3="http://www.garmin.com/xmlschemas/TrackPointExtension/v1"
          xmlns="http://www.topografix.com/GPX/1/1"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns2="http://www.garmin.com/xmlschemas/GpxExtensions/v3">
          <metadata>
            <link href="connect.garmin.com">
              <text>Garmin Connect</text>
            </link>
            <time>2019-09-29T13:58:25.000Z</time>
          </metadata>
          <trk>
            <name>Meylan Road Cycling</name>
            <type>road_biking</type>
            <trkseg>
              <trkpt lat="1" lon="2">
                <time>2019-09-29T13:58:25.000Z</time>
              </trkpt>
            </trkseg>
          </trk>
        </gpx> `;

    const result = await EventImporterGPX.getFromString(gpxString, xmldom.DOMParser);
    expect(result.getFirstActivity().name).toEqual('Meylan Road Cycling');
  });
  it('rejects route.gpx from the activity importer', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const samplesDir = path.resolve(__dirname, '../../../../../samples/gpx');
    const filePath = path.join(samplesDir, 'route.gpx');
    const fileString = fs.readFileSync(filePath, 'utf-8');

    await expect(EventImporterGPX.getFromString(fileString, xmldom.DOMParser)).rejects.toThrow(
      'use importRoutesFromGPX'
    );
  });

  it('rejects route-only GPX with metadata time instead of fabricating activity dates', async () => {
    const gpxString = `<?xml version="1.0" encoding="UTF-8"?>
        <gpx creator="Garmin Connect" version="1.1"
          xmlns="http://www.topografix.com/GPX/1/1"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
          <metadata>
            <time>2019-09-29T13:58:25.000Z</time>
          </metadata>
          <rte>
            <name>Route A</name>
            <rtept lat="1" lon="2"/>
            <rtept lat="1.1" lon="2.1"/>
          </rte>
          <rte>
            <name>Route B</name>
            <rtept lat="3" lon="4"/>
          </rte>
        </gpx>`;

    await expect(EventImporterGPX.getFromString(gpxString, xmldom.DOMParser)).rejects.toThrow(
      'use importRoutesFromGPX'
    );
  });

  it('rejects route-only GPX without metadata time instead of fabricating epoch dates', async () => {
    const gpxString = `<?xml version="1.0" encoding="UTF-8"?>
        <gpx creator="Garmin Connect" version="1.1"
          xmlns="http://www.topografix.com/GPX/1/1"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
          <rte>
            <name>Route A</name>
            <rtept lat="1" lon="2"/>
            <rtept lat="1.1" lon="2.1"/>
          </rte>
          <rte>
            <name>Route B</name>
            <rtept lat="3" lon="4"/>
            <rtept lat="3.1" lon="4.1"/>
            <rtept lat="3.2" lon="4.2"/>
          </rte>
        </gpx>`;

    await expect(EventImporterGPX.getFromString(gpxString, xmldom.DOMParser)).rejects.toThrow(
      'use importRoutesFromGPX'
    );
  });

  it('produces stable route-only rejection regardless of current system time', async () => {
    const gpxString = `<?xml version="1.0" encoding="UTF-8"?>
        <gpx creator="Garmin Connect" version="1.1"
          xmlns="http://www.topografix.com/GPX/1/1"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
          <rte>
            <name>Route A</name>
            <rtept lat="1" lon="2"/>
            <rtept lat="1.1" lon="2.1"/>
          </rte>
          <rte>
            <name>Route B</name>
            <rtept lat="3" lon="4"/>
          </rte>
        </gpx>`;

    jest.useFakeTimers().setSystemTime(new Date('2025-01-01T00:00:00.000Z'));
    await expect(EventImporterGPX.getFromString(gpxString, xmldom.DOMParser)).rejects.toThrow(
      'use importRoutesFromGPX'
    );

    jest.setSystemTime(new Date('2030-01-01T00:00:00.000Z'));
    await expect(EventImporterGPX.getFromString(gpxString, xmldom.DOMParser)).rejects.toThrow(
      'use importRoutesFromGPX'
    );
  });
});
