import { DOMParser } from '@xmldom/xmldom';
import { EventImporterTCX } from './importer.tcx';
import { findLapExtensionValue, findTrackPointExtensionValue } from './utils.tcx';
import { SportsLib } from '../../../../index';
import { DataSpeed } from '../../../../data/data.speed';
import { DataPace } from '../../../../data/data.pace';
import { DataSpeedAvg } from '../../../../data/data.speed-avg';
import { DataSpeedMax } from '../../../../data/data.speed-max';
import { DataStore, DynamicDataLoader } from '../../../../data/data.store';
import { ActivityUtilities } from '../../../utilities/activity.utilities';
import { ActivityParsingOptions } from '../../../../activities/activity-parsing-options';

const tcxNamespace = 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2';
const extensionNamespace = 'http://www.garmin.com/xmlschemas/ActivityExtension/v2';
const attributes = `xmlns="${tcxNamespace}" xmlns:ae="${extensionNamespace}" xmlns:other="urn:unrelated"`;
const speed = (value: string) => `<ae:TPX><Speed>${value}</Speed></ae:TPX>`;
const wrapped = (value: string) => `<Extensions>${speed(value)}</Extensions>`;
const children = (xml: string) =>
  new DOMParser().parseFromString(`<Trackpoint ${attributes}>${xml}</Trackpoint>`, 'text/xml').documentElement
    .childNodes;

const activityXML = (samples: string[]) =>
  new DOMParser().parseFromString(
    `<TrainingCenterDatabase ${attributes}><Activities><Activity Sport="Running"><Id>2020-01-01T00:00:00Z</Id>
    <Lap StartTime="2020-01-01T00:00:00Z"><TotalTimeSeconds>${samples.length - 1}</TotalTimeSeconds>
      <DistanceMeters>8</DistanceMeters><Calories>1</Calories><Track>
        ${samples
          .map(
            (sample, second) => `<Trackpoint><Time>2020-01-01T00:00:0${second}Z</Time>
          <DistanceMeters>${second * 2}</DistanceMeters><HeartRateBpm><Value>100</Value></HeartRateBpm>
          ${sample}</Trackpoint>`
          )
          .join('')}
      </Track>
    </Lap></Activity></Activities></TrainingCenterDatabase>`,
    'text/xml'
  );

