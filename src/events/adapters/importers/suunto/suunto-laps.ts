import { ActivityInterface } from '../../../../activities/activity.interface';
import { LapTypes } from '../../../../laps/lap.types';

interface LapBoundary {
  end: number;
  type: LapTypes;
}
interface SourceWindow {
  TimeISO8601?: string;
  Window: Record<string, unknown>;
}
export interface SuuntoLapSource {
  start: number;
  end: number;
  type: LapTypes;
  owner: ActivityInterface;
  window?: Record<string, unknown>;
  recoverTiming: boolean;
}

/** Native multisport windows have independent timestamps and sport ownership.
 * Their array positions do not correspond to the sample Lap events: a sport
 * change can emit a remainder summary without emitting a Lap event. */
export function resolveSuuntoMultisportLaps(
  activities: ActivityInterface[],
  activityIds: unknown[],
  boundaries: LapBoundary[],
  windows: SourceWindow[]
): SuuntoLapSource[] {
  const first = +activities[0].startDate;
  const last = activities[activities.length - 1];
  const stop = +last.endDate;
  const timestamp = (w: SourceWindow) => (w.TimeISO8601 ? Date.parse(w.TimeISO8601) : NaN);
  const ownerAt = (end: number) => activities.find(a => end > +a.startDate && end <= +a.endDate);
  const sameSport = (a: ActivityInterface, id: unknown) =>
    id !== undefined && id !== null && String(activityIds[activities.indexOf(a)]) === String(id);
  const lapWindows = windows.filter(w => w.Window?.Type === 'Lap' || w.Window?.Type === 'Autolap');
  const isManual = (type: LapTypes) => type === LapTypes.Manual;
  const matchesKind = (b: LapBoundary, w: SourceWindow) =>
    b.type === LapTypes.Stop || (w.Window.Type === 'Lap' ? isManual(b.type) : !isManual(b.type));
  const effectiveEnd = (w: SourceWindow) => {
    const end = timestamp(w);
    // Suunto may flush the final summaries after the explicit Stop. Require
    // the final sport summary and Move summary in that same timestamped batch.
    const terminal =
      sameSport(last, w.Window.ActivityId) &&
      windows.filter(v => v.Window.Type === 'Activity' && timestamp(v) === end && sameSport(last, v.Window.ActivityId))
        .length === 1 &&
      windows.filter(v => v.Window.Type === 'Move' && timestamp(v) === end).length === 1;
    return terminal ? stop : end <= stop ? end : NaN;
  };
  const sorted = lapWindows
    .map(w => ({ w, end: effectiveEnd(w) }))
    .filter(v => Number.isFinite(v.end) && v.end > first)
    .sort((a, b) => a.end - b.end);
  const used = new Set<LapBoundary>();
  const cursors = new Map<string, number>();
  const result: SuuntoLapSource[] = [];
  for (const { w, end } of sorted) {
    const peers = sorted.filter(v => v.end === end && v.w.Window.Type === w.Window.Type);
    if (peers.length !== 1) continue;
    const owner = ownerAt(end);
    if (!owner) continue;
    const id = w.Window.ActivityId;
    const global = id === undefined || id === null || String(id) === '2';
    if (!global && !sameSport(owner, id)) continue;
    const matches = boundaries.filter(b => b.end === end && matchesKind(b, w));
    if (matches.length > 1) continue;
    const boundary = matches[0];
    // A global window without a lap marker cannot establish an interval.
    if (global && !boundary) continue;
    let type: LapTypes | undefined = boundary?.type;
    // Manual and automatic counters can both flush at Stop. Keep their own
    // starts/types rather than collapsing both summaries into one Stop lap.
    if (type === LapTypes.Stop && sorted.some(v => v.end === end && v.w.Window.Type !== w.Window.Type)) {
      type = undefined;
    }
    if (!type) {
      const triggers = new Set(
        boundaries
          .filter(
            b =>
              (global || b.end > +owner.startDate) &&
              b.end <= +owner.endDate &&
              b.type !== LapTypes.Stop &&
              matchesKind(b, w)
          )
          .map(b => b.type)
      );
      // A concurrent manual summary does not identify which automatic counter
      // owns this remainder. The generic fallback is only for absent evidence.
      if (triggers.size > 1) continue;
      type = triggers.size === 1 ? [...triggers][0] : w.Window.Type === 'Lap' ? LapTypes.Manual : LapTypes.AutoLap;
    }
    // Stop is the endpoint trigger, not a lap counter. A lone final manual
    // summary must not start at a more recent automatic marker (or vice versa).
    let counterType = type;
    if (type === LapTypes.Stop) {
      const counters = new Set(
        boundaries
          .filter(
            b => b.end < end && b.type !== LapTypes.Stop && (global || b.end > +owner.startDate) && matchesKind(b, w)
          )
          .map(b => b.type)
      );
      if (counters.size > 1) continue;
      counterType =
        counters.size === 1 ? [...counters][0] : w.Window.Type === 'Lap' ? LapTypes.Manual : LapTypes.AutoLap;
    }
    const group = `${global ? 'global' : activities.indexOf(owner)}-${counterType}`;
    const earlier = boundaries
      .filter(b => b.end < end && b.type === counterType && (global || b.end > +owner.startDate))
      .slice(-1)[0];
    const start = Math.max(
      cursors.get(group) ?? -Infinity,
      earlier?.end ?? -Infinity,
      global ? first : +owner.startDate
    );
    if (start >= end) continue;
    if (boundary) used.add(boundary);
    cursors.set(group, end);
    result.push({ start, end, type, owner, window: w.Window, recoverTiming: !global || start >= +owner.startDate });
  }
  // Keep unmatched source boundaries, but never attach an unrelated summary.
  // Cross-leg starts remain a representation of the source marker sequence;
  // they are not evidence of an active duration spanning all those sports.
  const previousByType = new Map<LapTypes, number>();
  let previousEnd = first;
  for (const b of boundaries) {
    const start = b.type === LapTypes.Stop ? previousEnd : (previousByType.get(b.type) ?? first);
    previousByType.set(b.type, b.end);
    previousEnd = b.end;
    if (used.has(b)) continue;
    const owner = ownerAt(b.end);
    if (!owner || b.end <= start) continue;
    result.push({ start, end: b.end, type: b.type, owner, recoverTiming: false });
  }
  return result.sort((a, b) => a.end - b.end || a.start - b.start);
}
