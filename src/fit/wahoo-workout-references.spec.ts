import { readFITWorkoutReferences } from './fit-workout-references';
import { parseFITWahooWorkoutReferences } from './wahoo-workout-references';
import { FITWorkoutFixture, byte, numeric, type FixtureField } from '../specs/fit-workout-fixture';
import { DataStore } from '../data/data.store';
import { EventImporterFIT } from '../events/adapters/importers/fit/importer.fit';

const TIME = 1_100_000_000;
const START = Date.UTC(1989, 11, 31) + TIME * 1000;
const REFERENCE = {
  format: 'wahoo-app-plan-v1' as const,
  planId: '12345678',
  workoutId: '987654321',
  startTimeUnixMs: START
};

function payload(planId = REFERENCE.planId, workoutId = 987654321): number[] {
  const digits = [...new TextEncoder().encode(planId)];
  const tail = new Uint8Array(13);
  tail.set([0, 0, 14, 0]);
  new DataView(tail.buffer).setUint32(4, workoutId, true);
  // This trailing source field has no established public meaning and is deliberately not returned.
  new DataView(tail.buffer).setUint32(9, 123, true);
  return [0x35, 0, 5, ...digits, ...tail];
}

function fields(bytes = payload(), little = true): FixtureField[] {
  return [numeric(0, TIME, 4, 0x86, little), byte(1, 255), byte(2, bytes.length), { number: 3, type: 13, bytes }];
}

function fixture(referenceFields = fields(), little = true): FITWorkoutFixture {
  return new FITWorkoutFixture()
    .message(0, [byte(0, 4, 0), numeric(1, 32, 2, 0x84, little)], [], { little })
    .message(65285, referenceFields, [], { little })
    .message(18, [numeric(2, TIME, 4, 0x86, little), numeric(253, TIME + 300, 4, 0x86, little)], [], { little });
}

