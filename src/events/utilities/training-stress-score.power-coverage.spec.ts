import { FitBaseType, FitEncoder } from 'fit-file-parser/encoder';
import xmldom from '@xmldom/xmldom';
import { EventImporterFIT } from '../adapters/importers/fit/importer.fit';
import { EventImporterGPX } from '../adapters/importers/gpx/importer.gpx';
import { EventImporterTCX } from '../adapters/importers/tcx/importer.tcx';
import { ActivityParsingOptions } from '../../activities/activity-parsing-options';
import { ActivityUtilities } from './activity.utilities';
import { DataPower } from '../../data/data.power';
import { DataPowerNormalized } from '../../data/data.power-normalized';
import { DataPowerIntensityFactor } from '../../data/data.power-intensity-factor';

type Format = 'FIT' | 'TCX' | 'GPX';
type Coverage = 'complete' | 'single' | 'short' | 'thirty' | 'gappy' | 'one-gap' | 'coasting' | 'zero' | 'duplicate-missing';
const field = (number: number, value: number, baseType = FitBaseType.Uint8) => ({ number, value, baseType,
  size: baseType === FitBaseType.Uint32 ? 4 : baseType === FitBaseType.Uint16 ? 2 : 1 });

async function parse(format: Format, coverage: Coverage, extras: { np?: number; imported?: number } = {}) {
  const duration = coverage === 'single' ? 3600 : 60;
  const origin = new Date('2026-01-01T10:00:00Z');
  const time = (second: number) => new Date(+origin + second * 1000).toISOString();
  const samples: { second: number; power?: number }[] = Array.from({ length: duration + 1 }, (_, second) => ({ second,
    power: coverage === 'zero' ? 0 : coverage === 'coasting' ? second < 30 ? 250 : 0 :
      coverage === 'complete' || coverage === 'single' && second === 0 || coverage === 'short' && second < 29 ||
      (coverage === 'thirty' || coverage === 'duplicate-missing') && second < 30 ||
      coverage === 'gappy' && second % 2 === 0 || coverage === 'one-gap' && second !== 30 ? 250 : undefined }));
  if (coverage === 'duplicate-missing') samples.splice(16, 0, { second: 15 });
  const options = new ActivityParsingOptions({ generateUnitStreams: false, tss: format === 'FIT' ? undefined : {
    overrides: { functionalThresholdPower: 250, maxHeartRate: 190, restingHeartRate: 55, lactateThresholdHR: 165 }
  } });
  if (format === 'FIT') {
    const encoder = new FitEncoder(), start = FitEncoder.toFitTimestamp(origin);
    encoder.writeMessage(0, [field(0, 4, FitBaseType.Enum), field(1, 1, FitBaseType.Uint16), field(4, start, FitBaseType.Uint32)]);
    for (const sample of samples) encoder.writeMessage(20, [field(253, start + sample.second, FitBaseType.Uint32),
      field(3, 165), ...(sample.power === undefined ? [] : [field(7, sample.power, FitBaseType.Uint16)])], 1);
    encoder.writeMessage(18, [field(254, 0, FitBaseType.Uint16), field(253, start + duration, FitBaseType.Uint32),
      field(2, start, FitBaseType.Uint32), field(5, 2, FitBaseType.Enum), field(7, duration * 1000, FitBaseType.Uint32),
      field(8, duration * 1000, FitBaseType.Uint32), field(45, 250, FitBaseType.Uint16),
      ...(extras.np === undefined ? [] : [field(34, extras.np, FitBaseType.Uint16)]),
      ...(extras.imported === undefined ? [] : [field(35, extras.imported * 10, FitBaseType.Uint16)])], 2);
    encoder.writeMessage(216, [field(0, 18, FitBaseType.Uint16), field(1, 0, FitBaseType.Uint16),
      field(11, 190), field(12, 55), field(13, 165)], 3);
    const bytes = encoder.close();
    return (await EventImporterFIT.getFromArrayBuffer(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer, options)).getFirstActivity();
  }
  if (format === 'TCX') {
    const xml = `<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2"><Activities>
      <Activity Sport="Biking"><Id>${time(0)}</Id><Lap StartTime="${time(0)}"><TotalTimeSeconds>${duration}</TotalTimeSeconds>
      <DistanceMeters>1000</DistanceMeters><Calories>7</Calories><Intensity>Active</Intensity><TriggerMethod>Manual</TriggerMethod>
      <Track>${samples.map(sample => `<Trackpoint><Time>${time(sample.second)}</Time><HeartRateBpm><Value>165</Value></HeartRateBpm>
      ${sample.power === undefined ? '' : `<Extensions><TPX xmlns="http://www.garmin.com/xmlschemas/ActivityExtension/v2"><Watts>${sample.power}</Watts></TPX></Extensions>`}
      </Trackpoint>`).join('')}</Track></Lap></Activity></Activities></TrainingCenterDatabase>`;
    return (await EventImporterTCX.getFromXML(new xmldom.DOMParser().parseFromString(xml, 'application/xml') as unknown as Document, options)).getFirstActivity();
  }
  const xml = `<gpx version="1.1" creator="Synthetic" xmlns="http://www.topografix.com/GPX/1/1"
    xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1"><trk><type>cycling</type><trkseg>${samples.map(sample =>
      `<trkpt lat="60" lon="24"><time>${time(sample.second)}</time><extensions>
      ${sample.power === undefined ? '' : `<power>${sample.power}</power>`}<gpxtpx:TrackPointExtension><gpxtpx:hr>165</gpxtpx:hr></gpxtpx:TrackPointExtension>
      </extensions></trkpt>`).join('')}</trkseg></trk></gpx>`;
  return (await EventImporterGPX.getFromString(xml, xmldom.DOMParser, options)).getFirstActivity();
}

