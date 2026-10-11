import xmldom from '@xmldom/xmldom';
import { EventImporterGPX } from '../adapters/importers/gpx/importer.gpx';
import { EventImporterTCX } from '../adapters/importers/tcx/importer.tcx';
import { ActivityParsingOptions } from '../../activities/activity-parsing-options';
import { ActivityUtilities } from './activity.utilities';
import { DataPowerNormalized } from '../../data/data.power-normalized';
import { DataPowerIntensityFactor } from '../../data/data.power-intensity-factor';
import { DataPower } from '../../data/data.power';

type Coverage =
  | 'complete'
  | 'thirty'
  | 'short'
  | 'single'
  | 'gappy'
  | 'missing'
  | 'invalid'
  | 'blank'
  | 'duplicate-missing'
  | 'delayed'
  | 'positive';

async function parse(format: 'TCX' | 'GPX', coverage: Coverage) {
  const origin = Date.parse('2026-01-01T10:00:00Z');
  const samples: { second: number; power?: string }[] = Array.from({ length: 61 }, (_, second) => ({
    second,
    power:
      coverage === 'positive'
        ? '200'
        : coverage === 'complete' ||
            (coverage === 'duplicate-missing' && second < 30) ||
            (coverage === 'thirty' && second < 30) ||
            (coverage === 'short' && second < 29) ||
            (coverage === 'single' && second === 0) ||
            (coverage === 'gappy' && second % 2 === 0) ||
            (coverage === 'delayed' && second >= 30)
          ? '0'
          : coverage === 'invalid'
            ? 'not-a-number'
            : coverage === 'blank'
              ? ' '
              : undefined
  }));
  if (coverage === 'duplicate-missing') samples.splice(16, 0, { second: 15 });
  const time = (second: number) => new Date(origin + second * 1000).toISOString();
  const options = new ActivityParsingOptions({
    generateUnitStreams: false,
    tss: {
      overrides: {
        functionalThresholdPower: 250,
        maxHeartRate: 190,
        restingHeartRate: 55,
        lactateThresholdHR: 165
      }
    }
  });
  if (format === 'TCX') {
    const xml = `<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">
      <Activities><Activity Sport="Biking"><Id>${time(0)}</Id><Lap StartTime="${time(0)}">
      <TotalTimeSeconds>60</TotalTimeSeconds><DistanceMeters>1000</DistanceMeters><Calories>7</Calories>
      <Intensity>Active</Intensity><TriggerMethod>Manual</TriggerMethod><Track>${samples
        .map(
          sample =>
            `<Trackpoint><Time>${time(sample.second)}</Time><HeartRateBpm><Value>165</Value></HeartRateBpm>
        ${sample.power === undefined ? '' : `<Extensions><TPX xmlns="http://www.garmin.com/xmlschemas/ActivityExtension/v2"><Watts>${sample.power}</Watts></TPX></Extensions>`}
        </Trackpoint>`
        )
        .join('')}</Track></Lap></Activity></Activities></TrainingCenterDatabase>`;
    return (
      await EventImporterTCX.getFromXML(
        new xmldom.DOMParser().parseFromString(xml, 'application/xml') as unknown as Document,
        options
      )
    ).getFirstActivity();
  }
  const xml = `<gpx version="1.1" creator="Synthetic" xmlns="http://www.topografix.com/GPX/1/1"
    xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1"><trk><type>cycling</type><trkseg>${samples
      .map(
        sample =>
          `<trkpt lat="60" lon="24"><time>${time(sample.second)}</time><extensions>
      ${sample.power === undefined ? '' : `<power>${sample.power}</power>`}<gpxtpx:TrackPointExtension><gpxtpx:hr>165</gpxtpx:hr></gpxtpx:TrackPointExtension>
      </extensions></trkpt>`
      )
      .join('')}</trkseg></trk></gpx>`;
  return (await EventImporterGPX.getFromString(xml, xmldom.DOMParser, options)).getFirstActivity();
}

describe.each(['TCX', 'GPX'] as const)('%s zero-power source evidence', format => {
  it.each(['complete', 'thirty', 'delayed', 'positive'] as Coverage[])(
    'uses complete recorded windows, including shifted grids and positive power: %s',
    async coverage => {
      const activity = await parse(format, coverage);
      for (let repeat = 0; repeat < 2; repeat++) {
        expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic).toMatchObject({
          method: 'POWER',
          score: coverage === 'positive' ? 1.1 : 0
        });
        activity.removeStat(DataPowerNormalized.type);
        activity.removeStat(DataPowerIntensityFactor.type);
        ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
      }
    }
  );

  it.each(['short', 'single', 'gappy', 'missing', 'invalid', 'blank', 'duplicate-missing'] as Coverage[])(
    'never treats padding as a complete recorded zero window: %s',
    async coverage => {
      const activity = await parse(format, coverage);
      if (coverage === 'single')
        expect(activity.getStreamData(DataPower.type).filter(value => value === 0)).toHaveLength(61);
      for (let repeat = 0; repeat < 2; repeat++) {
        expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic).toMatchObject({
          method: 'HR',
          score: 1.7,
          reasons: expect.arrayContaining(['missing-power-inputs'])
        });
        activity.removeStat(DataPowerNormalized.type);
        activity.removeStat(DataPowerIntensityFactor.type);
        ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
      }
    }
  );
});
