import {LapTypes} from '../laps/lap.types';

export interface UserMapSettingsInterface {
  showLaps: boolean,
  showArrows: boolean,
  strokeWidth: number,
  lapTypes: LapTypes[],
  theme: MapThemes,
  mapType: MapTypes,
}


export enum MapThemes {
  Normal= 'Normal',
  Dark = 'Dark',
  Black = 'Black',
  Night = 'Night',
  Desert = 'Desert',
  Tron = 'Tron',
  MidnightCommander = 'MidnightCommander',
}

export enum MapTypes {
  RoadMap= 'roadmap',
  Satellite= 'satellite',
  Hybrid = 'hybrid',
  Terrain = 'terrain',
}
