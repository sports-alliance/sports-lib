/**
 * Canonical metric and stream utilities for browser charts and workers.
 *
 * This entry reuses the package-root implementations without importing activity
 * or route file adapters. Keep import/export facades out of this graph: bundlers
 * can otherwise emit unused asynchronous parser chunks for worker consumers.
 * No metric tokens, calculations, units or serialized representations change.
 *
 * @module Metrics
 */
export * from './data';
export * from './activities/activity.types';
export type { ActivityInterface } from './activities/activity.interface';
export { ActivityUtilities } from './events/utilities/activity.utilities';
export * from './events/utilities/helpers';
export * from './laps/lap.types';
export type { LapInterface } from './laps/lap.interface';
export { Stream } from './streams/stream';
export type { StreamInterface } from './streams/stream.interface';
export * from './users/settings/user.unit.settings.interface';
export * from './users/settings/user.chart.settings.interface';
export { ChartDataCategoryTypes } from './tiles/tile.settings.interface';
