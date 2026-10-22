import { Activity } from '../../activities/activity';
import { ActivityTypes } from '../../activities/activity.types';
import { Creator } from '../../creators/creator';
import { IBIStream } from '../../streams/ibi-stream';
import { Stream } from '../../streams/stream';
import { DataPower } from '../../data/data.power';
import { DataSpeed } from '../../data/data.speed';
import { analyzeActivityRR } from './activity-rr';
import {
  DataRRRMSSD,
  DataRRSDNN,
  DataRRIntervalCount,
  DataRRGapCount,
  DataRRHeartRateMin,
  DataRRHeartRateMax,
  DataRRDFAAlpha1Median
} from '../../data/data.rr';
import { ActivityUtilities } from './activity.utilities';
import { EventUtilities } from './event.utilities';
import { Event } from '../event';
import { FileType } from '../adapters/file-type.enum';
import { EventImporterJSON } from '../adapters/importers/json/importer.json';

const activity = (rr: number[], times?: number[]) => {
  const result = new Activity(new Date(0), new Date(10000), ActivityTypes.Running, new Creator('Synthetic'));
  result.addStream(new IBIStream(rr, times));
  return result;
};

describe('activity R-R stats', () => {
  it('retains IBI timing, generated-rate support and missing power together through JSON regeneration', () => {
    let child = activity([800, 900], [800, 5900]);
    const speed = new Stream(DataSpeed.type, [null, null, 2, null, null, 3], {
      direction: 'ending',
      durations: [null, null, 2, null, null, 3]
    });
    const power = [200, null, 0, 300];
    child.addStream(speed);
    child.addStream(new Stream(DataPower.type, power));
    const coverage = ActivityUtilities.getPowerCoverage(child);
    for (let pass = 0; pass < 3; pass++) {
      child = EventImporterJSON.getActivityFromJSON(JSON.parse(JSON.stringify(child.toJSON()))) as Activity;
      ActivityUtilities.generateMissingStreamsAndStatsForActivity(child);
      expect(child.getStream('IBI').toJSON()).toEqual({
        type: 'IBI',
        data: [800, 900],
        sampleTimes: [800, 5900]
      });
      expect(child.getStream(DataSpeed.type).toJSON()).toEqual(speed.toJSON());
      expect(child.getStream(DataPower.type).toJSON().data).toEqual(power);
      expect(ActivityUtilities.getPowerCoverage(child)).toEqual(coverage);
      expect(analyzeActivityRR(child)!.summary).toMatchObject({ gapCount: 1, rmssd: null });
    }
  });

  it('persists the available rolling HR range as canonical event stats', () => {
    const child = activity([...Array(20).fill(800), ...Array(20).fill(1000)]);
    child.endDate = new Date(36000);
    const event = new Event('Synthetic', child.startDate, child.endDate, FileType.SUUNTO);
    event.addActivity(child);
    EventUtilities.generateStatsForAll(event);
    const restored = EventImporterJSON.getEventFromJSON(JSON.parse(JSON.stringify(event.toJSON())));
    expect(restored.getStat(DataRRHeartRateMin.type)!.getValue()).toBe(60);
    expect(restored.getStat(DataRRHeartRateMax.type)!.getValue()).toBe(75);
  });
  it('does not derive beat statistics from a resampled one-second chart stream', () => {
    const child = activity([]);
    child.removeStream('IBI');
    child.addStream(new Stream('IBI', [800, 900, 850]));
    expect(analyzeActivityRR(child)).toBeNull();
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(child);
    expect(child.getStat(DataRRIntervalCount.type)).toBeUndefined();
  });
  it('generates canonical summary stats before event serialization and retains zero values', () => {
    const child = activity([800, 800, 800]);
    const event = new Event('Synthetic', child.startDate, child.endDate, FileType.SUUNTO);
    event.addActivity(child);
    EventUtilities.generateStatsForAll(event);
    expect(child.getStat(DataRRRMSSD.type)!.getValue()).toBe(0);
    expect(event.getStat(DataRRIntervalCount.type)!.getValue()).toBe(3);
    const restored = EventImporterJSON.getEventFromJSON(JSON.parse(JSON.stringify(event.toJSON())));
    expect(restored.getStat(DataRRRMSSD.type)!.getValue()).toBe(0);
    expect(restored.getFirstActivity().getStat(DataRRSDNN.type)!.getValue()).toBe(0);
    expect(event.getStat(DataRRDFAAlpha1Median.type)).toBeUndefined();
  });

  it('does not join actual gaps after full activity JSON restoration', () => {
    const child = activity([800, 900], [800, 5900]);
    const restored = EventImporterJSON.getActivityFromJSON(JSON.parse(JSON.stringify(child.toJSON())));
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(restored);
    expect(restored.getStat(DataRRRMSSD.type)).toBeUndefined();
    expect(restored.getStat(DataRRGapCount.type)!.getValue()).toBe(1);
  });

  it('preserves explicit stats and does not invent a combined multi-activity HRV average', () => {
    const first = activity([800, 850, 900]),
      second = activity([900, 900, 900]);
    first.addStat(new DataRRRMSSD(12));
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(first);
    ActivityUtilities.generateMissingStreamsAndStatsForActivity(second);
    expect(first.getStat(DataRRRMSSD.type)!.getValue()).toBe(12);
    const combined = ActivityUtilities.getSummaryStatsForActivities([first, second]);
    expect(combined.find(stat => stat.getType() === DataRRRMSSD.type)).toBeUndefined();
    expect(combined.find(stat => stat.getType() === DataRRIntervalCount.type)).toBeUndefined();
  });
});
