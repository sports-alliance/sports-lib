import xmldom from '@xmldom/xmldom';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { DataHeartRate } from '../../../../data/data.heart-rate';
import { DataDistance } from '../../../../data/data.distance';
import { EventImporterGPX } from './importer.gpx';
import { GXParser } from './gx-parser';
import { GPXSampleMapper } from './importer.gpx.mapper';

const namespace = 'http://www.cluetrust.com/XML/GPXDATA/1/0';

function gpx(extensions: string[], extraNamespaces = ''): string {
  return `<gpx creator="COROS Wearables" version="1.1" xmlns="http://www.topografix.com/GPX/1/1"
    xmlns:gpxdata="${namespace}" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1"
    ${extraNamespaces}><trk><type>running</type><trkseg>${extensions.map((extension, index) =>
    `<trkpt lat="1" lon="2"><time>2026-01-01T00:00:${String(index).padStart(2, '0')}Z</time>
      <extensions>${extension}</extensions></trkpt>`
  ).join('')}</trkseg></trk></gpx>`;
}

async function heartRate(xml: string): Promise<(number | null)[] | undefined> {
  const event = await EventImporterGPX.getFromString(xml, xmldom.DOMParser,
    new ActivityParsingOptions({ generateUnitStreams: false }));
  return event.getFirstActivity().getAllStreams().find(stream => stream.type === DataHeartRate.type)?.getData();
}

describe('GPX heart-rate extension mapping', () => {
  it('imports direct COROS ClueTrust HR readings, including recorded zero', async () => {
    expect(await heartRate(gpx(['<gpxdata:hr>120</gpxdata:hr>', '<gpxdata:hr>0</gpxdata:hr>',
      '<gpxdata:hr>125</gpxdata:hr>']))).toEqual([120, 0, 125]);
  });

  it('matches the namespace independently of the prefix', async () => {
    expect(await heartRate(gpx(['<sensor:hr>120</sensor:hr>', '<hr xmlns="' + namespace + '">121</hr>'],
      `xmlns:sensor="${namespace}"`))).toEqual([120, 121]);
  });

  it.each(['', '<gpxdata:hr/>', '<gpxdata:hr> </gpxdata:hr>', '<gpxdata:hr>invalid</gpxdata:hr>',
    '<gpxdata:hr>Infinity</gpxdata:hr>', '<gpxdata:hr><value>120</value></gpxdata:hr>',
    '<gpxdata:hr>120</gpxdata:hr><gpxdata:hr>130</gpxdata:hr>',
    '<hr>120</hr>', '<other:hr xmlns:other="urn:unrelated">120</other:hr>'])
  ('does not invent HR from missing, invalid, ambiguous or unrelated data: %s', async extension => {
    expect(await heartRate(gpx([extension, extension]))).toBeUndefined();
  });

  it('preserves direct heartrate and nested Garmin precedence when formats coexist', async () => {
    expect(await heartRate(gpx([
      '<heartrate>110</heartrate><gpxtpx:TrackPointExtension><gpxtpx:hr>120</gpxtpx:hr></gpxtpx:TrackPointExtension><gpxdata:hr>130</gpxdata:hr>',
      '<gpxtpx:TrackPointExtension><gpxtpx:hr>121</gpxtpx:hr></gpxtpx:TrackPointExtension><gpxdata:hr>131</gpxdata:hr>'
    ]))).toEqual([110, 121]);
  });

  it('maps a missing source sample as unavailable rather than recorded zero', () => {
    const parsed: any = new GXParser(gpx(['<gpxdata:hr>120</gpxdata:hr>', '', '<gpxdata:hr>125</gpxdata:hr>']), xmldom.DOMParser);
    const mapper = GPXSampleMapper.find(mapping => mapping.dataType === DataHeartRate.type)!;
    expect(parsed.trk[0].trkseg[0].trkpt.map((sample: any) => mapper.getSampleValue(sample)))
      .toEqual([120, null, 125]);
  });

  it('honors a stream allowlist that excludes HR', async () => {
    const event = await EventImporterGPX.getFromString(gpx(['<gpxdata:hr>120</gpxdata:hr>', '<gpxdata:hr>125</gpxdata:hr>']),
      xmldom.DOMParser, new ActivityParsingOptions({ streams: { includeTypes: [DataDistance.type] } }));
    expect(event.getFirstActivity().getAllStreams().some(stream => stream.type === DataHeartRate.type)).toBe(false);
  });
});
