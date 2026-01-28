import { DOMParser } from '@xmldom/xmldom';
import { EventImporterTCX } from './importer.tcx';
import { ActivityTypes } from '../../../../activities/activity.types';

describe('EventImporterTCX Fallback', () => {
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
