import { EventImporterSuuntoJSON } from './importer.suunto.json';
import { DataDuration } from '../../../../data/data.duration';
import { DataElapsedTime } from '../../../../data/data.elapsed-time';
import { DataTimerTime } from '../../../../data/data.timer-time';

describe('EventImporterSuuntoJSON duration policy', () => {
  it('keeps Duration as active time and exposes elapsed time separately', async () => {
    const payload = {
      DeviceLog: {
        Device: {
          Name: 'Suunto Test',
          SerialNumber: '12345',
          Info: {
            HW: '1.0',
            SW: '1.0'
          }
        },
        Samples: [
          {
            TimeISO8601: '2026-01-01T10:00:00.000Z',
            Events: [{ Activity: { ActivityType: 3 } }]
          },
          {
            TimeISO8601: '2026-01-01T10:10:00.000Z',
            Events: [{ Lap: { Type: 'Stop' } }]
          }
        ],
        Windows: [
          {
            Window: {
              Type: 'Activity',
              Duration: 600,
              PauseDuration: 120
            }
          }
        ],
        Header: {
          DateTime: '2026-01-01T10:00:00.000Z',
          Duration: 600
        }
      }
    };

    const event = await EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(payload));
    const activity = event.getFirstActivity();

    expect(activity.getStat(DataElapsedTime.type)?.getValue()).toBe(600);
    expect(activity.getDuration()?.getValue()).toBe(480);
    expect(activity.getStat(DataTimerTime.type)?.getValue()).toBe(480);
    expect(activity.getStat(DataDuration.type)?.getValue()).toBe(480);
    expect(activity.getPause()?.getValue()).toBe(120);
  });
});
