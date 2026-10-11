/** Merge complementary FIT records at the same absolute timestamp before sensor
 * mappers can pad absent fields. The last explicitly supplied value for each
 * field wins, including zero/invalid observations. Source records stay untouched. */
export function coalesceFitRecords(records: any[]): any[] {
  const result: any[] = [];
  const positions = new Map<number, number>();
  for (const record of records) {
    const timestamp = record.timestamp;
    const time = timestamp == null ? NaN : +new Date(timestamp);
    const position = Number.isFinite(time) ? positions.get(time) : undefined;
    if (position === undefined) {
      if (Number.isFinite(time)) positions.set(time, result.length);
      result.push(record);
      continue;
    }
    const merged = { ...result[position] };
    // Native and developer power fields describe the same observation. A later
    // explicit power record keeps its own alias precedence, including invalid
    // readings; it must not inherit an older native value over its developer one.
    const powerFields = ['power', 'Power', 'RP_Power'];
    if (powerFields.some(key => record[key] !== undefined)) {
      for (const key of powerFields) delete merged[key];
    }
    for (const [key, value] of Object.entries(record)) {
      if (value !== undefined) merged[key] = value;
    }
    result[position] = merged;
  }
  return result;
}
