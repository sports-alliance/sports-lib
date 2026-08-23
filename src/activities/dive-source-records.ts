/** FIT `message_index` bits decoded by the FIT parser. */
export interface DiveMessageIndex {
  value: number;
  reserved?: boolean;
  selected?: boolean;
}

/** FIT `dive_gas.status` values, including future numeric profile values. */
export type DiveGasStatus = 'disabled' | 'enabled' | 'backup_only' | number;

/** FIT `dive_gas.mode` values, including future numeric profile values. */
export type DiveGasMode = 'open_circuit' | 'closed_circuit_diluent' | number;

/**
 * Source-native FIT dive-gas configuration. Values retain the FIT parser's
 * decoded units: helium and oxygen contents are percentages.
 */
export interface DiveGasRecord {
  /** FIT `message_index`, including its source flags. */
  messageIndex?: DiveMessageIndex;
  /** FIT `helium_content` in percent. */
  heliumContent?: number;
  /** FIT `oxygen_content` in percent. */
  oxygenContent?: number;
  /** FIT `dive_gas.status` enum value. */
  status?: DiveGasStatus;
  /** FIT `dive_gas.mode` enum value. */
  mode?: DiveGasMode;
}

/**
 * Source-native FIT tank summary. Pressures are bar and volume used is litres,
 * matching the parser's decoded FIT profile values.
 */
export interface DiveTankSummaryRecord {
  /** FIT `tank_summary.timestamp`, when the source provides it. */
  timestamp?: Date;
  /** FIT packed ANT channel identifier from `tank_summary.sensor`. */
  sensor?: number;
  /** FIT `start_pressure` in bar. */
  startPressure?: number;
  /** FIT `end_pressure` in bar. */
  endPressure?: number;
  /** FIT `volume_used` in litres. */
  volumeUsed?: number;
}

/**
 * Source-native FIT tank-pressure update. Pressure is bar and timestamp is
 * retained as decoded by the FIT parser.
 */
export interface DiveTankUpdateRecord {
  /** FIT `tank_update.timestamp`, when the source provides it. */
  timestamp?: Date;
  /** FIT packed ANT channel identifier from `tank_update.sensor`. */
  sensor?: number;
  /** FIT `pressure` in bar. */
  pressure?: number;
}

/**
 * JSON-safe FIT dive-gas configuration. It preserves the parser-decoded
 * values without promoting them to scalar stats.
 */
export interface DiveGasJSONInterface {
  messageIndex?: DiveMessageIndex;
  heliumContent?: number;
  oxygenContent?: number;
  status?: DiveGasStatus;
  mode?: DiveGasMode;
}

/** Native JSON representation of a FIT tank summary. Timestamps are UTC milliseconds. */
export interface DiveTankSummaryJSONInterface {
  timestamp?: number;
  sensor?: number;
  startPressure?: number;
  endPressure?: number;
  volumeUsed?: number;
}

/** Native JSON representation of a FIT tank-pressure update. Timestamps are UTC milliseconds. */
export interface DiveTankUpdateJSONInterface {
  timestamp?: number;
  sensor?: number;
  pressure?: number;
}

/**
 * JSON-safe structured FIT dive records stored on a native activity. This is
 * intentionally separate from numeric stats and streams: Sports Lib never
 * derives gas mixtures, tank consumption, or a gas-to-tank association.
 */
export interface DiveSourceRecordsJSONInterface {
  gases: DiveGasJSONInterface[];
  tankSummaries: DiveTankSummaryJSONInterface[];
  tankUpdates: DiveTankUpdateJSONInterface[];
}

/**
 * Raw structured dive records attached to a Diving-group activity during a
 * source import. They round-trip through native activity JSON while retaining
 * the in-memory Date representation for tank timestamps.
 */
export interface DiveSourceRecords {
  gases: readonly DiveGasRecord[];
  tankSummaries: readonly DiveTankSummaryRecord[];
  tankUpdates: readonly DiveTankUpdateRecord[];
}

