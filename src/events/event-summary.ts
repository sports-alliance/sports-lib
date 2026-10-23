import type { ActivityJSONInterface } from '../activities/activity.json.interface';
import { ActivityTypes, ActivityTypesHelper } from '../activities/activity.types';
import { getActivityTypeSourceFromManufacturer } from '../activities/activity-types.provider';
import { normalizeActivityMetricSemanticsForJSONStats } from '../activities/activity.metric-semantics';
import { DataActivityTypes } from '../data/data.activity-types';
import { DataDistance } from '../data/data.distance';
import { DataDuration } from '../data/data.duration';
import type { DataInterface, DefaultDataValue } from '../data/data.interface';
import type { DataJSONInterface, DataJSONValue } from '../data/data.json.interface';
import { DataPowerCurve } from '../data/data.power-curve';
import { DynamicDataLoader } from '../data/data.store';
import { DataStanceTime } from '../data/data.stance-time';
import { DataStanceTimeBalanceLeft } from '../data/data-stance-time-balance-left';
import { DataStanceTimeBalanceRight } from '../data/data-stance-time-balance-right';
import { DataGroundContactTime } from '../data/data.ground-contact-time';
import { DataGroundContactTimeBalanceLeft } from '../data/data-ground-contact-time-balance-left';
import { DataGroundContactTimeBalanceRight } from '../data/data-ground-contact-time-balance-right';
import type { EventJSONInterface } from './event.json.interface';
import { createSpeedDerivedStat, SPEED_DERIVED_STAT_TYPES } from '../stats/speed-derived-stats';

/** Native event JSON with optional child activities, suitable for separately persisted summaries. */
export interface EventSummaryJSONInterface extends Omit<EventJSONInterface, 'activities'> {
  /** Only sport type and creator manufacturer are read; children are never hydrated. */
  activities?: readonly (Pick<ActivityJSONInterface, 'type'> & {
    creator?: Pick<ActivityJSONInterface['creator'], 'manufacturer'>;
  })[];
}

const LEGACY_INSTANCE_TYPES: ReadonlyMap<string, string> = new Map([
  [DataStanceTime.type, DataGroundContactTime.type],
  [DataStanceTimeBalanceLeft.type, DataGroundContactTimeBalanceLeft.type],
  [DataStanceTimeBalanceRight.type, DataGroundContactTimeBalanceRight.type]
]);

function canonicalType(type: string): string {
  try {
    return DynamicDataLoader.getDataClassFromDataType(type).type;
  } catch {
    // Unknown raw metrics remain readable as raw data. Constructor errors are deferred
    // until that metric is requested, without preventing unrelated summary reads.
    return type;
  }
}

function copyValue(value: DataJSONValue): DataJSONValue {
  if (Array.isArray(value)) return value.map(copyValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, copyValue(entry as DataJSONValue)]));
  }
  return value;
}

/**
 * Read-oriented event projection for dashboards and lists. Restores metadata and raw canonical
 * stats without constructing activities, laps, streams or metric objects. getStat constructs and
 * caches only the requested metric and any speed-derived dependencies. This is not an editable
 * EventInterface and deliberately has no persistence/export API.
 *
 * Summary sport semantics use embedded activity types when present, otherwise the persisted
 * Activity Types stat. Aliases, finite-scalar filtering and explicit canonical precedence match
 * native JSON hydration. Invalid metric values and unknown types throw only when requested.
 * @category Activities and events
 */
export class EventSummary {
  readonly name: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly srcFileType: EventJSONInterface['srcFileType'];
  readonly description: string | undefined;
  readonly privacy: EventJSONInterface['privacy'];
  readonly isMerge: boolean;
  private readonly id: string | null;
  private readonly rawStats = new Map<string, DataJSONValue>();
  private readonly stats = new Map<string, DataInterface<unknown>>();
  private readonly activityTypes: string[];

