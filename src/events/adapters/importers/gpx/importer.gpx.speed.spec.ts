import xmldom from '@xmldom/xmldom';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { DataSpeed } from '../../../../data/data.speed';
import { DataDistance } from '../../../../data/data.distance';
import { DataPace } from '../../../../data/data.pace';
import { DataSpeedAvg } from '../../../../data/data.speed-avg';
import { DataStore, DynamicDataLoader } from '../../../../data/data.store';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { EventImporterJSON } from '../json/importer.json';
import { createGPXRecordedSpeedReader } from '../../gpx-speed';
import { GXParser } from './gx-parser';
import { GPXSampleMapper } from './importer.gpx.mapper';
import { EventImporterGPX } from './importer.gpx';

const v1 = 'http://www.garmin.com/xmlschemas/TrackPointExtension/v1';
const v2 = v1.replace('/v1', '/v2');
const gp = 'http://www.topografix.com/GPX/1/1';
const block = (value: string, prefix = 'v') =>
  `<${prefix}:TrackPointExtension><${prefix}:speed>${value}</${prefix}:speed></${prefix}:TrackPointExtension>`;
function gpx(extensions: string[], creator = 'Synthetic', metadata = ''): string {
  return `<gpx creator="${creator}" version="1.1" xmlns="${gp}" xmlns:t="${v1}" xmlns:v="${v2}">${metadata}
    <trk><type>Running</type><trkseg>${extensions
      .map(
        (ext, i) => `<trkpt lat="1" lon="${2 + i * 0.00001}">
    <ele>10</ele><time>${new Date(Date.UTC(2026, 0, 1) + i * 1000).toISOString()}</time>
    <extensions>${ext}</extensions></trkpt>`
      )
      .join('')}</trkseg></trk></gpx>`;
}
function mapped(xml: string): (number | null)[] {
  const parsed: any = new GXParser(xml, xmldom.DOMParser, createGPXRecordedSpeedReader);
  return parsed.trk[0].trkseg[0].trkpt.map((p: any) =>
    GPXSampleMapper.find(m => m.dataType === DataSpeed.type)!.getSampleValue(p)
  );
}
async function parse(xml: string, options = new ActivityParsingOptions({ generateUnitStreams: false })) {
  return EventImporterGPX.getFromString(xml, xmldom.DOMParser, options);
}