describe('observed Wahoo FIT plan references', () => {
  it.each([true, false])('reads exact reference fields with FIT little endian = %p', little => {
    const result = readFITWorkoutReferences(fixture(fields(payload(), little), little).finish());
    expect(result.status).toBe('ok');
    expect(result.wahooWorkouts).toEqual([REFERENCE]);
    expect(result.sessions[0].startTimeUnixMs).toBe(START);
    expect(parseFITWahooWorkoutReferences(JSON.parse(JSON.stringify(result.wahooWorkouts)))).toEqual(
      result.wahooWorkouts
    );
  });

  it('retains the exact Plan while representing the missing scheduled Workout sentinel as null', () => {
    expect(readFITWorkoutReferences(fixture(fields(payload('23456789', 0xffffffff))).finish()).wahooWorkouts).toEqual([
      { ...REFERENCE, planId: '23456789', workoutId: null }
    ]);
  });

  it.each(['1', '1234567890123456789'])('reads bounded variable-length decimal Plan ID %s', id => {
    expect(readFITWorkoutReferences(fixture(fields(payload(id))).finish()).wahooWorkouts[0].planId).toBe(id);
  });

  it('does not hunt for an ID elsewhere in the file, names or unrelated private payloads', () => {
    const unrelated = [0x53, 0, 30, ...new TextEncoder().encode('private 12345678'), 0];
    const f = fixture(fields(unrelated));
    f.message(65285, fields([1, 2, ...new TextEncoder().encode('12345678'), 0]));
    expect(readFITWorkoutReferences(f.finish()).wahooWorkouts).toEqual([]);
  });

  it.each([0, 1, 255, 65535])('requires the Wahoo activity file identity, not manufacturer %p', manufacturer => {
    const f = new FITWorkoutFixture()
      .message(0, [byte(0, 4, 0), numeric(1, manufacturer, 2, 0x84)])
      .message(65285, fields());
    const result = readFITWorkoutReferences(f.finish());
    expect(result.wahooWorkouts).toEqual([]);
    expect(result.diagnostics).toContain('unsupported_wahoo_reference');
  });

  it.each([0, 5, 6, 255])('does not treat file type %p as a recorded activity', fileType => {
    const f = new FITWorkoutFixture()
      .message(0, [byte(0, fileType, 0), numeric(1, 32, 2, 0x84)])
      .message(65285, fields());
    expect(readFITWorkoutReferences(f.finish()).wahooWorkouts).toEqual([]);
  });

  it('rejects missing and conflicting file identities, including a later conflicting identity', () => {
    const absent = new FITWorkoutFixture().message(65285, fields());
    const duplicate = fixture().message(0, [byte(0, 4, 0), numeric(1, 1, 2, 0x84)]);
    for (const f of [absent, duplicate]) expect(readFITWorkoutReferences(f.finish()).wahooWorkouts).toEqual([]);
  });

  it('isolates malformed optional file identity to Wahoo instead of changing independent evidence', () => {
    const f = new FITWorkoutFixture()
      .message(0, [numeric(0, 4), numeric(1, 32, 2, 0x84)])
      .message(72, [byte(0, 5, 0), numeric(3, 321, 4, 0x8c)]);
    expect(readFITWorkoutReferences(f.finish()).status).toBe('ok');
    const result = readFITWorkoutReferences(f.message(65285, fields()).finish());
    expect(result.wahooWorkouts).toEqual([]);
    expect(result.diagnostics).toEqual(['unsupported_wahoo_reference']);
    expect(result.trainingFiles.getValue().references).toEqual([{ type: 5, serialNumber: 321 }]);
  });

  it.each(['', '0', '01234567', '-12', '12 3', '12\0other', '12\n34', '１２３', '1'.repeat(20)])(
    'rejects malformed Plan ID %p without substring fallback',
    id => {
      const result = readFITWorkoutReferences(fixture(fields(payload(id))).finish());
      expect(result.wahooWorkouts).toEqual([]);
      expect(result.diagnostics).toContain('invalid_wahoo_reference');
    }
  );

  it.each([0, 1, 2, 8])('validates framing boundary offset %p', offset => {
    const bytes = payload();
    const end = bytes.indexOf(0, 3);
    bytes[end + offset] ^= 1;
    const result = readFITWorkoutReferences(fixture(fields(bytes)).finish());
    expect(result.wahooWorkouts).toEqual([]);
    expect(result.diagnostics).toContain('invalid_wahoo_reference');
  });

  it.each([1, 2])('rejects unsupported private-layout header offset %p', offset => {
    const bytes = payload();
    bytes[offset]++;
    const result = readFITWorkoutReferences(fixture(fields(bytes)).finish());
    expect(result.wahooWorkouts).toEqual([]);
    expect(result.diagnostics).toContain('unsupported_wahoo_reference');
  });

  it('requires the full envelope and exact payload length, with no truncation or extra bytes', () => {
    const cases = [
      fields().slice(1),
      fields().filter(f => f.number !== 1),
      fields().filter(f => f.number !== 2),
      fields().map(f => (f.number === 1 ? byte(1, 0) : f)),
      fields().map(f => (f.number === 2 ? byte(2, 23) : f)),
      fields(payload().slice(0, -1)),
      fields([...payload(), 0]),
      fields().map(f => (f.number === 3 ? { ...f, type: 7 } : f)),
      fields().map(f => (f.number === 0 ? numeric(0, 0xffffffff) : f)),
      fields(payload(REFERENCE.planId, 0))
    ];
    for (const input of cases) {
      const result = readFITWorkoutReferences(fixture(input).finish());
      expect(result.wahooWorkouts).toEqual([]);
      expect(result.diagnostics).toContain('invalid_wahoo_reference');
    }
  });

  it('never accepts the good half of an ambiguous private reference group', () => {
    const f = fixture().message(65285, fields(payload('broken')));
    f.message(72, [byte(0, 5, 0), numeric(3, 321, 4, 0x8c)]);
    const result = readFITWorkoutReferences(f.finish());
    expect(result.status).toBe('partial');
    expect(result.wahooWorkouts).toEqual([]);
    expect(result.trainingFiles.getValue().references).toEqual([{ type: 5, serialNumber: 321 }]);
  });

  it('rejects unknown envelope extensions instead of assuming the reference semantics are unchanged', () => {
    const native = fixture([...fields(), byte(4, 0)]);
    const developer = new FITWorkoutFixture()
      .message(0, [byte(0, 4, 0), numeric(1, 32, 2, 0x84)])
      .message(65285, fields(), [{ number: 1, index: 0, bytes: [0] }]);
    for (const f of [native, developer]) {
      const result = readFITWorkoutReferences(f.finish());
      expect(result.wahooWorkouts).toEqual([]);
      expect(result.diagnostics).toContain('unsupported_wahoo_reference');
    }
  });

  it('rejects duplicate native fields rather than choosing a last value', () => {
    for (const extra of fields()) {
      expect(readFITWorkoutReferences(fixture([...fields(), extra]).finish()).wahooWorkouts).toEqual([]);
    }
  });

  it('invalidates the entire result instead of truncating beyond the record bound', () => {
    const f = fixture();
    for (let i = 0; i < 10_000; i++) f.message(65285, fields());
    const result = readFITWorkoutReferences(f.finish());
    expect(result.status).toBe('invalid');
    expect(result.diagnostics).toContain('record_limit');
    expect(result.wahooWorkouts).toEqual([]);
    expect(result.sessions).toEqual([]);
  });

  it('does not fabricate a session association from file-scoped metadata', () => {
    const f = fixture().message(18, [numeric(2, TIME + 1000), numeric(253, TIME + 1300)]);
    const result = readFITWorkoutReferences(f.finish());
    expect(result.sessions).toHaveLength(2);
    expect(result.wahooWorkouts).toEqual([REFERENCE]);
    expect(result.wahooWorkouts[0]).not.toHaveProperty('sessionIndex');
  });

  it('keeps positive Wahoo evidence out of normal imported event and activity JSON', async () => {
    const bytes = new FITWorkoutFixture()
      .message(0, [byte(0, 4, 0), numeric(1, 32, 2, 0x84)])
      .message(65285, fields())
      .message(18, [
        numeric(2, TIME),
        numeric(253, TIME + 300),
        byte(5, 10, 0),
        byte(6, 20, 0),
        numeric(7, 300_000),
        numeric(8, 300_000),
        numeric(9, 0)
      ])
      .finish();
    expect(readFITWorkoutReferences(bytes).wahooWorkouts).toEqual([REFERENCE]);
    const event = await EventImporterFIT.getFromArrayBuffer(Buffer.from(bytes));
    expect(event.getActivities()).toHaveLength(1);
    expect(JSON.stringify(event)).not.toMatch(/wahooWorkouts|wahoo-app-plan-v1|12345678|987654321/);
    expect(JSON.stringify(event.getFirstActivity().toJSON())).not.toMatch(/wahooWorkouts|wahoo-app-plan-v1/);
  });

  it('preserves duplicate/different observations for consumer-side ambiguity handling', () => {
    const result = readFITWorkoutReferences(
      fixture()
        .message(65285, fields())
        .message(65285, fields(payload('34567890')))
        .finish()
    );
    expect(result.wahooWorkouts).toHaveLength(3);
    expect(result.wahooWorkouts.map(r => r.planId)).toEqual(['12345678', '12345678', '34567890']);
  });

  it('has no trusted references for invalid FIT CRC and supports offset byte views without mutation', () => {
    const good = fixture().finish();
    const bad = good.slice();
    bad[bad.length - 1] ^= 1;
    expect(readFITWorkoutReferences(bad).wahooWorkouts).toEqual([]);
    const padded = new Uint8Array(good.length + 10);
    padded.set(good, 5);
    const before = padded.slice();
    expect(readFITWorkoutReferences(padded.subarray(5, good.length + 5)).wahooWorkouts).toEqual([REFERENCE]);
    expect(padded).toEqual(before);
  });
});

