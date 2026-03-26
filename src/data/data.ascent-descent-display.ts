export interface AscentDescentDisplayOptions {
  locale?: string | null;
  compact?: boolean;
}

function formatWithDotGrouping(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? '-' : '';
  const absoluteValueText = `${Math.abs(rounded)}`;
  return `${sign}${absoluteValueText.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

function formatCompactWithDot(value: number): string {
  const rounded = Math.round(value);
  const absoluteValue = Math.abs(rounded);
  const sign = rounded < 0 ? '-' : '';
  const suffixes: Array<{ threshold: number; suffix: string }> = [
    { threshold: 1_000_000_000, suffix: 'b' },
    { threshold: 1_000_000, suffix: 'm' },
    { threshold: 1_000, suffix: 'k' },
  ];

  for (const { threshold, suffix } of suffixes) {
    if (absoluteValue >= threshold) {
      const compactValue = absoluteValue / threshold;
      const compactText = compactValue % 1 === 0
        ? compactValue.toFixed(0)
        : compactValue.toFixed(1).replace(/\.0$/, '');
      return `${sign}${compactText}${suffix}`;
    }
  }

  return `${rounded}`;
}

export function formatAscentDescentDisplayValue(
  value: number,
  options?: AscentDescentDisplayOptions,
): string {
  if (!Number.isFinite(value)) {
    return '';
  }

  const rounded = Math.round(value);
  if (options?.compact) {
    if (options.locale) {
      return new Intl.NumberFormat(options.locale, {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 1,
      }).format(rounded);
    }
    return formatCompactWithDot(rounded);
  }

  if (options?.locale) {
    return new Intl.NumberFormat(options.locale, {
      useGrouping: true,
      maximumFractionDigits: 0,
    }).format(rounded);
  }

  return formatWithDotGrouping(rounded);
}