describe('GPX recorded speed', () => {
  it.each(['Amazfit Synthetic', 'Zepp App', 'Intervals.icu'])(
    'recognizes the evidenced legacy exporter %s',
    creator => {
      expect(mapped(gpx([block('3', 't'), block('0', 't')], creator))).toEqual([3, 0]);
    }
  );

  it('recognizes QS metadata without mistaking the original device creator for the exporter', () => {
    expect(
      mapped(
        gpx([block('3', 't')], 'Unrecognized device', `<metadata><link href="https://quantified-self.io/"/></metadata>`)
      )
    ).toEqual([3]);
  });

  it.each(['Synthetic', 'amazfit', 'AmazfitOther', 'Intervals.icu Other'])(
    'does not assume v1 units for %s',
    creator => {
      expect(mapped(gpx([block('3', 't')], creator))).toEqual([null]);
    }
  );

  it.each([
    '<metadata><extensions><link href="https://quantified-self.io/"/></extensions></metadata>',
    '<metadata><link href="https://quantified-self.io/other"/></metadata>',
    '<metadata xmlns="urn:other"><link href="https://quantified-self.io/"/></metadata>'
  ])('rejects unrelated metadata as v1 unit evidence', metadata => {
    expect(mapped(gpx([block('3', 't')], 'Synthetic', metadata))).toEqual([null]);
  });

  it.each(['0', '3.5', '2e1', '+.5'])('accepts finite nonnegative v2 decimal %s', text => {
    expect(mapped(gpx([block(text)]))).toEqual([Number(text)]);
  });

  it.each(['', ' ', '-1', 'NaN', 'Infinity', '1e999', '0x10', 'fast', '<v:value>3</v:value>'])(
    'rejects invalid or structured speed %s',
    value => {
      expect(mapped(gpx([block(value)]))).toEqual([null]);
    }
  );

  it.each([
    '<x:TrackPointExtension xmlns:x="urn:other"><x:speed>3</x:speed></x:TrackPointExtension>',
    '<t:TrackPointExtension><v:speed>3</v:speed></t:TrackPointExtension>',
    '<v:TrackPointExtension><wrapper><v:speed>3</v:speed></wrapper></v:TrackPointExtension>',
    `<wrapper>${block('3')}</wrapper>`,
    '<v:TrackPointExtension><v:speed unit="km/h">3</v:speed></v:TrackPointExtension>',
    '<v:TrackPointExtension><v:speed>3</v:speed><v:speed>3</v:speed></v:TrackPointExtension>',
    `${block('3')}${block('4')}`,
    `${block('3')}${block('4', 't')}`
  ])('rejects wrong ownership, units or ambiguous fields: %s', ext => {
    expect(mapped(gpx([ext], 'Amazfit Synthetic'))).toEqual([null]);
  });

  it('matches namespace URIs independently of prefixes and inline declarations', () => {
    expect(
      mapped(
        gpx([
          `<z:TrackPointExtension xmlns:z="${v2}"><z:speed>3</z:speed></z:TrackPointExtension>`,
          `<TrackPointExtension xmlns="${v2}"><speed xmlns="${v2}">0</speed></TrackPointExtension>`
        ])
      )
    ).toEqual([3, 0]);
  });

  it('rejects duplicate extensions and unrelated GPX namespaces', () => {
    expect(mapped(gpx([block('3')]).replace('</extensions>', '</extensions><extensions/>'))).toEqual([null]);
    expect(mapped(gpx([block('3')]).replace(`xmlns="${gp}"`, 'xmlns="urn:other"'))).toEqual([null]);
  });

  it('retains direct-speed precedence, including zero', () => {
    expect(mapped(gpx([`<speed>7</speed>${block('3')}`, `<speed>0</speed>${block('3')}`]))).toEqual([7, 0]);
  });

  it('retains missing readings and zeros through canonical JSON and repeated regeneration', async () => {
    const event = await parse(gpx([block('3'), '', block('0'), block('4')]));
    for (let i = 0; i < 2; i++) {
      const restored = EventImporterJSON.getEventFromJSON(JSON.parse(JSON.stringify(event.toJSON())));
      const a = restored.getFirstActivity();
      ActivityUtilities.generateMissingStreamsForActivity(a);
      expect(a.getStreamData(DataSpeed.type)).toEqual([3, null, 0, 4]);
      expect(a.getAllStreams().filter(s => s.type === DataSpeed.type)).toHaveLength(1);
      expect(a.getStat(DataSpeedAvg.type)?.getValue()).toBeCloseTo(7 / 3);
    }
    expect(DataSpeed.type).toBe('Speed');
    expect(new DataSpeed(3).getUnit()).toBe('m/s');
    expect(Object.values(DataStore)).toContain(DataSpeed);
    expect(DynamicDataLoader.getDataClassFromDataType(DataSpeed.type)).toBe(DataSpeed);
  });

  it('preserves GPS fallback when all recorded speed is absent or ineligible', async () => {
    const baseline = await parse(gpx(['', '']));
    const ignored = await parse(gpx([block('3', 't'), block('4', 't')]));
    expect(ignored.toJSON()).toEqual(baseline.toJSON());
  });

  it('honors a stream allowlist that excludes speed', async () => {
    const event = await parse(
      gpx([block('3'), block('0')]),
      new ActivityParsingOptions({
        streams: { includeTypes: [DataDistance.type] },
        generateUnitStreams: false
      })
    );
    expect(event.getFirstActivity().hasStreamData(DataSpeed.type)).toBe(false);
    expect(event.getFirstActivity().hasStreamData(DataPace.type)).toBe(false);
  });

  it('uses recorded speed consistently for calibrated running TSS without inventing calibration', async () => {
    const speed = Array(121).fill(block('3'));
    const options = new ActivityParsingOptions({
      generateUnitStreams: false,
      tss: { overrides: { functionalThresholdPace: 3 } }
    });
    const recorded = (await parse(gpx(speed), options)).getFirstActivity();
    const direct = (await parse(gpx(Array(121).fill('<speed>3</speed>')), options)).getFirstActivity();
    const gps = (await parse(gpx(Array(121).fill('')), options)).getFirstActivity();
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(recorded)).toEqual(
      ActivityUtilities.getTrainingStressScoreEvaluations(direct)
    );
    const result = ActivityUtilities.getTrainingStressScoreEvaluations(recorded).automatic;
    expect(result.method).toBe('PACE');
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).not.toEqual(ActivityUtilities.getTrainingStressScoreEvaluations(gps).automatic.score);
    expect(
      ActivityUtilities.getTrainingStressScoreEvaluations((await parse(gpx(speed))).getFirstActivity()).automatic.score
    ).toBeNull();
  });
});