describe('Wahoo reference JSON boundary', () => {
  it('snapshots the array bound once and never accepts more than the record limit', () => {
    let reads = 0;
    const oversized = new Proxy(
      Array.from({ length: 10_001 }, () => ({ ...REFERENCE })),
      {
        get(target, key, receiver) {
          if (key === 'length') return ++reads === 1 ? 10_000 : 10_001;
          return Reflect.get(target, key, receiver);
        }
      }
    );
    expect(() => parseFITWahooWorkoutReferences(oversized)).toThrow();
    expect(reads).toBe(1);

    reads = 0;
    const valid = new Proxy([{ ...REFERENCE }], {
      get(target, key, receiver) {
        if (key === 'length') {
          if (++reads !== 1) throw new Error('Length read twice');
          return 1;
        }
        return Reflect.get(target, key, receiver);
      }
    });
    expect(parseFITWahooWorkoutReferences(valid)).toEqual([REFERENCE]);
    expect(reads).toBe(1);
  });

  it('rejects oversized bounds before enumeration and rejects invalid length snapshots', () => {
    for (const length of [10_001, -1, 1.5, NaN, Infinity, '1', undefined]) {
      let enumerations = 0;
      const source = new Proxy([], {
        get(target, key, receiver) {
          return key === 'length' ? length : Reflect.get(target, key, receiver);
        },
        ownKeys(target) {
          enumerations++;
          return Reflect.ownKeys(target);
        }
      });
      expect(() => parseFITWahooWorkoutReferences(source)).toThrow();
      expect(enumerations).toBe(0);
    }
  });

  it('checks the same object-key snapshot for count and allowlist membership', () => {
    let reads = 0;
    const source = new Proxy(
      { ...REFERENCE, extra: 'unapproved' },
      {
        ownKeys() {
          return ++reads === 1 ? ['format', 'planId', 'workoutId', 'extra'] : Object.keys(REFERENCE);
        }
      }
    );
    expect(() => parseFITWahooWorkoutReferences([source])).toThrow();
    expect(reads).toBe(1);
  });

  it('owns its output and does not use caller array methods or read fields twice', () => {
    let reads = 0;
    const source = [
      {
        ...REFERENCE,
        get planId() {
          reads++;
          return reads === 1 ? '12345678' : 'broken';
        }
      }
    ];
    const parsed = parseFITWahooWorkoutReferences(source);
    expect(reads).toBe(1);
    source[0].workoutId = '333';
    expect(parsed).toEqual([REFERENCE]);
    const other = [{ ...REFERENCE }];
    Object.setPrototypeOf(other, { map: () => [] });
    expect(parseFITWahooWorkoutReferences(other)).toEqual([REFERENCE]);
  });

  it.each([
    null,
    {},
    '123',
    0,
    [null],
    new Array(1),
    [{ ...REFERENCE, secret: 'private' }],
    [{ ...REFERENCE, format: 'unknown' }],
    [{ ...REFERENCE, planId: ' 123' }],
    [{ ...REFERENCE, workoutId: '4294967295' }],
    [{ ...REFERENCE, workoutId: undefined }],
    [{ ...REFERENCE, startTimeUnixMs: NaN }],
    [{ ...REFERENCE, startTimeUnixMs: START + 1 }]
  ])('rejects invalid, incomplete or unknown JSON fields %p', value => {
    expect(() => parseFITWahooWorkoutReferences(value)).toThrow();
  });

  it('is metadata, not a new scalar class or numeric DataStore entry', () => {
    expect(parseFITWahooWorkoutReferences([])).toEqual([]);
    expect(Object.keys(DataStore)).not.toContain('FITWahooWorkoutReference');
  });

  it('rejects extended arrays, prototype-bearing records and out-of-range IDs/timestamps', () => {
    const extended = Object.assign([{ ...REFERENCE }], { extra: true });
    const symbol = Object.assign([{ ...REFERENCE }], { [Symbol('private')]: true });
    for (const input of [
      extended,
      symbol,
      [{ ...REFERENCE, workoutId: '0' }],
      [{ ...REFERENCE, workoutId: '0123' }],
      [{ ...REFERENCE, startTimeUnixMs: Date.UTC(1989, 11, 31) - 1000 }],
      [{ ...REFERENCE, startTimeUnixMs: Date.UTC(1989, 11, 31) + 0xffffffff * 1000 }],
      [Object.assign(Object.create({ secret: true }), REFERENCE)],
      Array.from({ length: 10_001 }, () => ({ ...REFERENCE }))
    ]) {
      expect(() => parseFITWahooWorkoutReferences(input)).toThrow();
    }
    expect(parseFITWahooWorkoutReferences([{ ...REFERENCE, workoutId: '4294967294' }])[0].workoutId).toBe('4294967294');
  });
});
