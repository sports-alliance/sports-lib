import { DataBare } from './data.bare';
import { DataJSONInterface, DataJSONValue } from './data.json.interface';

/** A source-native FIT message 72. Numeric enums remain FIT codes, not API identities. */
export type FITTrainingFileReference = {
  type?: number;
  manufacturer?: number;
  product?: number;
  serialNumber?: number;
  timeCreatedUnixMs?: number;
  timestampUnixMs?: number;
};

/** Lightweight message 26 metadata, not a parsed recipe or evidence of completed steps. */
export type FITWorkoutDefinition = {
  name?: string;
  sport?: number;
  subSport?: number;
  numValidSteps?: number;
};

/** Known Suunto developer applications that describe Guide usage. Not authentication. */
export type SuuntoPlusGuideExporter = 'SuuntoFitExport1' | 'SuuntoplusFitExt';

/** Positionally paired IDs from one session and developer-data index. */
export type SuuntoPlusGuideReference = {
  sessionIndex: number;
  developerDataIndex: number;
  applicationId: SuuntoPlusGuideExporter;
  /** Uploader OAuth client ID, not an application display name. */
  ownerId: string;
  externalId: string;
};

/** Ordered file-level references. */
export type FITTrainingFileReferencesValue = { references: FITTrainingFileReference[] };
/** Ordered embedded workout summaries. */
export type FITWorkoutDefinitionsValue = { definitions: FITWorkoutDefinition[] };
/** Session-scoped Guide references. */
export type SuuntoPlusGuideReferencesValue = { references: SuuntoPlusGuideReference[] };

const MAX_RECORDS = 10_000;
const FIT_EPOCH_UNIX_MS = Date.UTC(1989, 11, 31);

function record(value: unknown, allowed: readonly string[]): Record<string, unknown> {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    ![Object.prototype, null].includes(Object.getPrototypeOf(value)) ||
    Reflect.ownKeys(value).some(key => typeof key !== 'string' || !allowed.includes(key))
  ) {
    throw new TypeError('Invalid workout reference object');
  }
  return value as Record<string, unknown>;
}

function integer(value: unknown, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || Object.is(value, -0) || value < min || value > max) {
    throw new TypeError('Invalid workout reference integer');
  }
  return value;
}

function text(value: unknown, max: number): string {
  if (
    typeof value !== 'string' ||
    !value.length ||
    Array.from(value).length > max ||
    Array.from(value).some(character => {
      const code = character.codePointAt(0)!;
      return code < 32 || (code >= 127 && code <= 159) || code === 0xfffd || (code >= 0xd800 && code <= 0xdfff);
    })
  ) {
    throw new TypeError('Invalid workout reference string');
  }
  return value;
}

function timestamp(value: unknown): number {
  const ms = integer(value, FIT_EPOCH_UNIX_MS, FIT_EPOCH_UNIX_MS + 0xfffffffe * 1000);
  if (ms % 1000 !== 0) throw new TypeError('Invalid FIT timestamp precision');
  return ms;
}

function list(value: unknown, key: string): unknown[] {
  const input = record(value, [key]);
  const entries = input[key];
  if (!Array.isArray(entries)) throw new TypeError('Invalid workout reference list');
  const length = entries.length;
  const keys = Reflect.ownKeys(entries);
  if (
    !Number.isSafeInteger(length) ||
    length < 0 ||
    length > MAX_RECORDS ||
    keys.length !== length + 1 ||
    keys.some(
      property =>
        property !== 'length' &&
        (typeof property !== 'string' || !/^(0|[1-9][0-9]*)$/.test(property) || Number(property) >= length)
    )
  ) {
    throw new TypeError('Invalid workout reference list');
  }
  // Do not dispatch validation through a caller's map/iterator or Array species constructor.
  return Array.from({ length }, (_, index) => entries[index]);
}

function trainingFiles(value: unknown): FITTrainingFileReferencesValue {
  return {
    references: list(value, 'references').map(item => {
      const input = record(item, [
        'type',
        'manufacturer',
        'product',
        'serialNumber',
        'timeCreatedUnixMs',
        'timestampUnixMs'
      ]);
      const output: FITTrainingFileReference = {};
      if ('type' in input) output.type = integer(input.type, 0, 254);
      if ('manufacturer' in input) output.manufacturer = integer(input.manufacturer, 0, 65534);
      if ('product' in input) output.product = integer(input.product, 0, 65534);
      // uint32z: zero is invalid; 0xffffffff is a valid unsigned serial number.
      if ('serialNumber' in input) output.serialNumber = integer(input.serialNumber, 1, 0xffffffff);
      if ('timeCreatedUnixMs' in input) output.timeCreatedUnixMs = timestamp(input.timeCreatedUnixMs);
      if ('timestampUnixMs' in input) output.timestampUnixMs = timestamp(input.timestampUnixMs);
      return output;
    })
  };
}

