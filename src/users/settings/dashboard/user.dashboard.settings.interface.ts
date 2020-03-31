import { ActivityTypes } from '../../../activities/activity.types';
import { TileSettingsInterface } from '../../../tiles/tile.settings.interface';

export interface UserDashboardSettingsInterface {
  dateRange: DateRanges,
  startDate: number,
  endDate: number,
  tiles: TileSettingsInterface[],
  tableSettings: TableSettings
  activityTypes?: ActivityTypes[],
}

export interface TableSettings {
  eventsPerPage: number,
  active: string,
  direction: 'asc' | 'desc'
}

export enum DateRanges {
  thisWeek,
  lastWeek,
  lastSevenDays,
  thisMonth,
  lastMonth,
  lastThirtyDays,
  thisYear,
  lastYear,
  custom,
  all,
}
