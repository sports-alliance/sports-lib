import {LapTypes} from '../laps/lap.types';

export interface UserMapSettingsInterface {
  showLaps: boolean,
  showArrows: boolean,
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
  MidnightCommander = 'Midnight Commander',
}

export enum MapTypes {
  RoadMap= 'roadmap',
  Satellite= 'satellite',
  Hybrid = 'hybrid',
  Terrain = 'terrain',
}
