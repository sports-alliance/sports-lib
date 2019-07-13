import {LapTypes} from '../laps/lap.types';

export interface UserMapSettingsInterface {
  showLaps: boolean,
  lapTypes: LapTypes[],
  theme: MapThemes,
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
