import { LapTypes } from '../laps/lap.types';
export interface UserMapSettingsInterface {
    showLaps: boolean;
    showArrows: boolean;
    lapTypes: LapTypes[];
    theme: MapThemes;
    mapType: MapTypes;
}
export declare enum MapThemes {
    Normal = "Normal",
    Dark = "Dark",
    Black = "Black",
    Night = "Night",
    Desert = "Desert",
    Tron = "Tron",
    MidnightCommander = "MidnightCommander"
}
export declare enum MapTypes {
    RoadMap = "roadmap",
    Satellite = "satellite",
    Hybrid = "hybrid",
    Terrain = "terrain"
}
