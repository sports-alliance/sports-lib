import {
  ActivityTypes,
  ActivityUtilities,
  DataDistance,
  DataSpeed,
  DataSpeedKilometersPerHour,
  DataSpeedAvg,
  DataPaceAvg,
  EventSummary,
  Stream
} from '@sports-alliance/sports-lib/metrics';

const streams = ActivityUtilities.createUnitStreamsFromStreams(
  [new Stream(DataSpeed.type, [0, null, 2])],
  ActivityTypes.Running,
  [DataSpeedKilometersPerHour.type],
  { includeDerivedTypes: false, includeUnitVariants: true }
);
const summary = EventSummary.fromJSON({
  name: 'Worker summary',
  startDate: 0,
  endDate: 3600000,
  srcFileType: 'fit',
  description: null,
  privacy: 0,
  isMerge: false,
  stats: { [DataSpeedAvg.type]: 4 }
});
globalThis.metricsWorkerSmoke = [
  ...streams.find(stream => stream.type === DataSpeedKilometersPerHour.type).getData(),
  new DataDistance(1000).getValue(),
  summary.getStat(DataPaceAvg.type).getValue()
];
