export interface UserDashboardChartSettingsInterface {
  name: string,
  order: number,
  type: ChartTypes,
  dataType: string,
}

export enum ChartTypes {
  Pie = 'Pie',
  ColumnsHorizontal = 'Columns Horizontal',
  PyramidsVertical = 'Pyramids Vertical',
}
