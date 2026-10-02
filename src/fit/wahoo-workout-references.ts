import {
  fitTimestampToUnixMilliseconds,
  getFitBaseTypeId,
  readFitUnsignedField,
  type FitRawMessage
} from 'fit-file-parser/raw';

/**
 * File-scoped source metadata from the observed Wahoo app plan-reference layout.
 * Neither the manufacturer nor these IDs authenticate an account or prove completion.
 * Consumers must establish the recorded session, source provenance and owned delivery independently.
 */
export interface FITWahooWorkoutReference {
  format: 'wahoo-app-plan-v1';
  planId: string;
  /** The scheduled Cloud Workout ID, or null for Wahoo's explicit 0xffffffff sentinel. */
  workoutId: string | null;
  /** Source recording start, in UTC Unix milliseconds; not the scheduled calendar date. */
  startTimeUnixMs: number;
}

const MAX_RECORDS = 10_000;
const FIT_EPOCH = Date.UTC(1989, 11, 31);
const ID = /^[1-9][0-9]{0,18}$/;
const KEYS = ['format', 'planId', 'workoutId', 'startTimeUnixMs'];

/**
 * Restores a JSON-round-tripped reference list as an owned, strictly validated snapshot.
 * This is nonnumeric metadata, deliberately outside DataStore and normal Event/Activity JSON.
 */
export function parseFITWahooWorkoutReferences(value: unknown): FITWahooWorkoutReference[] {
  if (!Array.isArray(value) || value.length > MAX_RECORDS) throw new TypeError('Invalid Wahoo references');
  const length = value.length;
  const keys = Reflect.ownKeys(value);
  if (
    keys.length !== length + 1 ||
    keys.some(
      key => key !== 'length' && (typeof key !== 'string' || !/^(0|[1-9][0-9]*)$/.test(key) || Number(key) >= length)
    )
  ) {
    throw new TypeError('Invalid Wahoo references');
  }
  return Array.from({ length }, (_, index) => {
    const input = value[index] as Record<string, unknown>;
    if (
      !input ||
      typeof input !== 'object' ||
      Array.isArray(input) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(input)) ||
      Reflect.ownKeys(input).length !== KEYS.length ||
      Reflect.ownKeys(input).some(key => typeof key !== 'string' || !KEYS.includes(key))
    ) {
      throw new TypeError('Invalid Wahoo reference');
    }
    // Snapshot accessors once: validate exactly the values returned, not a second read.
    const { format, planId, workoutId, startTimeUnixMs } = input;
    if (
      format !== 'wahoo-app-plan-v1' ||
      typeof planId !== 'string' ||
      !ID.test(planId) ||
      (workoutId !== null &&
        (typeof workoutId !== 'string' || !ID.test(workoutId) || Number(workoutId) > 0xfffffffe)) ||
      typeof startTimeUnixMs !== 'number' ||
      !Number.isSafeInteger(startTimeUnixMs) ||
      startTimeUnixMs < FIT_EPOCH ||
      startTimeUnixMs > FIT_EPOCH + 0xfffffffe * 1000 ||
      startTimeUnixMs % 1000 !== 0
    ) {
      throw new TypeError('Invalid Wahoo reference');
    }
    return { format, planId, workoutId, startTimeUnixMs };
  });
}

export type WahooReferenceMessageResult =
  | { kind: 'ignore' | 'invalid' | 'unsupported' }
  | { kind: 'reference'; reference: FITWahooWorkoutReference };

/** Internal decoder for the exact observed layout, not a public Wahoo binary specification. */
export function readWahooReferenceMessage(message: FitRawMessage): WahooReferenceMessageResult {
  const payloadFields = message.fields.filter(field => field.fieldNumber === 3);
  // 0x0035 is the reference record. Other private records (such as 0x0053) are unrelated.
  if (!payloadFields.some(field => field.bytes[0] === 0x35)) return { kind: 'ignore' };
  const fields = new Map(message.fields.map(field => [field.fieldNumber, field]));
  const payload = fields.get(3);
  if (
    payloadFields.length !== 1 ||
    [0, 1, 2, 3].some(number => message.fields.filter(field => field.fieldNumber === number).length !== 1) ||
    !payload ||
    getFitBaseTypeId(payload.baseType) !== 13
  )
    return { kind: 'invalid' };
  const bytes = payload.bytes;
  if (message.fields.length !== 4 || message.developerFields.length !== 0 || bytes[1] !== 0 || bytes[2] !== 5)
    return { kind: 'unsupported' };
  const envelope = fields.get(1)!;
  const size = fields.get(2)!;
  if (
    getFitBaseTypeId(envelope.baseType) !== 2 ||
    envelope.bytes.length !== 1 ||
    envelope.bytes[0] !== 255 ||
    getFitBaseTypeId(size.baseType) !== 2 ||
    size.bytes.length !== 1 ||
    size.bytes[0] !== bytes.length
  ) {
    return { kind: 'invalid' };
  }
  const end = bytes.indexOf(0, 3);
  if (
    end < 4 ||
    end > 22 ||
    bytes.length !== end + 13 ||
    bytes[end + 1] !== 0 ||
    bytes[end + 2] !== 14 ||
    bytes[end + 3] !== 0 ||
    bytes[end + 8] !== 0
  ) {
    return { kind: 'invalid' };
  }
  const digits = bytes.subarray(3, end);
  if (digits.some(byte => byte < 48 || byte > 57) || digits[0] === 48) return { kind: 'invalid' };
  try {
    const start = readFitUnsignedField(fields.get(0), 0x86, 4, message.littleEndian);
    if (start === undefined) return { kind: 'invalid' };
    // The private payload is little-endian independently of its containing FIT definition.
    const workout = new DataView(bytes.buffer, bytes.byteOffset + end + 4, 4).getUint32(0, true);
    if (workout === 0) return { kind: 'invalid' };
    const reference = parseFITWahooWorkoutReferences([
      {
        format: 'wahoo-app-plan-v1',
        planId: Array.from(digits, digit => String.fromCharCode(digit)).join(''),
        workoutId: workout === 0xffffffff ? null : String(workout),
        startTimeUnixMs: fitTimestampToUnixMilliseconds(start)
      }
    ])[0];
    return { kind: 'reference', reference };
  } catch {
    return { kind: 'invalid' };
  }
}
