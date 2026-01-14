import { EventImporterGPX } from './importer.gpx';
import xmldom from '@xmldom/xmldom';

describe('importer.gpx', () => {
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
});
