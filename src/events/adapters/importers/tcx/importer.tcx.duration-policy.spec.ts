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

const start = new Date('2026-01-01T10:00:00Z');
const time = (second: number) => new Date(+start + second * 1000).toISOString();
const point = (second: number | null) => `<Trackpoint>${second === null ? '' : `<Time>${time(second)}</Time>`}
  <HeartRateBpm><Value>165</Value></HeartRateBpm></Trackpoint>`;
async function parseTracks(tracks: (number | null)[][], timer: number | null = 1200, lapStart: string | null = time(0)) {
  const xml = `<TrainingCenterDatabase><Activities><Activity Sport="Biking"><Id>${time(0)}</Id>
    <Lap ${lapStart === null ? '' : `StartTime="${lapStart}"`}>
      ${timer === null ? '' : `<TotalTimeSeconds>${timer}</TotalTimeSeconds>`}<DistanceMeters>1000</DistanceMeters>
      ${tracks.map(points => `<Track>${points.map(point).join('')}</Track>`).join('')}
    </Lap></Activity></Activities></TrainingCenterDatabase>`;
  return (await EventImporterTCX.getFromXML(new DOMParser().parseFromString(xml, 'text/xml'))).getFirstActivity();
}

describe('TCX lap bounds across Tracks', () => {
  it.each([
    [[0, 600], [1200, 1800]],
    [[1200, 1800], [0, 600]],
    [[1800, 1200], [600, 0]],
    [[0, 600, 1200, 1800]],
    [[], [null, 0, 600], [1200, 1800, null], []]
  ])('uses the full absolute lap window for track layout %j', async (...tracks) => {
    const activity = await parseTracks(tracks);
    for (const target of [activity, ...activity.getLaps()]) {
      expect(+target.startDate).toBe(+start);
      expect(+target.endDate).toBe(+start + 1800000);
      expect(target.getStat(DataElapsedTime.type)?.getValue()).toBe(1800);
      expect(target.getStat(DataDuration.type)?.getValue()).toBe(1200);
      expect(target.getPause()?.getValue()).toBe(600);
    }
  });

  it('includes time before a delayed first point from the explicit lap start', async () => {
    const activity = await parseTracks([[1, 600], [1200, 1800]]);
    expect(+activity.endDate).toBe(+start + 1800000);
    expect(activity.getStat(DataElapsedTime.type)?.getValue()).toBe(1800);
    expect(activity.getPause()?.getValue()).toBe(600);
  });

  it.each([null, 'invalid'])('falls back to the earliest valid point when StartTime is %s', async lapStart => {
    const activity = await parseTracks([[1200, 1800], [0, 600]], 1200, lapStart);
    expect(+activity.startDate).toBe(+start);
    expect(+activity.endDate).toBe(+start + 1800000);
    expect(activity.getPause()?.getValue()).toBe(600);
  });

  it('uses the full lap span for missing timer duration', async () => {
    const activity = await parseTracks([[0, 600], [1200, 1800]], null);
    expect(activity.getDuration()?.getValue()).toBe(1800);
    expect(activity.getPause()?.getValue()).toBe(0);
  });

  it('retains fractional-second lap bounds without truncating the end timestamp', async () => {
    const activity = await parseTracks([[0.25, 1800.582]], 1200, time(0.25));
    expect(+activity.startDate).toBe(+start + 250);
    expect(+activity.endDate).toBe(+start + 1800582);
    expect(activity.getStat(DataElapsedTime.type)?.getValue()).toBe(1800.3);
  });

  it.each([300, 600])('does not double-count a prior lap when the next stated start is %s', async nextStart => {
    const xml = `<TrainingCenterDatabase><Activities><Activity Sport="Biking"><Id>${time(0)}</Id>
      <Lap StartTime="${time(0)}"><TotalTimeSeconds>600</TotalTimeSeconds><Track>${point(0)}${point(600)}</Track></Lap>
      <Lap StartTime="${time(nextStart)}"><TotalTimeSeconds>599</TotalTimeSeconds><Track>${point(601)}${point(1200)}</Track></Lap>
      </Activity></Activities></TrainingCenterDatabase>`;
    const activity = (await EventImporterTCX.getFromXML(new DOMParser().parseFromString(xml, 'text/xml'))).getFirstActivity();
    const lap = activity.getLaps()[1];
    expect(+lap.startDate).toBe(+start + (nextStart === 300 ? 601 : 600) * 1000);
    expect(+lap.endDate).toBe(+start + 1200000);
    expect(lap.getStat(DataElapsedTime.type)?.getValue()).toBe(nextStart === 300 ? 599 : 600);
    expect(activity.getStat(DataElapsedTime.type)?.getValue()).toBe(nextStart === 300 ? 1199 : 1200);
  });

  it('keeps timer duration as the floor when recordings end early or are absent', async () => {
    for (const tracks of [[[10, 100]], [[]]]) {
      const activity = await parseTracks(tracks, 1200);
      expect(+activity.endDate).toBe(+start + 1200000);
      expect(activity.getStat(DataElapsedTime.type)?.getValue()).toBe(1200);
      expect(activity.getDuration()?.getValue()).toBe(1200);
    }
  });
});
