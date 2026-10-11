import type { ActivityInterface } from '../activities/activity.interface';

/** Real HR records in a length-based pool file must retain their coverage instead
 * of inheriting synthetic swim-stream timestamps. Parse-instance state also
 * survives explicit stat regeneration without changing the serialized schema. */
export const recordedPoolHeartRate = new WeakSet<ActivityInterface>();