describe('TCX speed without the Extensions wrapper', () => {
  it.each([
    [speed('2.5'), 2.5],
    [speed('0'), 0],
    [speed(' 2e0 '), 2],
    ['<ae:TPX><ae:Speed>3</ae:Speed></ae:TPX>', 3],
    [`<TPX xmlns="${extensionNamespace}"><Speed>4</Speed></TPX>`, 4],
    ['<ae:TPX><Speed xmlns="">5</Speed></ae:TPX>', 5]
  ])('recovers only the recognized speed observation from %s', (xml, expected) => {
    expect(findTrackPointExtensionValue(children(xml), 'Speed')).toBe(expected);
  });

  it.each(['', ' ', '-1', 'NaN', 'Infinity', '1e999', 'two', '0x10', '2m/s'])(
    'rejects invalid direct speed %j',
    value => {
      expect(findTrackPointExtensionValue(children(speed(value)), 'Speed')).toBeNull();
    }
  );

  it.each([
    '<other:TPX><Speed>2</Speed></other:TPX>',
    '<TPX><Speed>2</Speed></TPX>',
    '<ae:OtherTPX><Speed>2</Speed></ae:OtherTPX>',
    '<ae:TPX><other:Speed>2</other:Speed></ae:TPX>',
    '<ae:TPX><NotSpeed>2</NotSpeed></ae:TPX>',
    `<Container>${speed('2')}</Container>`,
    '<ae:TPX><Speed><Value>2</Value></Speed></ae:TPX>',
    speed('2') + speed('3'),
    speed('2') + speed('2'),
    '<ae:TPX><Speed>2</Speed><Speed>3</Speed></ae:TPX>',
    '<ae:TPX><Speed unit="km/h">36</Speed></ae:TPX>',
    '<ae:TPX><Speed>2</Speed><other:Speed>36</other:Speed></ae:TPX>',
    speed('2') + '<other:TPX><Speed>36</Speed></other:TPX>'
  ])('does not guess from unrelated, nested or ambiguous nodes: %s', xml => {
    expect(findTrackPointExtensionValue(children(xml), 'Speed')).toBeNull();
  });

  it.each([wrapped('3') + speed('9'), speed('9') + wrapped('3')])('preserves wrapped precedence', xml => {
    expect(findTrackPointExtensionValue(children(xml), 'Speed')).toBe(3);
  });

  it('does not fall back when the wrapper exists but supplies no speed', () => {
    expect(findTrackPointExtensionValue(children('<Extensions/>' + speed('2')), 'Speed')).toBeNull();
  });

  it('does not expand missing-wrapper support to power, cadence or lap extensions', () => {
    const nodes = children(
      '<ae:TPX><Speed>2</Speed><Watts>250</Watts><RunCadence>80</RunCadence></ae:TPX><ae:LX><AvgSpeed>2</AvgSpeed></ae:LX>'
    );
    expect(findTrackPointExtensionValue(nodes, 'Watts')).toBeNull();
    expect(findTrackPointExtensionValue(nodes, 'RunCadence')).toBeNull();
    expect(findLapExtensionValue(nodes, 'AvgSpeed')).toBeNull();
  });

  it('keeps normal wrapped speed, power, cadence and lap extensions unchanged', () => {
    const nodes = children(
      '<Extensions><ae:TPX><Speed>2</Speed><Watts>250</Watts><RunCadence>80</RunCadence></ae:TPX><ae:LX><AvgSpeed>3</AvgSpeed></ae:LX></Extensions>'
    );
    expect(findTrackPointExtensionValue(nodes, 'Speed')).toBe(2);
    expect(findTrackPointExtensionValue(nodes, 'Watts')).toBe(250);
    expect(findTrackPointExtensionValue(nodes, 'RunCadence')).toBe(80);
    expect(findLapExtensionValue(nodes, 'AvgSpeed')).toBe(3);
  });

  it('imports canonical speed and pace once, retains zero and gaps, and restores JSON without duplicates', async () => {
    const event = await EventImporterTCX.getFromXML(activityXML([speed('0'), speed('2'), '', speed('4'), speed('2')]));
    const activity = event.getFirstActivity();
    expect(activity.getStreamData(DataSpeed.type)).toEqual([0, 2, null, 4, 2]);
    expect(activity.getStreamData(DataPace.type)).toEqual([Infinity, 500, null, 250, 500]);
    for (const scope of [event, activity, ...activity.getLaps()]) {
      expect(scope.getStat(DataSpeedMax.type)?.getValue()).toBe(4);
      // Retain the existing TCX lap average policy, including its distance fallback at missing/zero speed.
      expect(scope.getStat(DataSpeedAvg.type)?.getValue()).toBe(2.5);
    }
    const restored = SportsLib.importFromJSON(JSON.parse(JSON.stringify(event.toJSON())));
    const reloaded = SportsLib.importFromJSON(JSON.parse(JSON.stringify(restored.toJSON()))).getFirstActivity();
    expect(reloaded.getStreamData(DataSpeed.type)).toEqual([0, 2, null, 4, 2]);
    expect(reloaded.getStreamData(DataPace.type)).toEqual([null, 500, null, 250, 500]);
    for (const type of [DataSpeed.type, DataPace.type]) {
      expect(reloaded.getAllStreams().filter(s => s.type === type)).toHaveLength(1);
      expect(Object.values(DataStore).some((entry: any) => entry?.type === type)).toBe(true);
      expect(DynamicDataLoader.getDataInstanceFromDataType(type, 2).getType()).toBe(type);
    }
    expect(new DataSpeed(2).getUnit()).toBe('m/s');
    expect(new DataSpeed(2).getDisplayValue()).toBe('2.00');
    expect(new DataSpeed(2).getValue()).toBe(2);
    expect(ActivityUtilities.getTrainingStressScoreEvaluations(activity).automatic.score).toBeNull();
  });

  it('keeps stream selection strict and computes the requested pace from direct speed', async () => {
    const options = new ActivityParsingOptions({ streams: { includeTypes: [DataPace.type] } });
    const event = await EventImporterTCX.getFromXML(activityXML([speed('2'), speed('4')]), options);
    expect(
      event
        .getFirstActivity()
        .getAllStreams()
        .map(s => s.type)
    ).toEqual([DataPace.type]);
    expect(event.getFirstActivity().getStreamData(DataPace.type)).toEqual([500, 250]);
  });
});
