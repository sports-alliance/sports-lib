import { DOMParser } from '@xmldom/xmldom';
import { EventImporterTCX } from './importer.tcx';
import { ActivityTypes } from '../../../../activities/activity.types';

describe('EventImporterTCX Fallback', () => {
  it.each([
    ['Running', true, ActivityTypes.Running],
    ['Biking', true, ActivityTypes.Cycling],
    ['Other', true, ActivityTypes.Other],
    [' running ', true, ActivityTypes.Running],
    ['trail_running', true, ActivityTypes.TrailRunning],
    ['Outdoor run', true, ActivityTypes.unknown],
    ['constructor', true, ActivityTypes.unknown],
    ['toString', true, ActivityTypes.unknown],
    ['__proto__', true, ActivityTypes.unknown],
    ['', true, ActivityTypes.unknown],
    [null, true, ActivityTypes.unknown],
    ['Running', false, ActivityTypes.IndoorRunning],
    ['Biking', false, ActivityTypes.IndoorCycling],
    ['Rowing', false, ActivityTypes.IndoorRowing],
    ['Outdoor run', false, ActivityTypes.unknown]
  ] as const)('resolves Sport=%p with GPS=%p as %p', async (sport, hasGps, expected) => {
    const sportAttribute = sport === null ? '' : `Sport="${sport}"`;
    const position = hasGps
      ? '<Position><LatitudeDegrees>1</LatitudeDegrees><LongitudeDegrees>2</LongitudeDegrees></Position>'
      : '';
    const xml = new DOMParser().parseFromString(`<TrainingCenterDatabase
      xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">
      <Activities><Activity ${sportAttribute}><Id>2024-01-01T10:00:00Z</Id>
        <Lap StartTime="2024-01-01T10:00:00Z"><TotalTimeSeconds>60</TotalTimeSeconds>
          <DistanceMeters>100</DistanceMeters><Track>
            <Trackpoint><Time>2024-01-01T10:00:00Z</Time>${position}<DistanceMeters>0</DistanceMeters></Trackpoint>
            <Trackpoint><Time>2024-01-01T10:01:00Z</Time>${position}<DistanceMeters>100</DistanceMeters></Trackpoint>
          </Track>
        </Lap>
      </Activity></Activities>
    </TrainingCenterDatabase>`, 'text/xml');
    const event = await EventImporterTCX.getFromXML(xml);
    const activity = event.getFirstActivity();
    expect(activity.type).toBe(expected);
    expect(activity.toJSON().type).toBe(expected);
    expect(activity.getDuration()?.getValue()).toBe(60);
    expect(activity.getDistance()?.getValue()).toBe(100);
  });

  it('should use first trackpoint time when Lap StartTime is missing', async () => {
    const tcxXml = `
      <TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">
        <Activities>
          <Activity Sport="Biking">
            <Id>2023-01-01T10:00:00Z</Id>
            <Lap>
              <!-- Missing StartTime attribute -->
              <TotalTimeSeconds>3600</TotalTimeSeconds>
              <DistanceMeters>10000</DistanceMeters>
              <Track>
                <Trackpoint>
                  <Time>2023-01-01T10:00:00Z</Time>
                  <Position>
                    <LatitudeDegrees>45.0</LatitudeDegrees>
                    <LongitudeDegrees>9.0</LongitudeDegrees>
                  </Position>
                </Trackpoint>
                <Trackpoint>
                  <Time>2023-01-01T11:00:00Z</Time>
                  <Position>
                    <LatitudeDegrees>45.1</LatitudeDegrees>
                    <LongitudeDegrees>9.1</LongitudeDegrees>
                  </Position>
                </Trackpoint>
              </Track>
            </Lap>
          </Activity>
        </Activities>
      </TrainingCenterDatabase>
    `;

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(tcxXml, 'text/xml');

    // Parse the event
    const event = await EventImporterTCX.getFromXML(xmlDoc);

    expect(event).toBeDefined();
    expect(event.getActivities().length).toBe(1);

    const activity = event.getActivities()[0];

    // Verify startDate matches the first trackpoint time
    // Note: getFromXML uses laps[0].startDate
    expect(activity.startDate.toISOString()).toBe('2023-01-01T10:00:00.000Z');

    // Verify stream creation works (no Invalid array length error)
    // This implicitly checks the data length calculation
    const distanceStream = activity.getDistance();
    expect(distanceStream).toBeDefined();

    // Verify the duration is correct (3600 seconds)
    expect(activity.getDuration()?.getValue()).toBe(3600);
  });

  it('should handle completely missing dates gracefully', async () => {
    // This tests the case where even trackpoints don't have time - should probably default to invalid date but NOT crash
    const tcxXml = `
      <TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">
        <Activities>
          <Activity Sport="Biking">
            <Id>2023-01-01T10:00:00Z</Id>
            <Lap>
              <TotalTimeSeconds>100</TotalTimeSeconds>
              <Track>
                <Trackpoint>
                   <Position>
                    <LatitudeDegrees>45.0</LatitudeDegrees>
                    <LongitudeDegrees>9.0</LongitudeDegrees>
                  </Position>
                </Trackpoint>
              </Track>
            </Lap>
          </Activity>
        </Activities>
      </TrainingCenterDatabase>
    `;

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(tcxXml, 'text/xml');

    // Should not throw
    await expect(EventImporterTCX.getFromXML(xmlDoc)).resolves.toBeDefined();
  });
});
