/** Decode the FIT session/lap balance100 summary, without changing record-level balance.
 * Some exports put record-format whole percentages in this hundredths field. If scoped records support
 * that alternative but exclude the canonical value, retain the existing stream fallback;
 * never guess a replacement scale. Genuine fractional and 0/100 percent summaries remain valid.
 */
export function getFitSummaryPowerBalance(summary: any): { left: number; right: number } | null {
  const balance = summary?.left_right_balance;
  if (!balance || !Number.isInteger(balance.value) || balance.value < 0 || balance.value > 10000 ||
    typeof balance.right !== 'boolean') return null;
  const percent = balance.value / 100;
  const left = balance.right ? (10000 - balance.value) / 100 : percent;

  const recordPercent = balance.value & 0x7f;
  if (balance.value > 0 && balance.value <= 0xff && recordPercent <= 100) {
    let min = Infinity, max = -Infinity;
    for (const records of [summary.records ?? [], ...(summary.laps ?? []).map((lap: any) => lap.records ?? [])]) {
      for (const record of records) {
        const b = record.left_right_balance;
        if (!b || !Number.isInteger(b.value) || b.value < 0 || b.value > 100 || typeof b.right !== 'boolean') continue;
        const value = b.right ? 100 - b.value : b.value;
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    }
    // Incorrect exports may retain either the summary side flag or the record's 0x80 flag.
    const unscaledLeft = balance.right || (balance.value & 0x80) !== 0 ? 100 - recordPercent : recordPercent;
    if ((left < min || left > max) && unscaledLeft >= min && unscaledLeft <= max) return null;
  }
  return { left, right: balance.right ? percent : (10000 - balance.value) / 100 };
}
