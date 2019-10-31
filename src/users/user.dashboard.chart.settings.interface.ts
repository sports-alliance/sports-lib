export interface UserDashboardChartSettingsInterface {
  name: string,
  order: number,
  type: ChartTypes,
  dataType: string,
  dataValueType: ChartDataValueTypes,
  dataCategoryType: ChartDataCategoryTypes,
  filterLowValues: boolean,
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
