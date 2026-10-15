import {
  SportsLib,
  ActivityParsingOptions,
  DataStamina,
  DataStaminaMin,
  DataEstimatedSustainableDistance as Distance,
  DataEstimatedSustainableDistanceMin as Minimum,
  EventUtilities
} from '../../../../index';

const origin = Date.parse('2026-01-01T10:00:00Z');
const time = (seconds: number) => new Date(origin + seconds * 1000).toISOString();
const options = new ActivityParsingOptions({ generateUnitStreams: false });
function payload(): any {
  return {
    DeviceLog: {
      Device: { Name: 'Synthetic', Info: { HW: '1', SW: '1' } },
      Header: { DateTime: time(0), Duration: 10, EnduranceValid: 0 },
      Windows: [
        {
          Window: {
            Type: 'Activity',
            Duration: 10,
            Endurance: { Cur: 60, Min: 50 },
            EnduranceDistance: { Cur: 8100, Min: 6900 }
          }
        }
      ],
      Samples: [
        { TimeISO8601: time(0), Events: [{ Activity: { ActivityType: 3 } }], Endurance: 100, EnduranceDistance: 10000 },
        { TimeISO8601: time(4), Endurance: 70, EnduranceDistance: 7000 },
        { TimeISO8601: time(10), Events: [{ Lap: { Type: 'Stop' } }], Endurance: 80, EnduranceDistance: 8000 }
      ]
    }
  };
}
const parse = (data: any, parseOptions = options) => SportsLib.importFromSuunto(JSON.stringify(data), parseOptions);

