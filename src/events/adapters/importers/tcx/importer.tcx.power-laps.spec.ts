import { DOMParser } from '@xmldom/xmldom';
import { EventImporterTCX } from './importer.tcx';
import { EventImporterJSON } from '../json/importer.json';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';

it.each([false, true])('keeps fractional TCX lap power consistent, supplied summaries=%s', async supplied => {
  const time = (second: number) => new Date(Date.UTC(2026, 0, 1) + second * 1000).toISOString();
  const point = (second: number, watts: number) => `<Trackpoint><Time>${time(second)}</Time>
    <Extensions><TPX xmlns="http://www.garmin.com/xmlschemas/ActivityExtension/v2"><Watts>${watts}</Watts></TPX></Extensions>
    </Trackpoint>`;
  const lap = (start: number, duration: number, points: string, summary = '') => `<Lap StartTime="${time(start)}">
    <TotalTimeSeconds>${duration}</TotalTimeSeconds><DistanceMeters>0</DistanceMeters><Calories>1</Calories>
    <Intensity>Active</Intensity><TriggerMethod>Manual</TriggerMethod><Track>${points}</Track>${summary}</Lap>`;
  const summary = supplied ? `<Extensions><LX xmlns="http://www.garmin.com/xmlschemas/ActivityExtension/v2">
    <AvgWatts>222</AvgWatts><MaxWatts>444</MaxWatts></LX></Extensions>` : '';
  const xml = `<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">
    <Activities><Activity Sport="Biking"><Id>${time(0)}</Id>
    ${lap(0, 0.5, point(0, 300))}${lap(0.5, 1, point(1, 100), summary)}
    ${lap(1.5, 1.5, point(2, 50) + point(3, 0))}</Activity></Activities></TrainingCenterDatabase>`;
  let event = await EventImporterTCX.getFromXML(
    new DOMParser().parseFromString(xml, 'application/xml') as unknown as Document,
    new ActivityParsingOptions({ generateUnitStreams: false })
  );
  for (let cycle = 0; cycle < 3; cycle++) {
    const activity = event.getFirstActivity();
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
    expect(activity.getStreamData('Power')).toEqual([300, 100, 50, 0]);
    expect(activity.getLaps()).toHaveLength(3);
    const target = activity.getLaps()[1];
    expect(+target.startDate - +activity.startDate).toBe(500);
    expect(+target.endDate - +activity.startDate).toBe(1500);
    expect(['Minimum Power', 'Maximum Power', 'Average Power'].map(type => target.getStat(type)?.getValue()))
      .toEqual(supplied ? [100, 444, 222] : [100, 300, 200]);
    event = EventImporterJSON.getEventFromJSON(JSON.parse(JSON.stringify(event.toJSON())));
  }
});
