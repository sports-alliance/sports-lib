import { EventImporterFIT } from './importer.fit';
import { Activity } from '../../../../activities/activity';
import { ActivityTypes } from '../../../../activities/activity.types';
import { Creator } from '../../../../creators/creator';
import { IBIStream } from '../../../../streams/ibi-stream';
import { analyzeActivityRR } from '../../../utilities/activity-rr';

const importer = EventImporterFIT as unknown as {
  getIBIStreamForActivity(records: { time: number[] }[], start: Date, activity: Activity): IBIStream;
};

describe('FIT R-R timing', () => {
  it('preserves sentinel gaps and a multisport leg offset on the IBI clock', () => {
    const activity = new Activity(new Date(50000), new Date(70000), ActivityTypes.Running, new Creator('Synthetic'));
    const stream: IBIStream = importer.getIBIStreamForActivity([{ time: [1, 65.535, 1] }], new Date(0), activity);
    expect(stream.getData()).toEqual([1000]);
    expect(stream.getStreamDataByDuration()).toEqual([{ time: 17535, value: 1000 }]);
    activity.addStream(stream);
    expect(analyzeActivityRR(activity)!.summary.coveragePercentage).toBe(5);
  });
  it('breaks HRV adjacency at sentinel gaps without counting them as real intervals', () => {
    const activity = new Activity(new Date(0), new Date(70000), ActivityTypes.Running, new Creator('Synthetic'));
    activity.addStream(importer.getIBIStreamForActivity([{ time: [0.8, 65.535, 0.9] }], new Date(0), activity));
    expect(analyzeActivityRR(activity)!.summary).toMatchObject({
      intervalCount: 2,
      gapCount: 1,
      rmssd: null,
      longestGap: 65.535
    });
  });
});
