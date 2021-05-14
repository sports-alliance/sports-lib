import { LapTypes } from '../../laps/lap.types';

export interface UserChartSettingsInterface {
  dataTypeSettings: DataTypeSettings;
  theme: ChartThemes;
  useAnimations: boolean;
  xAxisType: XAxisTypes;
  showAllData: boolean;
  downSamplingLevel: number;
  chartCursorBehaviour: ChartCursorBehaviours;
  strokeWidth: number;
  strokeOpacity: number;
  gainAndLossThreshold: number;
  extraMaxForPower: number;
  extraMaxForPace: number;
  fillOpacity: number;
  lapTypes: LapTypes[];
  showLaps: boolean;
  showGrid: boolean;
  stackYAxes: boolean;
  disableGrouping: boolean;
  hideAllSeriesOnInit: boolean;
}

export enum ChartThemes {
  Charts = 'amcharts',
  ChartsDark = 'amchartsdark',
  DataViz = 'dataviz',
  Frozen = 'frozen',
  Dark = 'dark',
  Kelly = 'kelly',
  Material = 'material',
  MoonriseKingdom = 'moonrisekingdom',
  SpiritedAway = 'spiritedaway'
}

export interface DataTypeSettings {
  [type: string]: { enabled: boolean; strokeColor?: string; fillColor?: number; fillOpacity?: number };
}

export enum XAxisTypes {
  Time = 'Time',
  Duration = 'Duration',
  Distance = 'Distance'
}

export enum ChartCursorBehaviours {
  ZoomX = 'zoomX',
  SelectX = 'selectX'
}