  private constructor(json: EventSummaryJSONInterface) {
    this.id = json.id || null;
    this.name = json.name;
    this.startDate = new Date(json.startDate);
    this.endDate = new Date(json.endDate);
    this.srcFileType = json.srcFileType;
    this.description = json.description || undefined;
    this.privacy = json.privacy;
    this.isMerge = json.isMerge || false;

    const canonicalStats = new Map<string, { sourceType: string; value: DataJSONValue }>();
    Object.entries(json.stats || {}).forEach(([sourceType, value]) => {
      if (value === null || value === undefined || (typeof value === 'number' && !Number.isFinite(value))) return;
      const type = canonicalType(sourceType);
      const existing = canonicalStats.get(type);
      if (!existing || (existing.sourceType !== type && sourceType === type)) {
        canonicalStats.set(type, { sourceType, value });
      }
    });
    canonicalStats.forEach(({ value }, type) => {
      this.rawStats.set(LEGACY_INSTANCE_TYPES.get(type) || type, copyValue(value));
    });
    if (json.powerCurve && json.powerCurve[DataPowerCurve.type] !== undefined) {
      this.rawStats.set(DataPowerCurve.type, copyValue(json.powerCurve[DataPowerCurve.type]));
    }
    const storedTypes = this.rawStats.get(DataActivityTypes.type);
    const embeddedTypes = (json.activities || []).map(
      activity =>
        ActivityTypesHelper.resolveActivityType(
          activity.type,
          getActivityTypeSourceFromManufacturer(activity.creator?.manufacturer)
        ) ?? ActivityTypes.unknown
    );
    this.activityTypes = Array.isArray(storedTypes) ? (storedTypes.slice() as string[]) : embeddedTypes;
    normalizeActivityMetricSemanticsForJSONStats(
      this.rawStats,
      embeddedTypes.length ? embeddedTypes : this.activityTypes
    );
  }

  /** Creates an isolated raw-stat snapshot without eagerly constructing metrics or child models. */
  static fromJSON(json: EventSummaryJSONInterface): EventSummary {
    return new EventSummary(json);
  }

  /** Returns the persisted identity, or null when the input has no ID. */
  getID(): string | null {
    return this.id;
  }

  /** Returns a copy of the recorded activity types, falling back to embedded child sports. */
  getActivityTypesAsArray(): string[] {
    return this.activityTypes.slice();
  }

  /**
   * Returns one canonical metric, constructing it once on first access. Missing metrics return
   * undefined; invalid stored metrics retain the loader's constructor error when requested.
   * Returned metric objects are cached; changing one does not alter the raw-stat snapshot.
   */
  getStat<TValue = DefaultDataValue>(type: string): DataInterface<TValue> | undefined {
    type = canonicalType(type);
    type = LEGACY_INSTANCE_TYPES.get(type) || type;
    const cached = this.stats.get(type);
    if (cached) return cached as DataInterface<TValue>;
    const stat = this.rawStats.has(type)
      ? DynamicDataLoader.getDataInstanceFromDataType(type, copyValue(this.rawStats.get(type)!))
      : createSpeedDerivedStat(this, type);
    if (!stat) return undefined;
    this.stats.set(type, stat);
    return stat as DataInterface<TValue>;
  }

  /** Canonical distance, hydrated on demand. */
  getDistance(): DataDistance | undefined {
    return this.getStat<number>(DataDistance.type) as DataDistance | undefined;
  }

  /** Canonical duration, hydrated on demand. */
  getDuration(): DataDuration | undefined {
    return this.getStat<number>(DataDuration.type) as DataDuration | undefined;
  }

  /** Materializes all available stored and speed-derived stats; the returned map is a copy. */
  getStats<TValue = DefaultDataValue>(): Map<string, DataInterface<TValue>> {
    [...this.rawStats.keys(), ...SPEED_DERIVED_STAT_TYPES].forEach(type => this.getStat(type));
    return new Map(this.stats) as Map<string, DataInterface<TValue>>;
  }

  /** Materializes all available stats, as an array. */
  getStatsAsArray<TValue = DefaultDataValue>(): DataInterface<TValue>[] {
    return Array.from(this.getStats<TValue>().values());
  }

  /** Copies canonical raw stats, after sport semantics and before lazy pace derivation. Not an event export. */
  getRawStats(): DataJSONInterface {
    return Object.fromEntries(Array.from(this.rawStats, ([type, value]) => [type, copyValue(value)]));
  }
}
