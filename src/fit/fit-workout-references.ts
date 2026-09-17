import FitParser from 'fit-file-parser';
import type { ParsedFit, ParsedRawFitMessage } from 'fit-file-parser';
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
interface FieldValue {
  field: Field;
  bytes: Uint8Array;
}
interface Description {
  name: string;
  type: number;
}
interface RawMessage {
  global: number;
  little: boolean;
  compressedTimestamp?: number;
  values: Map<number, FieldValue>;
  developers: { developerDataIndex: number; fieldDefinitionNumber: number; rawValue: Uint8Array }[];
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
const SELECTED_MESSAGES = [18, 26, 72, 206, 207] as const;
const SELECTED_MESSAGE_SET = new Set<number>(SELECTED_MESSAGES);
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
  if (type & 0x60) return undefined;
  const id = type & 0x1f;
  return FIT_BASE_TYPE_WIDTHS.has(id) ? id : undefined;
}

function validNativeField(field: Field): boolean {
  const id = baseTypeId(field.type);
  const width = id === undefined ? undefined : FIT_BASE_TYPE_WIDTHS.get(id);
  return field.size > 0 && width !== undefined && (id === 7 || field.size % width === 0);
}

function byteArray(value: unknown): Uint8Array {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.length > 255 ||
    value.some(byte => !Number.isSafeInteger(byte) || byte < 0 || byte > 255)
  ) {
    throw new ReadError('invalid_structure');
  }
  return Uint8Array.from(value);
}

function parserDiagnostic(error: unknown): FITWorkoutReferenceDiagnostic {
  if (typeof error === 'string') {
    if (error.includes('CRC')) return 'invalid_crc';
    if (
      error.includes('header') ||
      error.includes('.FIT') ||
      error.includes('File to small') ||
      error.includes('File data exceeds') ||
      error.includes('File CRC missing')
    ) {
      return 'invalid_header';
    }
  }
  return 'invalid_structure';
}

