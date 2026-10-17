import { Activity } from '../../activities/activity';
import { ActivityTypes } from '../../activities/activity.types';
import { Creator } from '../../creators/creator';
import { IBIStream } from '../../streams/ibi-stream';
import { Stream } from '../../streams/stream';
import { analyzeActivityRR } from './activity-rr';
import {
  DataRRRMSSD,
  DataRRSDNN,
  DataRRIntervalCount,
  DataRRGapCount,
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