const evaluate = ActivityUtilities.getTrainingStressScoreEvaluations.bind(ActivityUtilities);
const clearDerivedPower = (activity: Awaited<ReturnType<typeof parse>>) => {
  activity.removeStat(DataPowerNormalized.type);
  activity.removeStat(DataPowerIntensityFactor.type);
  ActivityUtilities.generateMissingStreamsAndStatsForActivity(activity);
};

describe.each(['FIT', 'TCX', 'GPX'] as const)('%s recorded positive-power coverage', format => {
  // FIT coalesces complementary same-timestamp records before padding. XML
  // importers retain their existing last-record behavior.
  it.each(['single', 'short', 'gappy', ...(format === 'FIT' ? [] : ['duplicate-missing'])] as Coverage[])(
    'does not promote missing power fields into complete NP windows: %s', async coverage => {
      const activity = await parse(format, coverage);
      const displayPower = activity.getStreamData(DataPower.type).slice();
      expect(displayPower.some(value => value === null)).toBe(true);
      expect(displayPower.some(value => value === 0)).toBe(false);
      for (let repeat = 0; repeat < 2; repeat++) {
        expect(evaluate(activity).automatic).toMatchObject({ method: 'HR', score: coverage === 'single' ? 100 : 1.7 });
        expect(activity.getStat(DataPowerNormalized.type)).toBeUndefined();
        expect(activity.getStat(DataPowerIntensityFactor.type)).toBeUndefined();
        expect(activity.getStreamData(DataPower.type)).toEqual(displayPower);
        clearDerivedPower(activity);
      }
    });

  it.each(['complete', 'thirty', 'one-gap', 'zero', ...(format === 'FIT' ? ['duplicate-missing'] : [])] as Coverage[])(
    'calculates NP only from complete recorded windows: %s', async coverage => {
      const activity = await parse(format, coverage);
      for (let repeat = 0; repeat < 2; repeat++) {
        expect(evaluate(activity).automatic).toMatchObject({ method: ['thirty', 'duplicate-missing'].includes(coverage) ? 'HR' : 'POWER', score: coverage === 'zero' ? 0 : 1.7 });
        expect(activity.getStat(DataPowerNormalized.type)?.getValue()).toBeCloseTo(coverage === 'zero' ? 0 : 250, 8);
        clearDerivedPower(activity);
      }
    });

  it('retains real recorded coasting zeros in the rolling workload', async () => {
    const activity = await parse(format, 'coasting');
    const values = [...Array(30).fill(250), ...Array(30).fill(0)];
    const means = values.slice(29).map((_, index) => values.slice(index, index + 30).reduce((sum, value) => sum + value, 0) / 30);
    const expectedNP = (means.reduce((sum, value) => sum + value ** 4, 0) / means.length) ** 0.25;
    expect(activity.getStat(DataPowerNormalized.type)?.getValue()).toBeCloseTo(expectedNP, 8);
    expect(evaluate(activity).automatic).toMatchObject({ method: 'POWER', score: Math.round(100 * (60 / 3600) * (expectedNP / 250) ** 2 * 10) / 10 });
  });
});

describe('authoritative FIT power summaries', () => {
  it('retains positive device NP despite sparse source power until explicit regeneration', async () => {
    const activity = await parse('FIT', 'single', { np: 200 });
    expect(evaluate(activity).automatic).toMatchObject({ method: 'POWER', score: 64 });
    expect(activity.getStat(DataPowerNormalized.type)?.getValue()).toBe(200);
    clearDerivedPower(activity);
    expect(evaluate(activity).automatic).toMatchObject({ method: 'HR', score: 100 });
  });
  it.each([0, 42.5])('preserves imported TSS %s while recomputing missing NP', async imported => {
    const activity = await parse('FIT', 'single', { imported });
    clearDerivedPower(activity);
    expect(evaluate(activity).automatic).toMatchObject({ method: 'IMPORTED', score: imported });
    expect(activity.getStat(DataPowerNormalized.type)).toBeUndefined();
  });
});
