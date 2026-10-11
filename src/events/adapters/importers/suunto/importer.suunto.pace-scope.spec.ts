import { EventImporterSuuntoJSON } from './importer.suunto.json';
import { EventImporterSuuntoSML } from './importer.suunto.sml';
import { EventImporterJSON } from '../json/importer.json';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { DataSpeed } from '../../../../data/data.speed';
import { DataSpeedZoneFiveDuration } from '../../../../data/data.speed-zone-five-duration';
import { DataEnergy } from '../../../../data/data.energy';
import { DataWeight } from '../../../../data/data.weight';
import { DataTrainingStressScore } from '../../../../data/data.training-stress-score';
import { DataTrainingStressScoreMethod } from '../../../../data/data.training-stress-score-method';

const origin = Date.parse('2026-01-01T10:00:00Z');
const time = (seconds: number) => new Date(origin + seconds * 1000).toISOString();
const options = new ActivityParsingOptions({ generateUnitStreams: false });
const speedForSport = (type: number) => type === 83 ? 1 : 3;
function payload(types = [3, 83]): any {
  return { DeviceLog: {
    Device: { Name: 'Synthetic', Info: { HW: '1', SW: '1' } },
    Header: { DateTime: time(0), Duration: types.length * 60,
      SpeedZones: { Zone2LowerLimit: 1, Zone3LowerLimit: 2, Zone4LowerLimit: 2.5,
        Zone5LowerLimit: 3, Zone5Duration: types.length * 60 } },
    Windows: types.map(type => ({ Window: { Type: 'Activity', ActivityId: type, Duration: 60,
      Speed: [{ Avg: speedForSport(type) }] } })),
    Samples: [...types.flatMap((type, index) => [
      { TimeISO8601: time(index * 60), Events: [{ Activity: { ActivityType: type } }] },
      ...Array.from({ length: 60 }, (_, second) => ({
        TimeISO8601: time(index * 60 + second), Speed: speedForSport(type)
      }))
    ]), { TimeISO8601: time(types.length * 60), Events: [{ Lap: { Type: 'Stop' } }] }]
  } };
}
const parse = (data: any, parsingOptions = options) =>
  EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(data), parsingOptions);
const evaluate = ActivityUtilities.evaluateTrainingStressScore.bind(ActivityUtilities);

