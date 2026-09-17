import {
  DataFITTrainingFileReferences,
  DataFITWorkoutDefinitions,
  DataSuuntoPlusGuideReferences,
  FITTrainingFileReference,
  FITWorkoutDefinition,
  SuuntoPlusGuideExporter,
  SuuntoPlusGuideReference
} from '../data/data.workout-references';

/**
 * Native session context. Index is source order, not a consumer activity ID. Enums are FIT codes.
 * Malformed optional fields are omitted individually without discarding valid Guide evidence for that session.
 */
export interface FITWorkoutReferenceSession {
  sessionIndex: number;
  startTimeUnixMs?: number;
  endTimeUnixMs?: number;
  sport?: number;
  subSport?: number;
}

/** Allowlisted codes contain no identifiers, file content or provider account information. */
export type FITWorkoutReferenceDiagnostic =
  | 'invalid_input'
  | 'input_limit'
  | 'invalid_header'
  | 'invalid_crc'
  | 'invalid_structure'
  | 'record_limit'
  | 'invalid_metadata'
  | 'conflicting_developer_definition'
  | 'invalid_guide_pairs'
  | 'unresolved_developer_field'
  | 'unsupported_exporter';

/** Metadata is deliberately separate from Event/Activity JSON and numeric stats. */
export interface FITWorkoutReferencesResult {
  /** Invalid structural input returns no evidence. Partial means some optional metadata was rejected or unsupported. */
  status: 'ok' | 'partial' | 'invalid';
  trainingFiles: DataFITTrainingFileReferences;
  workouts: DataFITWorkoutDefinitions;
  suuntoGuides: DataSuuntoPlusGuideReferences;
  sessions: FITWorkoutReferenceSession[];
  diagnostics: FITWorkoutReferenceDiagnostic[];
}

interface Field {
  number: number;
  size: number;
  type: number;
}
interface Definition {
  global: number;
  little: boolean;
  fields: Field[];
  developers: Field[];
}
interface FieldValue {
  field: Field;
  bytes: Uint8Array;
}
interface Description {
  name: string;
  type: number;
}
class ReadError extends Error {
  constructor(readonly code: FITWorkoutReferenceDiagnostic) {
    super(code);
  }
}

const OWNER = 'suuntoplus_plugin_owner_id';
const EXTERNAL = 'suuntoplus_plugin_external_id';
const EPOCH = Date.UTC(1989, 11, 31);
const MAX_BYTES = 64 * 1024 * 1024;
const MAX_RECORDS = 10_000;
const SELECTED_MESSAGES = new Set([18, 26, 72, 206, 207]);
const FIT_BASE_TYPE_WIDTHS = new Map<number, number>([
  [0, 1],
  [1, 1],
  [2, 1],
  [3, 2],
  [4, 2],
  [5, 4],
  [6, 4],
  [7, 1],
  [8, 4],
  [9, 8],
  [10, 1],
  [11, 2],
  [12, 4],
  [13, 1],
  [14, 8],
  [15, 8],
  [16, 8]
]);
const CRC_TABLE = [
  0, 0xcc01, 0xd801, 0x1400, 0xf001, 0x3c00, 0x2800, 0xe401, 0xa001, 0x6c00, 0x7800, 0xb401, 0x5000, 0x9c01, 0x8801,
  0x4400
];

function crc(bytes: Uint8Array): number {
  let value = 0;
  for (const byte of bytes) {
    value = (value >>> 4) ^ CRC_TABLE[value & 15] ^ CRC_TABLE[byte & 15];
    value = (value >>> 4) ^ CRC_TABLE[value & 15] ^ CRC_TABLE[byte >>> 4];
  }
  return value;
}

function uint(value: FieldValue | undefined, type: number, size: number, little: boolean): number | undefined {
  if (!value) return undefined;
  const expectedType = type & 0x1f;
  const actualType = value.field.type & 0x1f;
  const compatibleByte = size === 1 && [0, 2, 13].includes(expectedType) && [0, 2, 13].includes(actualType);
  if (value.field.size !== size || (actualType !== expectedType && !compatibleByte)) {
    throw new ReadError('invalid_metadata');
  }
  const view = new DataView(value.bytes.buffer, value.bytes.byteOffset, value.bytes.byteLength);
  const result = size === 1 ? view.getUint8(0) : size === 2 ? view.getUint16(0, little) : view.getUint32(0, little);
  const invalid = expectedType === 12 ? 0 : size === 1 ? 0xff : size === 2 ? 0xffff : 0xffffffff;
  return result === invalid ? undefined : result;
}

function string(bytes: Uint8Array): string {
  try {
    return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes).replace(/\0+$/, '');
  } catch {
    throw new ReadError('invalid_metadata');
  }
}

