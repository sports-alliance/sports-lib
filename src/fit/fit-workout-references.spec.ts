import { readFITWorkoutReferences } from './fit-workout-references';
import { FITWorkoutFixture, byte, numeric, stringField, developer } from '../specs/fit-workout-fixture';
import { FitEncoder } from 'fit-file-parser';
import { EventImporterFIT } from '../events/adapters/importers/fit/importer.fit';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const TIME = 1100000000;
const ms = (seconds: number) => Date.UTC(1989, 11, 31) + seconds * 1000;
const references = (fixture: FITWorkoutFixture) =>
  readFITWorkoutReferences(fixture.finish()).suuntoGuides.getValue().references;
const session = (fixture: FITWorkoutFixture, index = 1, owners = 'test-client', ids = 'guide-a') =>
  fixture.message(
    18,
    [numeric(253, TIME + 60), numeric(2, TIME), byte(5, 2, 0), byte(6, 0, 0)],
    [developer(2, index, owners), developer(3, index, ids)]
  );

describe('FIT workout reference reader', () => {
  it.each(['SuuntoFitExport1', 'SuuntoplusFitExt'])(
    'reads aligned Guide pairs from %s without consumer-specific filtering',
    applicationId => {
      const fixture = new FITWorkoutFixture().application(4, applicationId).descriptions(4);
      session(fixture, 4, 'client-a\0client-b', 'external-a\0external-b');
      const result = readFITWorkoutReferences(fixture.finish());
      expect(result.status).toBe('ok');
      expect(result.suuntoGuides.getValue().references).toEqual([
        { sessionIndex: 0, developerDataIndex: 4, applicationId, ownerId: 'client-a', externalId: 'external-a' },
        { sessionIndex: 0, developerDataIndex: 4, applicationId, ownerId: 'client-b', externalId: 'external-b' }
      ]);
      expect(result.sessions).toEqual([
        { sessionIndex: 0, startTimeUnixMs: ms(TIME), endTimeUnixMs: ms(TIME + 60), sport: 2, subSport: 0 }
      ]);
    }
  );

  it('normalizes the FIT endian flag on the developer application ID base type', () => {
    const fixture = new FITWorkoutFixture()
      .message(207, [byte(3, 1), { number: 1, type: 0x8d, bytes: [...new TextEncoder().encode('SuuntoplusFitExt')] }])
      .descriptions();
    session(fixture);
    const result = readFITWorkoutReferences(fixture.finish());
    expect(result.status).toBe('ok');
    expect(result.suuntoGuides.getValue().references).toHaveLength(1);
  });

  it('keeps both exporters and successive sessions separate', () => {
    const fixture = new FITWorkoutFixture()
      .application(0, 'SuuntoFitExport1')
      .descriptions(0)
      .application(1)
      .descriptions(1);
    fixture.message(
      18,
      [numeric(2, TIME)],
      [developer(2, 0, 'a'), developer(3, 0, 'one'), developer(2, 1, 'b'), developer(3, 1, 'two')]
    );
    session(fixture, 1, 'a', 'three');
    expect(references(fixture).map(item => [item.sessionIndex, item.developerDataIndex, item.externalId])).toEqual([
      [0, 0, 'one'],
      [0, 1, 'two'],
      [1, 1, 'three']
    ]);
  });

  it('resolves variable field numbers from descriptions', () => {
    const fixture = new FITWorkoutFixture()
      .application(9)
      .descriptions(9, 21, 22)
      .message(18, [], [developer(21, 9, 'client'), developer(22, 9, 'external')]);
    expect(references(fixture)[0]).toMatchObject({ developerDataIndex: 9, ownerId: 'client', externalId: 'external' });
  });

  it.each([
    [0, 1, 2, 3],
    [2, 9, 21, 22]
  ])(
    'reads a source-shaped Suunto session with independent metric and Guide definitions (%p, %p)',
    (metricIndex, guideIndex, ownerField, externalField) => {
      // Reproduces an inspected export's metadata topology, not its personal values or recording.
      const fixture = new FITWorkoutFixture().application(metricIndex, 'SuuntoFitExport1');
      for (const [field, name, type] of [
        [2, 'recovery_time', 0x86],
        [4, 'peak_epoc', 0x88],
        [11, 'aerobic_baseline', 0x88],
        [12, 'cumulative_baseline', 0x88],
        [13, 'aerobic_threshold', 0x88],
        [15, 'time_in_aerobic_zone', 0x88],
        [16, 'time_in_anaerobic_zone', 0x88],
        [17, 'time_in_vo2max_zone', 0x88],
        [18, 'ddfa', 0x88]
      ] as const)
        fixture.description(metricIndex, field, name, type);
      fixture.application(guideIndex).descriptions(guideIndex, ownerField, externalField);
      fixture.message(
        18,
        [numeric(253, TIME + 60), numeric(2, TIME), byte(5, 2, 0)],
        [
          { number: 2, index: metricIndex, bytes: [60, 0, 0, 0] },
          developer(ownerField, guideIndex, 'synthetic-client-a\0synthetic-client-b'),
          developer(externalField, guideIndex, 'synthetic-guide-a\0synthetic-guide-b')
        ]
      );
      const result = readFITWorkoutReferences(fixture.finish());
      expect(result.status).toBe('ok');
      expect(result.diagnostics).toEqual([]);
      expect(result.suuntoGuides.getValue().references).toEqual(
        ['a', 'b'].map(suffix => ({
          sessionIndex: 0,
          developerDataIndex: guideIndex,
          applicationId: 'SuuntoplusFitExt',
          ownerId: `synthetic-client-${suffix}`,
          externalId: `synthetic-guide-${suffix}`
        }))
      );
      expect(result.sessions).toEqual([
        { sessionIndex: 0, startTimeUnixMs: ms(TIME), endTimeUnixMs: ms(TIME + 60), sport: 2 }
      ]);
    }
  );

  it('allows unrelated developer IDs without application IDs', () => {
    const fixture = new FITWorkoutFixture()
      .message(207, [byte(3, 0)])
      .description(0, 0, 'calibration', 0x85)
      .application()
      .descriptions();
    session(fixture);
    const result = readFITWorkoutReferences(fixture.finish());
    expect(result.status).toBe('ok');
    expect(result.diagnostics).toEqual([]);
    expect(result.suuntoGuides.getValue().references).toHaveLength(1);
  });

  it('ignores unnamed unrelated fields and accepts an identity supplied before first Guide use', () => {
    const fixture = new FITWorkoutFixture()
      .message(207, [byte(3, 1)])
      .message(206, [byte(0, 1), byte(1, 12), byte(2, 0x88)])
      .application()
      .descriptions();
    session(fixture);
    expect(readFITWorkoutReferences(fixture.finish()).status).toBe('ok');
    expect(references(fixture)).toHaveLength(1);
  });

  it.each(['samples/fit/2025-10-22_08-55.fit', 'src/specs/fixtures/rides/fit/7739869618.fit'])(
    'ignores unrelated application-less metadata in existing sample %s',
    path => {
      const result = readFITWorkoutReferences(readFileSync(resolve(__dirname, '../..', path)));
      expect(result.status).toBe('ok');
      expect(result.diagnostics).toEqual([]);
      expect(result.suuntoGuides.getValue().references).toEqual([]);
    }
  );

  it.each([206, 207])('does not discard valid evidence for an unresolvable unrelated message %p', global => {
    const fixture = new FITWorkoutFixture().application().descriptions();
    session(fixture);
    fixture.message(global, [stringField(global === 206 ? 0 : 3, 'bad-index')]);
    const result = readFITWorkoutReferences(fixture.finish());
    expect(result.status).toBe('partial');
    expect(result.diagnostics).toEqual(['invalid_metadata']);
    expect(result.suuntoGuides.getValue().references).toHaveLength(1);
  });

  it.each([false, true])(
    'isolates unrelated malformed/conflicting fields inside a Guide exporter (conflict=%p)',
    conflict => {
      const fixture = new FITWorkoutFixture().application().descriptions().description(1, 12, 'unrelated');
      session(fixture);
      if (conflict) fixture.description(1, 12, 'changed_unrelated');
      else fixture.message(206, [byte(0, 1), byte(1, 12), byte(2, 7), { number: 3, type: 7, bytes: [0xc3, 0x28] }]);
      const result = readFITWorkoutReferences(fixture.finish());
      expect(result.status).toBe('partial');
      expect(result.suuntoGuides.getValue().references).toHaveLength(1);
    }
  );

  it('invalidates only references that actually use a conflicting field definition', () => {
    const fixture = new FITWorkoutFixture().application().descriptions();
    session(fixture);
    fixture
      .descriptions(1, 21, 22)
      .message(18, [], [developer(21, 1, 'second-client'), developer(22, 1, 'second-guide')]);
    fixture.description(1, 2, 'changed_field');
    const result = readFITWorkoutReferences(fixture.finish());
    expect(result.diagnostics).toEqual(['conflicting_developer_definition']);
    expect(result.suuntoGuides.getValue().references).toEqual([
      {
        sessionIndex: 1,
        developerDataIndex: 1,
        applicationId: 'SuuntoplusFitExt',
        ownerId: 'second-client',
        externalId: 'second-guide'
      }
    ]);
  });

  it.each(['suuntoplus_plugin_owner_id', 'unrelated'])(
    'does not hide a conflicting extra Guide field named %s',
    name => {
      const fixture = new FITWorkoutFixture()
        .application()
        .descriptions()
        .description(1, 12, 'suuntoplus_plugin_owner_id')
        .description(1, 12, name, 2)
        .message(18, [], [developer(2, 1, 'client'), developer(3, 1, 'guide'), developer(12, 1, 'ambiguous')]);
      const result = readFITWorkoutReferences(fixture.finish());
      expect(result.status).toBe('partial');
      expect(result.suuntoGuides.getValue().references).toEqual([]);
    }
  );

  it.each(['suuntoplus_plugin_owner_id', 'suuntoplus_plugin_external_id'])(
    'rejects an extra %s even when its base-type metadata cannot be decoded',
    name => {
      const fixture = new FITWorkoutFixture()
        .application()
        .descriptions()
        .message(206, [byte(0, 1), byte(1, 12), stringField(2, 'bad-type'), stringField(3, name)])
        .message(18, [], [developer(2, 1, 'client'), developer(3, 1, 'guide'), developer(12, 1, 'ambiguous')]);
      const result = readFITWorkoutReferences(fixture.finish());
      expect(result.status).toBe('partial');
      expect(result.diagnostics).toContain('invalid_metadata');
      expect(result.suuntoGuides.getValue().references).toEqual([]);
    }
  );

  it('preserves a supported group alongside an unsupported exporter and a malformed unrelated app', () => {
    const fixture = new FITWorkoutFixture()
      .application()
      .descriptions()
      .application(2, 'UnknownExport123')
      .descriptions(2)
      .application(3, 'bad');
    fixture.message(
      18,
      [],
      [developer(2, 1, 'a'), developer(3, 1, 'one'), developer(2, 2, 'b'), developer(3, 2, 'two')]
    );
    const result = readFITWorkoutReferences(fixture.finish());
    expect(result.diagnostics).toEqual(['invalid_metadata', 'unsupported_exporter']);
    expect(result.suuntoGuides.getValue().references.map(item => item.externalId)).toEqual(['one']);
  });

  it.each(['before', 'after'])('rejects malformed Guide field definitions %s a valid definition', position => {
    const fixture = new FITWorkoutFixture().application();
    const malformed = () =>
      fixture.message(206, [byte(0, 1), byte(1, 2), byte(2, 7), { number: 3, type: 7, bytes: [0xc3, 0x28] }]);
    if (position === 'before') malformed();
    fixture.descriptions();
    session(fixture);
    if (position === 'after') malformed();
    const result = readFITWorkoutReferences(fixture.finish());
    expect(result.diagnostics).toContain('invalid_metadata');
    expect(result.suuntoGuides.getValue().references).toEqual([]);
  });

  it('never mixes owner and external IDs across developer indexes', () => {
    const fixture = new FITWorkoutFixture()
      .application(0, 'SuuntoFitExport1')
      .descriptions(0)
      .application(1)
      .descriptions(1)
      .message(18, [], [developer(2, 0, 'client'), developer(3, 1, 'guide')]);
    const result = readFITWorkoutReferences(fixture.finish());
    expect(result.suuntoGuides.getValue().references).toEqual([]);
    expect(result.diagnostics).toContain('invalid_guide_pairs');
  });

  it.each([
    ['a\0b', 'one'],
    ['a\0\0b', 'one\0two\0three'],
    ['', 'one'],
    ['a', ''],
    [Array(11).fill('a').join('\0'), Array(11).fill('b').join('\0')]
  ])('rejects malformed positional pairs without shifting indexes', (owners, ids) => {
    const fixture = new FITWorkoutFixture().application().descriptions();
    session(fixture, 1, owners, ids);
    expect(references(fixture)).toEqual([]);
    expect(readFITWorkoutReferences(fixture.finish()).status).toBe('partial');
  });

  it('strips trailing padding only and handles unicode without normalizing identifiers', () => {
    const fixture = new FITWorkoutFixture().application().descriptions();
    session(fixture, 1, 'client\0\0', 'é🚴\0\0');
    expect(references(fixture)[0].externalId).toBe('é🚴');
  });

  it('rejects invalid UTF-8 and duplicate field names within a developer group', () => {
    const fixture = new FITWorkoutFixture()
      .application()
      .descriptions()
      .message(18, [], [{ number: 2, index: 1, bytes: [0xc3, 0x28] }, developer(3, 1, 'guide')]);
    expect(references(fixture)).toEqual([]);
    const duplicate = new FITWorkoutFixture()
      .application()
      .descriptions()
      .description(1, 4, 'suuntoplus_plugin_owner_id')
      .message(18, [], [developer(2, 1, 'a'), developer(4, 1, 'b'), developer(3, 1, 'guide')]);
    expect(references(duplicate)).toEqual([]);
  });

  it('rejects conflicting definitions even when changed after evidence was encountered', () => {
    const fixture = new FITWorkoutFixture().application().descriptions();
    session(fixture);
    fixture.description(1, 2, 'something_else');
    expect(references(fixture)).toEqual([]);
    expect(readFITWorkoutReferences(fixture.finish()).diagnostics).toContain('conflicting_developer_definition');
    const changedApp = new FITWorkoutFixture().application().descriptions();
    session(changedApp);
    changedApp.application(1, 'SuuntoFitExport1');
    expect(references(changedApp)).toEqual([]);
  });

  it('does not treat lookalike names from unrelated applications as Suunto evidence', () => {
    const fixture = new FITWorkoutFixture().application(1, 'UnknownExport123').descriptions();
    session(fixture);
    expect(references(fixture)).toEqual([]);
    expect(readFITWorkoutReferences(fixture.finish()).diagnostics).toEqual(['unsupported_exporter']);
  });

  it('distinguishes absent/malformed exporter identity from a well-formed unsupported exporter', () => {
    const missing = new FITWorkoutFixture().message(207, [byte(3, 1)]).descriptions();
    session(missing);
    expect(readFITWorkoutReferences(missing.finish()).diagnostics).toEqual(['unresolved_developer_field']);
    const malformed = new FITWorkoutFixture().application(1, 'too-short').descriptions();
    session(malformed);
    const result = readFITWorkoutReferences(malformed.finish());
    expect(result.diagnostics).toEqual(['invalid_metadata']);
    expect(result.suuntoGuides.getValue().references).toEqual([]);
  });

  it('isolates malformed developer groups while preserving other valid groups', () => {
    const fixture = new FITWorkoutFixture()
      .application(0, 'SuuntoFitExport1')
      .descriptions(0)
      .application(1)
      .descriptions(1)
      .description(1, 2, 'suuntoplus_plugin_owner_id', 2)
      .message(
        18,
        [],
        [
          developer(2, 0, 'client-a'),
          developer(3, 0, 'guide-a'),
          developer(2, 1, 'client-b'),
          developer(3, 1, 'guide-b')
        ]
      );
    expect(references(fixture).map(item => item.externalId)).toEqual(['guide-a']);
  });

  it('invalidates earlier Guide evidence after malformed identity redefinitions', () => {
    const fixture = new FITWorkoutFixture().application().descriptions();
    session(fixture);
    fixture.message(206, [byte(0, 1), byte(1, 2), byte(2, 7), { number: 3, type: 7, bytes: [0xc3, 0x28] }]);
    expect(references(fixture)).toEqual([]);
    const missingApp = new FITWorkoutFixture().application().descriptions();
    session(missingApp);
    missingApp.message(207, [byte(3, 1)]);
    expect(references(missingApp)).toEqual([]);
  });

  it('reports unresolved descriptions and ignores unrelated developer fields', () => {
    const missing = new FITWorkoutFixture().application().message(18, [], [developer(2, 1, 'a'), developer(3, 1, 'b')]);
    expect(readFITWorkoutReferences(missing.finish()).diagnostics).toContain('unresolved_developer_field');
    const unrelated = new FITWorkoutFixture()
      .application()
      .description(1, 2, 'not_a_guide')
      .message(18, [], [developer(2, 1, 'anything')]);
    expect(readFITWorkoutReferences(unrelated.finish()).status).toBe('ok');
  });

  it('handles identical repeated descriptions and applications without discarding evidence', () => {
    const fixture = new FITWorkoutFixture().application().descriptions();
    session(fixture);
    fixture.application().descriptions();
    expect(references(fixture)).toHaveLength(1);
  });

  it.each([true, false])('preserves native Garmin fields and workout context with little endian=%p', little => {
    const fixture = new FITWorkoutFixture().message(
      72,
      [
        numeric(253, TIME, 4, 0x86, little),
        byte(0, 5, 0),
        numeric(1, 1, 2, 0x84, little),
        numeric(2, 42, 2, 0x84, little),
        numeric(3, 0xffffffff, 4, 0x8c, little),
        numeric(4, TIME - 100, 4, 0x86, little)
      ],
      [],
      { little }
    );
    fixture.message(
      26,
      [stringField(8, 'Synthetic workout'), byte(4, 2, 0), byte(11, 0, 0), numeric(6, 1, 2, 0x84, little)],
      [],
      { little }
    );
    fixture.message(18, [numeric(2, TIME, 4, 0x86, little), byte(5, 2, 0), byte(6, 8, 0)], [], { little });
    const result = readFITWorkoutReferences(fixture.finish());
    expect(result.status).toBe('ok');
    expect(result.trainingFiles.getValue().references).toEqual([
      {
        type: 5,
        manufacturer: 1,
        product: 42,
        serialNumber: 4294967295,
        timeCreatedUnixMs: ms(TIME - 100),
        timestampUnixMs: ms(TIME)
      }
    ]);
    expect(result.workouts.getValue().definitions).toEqual([
      { name: 'Synthetic workout', sport: 2, subSport: 0, numValidSteps: 1 }
    ]);
    expect(result.sessions[0]).toMatchObject({ sport: 2, subSport: 8 });
    expect(result.sessions[0]).not.toHaveProperty('serialNumber');
  });

  it('keeps multiple workout/course references and missing fields without invalid sentinels', () => {
    const fixture = new FITWorkoutFixture()
      .message(72, [byte(0, 5, 0), numeric(3, 0, 4, 0x8c), numeric(4, 0xffffffff)])
      .message(72, [byte(0, 6, 0), numeric(3, 4000000000, 4, 12)])
      .message(72, []);
    expect(readFITWorkoutReferences(fixture.finish()).trainingFiles.getValue().references).toEqual([
      { type: 5 },
      { type: 6, serialNumber: 4000000000 },
      {}
    ]);
  });

  it('rejects wrong native base types without using a plausible serial as evidence', () => {
    const fixture = new FITWorkoutFixture().message(72, [numeric(3, 123, 4, 0x86)]);
    const result = readFITWorkoutReferences(fixture.finish());
    expect(result.trainingFiles.getValue().references).toEqual([]);
    expect(result.status).toBe('partial');
  });

  it.each([
    { fields: [{ number: 1, type: 17, bytes: [1] }] },
    { fields: [{ number: 1, type: 0x2c, bytes: [0, 0, 0, 0] }] },
    { fields: [numeric(1, 1, 2, 0x86)] }
  ])('rejects unsupported native base types and invalid element widths in definitions', ({ fields }) => {
    const result = readFITWorkoutReferences(new FITWorkoutFixture().message(20, fields).finish());
    expect(result.status).toBe('invalid');
    expect(result.diagnostics).toEqual(['invalid_structure']);
  });

  it('rejects unsupported developer field-description base-type IDs', () => {
    const fixture = new FITWorkoutFixture()
      .application()
      .message(206, [byte(0, 1), byte(1, 2), byte(2, 17), stringField(3, 'suuntoplus_plugin_owner_id')])
      .description(1, 3, 'suuntoplus_plugin_external_id')
      .message(18, [], [developer(2, 1, 'client'), developer(3, 1, 'guide')]);
    const result = readFITWorkoutReferences(fixture.finish());
    expect(result.status).toBe('partial');
    expect(result.diagnostics).toContain('invalid_metadata');
    expect(result.suuntoGuides.getValue().references).toEqual([]);
  });

  it('reconstructs compressed timestamps with rollover and reused local definitions', () => {
    const fixture = new FITWorkoutFixture()
      .message(20, [numeric(253, TIME + 30)], [], { local: 2 })
      .message(72, [numeric(253, 0), byte(0, 5, 0), numeric(3, 123, 4, 0x8c)], [], { local: 2, compressed: 2 })
      .message(18, [numeric(253, 0), numeric(2, TIME)], [], { local: 2, compressed: 5 });
    const result = readFITWorkoutReferences(fixture.finish());
    expect(result.status).toBe('ok');
    expect(result.trainingFiles.getValue().references[0].timestampUnixMs).toBe(ms(TIME + 34));
    expect(result.sessions[0].endTimeUnixMs).toBe(ms(TIME + 37));
  });

  it('fails closed for compressed timestamps without a valid base', () => {
    const fixture = new FITWorkoutFixture().message(72, [numeric(253, 0)], [], { compressed: 1 });
    expect(readFITWorkoutReferences(fixture.finish()).status).toBe('invalid');
  });

  it('handles compressed timestamps above the signed 32-bit range without overflow', () => {
    const time = 0xf000001e;
    const fixture = new FITWorkoutFixture()
      .message(20, [numeric(253, time)])
      .message(72, [numeric(253, 0), byte(0, 5, 0)], [], { compressed: 2 });
    expect(readFITWorkoutReferences(fixture.finish()).trainingFiles.getValue().references[0].timestampUnixMs).toBe(
      ms(time + 4)
    );
  });

  it('rejects a compressed message after an invalid timestamp base', () => {
    const fixture = new FITWorkoutFixture()
      .message(20, [numeric(253, TIME)])
      .message(20, [numeric(253, 0xffffffff)])
      .message(72, [numeric(253, 0)], [], { compressed: 2 });
    expect(readFITWorkoutReferences(fixture.finish()).status).toBe('invalid');
  });

  it('enforces source bounds and never truncates trusted evidence', () => {
    expect(readFITWorkoutReferences(new Uint8Array(64 * 1024 * 1024 + 1)).diagnostics).toEqual(['input_limit']);
    const fixture = new FITWorkoutFixture();
    for (let i = 0; i < 10001; i++) fixture.message(72, []);
    const result = readFITWorkoutReferences(fixture.finish());
    expect(result.status).toBe('invalid');
    expect(result.diagnostics).toContain('record_limit');
    expect(result.trainingFiles.getValue().references).toEqual([]);
    expect(readFITWorkoutReferences('not bytes' as never).diagnostics).toEqual(['invalid_input']);
  });

  it('preserves session ordinals after malformed optional session metadata', () => {
    const fixture = new FITWorkoutFixture()
      .application()
      .descriptions()
      .message(18, [byte(2, 1)]);
    session(fixture);
    expect(references(fixture)[0].sessionIndex).toBe(1);
  });

  it.each([
    [2, 'startTimeUnixMs'],
    [253, 'endTimeUnixMs'],
    [5, 'sport'],
    [6, 'subSport']
  ] as const)('isolates malformed native session field %p from other context and Guide evidence', (field, key) => {
    const fixture = new FITWorkoutFixture().application().descriptions();
    const validFields = [numeric(253, TIME + 60), numeric(2, TIME), byte(5, 2, 0), byte(6, 8, 0)];
    fixture.message(
      18,
      validFields.map(value => (value.number === field ? stringField(field, 'invalid') : value)),
      [developer(2, 1, 'client'), developer(3, 1, 'guide')]
    );
    const result = readFITWorkoutReferences(fixture.finish());
    expect(result.status).toBe('partial');
    expect(result.diagnostics).toEqual(['invalid_metadata']);
    const expected: Record<string, number> = {
      sessionIndex: 0,
      startTimeUnixMs: ms(TIME),
      endTimeUnixMs: ms(TIME + 60),
      sport: 2,
      subSport: 8
    };
    delete expected[key];
    expect(result.sessions).toEqual([expected]);
    expect(result.suuntoGuides.getValue().references).toEqual([
      {
        sessionIndex: 0,
        developerDataIndex: 1,
        applicationId: 'SuuntoplusFitExt',
        ownerId: 'client',
        externalId: 'guide'
      }
    ]);
  });

  it.each([12, 14])('supports header size %p, offset views, Buffers and ArrayBuffers without mutation', header => {
    const source = new FITWorkoutFixture().message(72, [byte(0, 5, 0)]).finish(header);
    const padded = new Uint8Array(source.length + 20);
    padded.set(source, 7);
    const view = padded.subarray(7, 7 + source.length);
    const before = [...padded];
    expect(readFITWorkoutReferences(view).status).toBe('ok');
    expect(readFITWorkoutReferences(Buffer.from(source)).status).toBe('ok');
    expect(readFITWorkoutReferences(source.slice().buffer).status).toBe('ok');
    expect([...padded]).toEqual(before);
  });

  it('rejects truncation, incorrect CRC, malformed headers and structural corruption without partial evidence', () => {
    const good = new FITWorkoutFixture().message(72, [numeric(3, 123, 4, 0x8c)]).finish();
    const crc = good.slice();
    crc[crc.length - 1] ^= 1;
    const header = good.slice();
    header[8] = 0;
    const structure = new FITWorkoutFixture().message(72, [numeric(3, 123, 4, 0x8c)]);
    structure.data.push(15); // data for an undefined local message
    for (const input of [good.subarray(0, -1), crc, header, structure.finish(), new Uint8Array(0)]) {
      const result = readFITWorkoutReferences(input);
      expect(result.status).toBe('invalid');
      expect(result.trainingFiles.getValue().references).toEqual([]);
      expect(result.sessions).toEqual([]);
    }
    const badHeaderCRC = good.slice();
    badHeaderCRC[12] ^= 1;
    new DataView(badHeaderCRC.buffer).setUint16(
      badHeaderCRC.length - 2,
      FitEncoder.calculateCRC(badHeaderCRC.subarray(0, -2)),
      true
    );
    expect(readFITWorkoutReferences(badHeaderCRC).diagnostics).toContain('invalid_crc');
  });

  it('does not change ordinary activity imports or leak references to event JSON', async () => {
    const file = readFileSync(resolve(__dirname, '../../samples/fit/road-with-power.fit'));
    const before = await EventImporterFIT.getFromArrayBuffer(file);
    readFITWorkoutReferences(file);
    const after = await EventImporterFIT.getFromArrayBuffer(file);
    // Library-generated IDs differ; compare source metrics/streams directly.
    expect(after.toJSON().stats).toEqual(before.toJSON().stats);
    expect(
      after
        .getFirstActivity()
        .getAllStreams()
        .map(stream => stream.toJSON())
    ).toEqual(
      before
        .getFirstActivity()
        .getAllStreams()
        .map(stream => stream.toJSON())
    );
    expect(JSON.stringify(after)).not.toMatch(
      /FIT Training File References|FIT Workout Definitions|SuuntoPlus Guide References/
    );
  });

  it('keeps positive reference evidence out of an imported recorded activity', async () => {
    const original = readFileSync(resolve(__dirname, '../../samples/fit/road-with-power.fit'));
    const headerSize = original[0];
    const references = new FITWorkoutFixture()
      .message(72, [byte(0, 5, 0), numeric(3, 321, 4, 0x8c)])
      .message(26, [stringField(8, 'Private source reference'), byte(4, 2, 0)]);
    const fixture = new FITWorkoutFixture();
    fixture.data = [...original.subarray(headerSize, original.length - 2), ...references.data];
    const bytes = fixture.finish();
    const parsed = readFITWorkoutReferences(bytes);
    expect(parsed.trainingFiles.getValue().references).toContainEqual({ type: 5, serialNumber: 321 });
    const event = await EventImporterFIT.getFromArrayBuffer(Buffer.from(bytes));
    const baseline = await EventImporterFIT.getFromArrayBuffer(original);
    expect(event.toJSON().stats).toEqual(baseline.toJSON().stats);
    expect(event.getActivities().map(activity => activity.toJSON().stats)).toEqual(
      baseline.getActivities().map(activity => activity.toJSON().stats)
    );
    expect(JSON.stringify(event)).not.toContain('Private source reference');
    expect(JSON.stringify(event)).not.toMatch(
      /FIT Training File References|FIT Workout Definitions|SuuntoPlus Guide References/
    );
  });
});
