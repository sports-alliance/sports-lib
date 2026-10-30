import { EventImporterFIT } from './importer.fit';
import { Activity } from '../../../../activities/activity';
import { ActivityTypes } from '../../../../activities/activity.types';
import { Creator } from '../../../../creators/creator';
import { IBIStream } from '../../../../streams/ibi-stream';
import { analyzeActivityRR } from '../../../utilities/activity-rr';
import { FitBaseType, FitEncoder } from 'fit-file-parser/encoder';
import { DataRRIntervalCount, DataRRRMSSD, DataRRCoverage, DataRRInvalidIntervalCount } from '../../../../data/data.rr';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { DataHeartRate } from '../../../../data/data.heart-rate';
import { EventImporterJSON } from '../json/importer.json';
import { filterRRHeartRate } from '../../../utilities/rr-heart-rate';

const importer = EventImporterFIT as unknown as {
  getIBIStreamForActivity(records: { time: number[] }[], start: Date, activity: Activity): IBIStream;
};

describe('FIT R-R timing', () => {
  it('retains end-crossing intervals for clipped leg coverage, excluding partial beats', () => {
    const activity = new Activity(new Date(100), new Date(2000), ActivityTypes.Running, new Creator('Synthetic'));
    activity.addStream(importer.getIBIStreamForActivity([{ time: [0.8, 0.8, 0.8] }], new Date(0), activity));
    expect(analyzeActivityRR(activity)!.summary).toMatchObject({ intervalCount: 1, coveragePercentage: 100 });
    expect(activity.getStreamDataByDuration('IBI').map(sample => sample.time)).toEqual([700, 1500, 2300]);
  });

  it.each([false, true])(
    'derives serializable HRV through the public binary FIT importer with padding=%s',
    async padded => {
      const encoder = new FitEncoder();
      const start = FitEncoder.toFitTimestamp(new Date('2026-01-01T10:00:00Z'));
      const uint32 = (number: number, value: number) => ({ number, value, baseType: FitBaseType.Uint32, size: 4 });
      encoder.writeMessage(0, [{ number: 0, value: 4, baseType: FitBaseType.Enum, size: 1 }, uint32(4, start)]);
      for (const time of [start, start + 10])
        encoder.writeMessage(
          20,
          [uint32(253, time), { number: 3, value: 100, baseType: FitBaseType.Uint8, size: 1 }],
          1
        );
      for (const batch of padded
        ? [
            [800, 850, 65535, 65535, 65535],
            [900, 65535, 65535, 65535, 65535]
          ]
        : [[800, 850, 900]]) {
        const intervals = new Uint8Array(batch.length * 2);
        batch.forEach((interval, i) => new DataView(intervals.buffer).setUint16(i * 2, interval, true));
        encoder.writeMessage(
          78,
          [{ number: 0, value: intervals, baseType: FitBaseType.Uint16, size: intervals.length }],
          2
        );
      }
      encoder.writeMessage(
        18,
        [
          uint32(253, start + 10),
          uint32(2, start),
          uint32(7, 10000),
          uint32(8, 10000),
          { number: 5, value: 1, baseType: FitBaseType.Enum, size: 1 }
        ],
        3
      );
      const bytes = encoder.close();
      const event = await EventImporterFIT.getFromArrayBuffer(
        bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
        new ActivityParsingOptions({ generateUnitStreams: false })
      );
      expect(event.getStat(DataRRIntervalCount.type)!.getValue()).toBe(3);
      expect(event.getStat(DataRRRMSSD.type)!.getValue()).toBe(50);
      expect(event.getStat(DataRRCoverage.type)!.getValue()).toBe(25.5);
      expect(event.getStat(DataRRInvalidIntervalCount.type)!.getValue()).toBe(0);
      expect(
        event
          .getFirstActivity()
          .getStreamData(DataHeartRate.type)
          .filter(value => value !== null)
      ).toEqual([100, 100]);
      // Consumers can independently filter FIT intervals without replacing recorded HR or changing HRV stats.
      const activity = event.getFirstActivity();
      const intervals = activity
        .getStreamDataByDuration('IBI')
        .map(sample => ({ time: sample.time, interval: sample.value! }));
      expect(
        filterRRHeartRate(intervals, +activity.endDate - +activity.startDate).map(sample => sample.heartRate)
      ).toEqual([75, 74, 72]);
      const restored = EventImporterJSON.getEventFromJSON(JSON.parse(JSON.stringify(event.toJSON())));
      expect(restored.getStat(DataRRRMSSD.type)!.getValue()).toBe(50);
    }
  );

  it('preserves multisport leg offsets without advancing the clock for padding', () => {
    const activity = new Activity(new Date(1000), new Date(2000), ActivityTypes.Running, new Creator('Synthetic'));
    const stream: IBIStream = importer.getIBIStreamForActivity([{ time: [1, 65.535, 1] }], new Date(0), activity);
    expect(stream.getData()).toEqual([1000]);
    expect(stream.getStreamDataByDuration()).toEqual([{ time: 1000, value: 1000 }]);
    activity.addStream(stream);
    expect(analyzeActivityRR(activity)!.summary.coveragePercentage).toBe(100);
  });
  it('ignores legacy numeric padding without inventing a gap or invalid observation', () => {
    const activity = new Activity(new Date(0), new Date(2000), ActivityTypes.Running, new Creator('Synthetic'));
    activity.addStream(importer.getIBIStreamForActivity([{ time: [0.8, 65.535, 0.9] }], new Date(0), activity));
    expect(analyzeActivityRR(activity)!.summary).toMatchObject({
      intervalCount: 2,
      invalidIntervalCount: 0,
      gapCount: 0,
      rmssd: 100,
      coveragePercentage: 85,
      longestGap: 0
    });
  });
  it('still treats recorded zero intervals as invalid adjacency barriers', () => {
    const activity = new Activity(new Date(0), new Date(2000), ActivityTypes.Running, new Creator('Synthetic'));
    activity.addStream(importer.getIBIStreamForActivity([{ time: [0.8, 0, 0.9] }], new Date(0), activity));
    expect(analyzeActivityRR(activity)!.summary).toMatchObject({
      intervalCount: 2,
      invalidIntervalCount: 1,
      rmssd: null,
      coveragePercentage: 85
    });
  });
});
