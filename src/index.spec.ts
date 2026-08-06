import { SportsLib } from './index';
import { ActivityTypes } from './activities/activity.types';
import { DataActivityTypes } from './data/data.activity-types';
import { DataDistance } from './data/data.distance';
import { DataIBI } from './data/data.ibi';
import { DataPowerCurve } from './data/data.power-curve';
import { DataTime } from './data/data.time';
import { FileType } from './events/adapters/file-type.enum';
import { Privacy } from './privacy/privacy.class.interface';
import { DataDuration } from './data/data.duration';
import { DataPaceAvg } from './data/data.pace-avg';
import { DataPower } from './data/data.power';
import { DataSpeedAvg } from './data/data.speed-avg';
import { LapTypes } from './laps/lap.types';

describe('SportsLib', () => {
  it('should import native JSON events through the public API with activities and power curves intact', () => {
    const eventCurve = new DataPowerCurve([{ duration: new DataDuration(1), power: new DataPower(300) }]).toJSON();
    const activityCurve = new DataPowerCurve([{ duration: new DataDuration(5), power: new DataPower(250) }]).toJSON();

    const event = SportsLib.importFromJSON({
      name: 'native-json',
      startDate: 0,
      endDate: 3000,
      srcFileType: FileType.FIT,
      description: null,
      isMerge: false,
      privacy: Privacy.Private,
      powerCurve: eventCurve,
      stats: {
        [DataActivityTypes.type]: [ActivityTypes.Running]
      },
      activities: [
        {
          name: null,
          startDate: 0,
          endDate: 3000,
          type: ActivityTypes.Running,
          powerMeter: false,
          trainer: false,
          powerCurve: activityCurve,
          stats: {},
          streams: [
            { type: DataTime.type, data: [0, 1, 2, 3] },
            { type: DataDistance.type, data: [0, null, null, 30] },
            { type: DataIBI.type, data: [823, 823, 823] }
          ],
          laps: [
            {
              lapId: 1,
              startDate: 0,
              endDate: 3000,
              startIndex: null,
              endIndex: null,
              type: LapTypes.Manual,
              stats: { [DataSpeedAvg.type]: 4 }
            }
          ],
          creator: { name: 'test', devices: [] },
          intensityZones: [],
          events: []
        }
      ]
    });

    expect(event.getActivities()).toHaveLength(1);
    expect(event.powerCurve?.toJSON()).toEqual(eventCurve);
    expect(event.getStat(DataPowerCurve.type)?.toJSON()).toEqual(eventCurve);

    const activity = event.getFirstActivity();
    expect(activity.hasStreamData(DataTime.type)).toBe(false);
    expect(activity.getStream(DataDistance.type).getData()).toEqual([0, null, null, 30]);
    expect(activity.generateTimeStream([DataIBI.type]).getData(true)).toEqual([1, 2]);
    expect(activity.powerCurve?.toJSON()).toEqual(activityCurve);
    expect(activity.getStat(DataPowerCurve.type)?.toJSON()).toEqual(activityCurve);
    expect(activity.getLaps()[0].getStat(DataPaceAvg.type)?.getValue()).toBe(250);
  });
});
