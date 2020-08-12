import { LapTypes } from '../../laps/lap.types';

export interface UserMapSettingsInterface {
  showLaps: boolean,
  showArrows: boolean,
  showPoints: boolean;
  strokeWidth: number,
  lapTypes: LapTypes[],
  theme: MapThemes,
  mapType: MapTypes,
}


export enum MapThemes {
  Normal = 'Normal',
  Dark = 'Dark',
  Black = 'Black',
  Night = 'Night',
  Desert = 'Desert',
  MidnightCommander = 'MidnightCommander',
  Retro = 'Retro',
  'Black&White' = 'Black&White',
  'Bright&Bubbly' = 'Bright&Bubbly',
  Hopper = 'Hopper',
  DarkElectric = 'DarkElectric',
  Mondrian = 'Mondrian',
}

export enum MapTypes {
  RoadMap = 'roadmap',
  Satellite = 'satellite',
  Hybrid = 'hybrid',
  Terrain = 'terrain',
}
