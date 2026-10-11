import { Activity } from '../../../activities/activity';
import { ActivityTypes } from '../../../activities/activity.types';
import { Creator } from '../../../creators/creator';
import { DataHeartRate } from '../../../data/data.heart-rate';
import { captureHeartRateCoverageBeforeFill, retainHeartRateCoverageAfterFill, getHeartRateSamplesWithCoverage } from './hr-observation-coverage';

const make = (values: (number | null)[]) => {
  const activity = new Activity(new Date(0), new Date(10000), ActivityTypes.Walking, new Creator('Synthetic'));
  const stream = activity.createStream(DataHeartRate.type); stream.setData(values); activity.addStream(stream);
  return { activity, stream };
};

describe('private HR observation bounds', () => {
  it('clips display extrapolation and retains invalid source boundaries without changing displayed data', () => {
    const { activity, stream } = make([null, 165, null, NaN, 165, null]);
    const before = activity.toJSON();
    captureHeartRateCoverageBeforeFill(activity);
    expect(activity.toJSON()).toEqual(before);
    stream.setData([165, 165, 165, 165, 165, 165]);
    retainHeartRateCoverageAfterFill(activity);
    const observations = getHeartRateSamplesWithCoverage(activity);
    expect(observations).toEqual([{ duration: 1, value: 165 }, { duration: 2, value: 165 },
      { duration: 3, value: NaN }, { duration: 4, value: 165 }]);
    expect(stream.getData()).toEqual(Array(6).fill(165));
    captureHeartRateCoverageBeforeFill(activity);
    expect(getHeartRateSamplesWithCoverage(activity)).toEqual(observations);
  });

  it('honors replaced caller data and recaptures its bounds on the next fill', () => {
    const { activity, stream } = make([null, 165, null]);
    captureHeartRateCoverageBeforeFill(activity);
    stream.setData([165, 165, 165]); retainHeartRateCoverageAfterFill(activity);
    expect(getHeartRateSamplesWithCoverage(activity)).toHaveLength(1);
    stream.setData([165, 165, 165]);
    expect(getHeartRateSamplesWithCoverage(activity)).toHaveLength(3);
    captureHeartRateCoverageBeforeFill(activity);
    expect(getHeartRateSamplesWithCoverage(activity)).toHaveLength(3);
  });

  it('does not infer observations from entirely missing inputs', () => {
    const { activity, stream } = make([null, null, null]);
    captureHeartRateCoverageBeforeFill(activity);
    stream.setData([165, 165, 165]); retainHeartRateCoverageAfterFill(activity);
    expect(getHeartRateSamplesWithCoverage(activity)).toEqual([]);
  });
});
