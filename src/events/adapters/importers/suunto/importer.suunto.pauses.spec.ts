import { EventImporterSuuntoJSON } from './importer.suunto.json';
import { EventImporterSuuntoSML } from './importer.suunto.sml';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { DataStartEvent } from '../../../../data/data.start-event';
import { DataStopEvent } from '../../../../data/data.stop-event';

const origin = Date.parse('2026-01-01T10:00:00Z');
const time = (seconds: number) => new Date(origin + seconds * 1000).toISOString();
const sample = (seconds: number, events: any[]) => ({ TimeISO8601: time(seconds), Events: events });
const options = new ActivityParsingOptions({ generateUnitStreams: false });

function payload() {
  return {
    DeviceLog: {
      Device: { Name: 'Synthetic', Info: { HW: '1', SW: '1' } },
      Header: {
        DateTime: time(0), Duration: 3600,
        SpeedZones: {
          Zone1LowerLimit: 1, Zone2LowerLimit: 1.5, Zone3LowerLimit: 2,
          Zone4LowerLimit: 2.5, Zone5LowerLimit: 3,
          Zone1Duration: 0, Zone2Duration: 0, Zone3Duration: 0, Zone4Duration: 0, Zone5Duration: 2400
        }
      },
      Windows: [{ Window: { Type: 'Activity', Duration: 3600, PauseDuration: 1200 } }],
      Samples: [
        sample(0, [{ Activity: { ActivityType: 3 } }]),
        ...Array.from({ length: 3601 }, (_, seconds) => ({
          TimeISO8601: time(seconds), Speed: seconds >= 1200 && seconds < 2400 ? 10 : 3,
          ...(seconds === 1200 || seconds === 2400
            ? { Events: [{ Pause: { State: seconds === 1200 } }] } : {})
        })),
        sample(3600, [{ Lap: { Type: 'Stop' } }])
      ] as any[]
    }
  };
}

describe('Suunto recorded pause events', () => {
  it('excludes paused samples from pace load and preserves active summary duration through regeneration', async () => {
    const activity = (await EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(payload()), options)).getFirstActivity();
    expect(activity.getAllEvents().map(event => [event.timestamp, event.getType()])).toEqual([
      [1200, DataStopEvent.type], [2400, DataStartEvent.type]
    ]);
    expect(activity.getDuration().getValue()).toBe(2400);
    expect(activity.getTimer().getValue()).toBe(2400);
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic).toMatchObject({ method: 'PACE', score: 66.7 });
    expect(ActivityUtilities.evaluateTrainingStressScore(activity).automatic).toMatchObject({ method: 'PACE', score: 66.7 });
  });

  it('reads every event entry, accepts only boolean states and ignores invalid or out-of-range timestamps', async () => {
    const data = payload();
    data.DeviceLog.Samples = [
      sample(0, [{ Activity: { ActivityType: 3 } }]),
      ...[null, 0, ''].map(TimeISO8601 => ({ TimeISO8601, Events: [{ Pause: { State: true } }] })),
      sample(100, [{ Altitude: {} }, { Pause: { State: true } }]),
      sample(200, [{ Pause: { State: 'false' } }]),
      sample(300, [{ Pause: { State: 0 } }]),
      { TimeISO8601: 'invalid', Events: [{ Pause: { State: false } }] },
      sample(400, [{ Pause: { State: false } }]),
      sample(4000, [{ Pause: { State: true } }]),
      sample(3600, [{ Lap: { Type: 'Stop' } }])
    ];
    const activity = (await EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(data), options)).getFirstActivity();
    expect(activity.getAllEvents().map(event => [event.timestamp, event.getType()])).toEqual([
      [100, DataStopEvent.type], [400, DataStartEvent.type]
    ]);
  });

  it('retains a recorded pause across a sport change on each leg\'s relative clock', async () => {
    const data = payload();
    data.DeviceLog.Windows = [];
    data.DeviceLog.Samples = [
      sample(0, [{ Activity: { ActivityType: 3 } }]),
      sample(100, [{ Pause: { State: true } }]),
      sample(200, [{ Activity: { ActivityType: 2 } }]),
      sample(300, [{ Pause: { State: false } }]),
      sample(400, [{ Lap: { Type: 'Stop' } }])
    ];
    const activities = (await EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(data), options)).getActivities();
    expect(activities.map(activity => activity.getAllEvents().map(event => [event.timestamp, event.getType()]))).toEqual([
      [[100, DataStopEvent.type]], [[0, DataStopEvent.type], [100, DataStartEvent.type]]
    ]);
  });

  it('does not invent timer events from aggregate pause duration', async () => {
    const data = payload();
    data.DeviceLog.Samples = [sample(0, [{ Activity: { ActivityType: 3 } }]), sample(3600, [{ Lap: { Type: 'Stop' } }])];
    const activity = (await EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(data), options)).getFirstActivity();
    expect(activity.getAllEvents()).toEqual([]);
    expect(activity.getTimer().getValue()).toBe(2400);
  });

  it('preserves pause/resume events through the SML XML adapter', async () => {
    const xml = `<sml><DeviceLog><Device><Name>Synthetic</Name><Info><HW>1</HW><SW>1</SW></Info></Device>
      <Header><DateTime>${time(0)}</DateTime><Duration>600</Duration><PauseDuration>200</PauseDuration><ActivityType>3</ActivityType></Header>
      <Samples>
        <Sample><UTC>${time(0)}</UTC><Speed>3</Speed></Sample>
        <Sample><Time>100</Time><Events><Pause><State>true</State></Pause></Events></Sample>
        <Sample><Time>300</Time><Events><Pause><State>false</State></Pause></Events></Sample>
        <Sample><UTC>${time(600)}</UTC><Speed>3</Speed></Sample>
      </Samples></DeviceLog></sml>`;
    const activity = (await EventImporterSuuntoSML.getFromXML(xml, options)).getFirstActivity();
    expect(activity.getAllEvents().map(event => [event.timestamp, event.getType()])).toEqual([
      [100, DataStopEvent.type], [300, DataStartEvent.type]
    ]);
    expect(activity.getTimer().getValue()).toBe(400);
  });
});
