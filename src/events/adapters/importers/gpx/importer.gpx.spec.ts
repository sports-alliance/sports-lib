import { EventImporterGPX } from './importer.gpx';
import xmldom from '@xmldom/xmldom';

describe('importer.gpx', () => {
  afterEach(() => {
    jest.useRealTimers();
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
          </trk>
        </gpx> `;

    const result = await EventImporterGPX.getFromString(gpxString, xmldom.DOMParser);
    expect(result.getFirstActivity().name).toEqual('Meylan Road Cycling');
  });
  it('parses route.gpx from samples', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const samplesDir = path.resolve(__dirname, '../../../../../samples/gpx');
    const filePath = path.join(samplesDir, 'route.gpx');
    const fileString = fs.readFileSync(filePath, 'utf-8');

    const result = await EventImporterGPX.getFromString(fileString, xmldom.DOMParser);
    expect(result.getActivities().length).toBeGreaterThan(0);
    const activity = result.getFirstActivity();
    expect(activity.type).toEqual('Route');

    const distance = activity.getStat('Distance');
    expect(distance).toBeDefined();
    expect(distance!.getValue()).toBeGreaterThan(0);

    // Check if the number of samples matches the number of points in the GPX
    const latStream = activity.getStream('Latitude');
    expect(latStream.getData().length).toBe(2987); // I counted 2987 rtept earlier
  });

  it('uses metadata time as deterministic base date for untimed routes', async () => {
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

    const result = await EventImporterGPX.getFromString(gpxString, xmldom.DOMParser);
    const activities = result.getActivities();

    expect(activities).toHaveLength(2);
    expect(activities[0].startDate.toISOString()).toEqual('2019-09-29T13:58:25.000Z');
    expect(activities[0].endDate.toISOString()).toEqual('2019-09-29T13:58:26.000Z');
    expect(activities[1].startDate.toISOString()).toEqual('2019-09-29T13:58:26.000Z');
    expect(activities[1].endDate.toISOString()).toEqual('2019-09-29T13:58:26.000Z');
  });

  it('falls back to epoch for untimed routes without metadata time', async () => {
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

    const result = await EventImporterGPX.getFromString(gpxString, xmldom.DOMParser);
    const activities = result.getActivities();

    expect(activities).toHaveLength(2);
    expect(activities[0].startDate.toISOString()).toEqual('1970-01-01T00:00:00.000Z');
    expect(activities[0].endDate.toISOString()).toEqual('1970-01-01T00:00:01.000Z');
    expect(activities[1].startDate.toISOString()).toEqual('1970-01-01T00:00:01.000Z');
    expect(activities[1].endDate.toISOString()).toEqual('1970-01-01T00:00:03.000Z');
  });

  it('produces stable untimed route output regardless of current system time', async () => {
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
    const firstResult = await EventImporterGPX.getFromString(gpxString, xmldom.DOMParser);
    const firstJson = firstResult.toJSON();

    jest.setSystemTime(new Date('2030-01-01T00:00:00.000Z'));
    const secondResult = await EventImporterGPX.getFromString(gpxString, xmldom.DOMParser);
    const secondJson = secondResult.toJSON();

    expect(firstJson).toEqual(secondJson);
    expect(firstResult.getActivities()[0].startDate.toISOString()).toEqual('1970-01-01T00:00:00.000Z');
    expect(secondResult.getActivities()[1].startDate.toISOString()).toEqual('1970-01-01T00:00:01.000Z');
  });
});
