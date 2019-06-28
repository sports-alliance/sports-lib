export interface UserDashboardChartSettingsInterface {
  name: string,
  order: number,
  type: ChartTypes,
  dataType: string,
  valueType: ValueTypes
}

export enum ChartTypes {
  Pie = 'Pie',
  ColumnsHorizontal = 'Columns Horizontal',
  PyramidsVertical = 'Pyramids Vertical',
}

export enum ValueTypes {
  Sum = 'Sum',
  Average = 'Average',
  Maximum = 'Maximum',
  Minimum = 'Minimum',
}
