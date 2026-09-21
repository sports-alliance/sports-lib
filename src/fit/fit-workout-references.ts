import type { FitRawField } from 'fit-file-parser/raw';
import {
  FitMessageReaderError,
  fitTimestampToUnixMilliseconds,
  getFitBaseTypeId,
  readFitMessages,
  readFitStringField,
  readFitUnsignedField
} from 'fit-file-parser/raw';
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
const MAX_BYTES = 64 * 1024 * 1024;
const MAX_RECORDS = 10_000;
const SELECTED_MESSAGES = [18, 26, 72, 206, 207] as const;

function decodeString(bytes: Uint8Array): string {
  try {
    return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes).replace(/\0+$/, '');
  } catch {
    throw new ReadError('invalid_metadata');
  }
}

function exporter(bytes: Uint8Array): SuuntoPlusGuideExporter | undefined {
  const id = Array.from(bytes, byte => String.fromCharCode(byte)).join('');
  return id === 'SuuntoFitExport1' || id === 'SuuntoplusFitExt' ? id : undefined;
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
    const parsed = readFitMessages(input, {
      messageNumbers: SELECTED_MESSAGES,
      maxInputBytes: MAX_BYTES
    });
    if (parsed.issues.length) {
      diagnostics.add('invalid_metadata');
    }

    const applications = new Map<number, Uint8Array>();
    const descriptions = new Map<string, Description>();
    const invalidApplications = new Set<number>();
    const invalidDescriptions = new Set<string>();
    const guideDescriptionKeys = new Set<string>();
    const guideDependencies = new Map<SuuntoPlusGuideReference, string[]>();

    for (const message of parsed.messages) {
      const values = new Map<number, FitRawField>(message.fields.map(field => [field.fieldNumber, field]));
      const number = (field: number, type: number, size: 1 | 2 | 4) =>
        readFitUnsignedField(values.get(field), type, size, message.littleEndian);
      const assign = <T extends object>(target: T, key: keyof T, value: unknown) => {
        if (value !== undefined) target[key] = value as T[keyof T];
      };
      const milliseconds = (value: number | undefined) =>
        value === undefined ? undefined : fitTimestampToUnixMilliseconds(value);

      try {
        if (message.globalMessageNumber === 72) {
          const item: FITTrainingFileReference = {};
          assign(item, 'type', number(0, 0, 1));
          assign(item, 'manufacturer', number(1, 0x84, 2));
          assign(item, 'product', number(2, 0x84, 2));
          assign(item, 'serialNumber', number(3, 0x8c, 4));
          assign(item, 'timeCreatedUnixMs', milliseconds(number(4, 0x86, 4)));
          assign(item, 'timestampUnixMs', milliseconds(message.timestamp));
          training.push(item);
        } else if (message.globalMessageNumber === 26) {
          const item: FITWorkoutDefinition = {};
          assign(item, 'name', readFitStringField(values.get(8)));
          assign(item, 'sport', number(4, 0, 1));
          assign(item, 'subSport', number(11, 0, 1));
          assign(item, 'numValidSteps', number(6, 0x84, 2));
          // Use the same validation as public construction, including malformed strings.
          workouts.push(new DataFITWorkoutDefinitions({ definitions: [item] }).getValue().definitions[0]);
        } else if (message.globalMessageNumber === 207) {
          const index = number(3, 2, 1);
          const app = values.get(1);
          if (index !== undefined) {
            // Application IDs are optional for unrelated FIT developer data. Absence alone is not a conflict.
            if (!app && !applications.has(index)) continue;
            if (!app || getFitBaseTypeId(app.baseType) !== 13 || app.bytes.length !== 16) {
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
        } else if (message.globalMessageNumber === 206) {
          const index = number(0, 2, 1);
          if (index === undefined) throw new ReadError('invalid_metadata');
          const field = number(1, 2, 1);
          if (field === undefined) throw new ReadError('invalid_metadata');
          const key = `${index}:${field}`;
          try {
            const name = readFitStringField(values.get(3)) || '';
            // Retain Guide semantics even if decoding the accompanying type throws. Otherwise an
            // ambiguous extra owner/external-ID field could be skipped in favor of another pair.
            if (name === OWNER || name === EXTERNAL) guideDescriptionKeys.add(key);
            const type = number(2, 2, 1);
            const describedType = type === undefined ? null : getFitBaseTypeId(type);
            if (describedType === null) throw new ReadError('invalid_metadata');
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
        } else if (message.globalMessageNumber === 18) {
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
              const value = field === 253 ? message.timestamp : number(field, type, size);
              assign(session, key, type === 0x86 ? milliseconds(value) : value);
            } catch {
              diagnostics.add('invalid_metadata');
            }
          }

          const groups = new Map<number, Map<string, Uint8Array>>();
          const groupDependencies = new Map<number, string[]>();
          const invalidGroups = new Set<number>();
          for (const developerField of message.developerFields) {
            const index = developerField.developerDataIndex;
            const key = `${index}:${developerField.fieldNumber}`;
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
            group.set(description.name, developerField.bytes);
            groups.set(index, group);
            const dependencies = groupDependencies.get(index) || [];
            dependencies.push(key);
            groupDependencies.set(index, dependencies);
          }
          for (const [index, group] of groups) {
            try {
              if (invalidGroups.has(index) || !group.has(OWNER) || !group.has(EXTERNAL)) throw new Error();
              const owners = decodeString(group.get(OWNER)!).split('\0');
              const ids = decodeString(group.get(EXTERNAL)!).split('\0');
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
    diagnostics.add(
      error instanceof FitMessageReaderError ? error.code : error instanceof ReadError ? error.code : 'invalid_input'
    );
    return result(true);
  }
}
