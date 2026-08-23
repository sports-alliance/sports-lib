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
 * Raw structured dive records attached to a Diving-group activity during a
 * source import. They are intentionally separate from numeric stats and
 * streams: Sports Lib never derives gas mixtures, tank consumption, or a
 * gas-to-tank association from them. They are source-hydration data and are
 * deliberately excluded from Sports Lib native JSON serialization.
 */
export interface DiveSourceRecords {
  gases: readonly DiveGasRecord[];
  tankSummaries: readonly DiveTankSummaryRecord[];
  tankUpdates: readonly DiveTankUpdateRecord[];
}

/** Input accepted when replacing an activity's source-native dive records. */
export type DiveSourceRecordsInput = Partial<DiveSourceRecords>;

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
