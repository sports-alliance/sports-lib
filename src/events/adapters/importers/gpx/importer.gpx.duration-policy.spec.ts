import { DOMParser } from '@xmldom/xmldom';
import { EventImporterGPX } from './importer.gpx';
import { DataDuration } from '../../../../data/data.duration';
import { DataElapsedTime } from '../../../../data/data.elapsed-time';
import { DataTimerTime } from '../../../../data/data.timer-time';

describe('EventImporterGPX duration policy', () => {
  it('emits elapsed and active duration stats consistently', async () => {
    const gpxString = `<?xml version="1.0" encoding="UTF-8"?>
      <gpx creator="test" version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
        <trk>
          <name>duration-policy</name>
          <trkseg>
            <trkpt lat="45.0" lon="9.0">
              <time>2026-01-01T10:00:00Z</time>
            </trkpt>
            <trkpt lat="45.1" lon="9.1">
              <time>2026-01-01T10:01:30Z</time>
            </trkpt>
          </trkseg>
        </trk>
      </gpx>`;

    const event = await EventImporterGPX.getFromString(gpxString, DOMParser);
    const activity = event.getFirstActivity();

    expect(activity.getStat(DataElapsedTime.type)?.getValue()).toBe(90);
    expect(activity.getDuration()?.getValue()).toBe(90);
    expect(activity.getStat(DataTimerTime.type)?.getValue()).toBe(90);
    expect(activity.getStat(DataDuration.type)?.getValue()).toBe(90);
  });
});