/** Input accepted when replacing an activity's source-native dive records. */
export type DiveSourceRecordsInput = Partial<DiveSourceRecords>;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isFiniteInteger(value: unknown): value is number {
  return isFiniteNumber(value) && Number.isInteger(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isDiveGasStatus(value: unknown): value is DiveGasStatus {
  return value === 'disabled' || value === 'enabled' || value === 'backup_only' || isFiniteInteger(value);
}

function isDiveGasMode(value: unknown): value is DiveGasMode {
  return value === 'open_circuit' || value === 'closed_circuit_diluent' || isFiniteInteger(value);
}

function cloneDiveMessageIndex(value: unknown): DiveMessageIndex | undefined {
  if (!isRecord(value) || !isFiniteInteger(value.value)) {
    return undefined;
  }

  const serialized: DiveMessageIndex = { value: value.value };
  if (typeof value.reserved === 'boolean') {
    serialized.reserved = value.reserved;
  }
  if (typeof value.selected === 'boolean') {
    serialized.selected = value.selected;
  }
  return serialized;
}

function serializeTimestamp(value: Date | undefined): number | undefined {
  if (!(value instanceof Date)) {
    return undefined;
  }

  const timestamp = value.getTime();
  return Number.isFinite(timestamp) ? timestamp : undefined;
}

function deserializeTimestamp(value: unknown): Date | undefined {
  if (!isFiniteInteger(value)) {
    return undefined;
  }

  const timestamp = new Date(value);
  return Number.isFinite(timestamp.getTime()) ? timestamp : undefined;
}

function serializeDiveGasRecord(record: DiveGasRecord): DiveGasJSONInterface {
  const serialized: DiveGasJSONInterface = {};
  const messageIndex = cloneDiveMessageIndex(record.messageIndex);
  if (messageIndex) {
    serialized.messageIndex = messageIndex;
  }
  if (isFiniteNumber(record.heliumContent)) {
    serialized.heliumContent = record.heliumContent;
  }
  if (isFiniteNumber(record.oxygenContent)) {
    serialized.oxygenContent = record.oxygenContent;
  }
  if (isDiveGasStatus(record.status)) {
    serialized.status = record.status;
  }
  if (isDiveGasMode(record.mode)) {
    serialized.mode = record.mode;
  }
  return serialized;
}

function serializeDiveTankSummaryRecord(record: DiveTankSummaryRecord): DiveTankSummaryJSONInterface {
  const serialized: DiveTankSummaryJSONInterface = {};
  const timestamp = serializeTimestamp(record.timestamp);
  if (timestamp !== undefined) {
    serialized.timestamp = timestamp;
  }
  if (isFiniteNumber(record.sensor)) {
    serialized.sensor = record.sensor;
  }
  if (isFiniteNumber(record.startPressure)) {
    serialized.startPressure = record.startPressure;
  }
  if (isFiniteNumber(record.endPressure)) {
    serialized.endPressure = record.endPressure;
  }
  if (isFiniteNumber(record.volumeUsed)) {
    serialized.volumeUsed = record.volumeUsed;
  }
  return serialized;
}

function serializeDiveTankUpdateRecord(record: DiveTankUpdateRecord): DiveTankUpdateJSONInterface {
  const serialized: DiveTankUpdateJSONInterface = {};
  const timestamp = serializeTimestamp(record.timestamp);
  if (timestamp !== undefined) {
    serialized.timestamp = timestamp;
  }
  if (isFiniteNumber(record.sensor)) {
    serialized.sensor = record.sensor;
  }
  if (isFiniteNumber(record.pressure)) {
    serialized.pressure = record.pressure;
  }
  return serialized;
}

function deserializeDiveGasRecord(record: unknown): DiveGasRecord {
  const deserialized: DiveGasRecord = {};
  if (!isRecord(record)) {
    return deserialized;
  }

  const messageIndex = cloneDiveMessageIndex(record.messageIndex);
  if (messageIndex) {
    deserialized.messageIndex = messageIndex;
  }
  if (isFiniteNumber(record.heliumContent)) {
    deserialized.heliumContent = record.heliumContent;
  }
  if (isFiniteNumber(record.oxygenContent)) {
    deserialized.oxygenContent = record.oxygenContent;
  }
  if (isDiveGasStatus(record.status)) {
    deserialized.status = record.status;
  }
  if (isDiveGasMode(record.mode)) {
    deserialized.mode = record.mode;
  }
  return deserialized;
}

function deserializeDiveTankSummaryRecord(record: unknown): DiveTankSummaryRecord {
  const deserialized: DiveTankSummaryRecord = {};
  if (!isRecord(record)) {
    return deserialized;
  }

  const timestamp = deserializeTimestamp(record.timestamp);
  if (timestamp) {
    deserialized.timestamp = timestamp;
  }
  if (isFiniteNumber(record.sensor)) {
    deserialized.sensor = record.sensor;
  }
  if (isFiniteNumber(record.startPressure)) {
    deserialized.startPressure = record.startPressure;
  }
  if (isFiniteNumber(record.endPressure)) {
    deserialized.endPressure = record.endPressure;
  }
  if (isFiniteNumber(record.volumeUsed)) {
    deserialized.volumeUsed = record.volumeUsed;
  }
  return deserialized;
}

function deserializeDiveTankUpdateRecord(record: unknown): DiveTankUpdateRecord {
  const deserialized: DiveTankUpdateRecord = {};
  if (!isRecord(record)) {
    return deserialized;
  }

  const timestamp = deserializeTimestamp(record.timestamp);
  if (timestamp) {
    deserialized.timestamp = timestamp;
  }
  if (isFiniteNumber(record.sensor)) {
    deserialized.sensor = record.sensor;
  }
  if (isFiniteNumber(record.pressure)) {
    deserialized.pressure = record.pressure;
  }
  return deserialized;
}

export function cloneDiveSourceRecords(records?: DiveSourceRecordsInput | null): DiveSourceRecords {
  return {
    gases: Array.isArray(records?.gases)
      ? records.gases.map(record => ({
          ...record,
          ...(record.messageIndex ? { messageIndex: { ...record.messageIndex } } : {})
        }))
      : [],
    tankSummaries: Array.isArray(records?.tankSummaries)
      ? records.tankSummaries.map(record => ({
          ...record,
          ...(record.timestamp ? { timestamp: new Date(record.timestamp.getTime()) } : {})
        }))
      : [],
    tankUpdates: Array.isArray(records?.tankUpdates)
      ? records.tankUpdates.map(record => ({
          ...record,
          ...(record.timestamp ? { timestamp: new Date(record.timestamp.getTime()) } : {})
        }))
      : []
  };
}

/** Serializes native dive records without Date or undefined values. */
export function serializeDiveSourceRecords(records?: DiveSourceRecordsInput | null): DiveSourceRecordsJSONInterface {
  return {
    gases: Array.isArray(records?.gases) ? records.gases.map(record => serializeDiveGasRecord(record)) : [],
    tankSummaries: Array.isArray(records?.tankSummaries)
      ? records.tankSummaries.map(record => serializeDiveTankSummaryRecord(record))
      : [],
    tankUpdates: Array.isArray(records?.tankUpdates)
      ? records.tankUpdates.map(record => serializeDiveTankUpdateRecord(record))
      : []
  };
}

/** Restores native dive records from JSON timestamps and JSON-safe values. */
export function deserializeDiveSourceRecords(records?: DiveSourceRecordsJSONInterface | null): DiveSourceRecords {
  // Each mapper allocates fresh records (and fresh Date instances), so avoid a
  // second full clone here. Activity#setDiveSourceRecords still establishes
  // the Activity's ownership boundary. This matters for long dives with many
  // tank-pressure updates.
  return {
    gases: Array.isArray(records?.gases)
      ? records.gases.filter(isRecord).map(record => deserializeDiveGasRecord(record))
      : [],
    tankSummaries: Array.isArray(records?.tankSummaries)
      ? records.tankSummaries.filter(isRecord).map(record => deserializeDiveTankSummaryRecord(record))
      : [],
    tankUpdates: Array.isArray(records?.tankUpdates)
      ? records.tankUpdates.filter(isRecord).map(record => deserializeDiveTankUpdateRecord(record))
      : []
  };
}
