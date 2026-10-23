import { EventImporterSuuntoJSON } from './importer.suunto.json';
import { EventImporterSuuntoSML } from './importer.suunto.sml';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import {
  DataRRRMSSD,
  DataRRIntervalCount,
  DataRRGapCount,
  DataRRCoverage,
  DataRRInvalidIntervalCount
} from '../../../../data/data.rr';
import { DataIBI } from '../../../../data/data.ibi';
import { DataHeartRate } from '../../../../data/data.heart-rate';
import { EventImporterJSON } from '../json/importer.json';

const time = (ms: number) => new Date(Date.parse('2026-01-01T10:00:00Z') + ms).toISOString();
const payload = () => ({
  DeviceLog: {
    Device: { Name: 'Synthetic', Info: { HW: '1', SW: '1' } },
    Header: { DateTime: time(0), Duration: 10 },
    Windows: [],
    Samples: [
      { TimeISO8601: time(0), Events: [{ Activity: { ActivityType: 3 } }] },
      { TimeISO8601: time(10000), Events: [{ Lap: { Type: 'Stop' } }] }
    ],
    'R-R': { Data: [800, 850, 900] }
  }
});
const xmlPayload = (headerStart: string, withUTC = true) => `<sml><DeviceLog>
  <Device><Name>Synthetic</Name><Info><HW>1</HW><SW>1</SW></Info></Device>
  <Header><DateTime>${headerStart}</DateTime><Duration>10</Duration><ActivityType>3</ActivityType></Header>
  <R-R><Data>${Array(20).fill(500).join(' ')}</Data></R-R>
  <Samples>
    <Sample>${withUTC ? `<UTC>${time(0)}</UTC>` : '<Time>0</Time>'}<HR>1</HR></Sample>
    <Sample>${withUTC ? `<UTC>${time(10000)}</UTC>` : '<Time>10</Time>'}<HR>1</HR></Sample>
  </Samples>
</DeviceLog></sml>`;

describe('Suunto R-R activity stats', () => {
  it.each([time(0), '2026-01-01T12:00:00', '2025-12-31T22:00:00'])(
    'anchors XML R-R intervals to UTC samples with header %s',
    async headerStart => {
      const event = await EventImporterSuuntoSML.getFromXML(xmlPayload(headerStart));
      const restored = EventImporterJSON.getEventFromJSON(JSON.parse(JSON.stringify(event.toJSON())));
      for (const parsed of [event, restored]) {
        const activity = parsed.getFirstActivity();
        expect(activity.startDate.toISOString()).toBe(time(0));
        expect(activity.getStream(DataIBI.type).getData()).toEqual(Array(20).fill(500));
        expect(activity.getStreamDataByDuration(DataIBI.type).map(sample => sample.time)).toEqual(
          Array.from({ length: 20 }, (_, i) => (i + 1) * 500)
        );
        expect(parsed.getStat(DataRRIntervalCount.type)!.getValue()).toBe(20);
        expect(parsed.getStat(DataRRCoverage.type)!.getValue()).toBe(100);
        expect(parsed.getStat(DataRRRMSSD.type)!.getValue()).toBe(0);
        expect(
          activity
            .getStream(DataHeartRate.type)
            .getData()
            .filter(value => value != null)
        ).toEqual(Array(10).fill(120));
      }
    }
  );

  it('uses the XML header clock when no UTC samples exist', async () => {
    const event = await EventImporterSuuntoSML.getFromXML(xmlPayload(time(0), false));
    expect(event.getFirstActivity().startDate.toISOString()).toBe(time(0));
    expect(event.getStat(DataRRIntervalCount.type)!.getValue()).toBe(20);
    expect(event.getStat(DataRRCoverage.type)!.getValue()).toBe(100);
  });

  it('preserves the source header anchor for ordinary JSON interval arrays', async () => {
    const data = payload();
    data.DeviceLog.Header.DateTime = time(5000);
    const event = await EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(data));
    expect(
      event
        .getFirstActivity()
        .getStreamDataByDuration(DataIBI.type)
        .map(sample => sample.time)
    ).toEqual([5800, 6650, 7550]);
  });

  it('clips end-crossing intervals to activity coverage without including them as beats', async () => {
    const data = payload();
    data.DeviceLog.Header.Duration = 2;
    data.DeviceLog.Samples[1].TimeISO8601 = time(2000);
    data.DeviceLog['R-R'].Data = [800, 800, 800];
    const event = await EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(data));
    expect(event.getStat(DataRRIntervalCount.type)!.getValue()).toBe(2);
    expect(event.getStat(DataRRCoverage.type)!.getValue()).toBe(100);
  });

  it('counts invalid observations at the beginning of an activity', async () => {
    const data = payload();
    data.DeviceLog['R-R'].Data = [0, 800, 850];
    const event = await EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(data));
    expect(event.getStat(DataRRInvalidIntervalCount.type)!.getValue()).toBe(1);
  });
  it('derives stats from an app-export interval array', async () => {
    const event = await EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(payload()));
    expect(event.getStat(DataRRIntervalCount.type)!.getValue()).toBe(3);
    expect(event.getStat(DataRRRMSSD.type)!.getValue()).toBe(50);
    expect(event.getStat(DataRRCoverage.type)!.getValue()).toBe(25.5);
  });
  it.each([false, true])('preserves SML batch gaps with string Attributes=%s', async stringify => {
    const source = payload().DeviceLog.Samples.map(sample => ({
      TimeISO8601: sample.TimeISO8601,
      Attributes: { 'suunto/sml': { Sample: { Events: sample.Events } } }
    }));
    const batch = (ms: number, ibi: number[]) => ({
      TimeISO8601: time(ms),
      Attributes: { 'suunto/sml': { 'R-R': { IBI: ibi } } }
    });
    const Samples = [source[0], batch(0, [800]), batch(5000, [900]), source[1]].map(sample => ({
      ...sample,
      Attributes: stringify ? JSON.stringify(sample.Attributes) : sample.Attributes
    }));
    const event = await EventImporterSuuntoSML.getFromJSONString(JSON.stringify({ Samples }));
    const activity = event.getFirstActivity();
    expect(activity.getStat(DataRRGapCount.type)!.getValue()).toBe(1);
    expect(activity.getStat(DataRRRMSSD.type)).toBeUndefined();
    expect(activity.getStreamDataByDuration(DataIBI.type).map(sample => sample.time)).toEqual([800, 5900]);
  });
  it('does not add unrequested IBI streams or activity HRV stats', async () => {
    const options = new ActivityParsingOptions({ streams: { includeTypes: ['Heart Rate'] } });
    const event = await EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(payload()), options);
    expect(event.getFirstActivity().hasStreamData(DataIBI.type)).toBe(false);
    expect(event.getStat(DataRRIntervalCount.type)).toBeUndefined();
  });

  it('keeps cumulative timing for an untimestamped SML interval batch', async () => {
    const Samples = payload().DeviceLog.Samples.map(sample => ({
      TimeISO8601: sample.TimeISO8601,
      Attributes: { 'suunto/sml': { Sample: { Events: sample.Events } } }
    }));
    const event = await EventImporterSuuntoSML.getFromJSONString(
      JSON.stringify({
        Samples: [Samples[0], { Attributes: { 'suunto/sml': { 'R-R': { Data: '800,850,900' } } } }, Samples[1]]
      })
    );
    expect(event.getStat(DataRRIntervalCount.type)!.getValue()).toBe(3);
    expect(event.getStat(DataRRRMSSD.type)!.getValue()).toBe(50);
  });
});
