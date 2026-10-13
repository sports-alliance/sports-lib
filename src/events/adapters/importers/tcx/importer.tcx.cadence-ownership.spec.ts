import { DOMParser } from '@xmldom/xmldom';
import { EventImporterTCX } from './importer.tcx';
import { DataCadence } from '../../../../data/data.cadence';
import { DataStrokeRate } from '../../../../data/data.stroke-rate';
import { DataCadenceAvg } from '../../../../data/data.cadence-avg';
import { SportsLib } from '../../../../index';

const namespace = 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2';
const document = (lapFields: string, points: string[], sport = 'Biking') =>
  new DOMParser().parseFromString(
    `<TrainingCenterDatabase xmlns="${namespace}" xmlns:t="${namespace}"
    xmlns:ae="http://www.garmin.com/xmlschemas/ActivityExtension/v2" xmlns:other="urn:other">
    <Activities><Activity Sport="${sport}"><Id>2020-01-01T00:00:00Z</Id>
    <Lap StartTime="2020-01-01T00:00:00Z"><TotalTimeSeconds>2</TotalTimeSeconds><DistanceMeters>4</DistanceMeters>
      <Track>${points.map((value, index) => `<Trackpoint><Time>2020-01-01T00:00:0${index}Z</Time>${value}</Trackpoint>`).join('')}</Track>
      ${lapFields}
    </Lap></Activity></Activities>
  </TrainingCenterDatabase>`,
    'text/xml'
  );
const importLap = async (fields: string, point = '<Cadence>120</Cadence>') =>
  (await EventImporterTCX.getFromXML(document(fields, [point, point, point]))).getFirstActivity().getLaps()[0];

describe('TCX lap cadence ownership', () => {
  it.each(['Biking', 'Running', 'Swimming'])(
    'does not promote a %s trackpoint cadence to a recorded lap stat',
    async sport => {
      const event = await EventImporterTCX.getFromXML(
        document('', ['<Cadence>60</Cadence>', '<Cadence>80</Cadence>', '<Cadence>100</Cadence>'], sport)
      );
      const type = sport === 'Swimming' ? DataStrokeRate.type : DataCadence.type;
      const leg = event.getFirstActivity();
      expect(leg.getStreamData(type)).toEqual([60, 80, 100]);
      expect(leg.getLaps()[0].getStat(type)).toBeUndefined();
      // Valid stream-derived averages remain available through the existing summary path.
      expect(leg.getStat(sport === 'Swimming' ? 'Average Stroke Rate' : DataCadenceAvg.type)?.getValue()).toBe(80);
      const restored = SportsLib.importFromJSON(JSON.parse(JSON.stringify(event.toJSON())));
      expect(restored.getFirstActivity().getLaps()[0].getStat(type)).toBeUndefined();
      expect(restored.getFirstActivity().getStreamData(type)).toEqual([60, 80, 100]);
    }
  );

  it('does not bypass unsupported TPX/Cadence units through the lap parser', async () => {
    const field = '<Extensions><ae:TPX><ae:Cadence>120</ae:Cadence></ae:TPX></Extensions>';
    // Default-namespaced elements also used to match the descendant lookup.
    const inherited =
      '<Extensions><TPX xmlns="http://www.garmin.com/xmlschemas/ActivityExtension/v2"><Cadence>120</Cadence></TPX></Extensions>';
    for (const sample of [field, inherited]) {
      const event = await EventImporterTCX.getFromXML(document('', [sample, sample, sample]));
      const leg = event.getFirstActivity();
      expect(leg.hasStreamData(DataCadence.type)).toBe(false);
      expect(leg.getLaps()[0].getStat(DataCadence.type)).toBeUndefined();
      expect(leg.getLaps()[0].getStat(DataCadenceAvg.type)).toBeUndefined();
    }
  });

  it.each([
    ['<Cadence>0</Cadence>', 0],
    ['<Cadence>75</Cadence>', 75],
    ['<t:Cadence>75</t:Cadence>', 75]
  ])('preserves a directly owned standard lap field after the track: %s', async (field, expected) => {
    expect((await importLap(field)).getStat(DataCadence.type)?.getValue()).toBe(expected);
  });

  it.each(['', 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v1'])(
    'retains direct fields in legacy documents with namespace %j',
    async legacyNamespace => {
      const xml = document('<Cadence>75</Cadence>', ['<Cadence>120</Cadence>', '', '']).toString();
      const doc = new DOMParser().parseFromString(xml.split(namespace).join(legacyNamespace), 'text/xml');
      const event = await EventImporterTCX.getFromXML(doc);
      expect(event.getFirstActivity().getLaps()[0].getStat(DataCadence.type)?.getValue()).toBe(75);
    }
  );

  it.each([
    '<Cadence/>',
    '<Cadence> </Cadence>',
    '<Cadence>NaN</Cadence>',
    '<Cadence>Infinity</Cadence>',
    '<Cadence>-1</Cadence>',
    '<Cadence>0x10</Cadence>',
    '<Cadence><Value>75</Value></Cadence>',
    '<other:Cadence>75</other:Cadence>',
    '<Cadence xmlns="urn:other">75</Cadence>',
    '<Container><Cadence>75</Cadence></Container>',
    '<Cadence>75</Cadence><Cadence>75</Cadence>',
    '<Cadence>75</Cadence><other:Cadence>75</other:Cadence>'
  ])('does not supply a lap cadence from ambiguous or invalid fields: %s', async field => {
    expect((await importLap(field)).getStat(DataCadence.type)).toBeUndefined();
  });

  it('preserves an explicit lap RunCadence average and its stream', async () => {
    const point = '<Extensions><ae:TPX><ae:RunCadence>80</ae:RunCadence></ae:TPX></Extensions>';
    const fields = '<Extensions><ae:LX><ae:AvgRunCadence>85</ae:AvgRunCadence></ae:LX></Extensions>';
    const event = await EventImporterTCX.getFromXML(document(fields, [point, point, point], 'Running'));
    const leg = event.getFirstActivity();
    expect(leg.getStreamData(DataCadence.type)).toEqual([80, 80, 80]);
    expect(leg.getLaps()[0].getStat(DataCadenceAvg.type)?.getValue()).toBe(85);
    expect(leg.getLaps()[0].getStat(DataCadence.type)).toBeUndefined();
  });
});
