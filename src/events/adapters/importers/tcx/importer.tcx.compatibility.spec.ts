import { DOMParser } from '@xmldom/xmldom';
import { findTCXAltitude, findTCXSpeed, hasCorosDirectSpeed } from './tcx.compatibility';
import { EventImporterTCX } from './importer.tcx';
import { SportsLib } from '../../../../index';
import { DataSpeed } from '../../../../data/data.speed';
import { DataPace } from '../../../../data/data.pace';
import { DataAltitude } from '../../../../data/data.altitude';
import { DataAltitudeMax } from '../../../../data/data.altitude-max';
import { DataCadence } from '../../../../data/data.cadence';
import { DataStrokeRate } from '../../../../data/data.stroke-rate';
import { DataStore, DynamicDataLoader } from '../../../../data/data.store';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';
import { ActivityUtilities } from '../../../utilities/activity.utilities';

const tcx = 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2';
const ae = 'http://www.garmin.com/xmlschemas/ActivityExtension/v2';
const attributes = `xmlns="${tcx}" xmlns:t="${tcx}" xmlns:ae="${ae}" xmlns:other="urn:other"`;
const element = (contents: string) =>
  new DOMParser().parseFromString(`<Trackpoint ${attributes}>${contents}</Trackpoint>`, 'text/xml').documentElement;
const directSpeed = (value: string) => `<Extensions><Speed>${value}</Speed></Extensions>`;
const standardSpeed = (value: string) => `<Extensions><ae:TPX><ae:Speed>${value}</ae:Speed></ae:TPX></Extensions>`;
const nestedAltitude = (value: string) => `<Position><AltitudeMeters>${value}</AltitudeMeters></Position>`;
const creator = '<Creator><Name>COROS Wearables</Name></Creator>';
const activity = (samples: string[], identity = creator, sport = 'Running') =>
  `<Activity Sport="${sport}"><Id>2020-01-01T00:00:00Z</Id>${identity}
    <Lap StartTime="2020-01-01T00:00:00Z"><TotalTimeSeconds>${samples.length - 1}</TotalTimeSeconds>
    <DistanceMeters>8</DistanceMeters><Calories>1</Calories><Track>${samples
      .map(
        (sample, index) =>
          `<Trackpoint><Time>2020-01-01T00:00:0${index}Z</Time><DistanceMeters>${index * 2}</DistanceMeters>${sample}</Trackpoint>`
      )
      .join('')}</Track></Lap></Activity>`;
const document = (...activities: string[]) =>
  new DOMParser().parseFromString(
    `<TrainingCenterDatabase ${attributes}><Activities>${activities.join('')}</Activities></TrainingCenterDatabase>`,
    'text/xml'
  );

