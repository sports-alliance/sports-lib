export interface UserDashboardChartSettingsInterface {
  name: string,
  order: number,
  type: ChartTypes,
  dataType: string,
  dataValueType: DataValueTypes
}

export enum ChartTypes {
  Pie = 'Pie',
  ColumnsHorizontal = 'Columns Horizontal',
  PyramidsVertical = 'Pyramids Vertical',
}

export enum DataValueTypes {
  Sum = 'Sum',
  Average = 'Average',
  Maximum = 'Maximum',
  Minimum = 'Minimum',
}
