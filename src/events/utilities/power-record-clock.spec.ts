import { Activity } from '../../activities/activity';
import { ActivityTypes } from '../../activities/activity.types';
import { Creator } from '../../creators/creator';
import { DataPower } from '../../data/data.power';
import { DataHeartRate } from '../../data/data.heart-rate';
import { Stream } from '../../streams/stream';
import { EventImporterJSON } from '../adapters/importers/json/importer.json';
import { captureRecordedPowerEvidence } from './tss/recorded-power-evidence';
import { ActivityUtilities } from './activity.utilities';

it('keeps source timestamps for other sensor filling without storing clock metadata or padding watts', () => {
  const make = (padded: boolean) => {
    const a = new Activity(new Date(0), new Date(6000), ActivityTypes.Cycling, new Creator('Synthetic'));
    a.addStream(
      new Stream(DataPower.type, padded ? [200, 0, 0, null, 0, 0, 0] : [200, null, null, null, null, null, null])
    );
    a.addStream(new Stream(DataHeartRate.type, [100, null, null, null, 110, null, null]));
    return a;
  };
  const a = make(false);
  const previous = make(true);
  captureRecordedPowerEvidence(
    a,
    [0, 1, 2, 4, 5, 6].map(i => ({ timestamp: new Date(i * 1000), ...(i === 0 ? { power: 200 } : {}) })),
    true
  );
  expect(a.generateTimeStream().getData()).toEqual(previous.generateTimeStream().getData());
  expect(a.generateTimeStream([DataPower.type]).getData()).toEqual([0, null, null, null, null, null, null]);
  ActivityUtilities.generateMissingStreamsAndStatsForActivity(a);
  ActivityUtilities.generateMissingStreamsAndStatsForActivity(previous);
  expect(a.getStreamData(DataHeartRate.type)).toEqual(previous.getStreamData(DataHeartRate.type));
  expect(a.getStreamData(DataPower.type)).toEqual([200, null, null, null, null, null, null]);
  const json = JSON.parse(JSON.stringify(a.toJSON()));
  expect(json.stats['Power Coverage']).toBeUndefined();
  expect(json.streams.every((s: any) => Object.keys(s).every(key => ['type', 'data'].includes(key)))).toBe(true);
  const restored = EventImporterJSON.getActivityFromJSON(json);
  expect(restored.getStreamData(DataHeartRate.type)).toEqual(a.getStreamData(DataHeartRate.type));
  expect(restored.getStreamData(DataPower.type)).toEqual(a.getStreamData(DataPower.type));
});