function parseMessages(bytes: Uint8Array): RawMessage[] {
  let parsed: ParsedFit | undefined;
  let parseError: string | undefined;
  try {
    // The callback parser is synchronous. Passing the view preserves non-zero
    // byte offsets in browsers and Node without copying or mutating the input.
    new FitParser({ force: false, includeRawMessages: SELECTED_MESSAGES, rawMessagesOnly: true }).parse(
      bytes as unknown as ArrayBuffer,
      (error, data) => {
        parseError = error;
        parsed = data;
      }
    );
  } catch (error) {
    throw new ReadError(parserDiagnostic(error));
  }
  if (parseError) throw new ReadError(parserDiagnostic(parseError));
  if (!parsed || !Array.isArray(parsed.raw_messages)) throw new ReadError('invalid_structure');

  const expectedIndexes = new Map<number, number>();
  return parsed.raw_messages.map((message: ParsedRawFitMessage): RawMessage => {
    if (
      !message ||
      !Number.isSafeInteger(message.global_message_number) ||
      !SELECTED_MESSAGE_SET.has(message.global_message_number) ||
      !Number.isSafeInteger(message.message_index) ||
      message.message_index < 0 ||
      typeof message.little_endian !== 'boolean' ||
      !Array.isArray(message.fields) ||
      !Array.isArray(message.developer_fields)
    ) {
      throw new ReadError('invalid_structure');
    }
    const expectedIndex = expectedIndexes.get(message.global_message_number) || 0;
    if (message.message_index !== expectedIndex) throw new ReadError('invalid_structure');
    expectedIndexes.set(message.global_message_number, expectedIndex + 1);

    if (
      message.compressed_timestamp !== undefined &&
      (!Number.isSafeInteger(message.compressed_timestamp) ||
        message.compressed_timestamp < 0 ||
        message.compressed_timestamp >= 0xffffffff)
    ) {
      throw new ReadError('invalid_structure');
    }

    const values = new Map<number, FieldValue>();
    for (const rawField of message.fields) {
      if (
        !rawField ||
        !Number.isSafeInteger(rawField.field_definition_number) ||
        rawField.field_definition_number < 0 ||
        rawField.field_definition_number > 255 ||
        !Number.isSafeInteger(rawField.base_type) ||
        rawField.base_type < 0 ||
        rawField.base_type > 255 ||
        values.has(rawField.field_definition_number)
      ) {
        throw new ReadError('invalid_structure');
      }
      const fieldBytes = byteArray(rawField.raw_value);
      const field = {
        number: rawField.field_definition_number,
        size: fieldBytes.length,
        type: rawField.base_type
      };
      if (!validNativeField(field)) throw new ReadError('invalid_structure');
      values.set(field.number, { field, bytes: fieldBytes });
    }
    if (message.compressed_timestamp !== undefined && values.has(253)) {
      throw new ReadError('invalid_structure');
    }

    const developerKeys = new Set<string>();
    const developers = message.developer_fields.map(field => {
      if (
        !field ||
        !Number.isSafeInteger(field.developer_data_index) ||
        field.developer_data_index < 0 ||
        field.developer_data_index > 255 ||
        !Number.isSafeInteger(field.field_definition_number) ||
        field.field_definition_number < 0 ||
        field.field_definition_number > 255
      ) {
        throw new ReadError('invalid_structure');
      }
      const key = `${field.developer_data_index}:${field.field_definition_number}`;
      if (developerKeys.has(key)) throw new ReadError('invalid_structure');
      developerKeys.add(key);
      return {
        developerDataIndex: field.developer_data_index,
        fieldDefinitionNumber: field.field_definition_number,
        rawValue: byteArray(field.raw_value)
      };
    });

    return {
      global: message.global_message_number,
      little: message.little_endian,
      ...(message.compressed_timestamp === undefined ? {} : { compressedTimestamp: message.compressed_timestamp }),
      values,
      developers
    };
  });
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
    ) {
      throw new ReadError('invalid_header');
    }

    const applications = new Map<number, Uint8Array>();
    const descriptions = new Map<string, Description>();
    const invalidApplications = new Set<number>();
    const invalidDescriptions = new Set<string>();
    const guideDescriptionKeys = new Set<string>();
    const guideDependencies = new Map<SuuntoPlusGuideReference, string[]>();

    for (const message of parseMessages(bytes)) {
      const number = (field: number, type: number, size: number) =>
        uint(message.values.get(field), type, size, message.little);
      const assign = <T extends object>(target: T, key: keyof T, value: unknown) => {
        if (value !== undefined) target[key] = value as T[keyof T];
      };
      let messageTimestamp = message.compressedTimestamp;
      if (messageTimestamp === undefined && message.values.has(253)) {
        try {
          messageTimestamp = number(253, 0x86, 4);
        } catch {
          diagnostics.add('invalid_metadata');
        }
      }
      const milliseconds = (value: number | undefined) => (value === undefined ? undefined : EPOCH + value * 1000);

      try {
        if (message.global === 72) {
          const item: FITTrainingFileReference = {};
          assign(item, 'type', number(0, 0, 1));
          assign(item, 'manufacturer', number(1, 0x84, 2));
          assign(item, 'product', number(2, 0x84, 2));
          assign(item, 'serialNumber', number(3, 0x8c, 4));
          assign(item, 'timeCreatedUnixMs', milliseconds(number(4, 0x86, 4)));
          assign(item, 'timestampUnixMs', milliseconds(messageTimestamp));
          training.push(item);
        } else if (message.global === 26) {
          const item: FITWorkoutDefinition = {};
          assign(item, 'name', fieldString(message.values.get(8)));
          assign(item, 'sport', number(4, 0, 1));
          assign(item, 'subSport', number(11, 0, 1));
          assign(item, 'numValidSteps', number(6, 0x84, 2));
          workouts.push(new DataFITWorkoutDefinitions({ definitions: [item] }).getValue().definitions[0]);
        } else if (message.global === 207) {
          const index = number(3, 2, 1);
          const app = message.values.get(1);
          if (index !== undefined) {
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
        } else if (message.global === 206) {
          const index = number(0, 2, 1);
          if (index === undefined) throw new ReadError('invalid_metadata');
          const field = number(1, 2, 1);
          if (field === undefined) throw new ReadError('invalid_metadata');
          const key = `${index}:${field}`;
          try {
            const name = fieldString(message.values.get(3)) || '';
            if (name === OWNER || name === EXTERNAL) guideDescriptionKeys.add(key);
            const type = number(2, 2, 1);
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
        } else if (message.global === 18) {
          const session: FITWorkoutReferenceSession = { sessionIndex: sessions.length };
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
          for (const field of message.developers) {
            const index = field.developerDataIndex;
            const key = `${index}:${field.fieldDefinitionNumber}`;
            const description = descriptions.get(key);
            const app = applications.get(index);
            const application = app && exporter(app);
            if (invalidApplications.has(index)) continue;
            if (invalidDescriptions.has(key)) {
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
            group.set(description.name, field.rawValue);
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

    for (let i = guides.length - 1; i >= 0; i--) {
      if (
        invalidApplications.has(guides[i].developerDataIndex) ||
        guideDependencies.get(guides[i])!.some(key => invalidDescriptions.has(key))
      ) {
        guides.splice(i, 1);
      }
    }
    return result();
  } catch (error) {
    diagnostics.add(error instanceof ReadError ? error.code : 'invalid_input');
    return result(true);
  }
}
