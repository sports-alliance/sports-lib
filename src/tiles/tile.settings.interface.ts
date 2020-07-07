import { MapThemes, MapTypes } from '../users/settings/user.map.settings.interface';

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
  dataTimeInterval: TimeIntervals,
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

export declare enum TimeIntervals {
  Auto = 0,
  Hourly = 1,
  Daily = 2,
  Weekly = 3,
  BiWeekly = 4,
  Monthly = 5,
  Quarterly = 6,
  Semesterly = 7,
  Yearly = 8
}