describe('Suunto pace threshold sport ownership', () => {
  it.each([[3, 83], [4, 3], [3, 99, 83]])(
    'does not assign an unscoped header speed threshold to mixed sport legs (%j)', async (...types) => {
      const data = payload(types);
      data.DeviceLog.Windows[0].Window.SpeedZones = { Zone5Duration: 30 };
      const activities = (await parse(data)).getActivities();
      for (const activity of activities) {
        const zones = activity.intensityZones.find(zone => zone.type === DataSpeed.type);
        expect(zones).toBeDefined();
        expect(zones?.zone2LowerLimit).toBeUndefined();
        expect(zones?.zone3LowerLimit).toBeUndefined();
        expect(zones?.zone4LowerLimit).toBeUndefined();
        expect(zones?.zone5LowerLimit).toBeUndefined();
        expect(evaluate(activity).automatic.score).toBeNull();
      }
      expect(activities[0].getStat(DataSpeedZoneFiveDuration.type)?.getValue()).toBe(30);
      expect(activities[1].getStat(DataSpeedZoneFiveDuration.type)).toBeUndefined();
    }
  );

  it('retains a shared header threshold for multiple legs of the same sport', async () => {
    const activities = (await parse(payload([3, 3]))).getActivities();
    for (const activity of activities) {
      expect(activity.intensityZones.find(zone => zone.type === DataSpeed.type)?.zone5LowerLimit).toBe(3);
      expect(evaluate(activity).automatic).toMatchObject({ method: 'PACE', score: 1.7 });
    }
  });

  it('retains a single swimming activity threshold', async () => {
    const data = payload([83]);
    data.DeviceLog.Header.SpeedZones.Zone5LowerLimit = 1;
    expect(evaluate((await parse(data)).getFirstActivity()).automatic)
      .toMatchObject({ method: 'SWIM_PACE', score: 1.7 });
  });

  it('honors local thresholds without filling missing local boundaries from another sport', async () => {
    const data = payload();
    data.DeviceLog.Windows[0].Window.SpeedZones = { Zone5LowerLimit: 3 };
    data.DeviceLog.Windows[1].Window.SpeedZones = { Zone5LowerLimit: 1, Zone5Duration: 20 };
    const activities = (await parse(data)).getActivities();
    expect(evaluate(activities[0]).automatic).toMatchObject({ method: 'PACE', score: 1.7 });
    expect(evaluate(activities[1]).automatic).toMatchObject({ method: 'SWIM_PACE', score: 1.7 });
    const zones = activities[1].intensityZones.find(zone => zone.type === DataSpeed.type);
    expect(zones?.zone4LowerLimit).toBeUndefined();
    expect(zones?.zone5LowerLimit).toBe(1);
    expect(zones?.zone5Duration).toBe(20);
  });

  it('does not accept a threshold from a window explicitly belonging to a different sport', async () => {
    const data = payload();
    data.DeviceLog.Windows[1].Window.ActivityId = 3;
    data.DeviceLog.Windows[1].Window.SpeedZones = { Zone5LowerLimit: 3 };
    const swim = (await parse(data)).getActivities()[1];
    expect(swim.intensityZones.find(zone => zone.type === DataSpeed.type)?.zone5LowerLimit).toBeUndefined();
    expect(evaluate(swim).automatic.reasons).toContain('missing-swim-threshold');
  });

  it.each([0, -1, 'not-a-number', null])('does not replace an invalid local threshold (%s) with the unscoped header', async threshold => {
    const data = payload();
    data.DeviceLog.Windows[1].Window.SpeedZones = { Zone5LowerLimit: threshold };
    const swim = (await parse(data)).getActivities()[1];
    expect(evaluate(swim).automatic).toMatchObject({ score: null, method: null });
    expect(evaluate(swim).automatic.reasons).toContain('missing-swim-threshold');
  });

  it('keeps explicit physiological overrides available for mixed sport imports', async () => {
    const overrideOptions = new ActivityParsingOptions({ generateUnitStreams: false,
      tss: { overrides: { functionalThresholdPace: 3, thresholdSwimSpeed: 1 } } });
    const activities = (await parse(payload(), overrideOptions)).getActivities();
    expect(evaluate(activities[0]).automatic).toMatchObject({ method: 'PACE', score: 1.7 });
    expect(evaluate(activities[1]).automatic).toMatchObject({ method: 'SWIM_PACE', score: 1.7 });
  });

  it('continues to eligible calorie-derived MET when the swimming threshold is unavailable', async () => {
    const swim = (await parse(payload())).getActivities()[1];
    swim.addStat(new DataEnergy(3.5));
    swim.addStat(new DataWeight(70));
    expect(evaluate(swim).automatic).toMatchObject({ method: 'MET', score: 0.2, estimated: true });
    expect(evaluate(swim).automatic.reasons).toContain('missing-swim-threshold');
  });

  it.each([0, 42])('preserves imported TSS %s for all preferences', async score => {
    const swim = (await parse(payload())).getActivities()[1];
    swim.addStat(new DataTrainingStressScore(score));
    for (const policy of ['automatic', 'hr', 'met'] as const) {
      expect(evaluate(swim)[policy]).toMatchObject({ method: 'IMPORTED', score, provenance: 'imported' });
    }
  });

  it('does not resurrect the unscoped threshold after native JSON restoration and regeneration', async () => {
    const event = await parse(payload());
    const restored = EventImporterJSON.getEventFromJSON(JSON.parse(JSON.stringify(event.toJSON())));
    for (const activity of restored.getActivities()) {
      activity.addStat(new DataTrainingStressScore(0.1));
      activity.addStat(new DataTrainingStressScoreMethod('SWIM_PACE'));
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
      expect(activity.getStat(DataTrainingStressScore.type)).toBeUndefined();
      expect(evaluate(activity).automatic.score).toBeNull();
    }
  });

  it('retains the SML single-sport header threshold', async () => {
    const xml = `<sml><DeviceLog><Device><Name>Synthetic</Name><Info><HW>1</HW><SW>1</SW></Info></Device>
      <Header><DateTime>${time(0)}</DateTime><Duration>60</Duration><ActivityType>83</ActivityType>
        <SpeedZones><Zone5LowerLimit>1</Zone5LowerLimit></SpeedZones></Header>
      <Samples>${Array.from({ length: 61 }, (_, second) =>
        `<Sample><UTC>${time(second)}</UTC><Speed>1</Speed></Sample>`).join('')}</Samples>
      </DeviceLog></sml>`;
    const activity = (await EventImporterSuuntoSML.getFromXML(xml, options)).getFirstActivity();
    expect(evaluate(activity).automatic).toMatchObject({ method: 'SWIM_PACE', score: 1.7 });
  });
});
