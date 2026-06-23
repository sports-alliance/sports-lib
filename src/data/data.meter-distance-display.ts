export function formatMeterDistanceDisplayValue(value: number): string {
  if (!Number.isFinite(value)) {
    return '';
  }

  if (Math.abs(value) >= 1000) {
    const rounded = Math.round(value);
    const sign = rounded < 0 ? '-' : '';
    const absoluteValueText = `${Math.abs(rounded)}`;
    return `${sign}${absoluteValueText.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  }

  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded)
    ? `${rounded}`
    : rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}
