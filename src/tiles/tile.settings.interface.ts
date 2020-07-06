import { MapThemes, MapTypes } from '../users/settings/user.map.settings.interface';
import { DateRanges } from '../users/settings/dashboard/user.dashboard.settings.interface';

export interface TileSettingsInterface {
  name: string,
  order: number,
  type: TileTypes,
  size: { columns: number, rows: number }
}

export interface TileChartSettingsInterface extends TileSettingsInterface {
  chartType: ChartTypes,
  dataType: string,
  dataValueType: ChartDataValueTypes,
  dateGroup: DateGroups,
  dataCategoryType: ChartDataCategoryTypes,
  filterLowValues: boolean,
}

export interface TileMapSettingsInterface extends TileSettingsInterface {
  mapType: MapTypes;
  mapTheme: MapThemes;
  showHeatMap: boolean;
  clusterMarkers: boolean;
}

export enum TileTypes {
  Chart = 'Chart',
  Map = 'Map',
}


export enum ChartTypes {
  Pie = 'Pie',
  ColumnsHorizontal = 'Columns Horizontal',
  ColumnsVertical = 'Columns Vertical',
  PyramidsVertical = 'Pyramids Vertical',
  LinesHorizontal = 'Lines Horizontal',
  LinesVertical = 'Lines Vertical',
  Spiral = 'Spiral',
}

export enum ChartDataValueTypes {
  Total = 'Total',
  Average = 'Average',
  Maximum = 'Maximum',
  Minimum = 'Minimum',
}

export enum ChartDataCategoryTypes {
  ActivityType = 'Activity Type',
  DateType = 'Date Type',
}

export enum DateGroups {
  Hour,
  Day,
  Week,
  BiWeek,
  Month,
  Quarter,
  Semester,
  Year,
}
