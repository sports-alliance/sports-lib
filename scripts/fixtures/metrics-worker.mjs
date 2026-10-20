import {
  ActivityTypes,
  ActivityUtilities,
  DataDistance,
  DataSpeed,
  DataSpeedKilometersPerHour,
  Stream
} from '@sports-alliance/sports-lib/metrics';

const streams = ActivityUtilities.createUnitStreamsFromStreams(
  [new Stream(DataSpeed.type, [0, null, 2])],
  ActivityTypes.Running,
  [DataSpeedKilometersPerHour.type],
  { includeDerivedTypes: false, includeUnitVariants: true }
);
globalThis.metricsWorkerSmoke = [
  ...streams.find(stream => stream.type === DataSpeedKilometersPerHour.type).getData(),
  new DataDistance(1000).getValue()
];