function fieldString(value: FieldValue | undefined): string | undefined {
  if (!value) return undefined;
  if ((value.field.type & 0x1f) !== 7) throw new ReadError('invalid_metadata');
  const result = string(value.bytes);
  return result || undefined;
}

function exporter(bytes: Uint8Array): SuuntoPlusGuideExporter | undefined {
  const id = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
  return id === 'SuuntoFitExport1' || id === 'SuuntoplusFitExt' ? id : undefined;
}

function baseTypeId(type: number): number | undefined {
  // FIT decoders identify the base type from the low five bits. Accept the
  // optional endian-capability flag used by encoders, but not reserved bits.
  if (type & 0x60) return undefined;
  const id = type & 0x1f;
  return FIT_BASE_TYPE_WIDTHS.has(id) ? id : undefined;
}

function validNativeField(field: Field): boolean {
  const id = baseTypeId(field.type);
  const width = id === undefined ? undefined : FIT_BASE_TYPE_WIDTHS.get(id);
  return width !== undefined && (id === 7 || field.size % width === 0);
}

/**
 * Reads optional FIT workout-reference evidence without importing activity streams or changing event JSON.
 * Supports browser ArrayBuffers/Uint8Arrays and Node buffers (including views with nonzero offsets).
 * Validates CRC and structure; invalid files return empty data classes, never partial trusted evidence.
 * Optional malformed metadata is isolated to its identifiable application/field dependencies.
 * Unknown exporter identities are unsupported, not malformed. No names or IDs are logged.
 * Source safety bounds are 64 MiB and 10,000 records per returned collection; overflow is invalid, not truncated.
 * References indicate source-described usage, not account authentication or completion of prescribed targets.
 */
