import { Activity } from '../../activities/activity';
import { ActivityTypes } from '../../activities/activity.types';
import { Creator } from '../../creators/creator';
import { IBIStream } from '../../streams/ibi-stream';
import { Stream } from '../../streams/stream';
import { EventImporterJSON } from '../adapters/importers/json/importer.json';
import { ActivityUtilities } from './activity.utilities';
import { analyzeActivityRR } from './activity-rr';

const activity = (stream: Stream) => {
  const result = new Activity(new Date(0), new Date(10000), ActivityTypes.Running, new Creator('Synthetic'));
  result.addStream(stream);
  return result;
};
const reload = (child: Activity) =>
  EventImporterJSON.getActivityFromJSON(JSON.parse(JSON.stringify(child.toJSON()))) as Activity;

describe('cropping irregular IBI', () => {
  it('retains the actual beats inside the crop and rebases their timestamps', () => {
    const source = new IBIStream([800, 900, 700], [800, 5900, 6600]);
    const original = JSON.stringify(source.toJSON());
    let child = activity(source);
    ActivityUtilities.cropTime(child, new Date(4000), new Date(8000));
    for (let pass = 0; pass < 3; pass++) {
      expect(child.getStream('IBI')).toBeInstanceOf(IBIStream);
      expect(child.getStream('IBI').getStreamDataByDuration()).toEqual([
        { time: 1900, value: 900 },
        { time: 2600, value: 700 }
      ]);
      child = reload(child);
    }
    expect(JSON.stringify(source.toJSON())).toBe(original);
  });

  it('retains partial boundary intervals for coverage without using them as full beats', () => {
    const child = activity(new IBIStream([800, 800, 800, 800, 800]));
    ActivityUtilities.cropTime(child, new Date(1000), new Date(3500));
    expect(
      child
        .getStream('IBI')
        .getStreamDataByDuration()
        .map(sample => sample.time)
    ).toEqual([600, 1400, 2200, 3000]);
    expect(analyzeActivityRR(child)!.summary).toMatchObject({ intervalCount: 2, coveragePercentage: 100 });
    expect(analyzeActivityRR(reload(child))!.summary).toEqual(analyzeActivityRR(child)!.summary);
  });

  it('preserves internal gaps through cropping and JSON restoration', () => {
    const child = activity(new IBIStream([800, 900, 700], [800, 5900, 7800]));
    ActivityUtilities.cropTime(child, new Date(1000), new Date(8000));
    expect(analyzeActivityRR(reload(child))!.summary).toMatchObject({
      intervalCount: 2,
      gapCount: 1,
      longestGap: 1.2,
      rmssd: null
    });
  });

  it('retains invalid observations as timestamped adjacency barriers', () => {
    const child = activity(new IBIStream([800, null, 0, 900], [800, 5000, 5000, 5900]));
    ActivityUtilities.cropTime(child, new Date(4000), new Date(6000));
    expect(child.getStream('IBI').getStreamDataByDuration()).toEqual([
      { time: 1000, value: null },
      { time: 1000, value: 0 },
      { time: 1900, value: 900 }
    ]);
    expect(analyzeActivityRR(reload(child))!.summary).toMatchObject({
      intervalCount: 1,
      invalidIntervalCount: 2,
      coveragePercentage: 45
    });
  });

  it('retains an empty raw IBI stream when no intervals overlap the crop', () => {
    const child = activity(new IBIStream([800, 900, 700], [800, 5900, 6600]));
    ActivityUtilities.cropTime(child, new Date(4000), new Date(4500));
    const restored = reload(child);
    expect(restored.getStream('IBI')).toBeInstanceOf(IBIStream);
    expect(restored.getStream('IBI').getStreamDataByDuration()).toEqual([]);
    expect(analyzeActivityRR(restored)).toBeNull();
  });

  it('keeps original absolute beat times across successive crops', () => {
    const child = activity(new IBIStream([800, 900, 700], [800, 5900, 7800]));
    ActivityUtilities.cropTime(child, new Date(1000), new Date(9000));
    ActivityUtilities.cropTime(child, new Date(4000), new Date(8000));
    expect(reload(child).getStreamDataByTime('IBI')).toEqual([
      { time: 5900, value: 900 },
      { time: 7800, value: 700 }
    ]);
  });

  it.each([
    [undefined, 2000, [800, 1600, 2400]],
    [2000, undefined, [400, 1200, 2000]],
    [1001, 3500, [400, 1200, 2000]]
  ])('uses the existing crop bounds for start=%s end=%s', (start, end, times) => {
    const child = activity(new IBIStream([800, 800, 800, 800, 800]));
    ActivityUtilities.cropTime(
      child,
      start === undefined ? undefined : new Date(start),
      end === undefined ? undefined : new Date(end)
    );
    expect(
      child
        .getStream('IBI')
        .getStreamDataByDuration()
        .map(sample => sample.time)
    ).toEqual(times);
  });

  it('uses raw intervals even with a read filter and leaves the source unchanged', () => {
    const source = new IBIStream([800, 900, 700], [800, 5900, 6600]);
    source.useFilter({ filterData: () => [500, 500, 500] });
    const child = activity(source);
    ActivityUtilities.cropTime(child, new Date(4000), new Date(8000));
    expect(child.getStream('IBI').toJSON().data).toEqual([900, 700]);
    expect(source.getSampleTimes()).toEqual([800, 5900, 6600]);
    expect(source.hasFilter()).toBe(true);
  });

  it('leaves cropped regular IBI charts on their one-second clock and ineligible after reload', () => {
    const child = activity(new Stream('IBI', [null, 600, 700, 800]));
    ActivityUtilities.cropTime(child, new Date(1000), new Date(2000));
    expect(child.getStream('IBI').getStreamDataByDuration()).toEqual([
      { time: 0, value: 600 },
      { time: 1000, value: 700 }
    ]);
    expect(analyzeActivityRR(reload(child))).toBeNull();
  });
});
