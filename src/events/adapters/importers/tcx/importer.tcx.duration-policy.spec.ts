import { DOMParser } from '@xmldom/xmldom';
import { EventImporterTCX } from './importer.tcx';
import { DataDuration } from '../../../../data/data.duration';
import { DataElapsedTime } from '../../../../data/data.elapsed-time';
import { DataTimerTime } from '../../../../data/data.timer-time';

describe('EventImporterTCX duration policy', () => {
  it('keeps Duration as active timer time and exposes elapsed time separately', async () => {
    const tcxXml = `
      <TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">
        <Activities>
          <Activity Sport="Biking">
            <Id>2026-01-01T10:00:00Z</Id>
            <Lap StartTime="2026-01-01T10:00:00Z">
              <TotalTimeSeconds>100</TotalTimeSeconds>
              <DistanceMeters>1000</DistanceMeters>
              <Track>
                <Trackpoint>
                  <Time>2026-01-01T10:00:00Z</Time>
                </Trackpoint>
                <Trackpoint>
                  <Time>2026-01-01T10:02:10Z</Time>
                </Trackpoint>
              </Track>
            </Lap>
          </Activity>
        </Activities>
      </TrainingCenterDatabase>
    `;

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(tcxXml, 'text/xml');
    const event = await EventImporterTCX.getFromXML(xmlDoc);
    const activity = event.getFirstActivity();

    expect(activity.getStat(DataElapsedTime.type)?.getValue()).toBe(130);
    expect(activity.getDuration()?.getValue()).toBe(100);
    expect(activity.getStat(DataTimerTime.type)?.getValue()).toBe(100);
    expect(activity.getStat(DataDuration.type)?.getValue()).toBe(100);
    expect(activity.getPause()?.getValue()).toBe(30);
  });

  it('falls back timer time to elapsed time when TotalTimeSeconds is missing', async () => {
    const tcxXml = `
      <TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">
        <Activities>
          <Activity Sport="Biking">
            <Id>2026-01-01T10:00:00Z</Id>
            <Lap StartTime="2026-01-01T10:00:00Z">
              <DistanceMeters>1000</DistanceMeters>
              <Track>
                <Trackpoint>
                  <Time>2026-01-01T10:00:00Z</Time>
                </Trackpoint>
                <Trackpoint>
                  <Time>2026-01-01T10:01:30Z</Time>
                </Trackpoint>
              </Track>
            </Lap>
          </Activity>
        </Activities>
      </TrainingCenterDatabase>
    `;

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(tcxXml, 'text/xml');
    const event = await EventImporterTCX.getFromXML(xmlDoc);
    const activity = event.getFirstActivity();

    expect(activity.getLaps().length).toBe(1);
    expect(activity.getStat(DataElapsedTime.type)?.getValue()).toBe(90);
    expect(activity.getDuration()?.getValue()).toBe(90);
    expect(activity.getStat(DataTimerTime.type)?.getValue()).toBe(90);
    expect(activity.getPause()?.getValue()).toBe(0);
  });
});