export function readFITWorkoutReferences(input: ArrayBuffer | Uint8Array): FITWorkoutReferencesResult {
  const diagnostics = new Set<FITWorkoutReferenceDiagnostic>();
  const training: FITTrainingFileReference[] = [];
  const workouts: FITWorkoutDefinition[] = [];
  const guides: SuuntoPlusGuideReference[] = [];
  const sessions: FITWorkoutReferenceSession[] = [];
  const result = (invalid = false): FITWorkoutReferencesResult => ({
    status: invalid ? 'invalid' : diagnostics.size ? 'partial' : 'ok',
    trainingFiles: new DataFITTrainingFileReferences({ references: invalid ? [] : training }),
    workouts: new DataFITWorkoutDefinitions({ definitions: invalid ? [] : workouts }),
    suuntoGuides: new DataSuuntoPlusGuideReferences({ references: invalid ? [] : guides }),
    sessions: invalid ? [] : sessions,
    diagnostics: [...diagnostics]
  });
  try {
    if (!(input instanceof ArrayBuffer) && !(input instanceof Uint8Array)) throw new ReadError('invalid_input');
    const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
    if (bytes.length > MAX_BYTES) throw new ReadError('input_limit');
    if (bytes.length < 14) throw new ReadError('invalid_header');
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const header = bytes[0];
    const end = header + view.getUint32(4, true);
    if (
      ![12, 14].includes(header) ||
      ![1, 2].includes(bytes[1] >>> 4) ||
      bytes[8] !== 46 ||
      bytes[9] !== 70 ||
      bytes[10] !== 73 ||
      bytes[11] !== 84 ||
      end + 2 !== bytes.length
    )
      throw new ReadError('invalid_header');
    if (
      (header === 14 && view.getUint16(12, true) !== 0 && crc(bytes.subarray(0, 12)) !== view.getUint16(12, true)) ||
      crc(bytes.subarray(0, end)) !== view.getUint16(end, true)
    )
      throw new ReadError('invalid_crc');

    let cursor = header;
    let lastTimestamp: number | undefined;
    const definitions = new Map<number, Definition>();
    const applications = new Map<number, Uint8Array>();
    const descriptions = new Map<string, Description>();
    const invalidApplications = new Set<number>();
    const invalidDescriptions = new Set<string>();
    const guideDescriptionKeys = new Set<string>();
    const guideDependencies = new Map<SuuntoPlusGuideReference, string[]>();
    const take = (size: number): Uint8Array => {
      if (cursor + size > end) throw new ReadError('invalid_structure');
      const data = bytes.subarray(cursor, cursor + size);
      cursor += size;
      return data;
    };
    while (cursor < end) {
      const record = take(1)[0];
      const compressed = !!(record & 0x80);
      const local = compressed ? (record >> 5) & 3 : record & 15;
      if (!compressed && record & 0x10) throw new ReadError('invalid_structure');
      if (!compressed && record & 0x40) {
        const base = take(5);
        if (base[0] !== 0 || base[1] > 1) throw new ReadError('invalid_structure');
        const little = base[1] === 0;
        const global = little ? base[2] | (base[3] << 8) : (base[2] << 8) | base[3];
        const readFields = (count: number, developer: boolean): Field[] => {
          const fields: Field[] = [];
          const keys = new Set<string>();
          for (let n = 0; n < count; n++) {
            const raw = take(3);
            const key = developer ? `${raw[2]}:${raw[0]}` : `${raw[0]}`;
            if (!raw[1] || keys.has(key)) throw new ReadError('invalid_structure');
            keys.add(key);
            const field = { number: raw[0], size: raw[1], type: raw[2] };
            if (!developer && SELECTED_MESSAGES.has(global) && !validNativeField(field)) {
              throw new ReadError('invalid_structure');
            }
            fields.push(field);
          }
          return fields;
        };
        const fields = readFields(base[4], false);
        const developers = record & 0x20 ? readFields(take(1)[0], true) : [];
        definitions.set(local, { global, little, fields, developers });
        continue;
      }
      if (!compressed && record & 0x20) throw new ReadError('invalid_structure');
      const def = definitions.get(local);
      if (!def) throw new ReadError('invalid_structure');
      let messageTimestamp: number | undefined;
      if (compressed) {
        const first = def.fields[0];
        if (!first || first.number !== 253 || first.type !== 0x86 || first.size !== 4 || lastTimestamp === undefined) {
          throw new ReadError('invalid_structure');
        }
        messageTimestamp = Math.floor(lastTimestamp / 32) * 32 + (record & 31);
        if (messageTimestamp < lastTimestamp) messageTimestamp += 32;
        if (messageTimestamp >= 0xffffffff) throw new ReadError('invalid_structure');
        lastTimestamp = messageTimestamp;
      }
      const values = new Map<number, FieldValue>();
      for (const field of def.fields) {
        if (compressed && field.number === 253) continue;
        const raw = take(field.size);
        if (SELECTED_MESSAGES.has(def.global) || field.number === 253) {
          values.set(field.number, { field, bytes: raw });
        }
      }
      const developerValues: { field: Field; bytes: Uint8Array }[] = [];
      for (const field of def.developers) {
        const raw = take(field.size);
        if (def.global === 18) developerValues.push({ field, bytes: raw });
      }
      const number = (field: number, type: number, size: number) => uint(values.get(field), type, size, def.little);
      const assign = <T extends object>(target: T, key: keyof T, value: unknown) => {
        if (value !== undefined) target[key] = value as T[keyof T];
      };
      if (!compressed && values.has(253)) {
        try {
          messageTimestamp = number(253, 0x86, 4);
          lastTimestamp = messageTimestamp;
        } catch {
          lastTimestamp = undefined;
          diagnostics.add('invalid_metadata');
        }
      }
      const milliseconds = (value: number | undefined) => (value === undefined ? undefined : EPOCH + value * 1000);
      try {
        if (def.global === 72) {
          const item: FITTrainingFileReference = {};
          assign(item, 'type', number(0, 0, 1));
          assign(item, 'manufacturer', number(1, 0x84, 2));
          assign(item, 'product', number(2, 0x84, 2));
          assign(item, 'serialNumber', number(3, 0x8c, 4));
          assign(item, 'timeCreatedUnixMs', milliseconds(number(4, 0x86, 4)));
          assign(item, 'timestampUnixMs', milliseconds(messageTimestamp));
          training.push(item);
        } else if (def.global === 26) {
          const item: FITWorkoutDefinition = {};
          assign(item, 'name', fieldString(values.get(8)));
          assign(item, 'sport', number(4, 0, 1));
          assign(item, 'subSport', number(11, 0, 1));
          assign(item, 'numValidSteps', number(6, 0x84, 2));
          // Use the same validation as public construction, including malformed strings.
          workouts.push(new DataFITWorkoutDefinitions({ definitions: [item] }).getValue().definitions[0]);
        } else if (def.global === 207) {
          const index = number(3, 2, 1);
          const app = values.get(1);
          if (index !== undefined) {
            // Application IDs are optional for unrelated FIT developer data. Absence alone is not a conflict.
            if (!app && !applications.has(index)) continue;
            if (!app || (app.field.type & 0x1f) !== 13 || app.bytes.length !== 16) {
              invalidApplications.add(index);
              diagnostics.add('invalid_metadata');
              continue;
            }
            const previous = applications.get(index);
            if (previous && previous.some((byte, i) => byte !== app.bytes[i])) {
              invalidApplications.add(index);
              diagnostics.add('conflicting_developer_definition');
            }
            applications.set(index, app.bytes);
          } else throw new ReadError('invalid_metadata');
        } else if (def.global === 206) {
          const index = number(0, 2, 1);
          if (index === undefined) throw new ReadError('invalid_metadata');
          const field = number(1, 2, 1);
          if (field === undefined) throw new ReadError('invalid_metadata');
          const key = `${index}:${field}`;
          try {
            const name = fieldString(values.get(3)) || '';
            // Retain Guide semantics even if decoding the accompanying type throws. Otherwise an
            // ambiguous extra owner/external-ID field could be skipped in favor of another pair.
            if (name === OWNER || name === EXTERNAL) guideDescriptionKeys.add(key);
            const type = number(2, 2, 1);
            // field_description.fit_base_type_id carries the same FIT profile
            // base-type byte used by native definitions.
            const describedType = type === undefined ? undefined : baseTypeId(type);
            if (describedType === undefined) throw new ReadError('invalid_metadata');
            const description = { name, type: describedType };
            const previous = descriptions.get(key);
            if (previous && (previous.name !== description.name || previous.type !== description.type)) {
              invalidDescriptions.add(key);
              diagnostics.add('conflicting_developer_definition');
            }
            descriptions.set(key, description);
          } catch {
            invalidDescriptions.add(key);
            diagnostics.add('invalid_metadata');
          }
        } else if (def.global === 18) {
          const session: FITWorkoutReferenceSession = { sessionIndex: sessions.length };
          // Optional context must not discard other native fields or independently valid Guide pairs.
          sessions.push(session);
          for (const [key, field, type, size] of [
            ['startTimeUnixMs', 2, 0x86, 4],
            ['endTimeUnixMs', 253, 0x86, 4],
            ['sport', 5, 0, 1],
            ['subSport', 6, 0, 1]
          ] as const) {
            try {
              const value = field === 253 ? messageTimestamp : number(field, type, size);
              assign(session, key, type === 0x86 ? milliseconds(value) : value);
            } catch {
              diagnostics.add('invalid_metadata');
            }
          }
          const groups = new Map<number, Map<string, Uint8Array>>();
          const groupDependencies = new Map<number, string[]>();
          const invalidGroups = new Set<number>();
          for (const { field, bytes: raw } of developerValues) {
            const index = field.type;
            const key = `${index}:${field.number}`;
            const description = descriptions.get(key);
            const app = applications.get(index);
            const application = app && exporter(app);
            if (invalidApplications.has(index)) continue;
            if (invalidDescriptions.has(key)) {
              // A rejected Guide field cannot be silently dropped in favor of another apparent pair.
              if (guideDescriptionKeys.has(key)) invalidGroups.add(index);
              continue;
            }
            if (!description) {
              if (application) diagnostics.add('unresolved_developer_field');
              continue;
            }
            if (description.name !== OWNER && description.name !== EXTERNAL) continue;
            if (!application) {
              diagnostics.add(app ? 'unsupported_exporter' : 'unresolved_developer_field');
              continue;
            }
            const group = groups.get(index) || new Map<string, Uint8Array>();
            if (description.type !== 7 || group.has(description.name)) invalidGroups.add(index);
            group.set(description.name, raw);
            groups.set(index, group);
            const dependencies = groupDependencies.get(index) || [];
            dependencies.push(key);
            groupDependencies.set(index, dependencies);
          }
          for (const [index, group] of groups) {
            try {
              if (invalidGroups.has(index) || !group.has(OWNER) || !group.has(EXTERNAL)) throw new Error();
              const owners = string(group.get(OWNER)!).split('\0');
              const ids = string(group.get(EXTERNAL)!).split('\0');
              if (owners.length !== ids.length || owners.length > 10) throw new Error();
              const pairs = owners.map((ownerId, i) => ({
                sessionIndex: session.sessionIndex,
                developerDataIndex: index,
                applicationId: exporter(applications.get(index)!)!,
                ownerId,
                externalId: ids[i]
              }));
              const validated = new DataSuuntoPlusGuideReferences({ references: pairs });
              for (const reference of validated.getValue().references) {
                guides.push(reference);
                guideDependencies.set(reference, groupDependencies.get(index)!);
              }
            } catch {
              diagnostics.add('invalid_guide_pairs');
            }
          }
        }
      } catch {
        diagnostics.add('invalid_metadata');
      }
      if ([training.length, workouts.length, guides.length, sessions.length].some(count => count > MAX_RECORDS)) {
        throw new ReadError('record_limit');
      }
    }
    // Later identity conflicts invalidate the application; field conflicts invalidate only their dependents.
    // A malformed message with no resolvable index cannot redefine other valid developer groups.
    for (let i = guides.length - 1; i >= 0; i--) {
      if (
        invalidApplications.has(guides[i].developerDataIndex) ||
        guideDependencies.get(guides[i])!.some(key => invalidDescriptions.has(key))
      )
        guides.splice(i, 1);
    }
    return result();
  } catch (error) {
    diagnostics.add(error instanceof ReadError ? error.code : 'invalid_input');
    return result(true);
  }
}
