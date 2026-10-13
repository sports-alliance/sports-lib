import { EventImporterSuuntoJSON } from './importer.suunto.json';
import { DataEHPE } from '../../../../data/data.ehpe';
import { DataEHPEAvg } from '../../../../data/data.ehpe-avg';
import { DataEVPE } from '../../../../data/data.evpe';
import { DataEVPEAvg } from '../../../../data/data.evpe-avg';

describe('Suunto position error metrics', () => {
  it('preserves source values and unrounded averages while displaying meters to one decimal', async () => {
    const ehpe = [3.897331154684096, 5.74822695035461];
    const evpe = [8.704248366013072, 8.21631205673759];
    const payload = {
      DeviceLog: {
        Device: { Name: 'Synthetic', Info: { HW: '1', SW: '1' } },
        Header: { DateTime: '2026-01-01T10:00:00.000Z', Duration: 2 },
        Windows: [{ Window: { Type: 'Activity', Duration: 2 } }],
        Samples: [
          {
            TimeISO8601: '2026-01-01T10:00:00.000Z',
            Events: [{ Activity: { ActivityType: 3 } }],
            EHPE: ehpe[0],
            EVPE: evpe[0]
          },
          {
            TimeISO8601: '2026-01-01T10:00:01.000Z',
            EHPE: ehpe[1],
            EVPE: evpe[1]
          },
          {
            TimeISO8601: '2026-01-01T10:00:02.000Z',
            Events: [{ Lap: { Type: 'Stop' } }]
          }
        ]
      }
    };
    const event = await EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(payload));
    const activity = event.getFirstActivity();

    [
      { base: DataEHPE, avg: DataEHPEAvg, values: ehpe, display: '4.8' },
      { base: DataEVPE, avg: DataEVPEAvg, values: evpe, display: '8.5' }
    ].forEach(({ base, avg, values, display }) => {
      expect(activity.getStreamData(base.type).filter(value => typeof value === 'number')).toEqual(values);
      const stat = activity.getStat(avg.type)!;
      const mean = (values[0] + values[1]) / 2;
      expect(stat.getValue()).toBe(mean);
      expect(stat.getUnit()).toBe('m');
      expect(stat.getDisplayValue()).toBe(display);
      expect(stat.getDisplayUnit()).toBe('m');
      expect(stat.toJSON()).toEqual({ [avg.type]: mean });
    });
  });
});