describe('TCX exporter-specific speed and nested altitude', () => {
  it.each(['0', '7.2', ' 3.6e1 ', '+1.8', '.36'])('converts COROS direct speed %j from km/h', value => {
    expect(findTCXSpeed(element(directSpeed(value)), true)).toBe(Number(value) / 3.6);
    expect(findTCXSpeed(element(directSpeed(value)))).toBeNull();
  });

  it.each(['', ' ', '-1', 'NaN', 'Infinity', '1e999', '0x10', '2 km/h', '<Value>2</Value>'])(
    'rejects invalid direct speed %j',
    value => {
      expect(findTCXSpeed(element(directSpeed(value)), true)).toBeNull();
    }
  );

  it.each([
    '<other:Extensions><Speed>7.2</Speed></other:Extensions>',
    '<Extensions><other:Speed>7.2</other:Speed></Extensions>',
    '<Extensions><ae:Speed>7.2</ae:Speed></Extensions>',
    '<Extensions><Speed xmlns="">7.2</Speed></Extensions>',
    '<Extensions><NotSpeed>7.2</NotSpeed></Extensions>',
    '<Extensions><Container><Speed>7.2</Speed></Container></Extensions>',
    '<Extensions><Speed>7.2</Speed><Speed>7.2</Speed></Extensions>',
    '<Extensions><Speed>7.2</Speed><other:Speed>9</other:Speed></Extensions>',
    directSpeed('7.2') + '<Extensions/>',
    directSpeed('7.2') + '<other:Extensions/>',
    `<Container>${directSpeed('7.2')}</Container>`,
    '<Extensions><Speed>7.2</Speed><ae:TPX/></Extensions>',
    '<Extensions><Speed>7.2</Speed><other:TPX/></Extensions>'
  ])('rejects ambiguous or unrelated direct speed: %s', xml => {
    expect(findTCXSpeed(element(xml), true)).toBeNull();
  });

  it('accepts equivalent namespace prefixes, without broadening field ownership', () => {
    expect(findTCXSpeed(element('<t:Extensions><t:Speed>7.2</t:Speed></t:Extensions>'), true)).toBe(2);
    expect(findTCXAltitude(element('<t:Position><t:AltitudeMeters>-2</t:AltitudeMeters></t:Position>'))).toBe(-2);
    expect(hasCorosDirectSpeed(element('<t:Creator><t:Name>COROS Wearables</t:Name></t:Creator>'))).toBe(true);
  });

  it('rejects fallback fields belonging to a foreign-namespace trackpoint or activity', () => {
    const foreign = new DOMParser().parseFromString(
      `<other:Trackpoint ${attributes}>${creator}${directSpeed('7.2')}${nestedAltitude('2')}</other:Trackpoint>`,
      'text/xml'
    ).documentElement;
    expect(findTCXSpeed(foreign, true)).toBeNull();
    expect(findTCXAltitude(foreign)).toBeNull();
    expect(hasCorosDirectSpeed(foreign)).toBe(false);
  });

  it.each([
    '',
    '<Creator><Name>Other exporter</Name></Creator>',
    '<Creator><Name>COROS Wearables clone</Name></Creator>',
    '<other:Creator><Name>COROS Wearables</Name></other:Creator>',
    '<Creator><other:Name>COROS Wearables</other:Name></Creator>',
    '<Creator><Name><Value>COROS Wearables</Value></Name></Creator>',
    '<Creator><Name>COROS Wearables</Name><Name>COROS Wearables</Name></Creator>',
    creator + creator,
    creator + '<other:Creator/>',
    `<Lap>${creator}</Lap>`
  ])('does not infer COROS units from missing or ambiguous identity: %s', xml => {
    expect(hasCorosDirectSpeed(element(xml))).toBe(false);
  });

  it.each(['0', '2.5'])('keeps standard TPX speed %s in m/s even for COROS', value => {
    const xml = `<Extensions><Speed>72</Speed><ae:TPX><ae:Speed>${value}</ae:Speed></ae:TPX></Extensions>`;
    expect(findTCXSpeed(element(xml), true)).toBe(Number(value));
    expect(findTCXSpeed(element(`<ae:TPX><ae:Speed>${value}</ae:Speed></ae:TPX>`), true)).toBe(Number(value));
  });

  it.each(['-5.5', '0', '+4', ' 1.2e2 '])('retains nested altitude %j in metres', value => {
    expect(findTCXAltitude(element(nestedAltitude(value)))).toBe(Number(value));
  });

  it.each(['', ' ', 'NaN', 'Infinity', '-Infinity', '1e999', '0x10', '2m', '<Value>2</Value>'])(
    'rejects invalid nested altitude %j',
    value => {
      expect(findTCXAltitude(element(nestedAltitude(value)))).toBeNull();
    }
  );

  it.each([
    '<other:Position><AltitudeMeters>2</AltitudeMeters></other:Position>',
    '<Position><other:AltitudeMeters>2</other:AltitudeMeters></Position>',
    '<Position><NotAltitudeMeters>2</NotAltitudeMeters></Position>',
    '<Position><Container><AltitudeMeters>2</AltitudeMeters></Container></Position>',
    '<Position><AltitudeMeters xmlns="">2</AltitudeMeters></Position>',
    '<Position><AltitudeMeters>2</AltitudeMeters><AltitudeMeters>3</AltitudeMeters></Position>',
    '<Position><AltitudeMeters>2</AltitudeMeters><other:AltitudeMeters>3</other:AltitudeMeters></Position>',
    nestedAltitude('2') + '<Position/>',
    nestedAltitude('2') + '<other:Position/>',
    `<Container>${nestedAltitude('2')}</Container>`
  ])('rejects ambiguous or unrelated nested altitude: %s', xml => {
    expect(findTCXAltitude(element(xml))).toBeNull();
  });

  it.each(['-3', '0', '4', ''])('preserves standard altitude precedence for %j', value => {
    for (const xml of [
      `<AltitudeMeters>${value}</AltitudeMeters>${nestedAltitude('9')}`,
      `${nestedAltitude('9')}<AltitudeMeters>${value}</AltitudeMeters>`
    ]) {
      expect(findTCXAltitude(element(xml))).toBe(value === '' ? null : Number(value));
    }
  });

  it('produces the same canonical metrics as equivalent standard fields, including summaries and JSON', async () => {
    const raw = [
      directSpeed('0') + nestedAltitude('-5'),
      directSpeed('7.2') + nestedAltitude('0'),
      '',
      directSpeed('14.4') + nestedAltitude('5'),
      directSpeed('7.2') + nestedAltitude('10')
    ];
    const standard = [
      standardSpeed('0') + '<Position/><AltitudeMeters>-5</AltitudeMeters>',
      standardSpeed('2') + '<Position/><AltitudeMeters>0</AltitudeMeters>',
      '',
      standardSpeed('4') + '<Position/><AltitudeMeters>5</AltitudeMeters>',
      standardSpeed('2') + '<Position/><AltitudeMeters>10</AltitudeMeters>'
    ];
    const options = new ActivityParsingOptions({ streams: { smooth: { altitudeSmooth: false } } });
    const event = await EventImporterTCX.getFromXML(document(activity(raw)), options);
    const reference = await EventImporterTCX.getFromXML(document(activity(standard)), options);
    expect(event.toJSON()).toEqual(reference.toJSON());
    const leg = event.getFirstActivity();
    expect(leg.getStreamData(DataSpeed.type)).toEqual([0, 2, null, 4, 2]);
    expect(leg.getStreamData(DataPace.type)).toEqual([Infinity, 500, null, 250, 500]);
    // Preserve the existing altitude forward-fill policy at a missing observation.
    expect(leg.getStreamData(DataAltitude.type)).toEqual([-5, 0, 0, 5, 10]);
    expect(leg.getStat(DataAltitudeMax.type)?.getValue()).toBe(10);
    let restored = event;
    for (let round = 0; round < 2; round++) {
      restored = SportsLib.importFromJSON(JSON.parse(JSON.stringify(restored.toJSON())));
      expect(restored.toJSON()).toEqual(
        SportsLib.importFromJSON(JSON.parse(JSON.stringify(reference.toJSON()))).toJSON()
      );
      for (const type of [DataSpeed.type, DataPace.type, DataAltitude.type]) {
        expect(
          restored
            .getFirstActivity()
            .getAllStreams()
            .filter(stream => stream.type === type)
        ).toHaveLength(1);
        expect(Object.values(DataStore).some((entry: any) => entry?.type === type)).toBe(true);
        expect(DynamicDataLoader.getDataInstanceFromDataType(type, 2).getValue()).toBe(2);
      }
      // These inputs cannot supply missing physiological calibration.
      expect(
        ActivityUtilities.getTrainingStressScoreEvaluations(restored.getFirstActivity()).automatic.score
      ).toBeNull();
    }
    expect(new DataAltitude(-5).getUnit()).toBe('m');
    expect(new DataAltitude(-5).getValue()).toBe(-5);
    expect(new DataAltitude(-5).getDisplayValue()).toBe(-5);
  });

  it('scopes COROS identification to each activity in a multisport file', async () => {
    const event = await EventImporterTCX.getFromXML(
      document(
        activity([directSpeed('7.2'), directSpeed('14.4')]),
        activity([directSpeed('7.2'), directSpeed('14.4')], '<Creator><Name>Other</Name></Creator>')
      )
    );
    expect(event.getActivities()[0].getStreamData(DataSpeed.type)).toEqual([2, 4]);
    expect(event.getActivities()[1].hasStreamData(DataSpeed.type)).toBe(false);
  });

  it.each([DataPace.type, DataAltitude.type])('keeps selection strict for %s', async type => {
    const event = await EventImporterTCX.getFromXML(
      document(activity([directSpeed('7.2') + nestedAltitude('-5'), directSpeed('14.4') + nestedAltitude('5')])),
      new ActivityParsingOptions({ streams: { includeTypes: [type], smooth: { altitudeSmooth: false } } })
    );
    expect(
      event
        .getFirstActivity()
        .getAllStreams()
        .map(stream => stream.type)
    ).toEqual([type]);
    expect(event.getFirstActivity().getStreamData(type)).toEqual(type === DataPace.type ? [500, 250] : [-5, 5]);
  });

  it.each(['Running', 'Biking', 'Swimming'])('does not guess units for unsupported TPX/Cadence in %s', async sport => {
    const ambiguous = '<Extensions><ae:TPX><ae:Cadence>120</ae:Cadence></ae:TPX></Extensions>';
    const event = await EventImporterTCX.getFromXML(document(activity([ambiguous, ambiguous], '', sport)));
    expect(event.getFirstActivity().hasStreamData(DataCadence.type)).toBe(false);
    expect(event.getFirstActivity().hasStreamData(DataStrokeRate.type)).toBe(false);
    const standard = await EventImporterTCX.getFromXML(
      document(activity(['<Cadence>0</Cadence>' + ambiguous, '<Cadence>60</Cadence>' + ambiguous], '', sport))
    );
    const type = sport === 'Swimming' ? DataStrokeRate.type : DataCadence.type;
    expect(standard.getFirstActivity().getStreamData(type)).toEqual([0, 60]);
  });
});