function workouts(value: unknown): FITWorkoutDefinitionsValue {
  return {
    definitions: list(value, 'definitions').map(item => {
      const input = record(item, ['name', 'sport', 'subSport', 'numValidSteps']);
      const output: FITWorkoutDefinition = {};
      if ('name' in input) output.name = text(input.name, 255);
      if ('sport' in input) output.sport = integer(input.sport, 0, 254);
      if ('subSport' in input) output.subSport = integer(input.subSport, 0, 254);
      if ('numValidSteps' in input) output.numValidSteps = integer(input.numValidSteps, 0, 65534);
      return output;
    })
  };
}

function guides(value: unknown): SuuntoPlusGuideReferencesValue {
  const groupCounts = new Map<string, number>();
  const applications = new Map<number, SuuntoPlusGuideExporter>();
  return {
    references: list(value, 'references').map(item => {
      const input = record(item, ['sessionIndex', 'developerDataIndex', 'applicationId', 'ownerId', 'externalId']);
      const applicationId = input.applicationId;
      if (applicationId !== 'SuuntoFitExport1' && applicationId !== 'SuuntoplusFitExt') {
        throw new TypeError('Invalid Suunto Guide exporter');
      }
      const output: SuuntoPlusGuideReference = {
        sessionIndex: integer(input.sessionIndex, 0, MAX_RECORDS - 1),
        developerDataIndex: integer(input.developerDataIndex, 0, 254),
        applicationId,
        ownerId: text(input.ownerId, 64),
        externalId: text(input.externalId, 64)
      };
      const group = `${output.sessionIndex}:${output.developerDataIndex}`;
      const application = applications.get(output.developerDataIndex);
      if (application && application !== output.applicationId)
        throw new TypeError('Conflicting Guide exporter identity');
      applications.set(output.developerDataIndex, output.applicationId);
      const count = (groupCounts.get(group) || 0) + 1;
      if (count > 10) throw new TypeError('Too many Guide references in one developer group');
      groupCounts.set(group, count);
      return output;
    })
  };
}

function unwrap(json: unknown, type: string): unknown {
  const input = record(json, [type]);
  if (!Object.prototype.hasOwnProperty.call(input, type))
    throw new TypeError('Missing canonical workout reference type');
  return input[type];
}

/** Internal common ownership boundary; only the concrete classes are public. */
abstract class WorkoutReferenceData<T extends DataJSONValue> extends DataBare<T> {
  protected abstract normalize(value: unknown): T;

  override isValueTypeValid(value: unknown): boolean {
    try {
      this.normalize(value);
      return true;
    } catch {
      return false;
    }
  }

  /** Validates an owned snapshot before replacing the previous value; failure leaves it unchanged. */
  override setValue(value: T): this {
    this.value = this.normalize(value);
    return this;
  }

  override getValue(): T {
    return this.normalize(this.value);
  }

  /** Returns a fresh, canonical JSON envelope without exposing owned references. */
  override toJSON(): DataJSONInterface {
    return { [this.getType()]: this.getValue() };
  }

  /** Avoids displaying provider IDs as a scalar metric. */
  override getDisplayValue(): string {
    return this.getType();
  }
}

/** Ordered file-level FIT references; does not assert a provider account, API ID or completion. */
export class DataFITTrainingFileReferences extends WorkoutReferenceData<FITTrainingFileReferencesValue> {
  static type = 'FIT Training File References';
  constructor(value: FITTrainingFileReferencesValue | unknown) {
    super(trainingFiles(value));
  }
  protected normalize(value: unknown): FITTrainingFileReferencesValue {
    return trainingFiles(value);
  }
  /** Restores only this class's canonical JSON envelope. */
  static fromJSON(json: unknown): DataFITTrainingFileReferences {
    return new DataFITTrainingFileReferences(unwrap(json, this.type));
  }
}

/** Embedded workout descriptions, independent of any recorded session association. */
export class DataFITWorkoutDefinitions extends WorkoutReferenceData<FITWorkoutDefinitionsValue> {
  static type = 'FIT Workout Definitions';
  constructor(value: FITWorkoutDefinitionsValue | unknown) {
    super(workouts(value));
  }
  protected normalize(value: unknown): FITWorkoutDefinitionsValue {
    return workouts(value);
  }
  /** Restores only this class's canonical JSON envelope. */
  static fromJSON(json: unknown): DataFITWorkoutDefinitions {
    return new DataFITWorkoutDefinitions(unwrap(json, this.type));
  }
}

/** Paired source Guide IDs. Account validation and completion matching belong to the consumer. */
export class DataSuuntoPlusGuideReferences extends WorkoutReferenceData<SuuntoPlusGuideReferencesValue> {
  static type = 'SuuntoPlus Guide References';
  constructor(value: SuuntoPlusGuideReferencesValue | unknown) {
    super(guides(value));
  }
  protected normalize(value: unknown): SuuntoPlusGuideReferencesValue {
    return guides(value);
  }
  /** Restores only this class's canonical JSON envelope. */
  static fromJSON(json: unknown): DataSuuntoPlusGuideReferences {
    return new DataSuuntoPlusGuideReferences(unwrap(json, this.type));
  }
}
