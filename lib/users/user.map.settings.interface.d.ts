import { LapTypes } from '../laps/lap.types';
export interface UserMapSettingsInterface {
    lapsToShow: LapTypes[];
    theme: MapThemes;
}
export declare enum MapThemes {
    Normal = "Normal",
    Dark = "Dark",
    Black = "Black",
    Night = "Night",
    Desert = "Desert",
    Tron = "Tron",
    MidnightCommander = "Midnight Commander"
}
