import { ActivityInterface } from '../../activities/activity.interface';
import { DataIBI } from '../../data/data.ibi';
import * as RRData from '../../data/data.rr';
import { DataNumber } from '../../data/data.number';
import { IBIStream } from '../../streams/ibi-stream';
import { analyzeRRIntervals, RRAnalysis, RRSummary } from './rr-analysis';

/** Analyze the activity's raw IBI stream using elapsed wall time, including recording gaps and pauses. */
export function analyzeActivityRR(activity: ActivityInterface, includeDetails = true): RRAnalysis | null {
  const duration = activity.endDate.getTime() - activity.startDate.getTime();
  if (!activity.hasStreamData(DataIBI.type) || !Number.isFinite(duration) || duration <= 0) return null;
  if (!(activity.getStream(DataIBI.type) instanceof IBIStream)) return null;
  const samples = activity
    .getStreamDataByDuration(DataIBI.type)
    .map(sample => ({ time: sample.time, interval: sample.value ?? NaN }));
  return analyzeRRIntervals(samples, duration, { includeDetails });
}

const RR_SUMMARY_CLASSES: readonly [keyof RRSummary, new (value: number) => DataNumber][] = [
  ['intervalCount', RRData.DataRRIntervalCount],
  ['invalidIntervalCount', RRData.DataRRInvalidIntervalCount],
  ['artifactCount', RRData.DataRRArtifactCount],
  ['artifactPercentage', RRData.DataRRArtifactPercentage],
  ['suspectedEctopicPairCount', RRData.DataRRSuspectedEctopicPairCount],
  ['suspectedEctopicPairsPerHour', RRData.DataRRSuspectedEctopicPairRate],
  ['coveragePercentage', RRData.DataRRCoverage],
  ['gapCount', RRData.DataRRGapCount],
  ['longestGap', RRData.DataRRLongestGap],
  ['meanInterval', RRData.DataRRMeanInterval],
  ['averageHeartRate', RRData.DataRRHeartRateAvg],
  ['minimumHeartRate', RRData.DataRRHeartRateMin],
  ['maximumHeartRate', RRData.DataRRHeartRateMax],
  ['rmssd', RRData.DataRRRMSSD],
  ['sdnn', RRData.DataRRSDNN],
  ['pnn50', RRData.DataRRPNN50],
  ['dfaAlpha1Median', RRData.DataRRDFAAlpha1Median],
  ['dfaAlpha1Min', RRData.DataRRDFAAlpha1Min],
  ['dfaAlpha1Max', RRData.DataRRDFAAlpha1Max],
  ['dfaWindowCount', RRData.DataRRDFAWindowCount]
];

/** Fill available canonical R–R stats; preserve explicit persisted values and omit unavailable estimates. */
export function addMissingRRStats(activity: ActivityInterface): void {
  const analysis = analyzeActivityRR(activity, false);
  if (!analysis) return;
  for (const [key, DataClass] of RR_SUMMARY_CLASSES) {
    const value = analysis.summary[key];
    if (value !== null && Number.isFinite(value)) {
      const stat = new DataClass(value);
      if (!activity.getStat(stat.getType())) activity.addStat(stat);
    }
  }
}