describe('Suunto endurance observations', () => {
  it.each([false, true])('preserves scope endings and minima, including array shape %p', async arrayShape => {
    const data = payload();
    if (arrayShape) {
      const window = data.DeviceLog.Windows[0].Window;
      window.Endurance = [window.Endurance];
      window.EnduranceDistance = [window.EnduranceDistance];
    }
    const event = await parse(data);
    const activity = event.getFirstActivity();
    expect(activity.creator.manufacturer).toBe('Suunto');
    expect(activity.getStat(DataStamina.type)?.getValue()).toBe(60);
    expect(activity.getStat(DataStaminaMin.type)?.getValue()).toBe(50);
    expect(activity.getStat(Distance.type)?.getValue()).toBe(8100);
    expect(activity.getStat(Minimum.type)?.getValue()).toBe(6900);
    expect(activity.getStreamData(Distance.type).filter(value => value !== null)).toEqual([10000, 7000, 8000]);
    expect(activity.getStreamData(Distance.type)[1]).toBeNull();
    const restored = await SportsLib.importFromJSON(JSON.parse(JSON.stringify(event.toJSON())));
    expect(restored.getFirstActivity().getStat(Distance.type)?.getValue()).toBe(8100);
    expect(restored.getFirstActivity().getStat(Minimum.type)?.getValue()).toBe(6900);
  });

  it('uses header observations only for missing single-activity summaries, preserving window zero', async () => {
    const data = payload();
    data.DeviceLog.Header.Endurance = [{ Cur: 10, Min: 0 }];
    data.DeviceLog.Header.EnduranceDistance = [{ Cur: 9000, Min: 6000 }];
    delete data.DeviceLog.Windows[0].Window.Endurance;
    data.DeviceLog.Windows[0].Window.EnduranceDistance = { Cur: 0 };
    const activity = (await parse(data)).getFirstActivity();
    expect(activity.getStat(DataStamina.type)?.getValue()).toBe(10);
    expect(activity.getStat(DataStaminaMin.type)?.getValue()).toBe(0);
    expect(activity.getStat(Distance.type)?.getValue()).toBe(0);
    expect(activity.getStat(Minimum.type)?.getValue()).toBe(6000);
  });

  it('retains independent lap observations and does not sum them into activity estimates', async () => {
    const data = payload();
    data.DeviceLog.Samples[1].Events = [{ Lap: { Type: 'Manual' } }];
    data.DeviceLog.Windows.push(
      { Window: { Type: 'Lap', Duration: 4, EnduranceDistance: { Cur: 7100, Min: 7000 } } },
      { Window: { Type: 'Lap', Duration: 6, EnduranceDistance: { Cur: 8000, Min: 0 } } }
    );
    const activity = (await parse(data)).getFirstActivity();
    expect(activity.getLaps().map(lap => lap.getStat(Distance.type)?.getValue())).toEqual([7100, 8000]);
    expect(activity.getLaps().map(lap => lap.getStat(Minimum.type)?.getValue())).toEqual([7000, 0]);
    expect(activity.getStat(Distance.type)?.getValue()).toBe(8100);
    expect(activity.getStat(Minimum.type)?.getValue()).toBe(6900);
  });

  it('rejects unknown selections and leaves absent endurance fields absent', async () => {
    await expect(
      parse(payload(), new ActivityParsingOptions({ streams: { includeTypes: ['EnergySense'] } }))
    ).rejects.toThrow('Unknown stream');
    const data = payload();
    delete data.DeviceLog.Windows[0].Window.Endurance;
    delete data.DeviceLog.Windows[0].Window.EnduranceDistance;
    data.DeviceLog.Samples.forEach((sample: any) => {
      delete sample.Endurance;
      delete sample.EnduranceDistance;
    });
    const activity = (await parse(data)).getFirstActivity();
    for (const type of [DataStamina.type, Distance.type, Minimum.type]) {
      expect(activity.getStat(type)).toBeUndefined();
      expect(activity.hasStreamData(type)).toBe(false);
    }
  });

  it('derives a missing minimum from canonical one-second samples after ordinary timestamp collisions', async () => {
    const data = payload();
    delete data.DeviceLog.Windows[0].Window.EnduranceDistance;
    data.DeviceLog.Samples.splice(
      1,
      0,
      { TimeISO8601: time(1.4), EnduranceDistance: 2800 },
      { TimeISO8601: time(1.49), EnduranceDistance: 2820 }
    );
    const activity = (await parse(data)).getFirstActivity();
    expect(activity.getStreamData(Distance.type)[1]).toBe(2820);
    expect(activity.getStat(Minimum.type)?.getValue()).toBe(2820);
  });

  it('derives only a missing sampled minimum without inventing a scope-ending estimate', async () => {
    const data = payload();
    delete data.DeviceLog.Windows[0].Window.EnduranceDistance;
    const activity = (await parse(data)).getFirstActivity();
    expect(activity.getStat(Minimum.type)?.getValue()).toBe(7000);
    expect(activity.getStat(Distance.type)).toBeUndefined();
  });

  it('retains summary-only zero and does not manufacture a stream', async () => {
    const data = payload();
    data.DeviceLog.Samples.forEach((sample: any) => {
      delete sample.EnduranceDistance;
    });
    data.DeviceLog.Windows[0].Window.EnduranceDistance = { Cur: 0, Min: 0 };
    const activity = (await parse(data)).getFirstActivity();
    expect(activity.hasStreamData(Distance.type)).toBe(false);
    expect(activity.getStat(Distance.type)?.getValue()).toBe(0);
    expect(activity.getStat(Minimum.type)?.getValue()).toBe(0);
  });

  it.each([null, '', '0', -1, true, {}, []])('does not coerce an invalid distance %p', async invalid => {
    const data = payload();
    data.DeviceLog.Samples.forEach((sample: any) => {
      sample.EnduranceDistance = invalid;
    });
    data.DeviceLog.Windows[0].Window.EnduranceDistance = { Cur: invalid, Min: invalid };
    const activity = (await parse(data)).getFirstActivity();
    expect(activity.hasStreamData(Distance.type)).toBe(false);
    expect(activity.getStat(Distance.type)).toBeUndefined();
    expect(activity.getStat(Minimum.type)).toBeUndefined();
  });

  it('keeps observed zero, gaps and rebounds with selective parsing', async () => {
    const data = payload();
    data.DeviceLog.Samples[1].EnduranceDistance = 0;
    const activity = (
      await parse(
        data,
        new ActivityParsingOptions({
          generateUnitStreams: false,
          streams: { includeTypes: [Distance.type] }
        })
      )
    ).getFirstActivity();
    expect(activity.getStreamData(Distance.type)[4]).toBe(0);
    expect(activity.getStreamData(Distance.type)[10]).toBe(8000);
    expect(activity.hasStreamData(DataStamina.type)).toBe(false);
  });

  it('does not combine estimates from multiple recordings', async () => {
    const first = await parse(payload());
    const second = await parse(payload());
    const merged = EventUtilities.mergeEvents([first, second]);
    EventUtilities.reGenerateStatsForEvent(merged);
    expect(merged.getActivities()).toHaveLength(2);
    expect(merged.getStat(Distance.type)).toBeUndefined();
    expect(merged.getStat(Minimum.type)).toBeUndefined();
    expect(merged.getActivities().map(activity => activity.getStat(Distance.type)?.getValue())).toEqual([8100, 8100]);
  });
});
