import { DataInterface } from '../data/data.interface';
import { DataJSONInterface } from '../data/data.json.interface';
import { StatsClassInterface } from './stats.class.interface';

type StatsSource = Pick<StatsClassInterface, 'getStat'>;
type NumericRecordReducer = 'sum' | 'min' | 'max' | 'average' | 'weightedAverage';

export interface NumericRecordAggregation {
  readonly outputKey: string;
  readonly keys: readonly string[];
  readonly reducer: NumericRecordReducer;
  readonly weightKeys?: readonly string[];
  readonly requireCompleteCoverage?: boolean;
}

export class StatsUtilities {
  static serializeStats(stats: Map<string, DataInterface>): DataJSONInterface {
    const statsJSON: DataJSONInterface = {};
    stats.forEach((value: DataInterface) => {
      Object.assign(statsJSON, value.toJSON());
    });
    return statsJSON;
  }

  static getFiniteStatValue(source: StatsSource, statType: string): number | null {
    const value = source.getStat(statType)?.getValue();
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  static getFiniteNumericValue(value: unknown): number | null {
    if (typeof value !== 'number' && typeof value !== 'string') {
      return null;
    }

    if (typeof value === 'string' && value.trim() === '') {
      return null;
    }

    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  static getFiniteNumericRecordValue(source: unknown, keys: readonly string[]): number | null {
    if (!source || typeof source !== 'object') {
      return null;
    }

    const record = source as Record<string, unknown>;
    for (const key of keys) {
      const value = this.getFiniteNumericValue(record[key]);
      if (value !== null) {
        return value;
      }
    }

    return null;
  }

  static aggregateNumericRecords(
    records: readonly unknown[],
    aggregations: readonly NumericRecordAggregation[]
  ): Record<string, number> {
    const sourceRecords = records.filter(record => record && typeof record === 'object');

    return aggregations.reduce<Record<string, number>>((summary, aggregation) => {
      const valuesWithWeights = sourceRecords.reduce<{ value: number; weight: number | null }[]>((accu, record) => {
        const value = this.getFiniteNumericRecordValue(record, aggregation.keys);
        if (value === null) {
          return accu;
        }

        accu.push({
          value,
          weight: aggregation.weightKeys ? this.getFiniteNumericRecordValue(record, aggregation.weightKeys) : null
        });
        return accu;
      }, []);

      if (aggregation.requireCompleteCoverage && valuesWithWeights.length !== sourceRecords.length) {
        return summary;
      }

      const aggregateValue = this.aggregateValues(valuesWithWeights, aggregation.reducer);
      if (aggregateValue !== null) {
        summary[aggregation.outputKey] = aggregateValue;
      }

      return summary;
    }, {});
  }

  static sum(sources: StatsSource[], statType: string): number | null {
    let sum = 0;
    let hasValue = false;

    sources.forEach(source => {
      const value = this.getFiniteStatValue(source, statType);
      if (value === null) {
        return;
      }
      sum += value;
      hasValue = true;
    });

    return hasValue ? sum : null;
  }

  static min(sources: StatsSource[], statType: string): number | null {
    const values = this.getFiniteStatValues(sources, statType);
    return values.length ? Math.min(...values) : null;
  }

  static max(sources: StatsSource[], statType: string): number | null {
    const values = this.getFiniteStatValues(sources, statType);
    return values.length ? Math.max(...values) : null;
  }

  static average(sources: StatsSource[], statType: string): number | null {
    const values = this.getFiniteStatValues(sources, statType);
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  }

  static weightedAverage(sources: StatsSource[], valueStatType: string, weightStatType: string): number | null {
    const valuesWithWeights = sources.reduce<{ value: number; weight: number | null }[]>((accu, source) => {
      const value = this.getFiniteStatValue(source, valueStatType);
      if (value === null) {
        return accu;
      }

      accu.push({
        value,
        weight: this.getFiniteStatValue(source, weightStatType)
      });
      return accu;
    }, []);

    if (!valuesWithWeights.length) {
      return null;
    }

    const canWeight = valuesWithWeights.every(({ weight }) => weight !== null && weight > 0);
    if (!canWeight) {
      return valuesWithWeights.reduce((sum, { value }) => sum + value, 0) / valuesWithWeights.length;
    }

    const totalWeight = valuesWithWeights.reduce((sum, { weight }) => sum + (weight as number), 0);
    return valuesWithWeights.reduce((sum, { value, weight }) => sum + value * (weight as number), 0) / totalWeight;
  }

  private static getFiniteStatValues(sources: StatsSource[], statType: string): number[] {
    return sources.reduce<number[]>((values, source) => {
      const value = this.getFiniteStatValue(source, statType);
      if (value !== null) {
        values.push(value);
      }
      return values;
    }, []);
  }

  private static aggregateValues(
    valuesWithWeights: { value: number; weight: number | null }[],
    reducer: NumericRecordReducer
  ): number | null {
    if (!valuesWithWeights.length) {
      return null;
    }

    const values = valuesWithWeights.map(({ value }) => value);

    switch (reducer) {
      case 'sum':
        return values.reduce((sum, value) => sum + value, 0);
      case 'min':
        return Math.min(...values);
      case 'max':
        return Math.max(...values);
      case 'average':
        return values.reduce((sum, value) => sum + value, 0) / values.length;
      case 'weightedAverage': {
        const canWeight = valuesWithWeights.every(({ weight }) => weight !== null && weight > 0);
        if (!canWeight) {
          return values.reduce((sum, value) => sum + value, 0) / values.length;
        }

        const totalWeight = valuesWithWeights.reduce((sum, { weight }) => sum + (weight as number), 0);
        return valuesWithWeights.reduce((sum, { value, weight }) => sum + value * (weight as number), 0) / totalWeight;
      }
    }
  }
}
