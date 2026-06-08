import type { NumericRecordAggregation } from '../stats/stats.utilities';

export const FIT_DISTANCE_ELEVATION_GRADE_SUMMARY_AGGREGATIONS = [
  {
    outputKey: 'total_distance',
    keys: ['total_distance', 'TotalDistance'],
    reducer: 'sum',
    requireCompleteCoverage: true
  },
  { outputKey: 'total_ascent', keys: ['total_ascent', 'TotalAscent'], reducer: 'sum', requireCompleteCoverage: true },
  {
    outputKey: 'total_descent',
    keys: ['total_descent', 'TotalDescent'],
    reducer: 'sum',
    requireCompleteCoverage: true
  },
  {
    outputKey: 'avg_grade',
    keys: ['avg_grade', 'AvgGrade'],
    reducer: 'weightedAverage',
    weightKeys: ['total_distance', 'TotalDistance'],
    requireCompleteCoverage: true
  },
  {
    outputKey: 'max_pos_grade',
    keys: ['max_pos_grade', 'MaxPositiveGrade'],
    reducer: 'max',
    requireCompleteCoverage: true
  },
  {
    outputKey: 'max_neg_grade',
    keys: ['max_neg_grade', 'MaxNegativeGrade'],
    reducer: 'min',
    requireCompleteCoverage: true
  }
] as const satisfies readonly NumericRecordAggregation[];
