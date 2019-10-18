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
  PyramidsVertical = 'Pyramids Vertical',
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
