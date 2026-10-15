import { EventImporterSuuntoJSON } from './importer.suunto.json';
import { EventImporterSuuntoSML } from './importer.suunto.sml';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { ActivityTypes } from '../../../../activities/activity.types';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { DataSpeed } from '../../../../data/data.speed';
import { DataSpeedZoneFiveDuration } from '../../../../data/data.speed-zone-five-duration';
import { DataFusedAltitude } from '../../../../data/data.fused-altitude';

const origin = Date.parse('2026-01-01T10:00:00Z');
const time = (seconds: number) => new Date(origin + seconds * 1000).toISOString();
const sample = (seconds: number, events: any[]) => ({ TimeISO8601: time(seconds), Events: events });
const options = new ActivityParsingOptions({ generateUnitStreams: false });
function payload(): any {
  return { DeviceLog: {
    Device: { Name: 'Synthetic', Info: { HW: '1', SW: '1' } },
    Header: { DateTime: time(0), Duration: 3600, SpeedZones: { Zone5LowerLimit: 3, Zone5Duration: 3600 } },
    Windows: [{ Window: { Type: 'Activity', Duration: 3600 } }],
    Samples: [sample(0, [{ Activity: { ActivityType: 3 } }]),
      ...Array.from({ length: 3601 }, (_, seconds) => ({ TimeISO8601: time(seconds), Speed: 3 })),
      sample(3600, [{ Lap: { Type: 'Stop' } }])]
  } };
}
const parse = (data: any) => EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(data), options);

describe('Suunto source evidence', () => {
  it('keeps calibrated threshold pace when the Activity event is not first', async () => {
    const data = payload();
    data.DeviceLog.Samples[0].Events.unshift({ Pause: { State: false } });
    const activity = (await parse(data)).getFirstActivity();
    expect(activity.type).toBe(ActivityTypes.Running);
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic).toMatchObject({ method: 'PACE', score: 100 });
  });

  it('retains one unknown-sport boundary for conflicting activity entries instead of choosing a sport', async () => {
    const data = payload();
    data.DeviceLog.Samples[0].Events.push({ Activity: { ActivityType: 2 } });
    const event = await parse(data);
    expect(event.getActivities()).toHaveLength(1);
    expect(event.getFirstActivity().type).toBe(ActivityTypes.unknown);
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(event.getFirstActivity()).automatic.score).toBeNull();
  });

  it('does not duplicate the same sport boundary and retains non-first lap, stop and altitude events', async () => {
    const data = payload();
    data.DeviceLog.Samples = [
      sample(0, [{ Activity: { ActivityType: 3 } }, { Activity: { ActivityType: 3 } }]),
      sample(900, [{ Pause: { State: false } }, { Altitude: {} }]),
      sample(1800, [{ Pause: { State: false } }, { Lap: { Type: 'Manual' } }]),
      sample(3600, [{ Pause: { State: false } }, { Lap: { Type: 'Stop' } }]),
      { TimeISO8601: time(4000), Speed: 3 }
    ];
    const event = await parse(data);
    const activity = event.getFirstActivity();
    expect(event.getActivities()).toHaveLength(1);
    expect(activity.endDate.toISOString()).toBe(time(3600));
    expect(activity.getLaps()).toHaveLength(2);
    expect(activity.getStat(DataFusedAltitude.type)?.getValue()).toBe(true);
  });

  it('does not calculate pace from elapsed time when a valid summary proves zero active duration', async () => {
    const data = payload();
    data.DeviceLog.Windows[0].Window.PauseDuration = 3600;
    data.DeviceLog.Header.PauseDuration = 3600;
    data.DeviceLog.Header.SpeedZones.Zone5Duration = 0;
    const activity = (await parse(data)).getFirstActivity();
    expect(activity.getTimer()!.getValue()).toBe(0);
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic.score).toBeNull();
    expect(ActivityUtilities.evaluateTrainingStressScore(activity).automatic.score).toBeNull();
  });

  it('keeps inconsistent pause timing unavailable instead of assuming a full active duration', async () => {
    const data = payload();
    data.DeviceLog.Windows[0].Window.PauseDuration = 4000;
    const activity = (await parse(data)).getFirstActivity();
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic.score).toBeNull();
  });

  it('keeps per-leg zone durations separate while retaining shared threshold settings', async () => {
    const data = payload();
    data.DeviceLog.Windows = [
      { Window: { Type: 'Activity', Duration: 1800, SpeedZones: { Zone5Duration: 1200 } } },
      { Window: { Type: 'Activity', Duration: 1800 } }
    ];
    data.DeviceLog.Samples.splice(1801, 0, sample(1800, [{ Activity: { ActivityType: 3 } }]));
    const activities = (await parse(data)).getActivities();
    expect(activities.map(activity => activity.getStat(DataSpeedZoneFiveDuration.type)?.getValue())).toEqual([1200, undefined]);
    expect(activities.map(activity => activity.intensityZones.find(zone => zone.type === DataSpeed.type)?.zone5LowerLimit)).toEqual([3, 3]);
    expect(activities.map(activity => ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic.score)).toEqual([50, 50]);
  });

  it('preserves single-leg parent zone durations and allows explicit local zero to override them', async () => {
    const data = payload();
    expect((await parse(data)).getFirstActivity().getStat(DataSpeedZoneFiveDuration.type)?.getValue()).toBe(3600);
    data.DeviceLog.Windows[0].Window.SpeedZones = { Zone5Duration: 0 };
    expect((await parse(data)).getFirstActivity().getStat(DataSpeedZoneFiveDuration.type)?.getValue()).toBe(0);
  });

  it('preserves repeated XML events and all-paused duration through SML', async () => {
    const xml = `<sml><DeviceLog><Device><Name>Synthetic</Name><Info><HW>1</HW><SW>1</SW></Info></Device>
      <Header><DateTime>${time(0)}</DateTime><Duration>600</Duration><PauseDuration>600</PauseDuration><ActivityType>3</ActivityType>
      <SpeedZones><Zone5LowerLimit>3</Zone5LowerLimit><Zone5Duration>0</Zone5Duration></SpeedZones></Header>
      <Samples><Sample><UTC>${time(0)}</UTC><Speed>3</Speed></Sample>
      <Sample><Time>300</Time><Events><Pause><State>true</State></Pause><Activity><ActivityType>3</ActivityType></Activity></Events>
      <Events><Lap><Type>Manual</Type></Lap></Events><Events><Altitude><Value>10</Value></Altitude></Events></Sample>
      <Sample><UTC>${time(600)}</UTC><Speed>3</Speed><Events><Lap><Type>Stop</Type></Lap></Events></Sample>
      </Samples></DeviceLog></sml>`;
    const activity = (await EventImporterSuuntoSML.getFromXML(xml, options)).getFirstActivity();
    expect(activity.getTimer()!.getValue()).toBe(0);
    expect(activity.getLaps()).toHaveLength(2);
    expect(activity.getAllEvents()).toHaveLength(1);
    expect(activity.getStat(DataFusedAltitude.type)?.getValue()).toBe(true);
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic.score).toBeNull();
  });
});
