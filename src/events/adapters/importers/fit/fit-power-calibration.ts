const indexValue = (value: any): unknown => typeof value === 'object' && value !== null ? value.value : value;
const positive = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0;

/** Resolve independent, session-scoped FTP, never an estimate from the power stream. */
export function resolveFitFunctionalThresholdPower(file: any, session: any, sessionIndex: number): number | null {
  const sessions = file.sessions ?? [];
  const id = indexValue(session.message_index) ?? sessionIndex;
  if (sessions.filter((row: any, index: number) => (indexValue(row.message_index) ?? index) === id).length > 1) return null;
  const matches = (file.time_in_zone ?? []).filter((row: any) =>
    (row.reference_mesg === 'session' || row.reference_mesg === 18) &&
    (indexValue(row.reference_index) === id || (row.reference_index === undefined && sessions.length === 1)));
  if (matches.length > 1) return null;
  const scoped = [session.threshold_power, matches[0]?.functional_threshold_power].filter(value => value != null);
  if (scoped.some(value => !positive(value)) || new Set(scoped).size > 1) return null;
  const records = file.messages?.zones_target;
  const globals = (Array.isArray(records) && records.length ? records : file.zones_target ? [file.zones_target] : [])
    .map((row: any) => row.functional_threshold_power).filter((value: unknown) => value != null);
  if (new Set(globals).size > 1 || globals.some((value: unknown) => !positive(value) && !(value === 0 && scoped.length))) return null;
  return scoped[0] ?? globals[0] ?? null;
}
