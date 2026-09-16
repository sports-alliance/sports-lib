import {
  DataFITTrainingFileReferences,
  DataFITWorkoutDefinitions,
  DataSuuntoPlusGuideReferences
} from './data.workout-references';
import { DataStore, DynamicDataLoader } from './data.store';

const cases = [
  {
    Class: DataFITTrainingFileReferences,
    key: 'references',
    item: { type: 5, serialNumber: 4294967295, timestampUnixMs: 1700000000000 }
  },
  {
    Class: DataFITWorkoutDefinitions,
    key: 'definitions',
    item: { name: 'Intervals 🚴', sport: 2, subSport: 0, numValidSteps: 3 }
  },
  {
    Class: DataSuuntoPlusGuideReferences,
    key: 'references',
    item: {
      sessionIndex: 0,
      developerDataIndex: 1,
      applicationId: 'SuuntoplusFitExt',
      ownerId: 'test-client',
      externalId: 'guide-a'
    }
  }
] as const;

function items(value: unknown, key: string): Record<string, unknown>[] {
  return (value as Record<string, Record<string, unknown>[]>)[key];
}

describe.each(cases)('$Class.type', ({ Class, key, item }) => {
  const value = () => ({ schemaVersion: 1, [key]: [{ ...item }] });

  it('round-trips canonical JSON through an explicit static factory and dynamic loading', () => {
    const instance = new Class(value());
    const json = JSON.parse(JSON.stringify(instance));
    expect(Class.fromJSON(json).toJSON()).toEqual(json);
    expect(instance.getUnit()).toBe('');
    expect(instance.getDisplayValue()).toBe(Class.type);
    expect(DataStore[Class.name]).toBe(Class);
    expect(DynamicDataLoader.getDataInstanceFromDataType(Class.type, value()).toJSON()).toEqual(json);
  });

  it('owns construction, getter, setValue and serialized data independently', () => {
    const input = value();
    const instance = new Class(input);
    const expected = instance.toJSON();
    Object.assign(items(input, key)[0], { injected: 'not retained' });
    const exposed = instance.getValue();
    items(exposed, key)[0].injected = 'not retained';
    items(exposed, key).push({});
    const serialized = instance.toJSON();
    items(serialized[Class.type], key).length = 0;
    expect(instance.toJSON()).toEqual(expected);
    const next = value();
    instance.setValue(next as never);
    items(next, key).length = 0;
    expect(instance.toJSON()).toEqual(expected);
    expect(() => instance.setValue({ schemaVersion: 2 } as never)).toThrow();
    expect(instance.toJSON()).toEqual(expected);
  });

  it.each([null, 0, NaN, Infinity, '1', {}, [], { schemaVersion: 2 }, { schemaVersion: 1 }])(
    'rejects invalid values %p',
    invalid => {
      expect(() => new Class(invalid)).toThrow();
    }
  );

  it('rejects unknown keys, invalid envelopes, sparse lists and invalid members', () => {
    expect(() => new Class({ ...value(), unexpected: true })).toThrow();
    expect(() => new Class({ schemaVersion: 1, [key]: [{ ...item, extra: 1 }] })).toThrow();
    expect(() => new Class({ schemaVersion: 1, [key]: [undefined] })).toThrow();
    expect(() => new Class({ schemaVersion: 1, [key]: new Array(1) })).toThrow();
    expect(() => Class.fromJSON({ ...new Class(value()).toJSON(), extra: 1 })).toThrow();
    expect(() => Class.fromJSON({ wrong: value() })).toThrow();
    expect(() => Class.fromJSON(value())).toThrow();
  });

  it('is not eligible for QS numeric metric discovery', () => {
    // QS probes each registered constructor with 0, then requires a finite numeric getValue().
    expect(() => new Class(0)).toThrow();
    const instance = new Class(value());
    expect(instance.isValueTypeValid(0)).toBe(false);
    expect(typeof instance.getValue()).toBe('object');
  });
});

describe('reference constraints', () => {
  it.each([0, -1, 4294967296, 1.5, NaN])('rejects invalid uint32z serial %p', serialNumber => {
    expect(() => new DataFITTrainingFileReferences({ schemaVersion: 1, references: [{ serialNumber }] })).toThrow();
  });
  it('preserves missing native values and duplicate records without inventing identities', () => {
    const value = { schemaVersion: 1, references: [{}, {}] };
    expect(new DataFITTrainingFileReferences(value).getValue()).toEqual(value);
  });
  it.each(['', 'a\0b', '\ud800', 'a\ufffdb', 'x'.repeat(65)])('rejects malformed Guide IDs %p', externalId => {
    expect(
      () => new DataSuuntoPlusGuideReferences({ schemaVersion: 1, references: [{ ...cases[2].item, externalId }] })
    ).toThrow();
  });
  it('bounds each paired group and rejects unsupported exporters', () => {
    expect(
      () => new DataSuuntoPlusGuideReferences({ schemaVersion: 1, references: Array(11).fill(cases[2].item) })
    ).toThrow();
    expect(
      () =>
        new DataSuuntoPlusGuideReferences({
          schemaVersion: 1,
          references: [{ ...cases[2].item, applicationId: 'other' }]
        })
    ).toThrow();
  });

  it('rejects sparse arrays disguised by extra properties and conflicting exporter identities', () => {
    const sparse = new Array(1);
    Object.assign(sparse, { extra: {} });
    expect(() => new DataFITTrainingFileReferences({ schemaVersion: 1, references: sparse })).toThrow();
    expect(
      () =>
        new DataSuuntoPlusGuideReferences({
          schemaVersion: 1,
          references: [cases[2].item, { ...cases[2].item, sessionIndex: 1, applicationId: 'SuuntoFitExport1' }]
        })
    ).toThrow();
  });

  it.each([
    { type: -0 },
    { type: 255 },
    { manufacturer: 65535 },
    { product: NaN },
    { timestampUnixMs: 0 },
    { timestampUnixMs: 1700000000001 },
    { serialNumber: undefined }
  ])('rejects invalid or non-JSON-stable native fields %p', reference => {
    expect(() => new DataFITTrainingFileReferences({ schemaVersion: 1, references: [reference] })).toThrow();
  });
});
