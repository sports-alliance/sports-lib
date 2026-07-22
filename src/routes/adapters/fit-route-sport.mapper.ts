import { ActivityTypes, ActivityTypesHelper } from '../../activities/activity.types';

export interface FITRouteSport {
  sport: number;
  subSport?: number;
}

const FIT_SPORTS: Record<string, number> = {
  generic: 0,
  running: 1,
  cycling: 2,
  transition: 3,
  fitnessequipment: 4,
  swimming: 5,
  basketball: 6,
  soccer: 7,
  tennis: 8,
  americanfootball: 9,
  training: 10,
  walking: 11,
  crosscountryskiing: 12,
  alpineskiing: 13,
  snowboarding: 14,
  rowing: 15,
  mountaineering: 16,
  hiking: 17,
  multisport: 18,
  paddling: 19,
  flying: 20,
  ebiking: 21,
  motorcycling: 22,
  boating: 23,
  driving: 24,
  golf: 25,
  hanggliding: 26,
  horsebackriding: 27,
  hunting: 28,
  fishing: 29,
  inlineskating: 30,
  rockclimbing: 31,
  sailing: 32,
  iceskating: 33,
  skydiving: 34,
  snowshoeing: 35,
  snowmobiling: 36,
  standuppaddleboarding: 37,
  surfing: 38,
  wakeboarding: 39,
  waterskiing: 40,
  kayaking: 41,
  rafting: 42,
  windsurfing: 43,
  kitesurfing: 44,
  tactical: 45,
  jumpmaster: 46,
  boxing: 47,
  floorclimbing: 48,
  baseball: 49,
  diving: 53,
  hiit: 62,
  cricket: 71,
  rugby: 72,
  hockey: 73,
  volleyball: 75,
  snorkeling: 82
};

const FIT_SUB_SPORTS: Record<string, number> = {
  treadmill: 1,
  trail: 3,
  indoorcycling: 6,
  mountain: 8,
  downhill: 9,
  indoorrowing: 14,
  lapswimming: 17,
  openwater: 18,
  flexibilitytraining: 19,
  strengthtraining: 20,
  exercise: 23,
  cardiotraining: 26,
  backcountry: 37,
  yoga: 43,
  pilates: 44,
  indoorrunning: 45,
  virtualactivity: 58
};

const ACTIVITY_MAPPINGS: Record<string, FITRouteSport> = {
  unknownsport: { sport: FIT_SPORTS.generic },
  other: { sport: FIT_SPORTS.generic },
  generic: { sport: FIT_SPORTS.generic },
  hiit: { sport: FIT_SPORTS.hiit },
  transition: { sport: FIT_SPORTS.transition },
  fitnessequipment: { sport: FIT_SPORTS.fitnessequipment },
  multisport: { sport: FIT_SPORTS.multisport },
  treadmill: { sport: FIT_SPORTS.running, subSport: FIT_SUB_SPORTS.treadmill },
  virtualrunning: { sport: FIT_SPORTS.running, subSport: FIT_SUB_SPORTS.virtualactivity },
  running: { sport: FIT_SPORTS.running },
  trailrunning: { sport: FIT_SPORTS.running, subSport: FIT_SUB_SPORTS.trail },
  indoorrunning: { sport: FIT_SPORTS.running, subSport: FIT_SUB_SPORTS.indoorrunning },
  cycling: { sport: FIT_SPORTS.cycling },
  indoorcycling: { sport: FIT_SPORTS.cycling, subSport: FIT_SUB_SPORTS.indoorcycling },
  virtualcycling: { sport: FIT_SPORTS.cycling, subSport: FIT_SUB_SPORTS.virtualactivity },
  ebiking: { sport: FIT_SPORTS.ebiking },
  mountainbiking: { sport: FIT_SPORTS.cycling, subSport: FIT_SUB_SPORTS.mountain },
  enduromtb: { sport: FIT_SPORTS.cycling, subSport: FIT_SUB_SPORTS.mountain },
  downhillcycling: { sport: FIT_SPORTS.cycling, subSport: FIT_SUB_SPORTS.downhill },
  motorcycling: { sport: FIT_SPORTS.motorcycling },
  boating: { sport: FIT_SPORTS.boating },
  driving: { sport: FIT_SPORTS.driving },
  circuittraining: { sport: FIT_SPORTS.fitnessequipment, subSport: FIT_SUB_SPORTS.exercise },
  swimming: { sport: FIT_SPORTS.swimming, subSport: FIT_SUB_SPORTS.lapswimming },
  openwaterswimming: { sport: FIT_SPORTS.swimming, subSport: FIT_SUB_SPORTS.openwater },
  basketball: { sport: FIT_SPORTS.basketball },
  soccer: { sport: FIT_SPORTS.soccer },
  americanfootball: { sport: FIT_SPORTS.americanfootball },
  skating: { sport: FIT_SPORTS.inlineskating },
  aerobics: { sport: FIT_SPORTS.fitnessequipment, subSport: FIT_SUB_SPORTS.exercise },
  yoga: { sport: FIT_SPORTS.fitnessequipment, subSport: FIT_SUB_SPORTS.yoga },
  pilates: { sport: FIT_SPORTS.fitnessequipment, subSport: FIT_SUB_SPORTS.pilates },
  trekking: { sport: FIT_SPORTS.hiking },
  walking: { sport: FIT_SPORTS.walking },
  sailing: { sport: FIT_SPORTS.sailing },
  kayaking: { sport: FIT_SPORTS.kayaking },
  canoeing: { sport: FIT_SPORTS.paddling },
  rafting: { sport: FIT_SPORTS.rafting },
  rowing: { sport: FIT_SPORTS.rowing },
  indoorrowing: { sport: FIT_SPORTS.rowing, subSport: FIT_SUB_SPORTS.indoorrowing },
  climbing: { sport: FIT_SPORTS.rockclimbing },
  alpineskiing: { sport: FIT_SPORTS.alpineskiing },
  crosscountryskiing: { sport: FIT_SPORTS.crosscountryskiing },
  nordicskiing: { sport: FIT_SPORTS.crosscountryskiing },
  backcountryskiing: { sport: FIT_SPORTS.crosscountryskiing, subSport: FIT_SUB_SPORTS.backcountry },
  skitouring: { sport: FIT_SPORTS.crosscountryskiing },
  telemarkskiing: { sport: FIT_SPORTS.alpineskiing },
  rollerskiing: { sport: FIT_SPORTS.crosscountryskiing },
  snowboarding: { sport: FIT_SPORTS.snowboarding },
  weighttraining: { sport: FIT_SPORTS.fitnessequipment, subSport: FIT_SUB_SPORTS.strengthtraining },
  icehockey: { sport: FIT_SPORTS.hockey },
  volleyball: { sport: FIT_SPORTS.volleyball },
  football: { sport: FIT_SPORTS.americanfootball },
  softball: { sport: FIT_SPORTS.baseball },
  baseball: { sport: FIT_SPORTS.baseball },
  tennis: { sport: FIT_SPORTS.tennis },
  boxing: { sport: FIT_SPORTS.boxing },
  floorball: { sport: FIT_SPORTS.hockey },
  scubadiving: { sport: FIT_SPORTS.diving },
  freediving: { sport: FIT_SPORTS.diving },
  diving: { sport: FIT_SPORTS.diving },
  snorkeling: { sport: FIT_SPORTS.snorkeling },
  golf: { sport: FIT_SPORTS.golf },
  hanggliding: { sport: FIT_SPORTS.hanggliding },
  horsebackriding: { sport: FIT_SPORTS.horsebackriding },
  iceskating: { sport: FIT_SPORTS.iceskating },
  mountaineering: { sport: FIT_SPORTS.mountaineering },
  cricket: { sport: FIT_SPORTS.cricket },
  rugby: { sport: FIT_SPORTS.rugby },
  snowshoeing: { sport: FIT_SPORTS.snowshoeing },
  windsurfing: { sport: FIT_SPORTS.windsurfing },
  paddling: { sport: FIT_SPORTS.paddling },
  flying: { sport: FIT_SPORTS.flying },
  kitesurfing: { sport: FIT_SPORTS.kitesurfing },
  tactical: { sport: FIT_SPORTS.tactical },
  jumpmaster: { sport: FIT_SPORTS.jumpmaster },
  floorclimbing: { sport: FIT_SPORTS.floorclimbing },
  hiking: { sport: FIT_SPORTS.hiking },
  fishing: { sport: FIT_SPORTS.fishing },
  hunting: { sport: FIT_SPORTS.hunting },
  inlineskating: { sport: FIT_SPORTS.inlineskating },
  rockclimbing: { sport: FIT_SPORTS.rockclimbing },
  indoorclimbing: { sport: FIT_SPORTS.rockclimbing },
  bouldering: { sport: FIT_SPORTS.rockclimbing },
  skydiving: { sport: FIT_SPORTS.skydiving },
  snowmobiling: { sport: FIT_SPORTS.snowmobiling },
  standuppaddling: { sport: FIT_SPORTS.standuppaddleboarding },
  surfing: { sport: FIT_SPORTS.surfing },
  wakeboarding: { sport: FIT_SPORTS.wakeboarding },
  waterskiing: { sport: FIT_SPORTS.waterskiing },
  flexibilitytraining: { sport: FIT_SPORTS.fitnessequipment, subSport: FIT_SUB_SPORTS.flexibilitytraining },
  strengthtraining: { sport: FIT_SPORTS.fitnessequipment, subSport: FIT_SUB_SPORTS.strengthtraining },
  training: { sport: FIT_SPORTS.training },
  cardiotraining: { sport: FIT_SPORTS.fitnessequipment, subSport: FIT_SUB_SPORTS.cardiotraining },
  ellipticaltrainer: { sport: FIT_SPORTS.fitnessequipment },
  workout: { sport: FIT_SPORTS.training }
};

/**
 * A FIT sport can have several SportsLib aliases. Keep the import side
 * deterministic by selecting one canonical activity rather than relying on
 * insertion order in ACTIVITY_MAPPINGS.
 */
const FIT_DEFAULT_ACTIVITIES: Record<number, string> = {
  [FIT_SPORTS.generic]: 'generic',
  [FIT_SPORTS.hiit]: 'hiit',
  [FIT_SPORTS.transition]: 'transition',
  [FIT_SPORTS.fitnessequipment]: 'fitnessequipment',
  [FIT_SPORTS.multisport]: 'multisport',
  [FIT_SPORTS.running]: 'running',
  [FIT_SPORTS.cycling]: 'cycling',
  [FIT_SPORTS.ebiking]: 'ebiking',
  [FIT_SPORTS.motorcycling]: 'motorcycling',
  [FIT_SPORTS.boating]: 'boating',
  [FIT_SPORTS.driving]: 'driving',
  [FIT_SPORTS.swimming]: 'swimming',
  [FIT_SPORTS.basketball]: 'basketball',
  [FIT_SPORTS.soccer]: 'soccer',
  [FIT_SPORTS.americanfootball]: 'americanfootball',
  [FIT_SPORTS.tennis]: 'tennis',
  [FIT_SPORTS.training]: 'training',
  [FIT_SPORTS.walking]: 'walking',
  [FIT_SPORTS.crosscountryskiing]: 'crosscountryskiing',
  [FIT_SPORTS.alpineskiing]: 'alpineskiing',
  [FIT_SPORTS.snowboarding]: 'snowboarding',
  [FIT_SPORTS.rowing]: 'rowing',
  [FIT_SPORTS.mountaineering]: 'mountaineering',
  [FIT_SPORTS.hiking]: 'hiking',
  [FIT_SPORTS.paddling]: 'paddling',
  [FIT_SPORTS.flying]: 'flying',
  [FIT_SPORTS.golf]: 'golf',
  [FIT_SPORTS.hanggliding]: 'hanggliding',
  [FIT_SPORTS.horsebackriding]: 'horsebackriding',
  [FIT_SPORTS.hunting]: 'hunting',
  [FIT_SPORTS.fishing]: 'fishing',
  [FIT_SPORTS.inlineskating]: 'inlineskating',
  [FIT_SPORTS.rockclimbing]: 'rockclimbing',
  [FIT_SPORTS.sailing]: 'sailing',
  [FIT_SPORTS.iceskating]: 'iceskating',
  [FIT_SPORTS.skydiving]: 'skydiving',
  [FIT_SPORTS.snowshoeing]: 'snowshoeing',
  [FIT_SPORTS.snowmobiling]: 'snowmobiling',
  [FIT_SPORTS.standuppaddleboarding]: 'standuppaddling',
  [FIT_SPORTS.surfing]: 'surfing',
  [FIT_SPORTS.wakeboarding]: 'wakeboarding',
  [FIT_SPORTS.waterskiing]: 'waterskiing',
  [FIT_SPORTS.kayaking]: 'kayaking',
  [FIT_SPORTS.rafting]: 'rafting',
  [FIT_SPORTS.windsurfing]: 'windsurfing',
  [FIT_SPORTS.kitesurfing]: 'kitesurfing',
  [FIT_SPORTS.tactical]: 'tactical',
  [FIT_SPORTS.jumpmaster]: 'jumpmaster',
  [FIT_SPORTS.boxing]: 'boxing',
  [FIT_SPORTS.floorclimbing]: 'floorclimbing',
  [FIT_SPORTS.baseball]: 'baseball',
  [FIT_SPORTS.diving]: 'diving',
  [FIT_SPORTS.cricket]: 'cricket',
  [FIT_SPORTS.rugby]: 'rugby',
  [FIT_SPORTS.hockey]: 'icehockey',
  [FIT_SPORTS.volleyball]: 'volleyball',
  [FIT_SPORTS.snorkeling]: 'snorkeling'
};

const FIT_SUB_SPORT_ACTIVITIES: Record<string, string> = {
  [`${FIT_SPORTS.running}:${FIT_SUB_SPORTS.treadmill}`]: 'treadmill',
  [`${FIT_SPORTS.running}:${FIT_SUB_SPORTS.trail}`]: 'trailrunning',
  [`${FIT_SPORTS.running}:${FIT_SUB_SPORTS.indoorrunning}`]: 'indoorrunning',
  [`${FIT_SPORTS.running}:${FIT_SUB_SPORTS.virtualactivity}`]: 'virtualrunning',
  [`${FIT_SPORTS.cycling}:${FIT_SUB_SPORTS.indoorcycling}`]: 'indoorcycling',
  [`${FIT_SPORTS.cycling}:${FIT_SUB_SPORTS.mountain}`]: 'mountainbiking',
  [`${FIT_SPORTS.cycling}:${FIT_SUB_SPORTS.downhill}`]: 'downhillcycling',
  [`${FIT_SPORTS.cycling}:${FIT_SUB_SPORTS.virtualactivity}`]: 'virtualcycling',
  [`${FIT_SPORTS.fitnessequipment}:${FIT_SUB_SPORTS.flexibilitytraining}`]: 'flexibilitytraining',
  [`${FIT_SPORTS.fitnessequipment}:${FIT_SUB_SPORTS.strengthtraining}`]: 'weighttraining',
  [`${FIT_SPORTS.fitnessequipment}:${FIT_SUB_SPORTS.exercise}`]: 'circuittraining',
  [`${FIT_SPORTS.fitnessequipment}:${FIT_SUB_SPORTS.cardiotraining}`]: 'cardiotraining',
  [`${FIT_SPORTS.fitnessequipment}:${FIT_SUB_SPORTS.yoga}`]: 'yoga',
  [`${FIT_SPORTS.fitnessequipment}:${FIT_SUB_SPORTS.pilates}`]: 'pilates',
  [`${FIT_SPORTS.swimming}:${FIT_SUB_SPORTS.lapswimming}`]: 'swimming',
  [`${FIT_SPORTS.swimming}:${FIT_SUB_SPORTS.openwater}`]: 'openwaterswimming',
  [`${FIT_SPORTS.rowing}:${FIT_SUB_SPORTS.indoorrowing}`]: 'indoorrowing',
  [`${FIT_SPORTS.crosscountryskiing}:${FIT_SUB_SPORTS.backcountry}`]: 'backcountryskiing'
};

function normalize(value: unknown): string {
  return String(value || '')
    .toLowerCase()
    .replace(/[\s_-]/g, '');
}

function getFitEnumValue(value: unknown, values: Record<string, number>): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value;
  }
  const parsed = Number(value);
  if (typeof value === 'string' && value.trim() && Number.isInteger(parsed)) {
    return parsed;
  }
  return values[normalize(value)] ?? null;
}

export class FITRouteSportMapper {
  static toFIT(activityType: unknown): FITRouteSport {
    const resolved = ActivityTypesHelper.resolveActivityType(activityType);
    return ACTIVITY_MAPPINGS[normalize(resolved || activityType)] || { sport: FIT_SPORTS.generic };
  }

  static fromFIT(sport: unknown, subSport?: unknown): ActivityTypes | null {
    const sportValue = getFitEnumValue(sport, FIT_SPORTS);
    const subSportValue = getFitEnumValue(subSport, FIT_SUB_SPORTS);
    if (sportValue === null) {
      return null;
    }

    const subSportActivity = subSportValue === null ? null : FIT_SUB_SPORT_ACTIVITIES[`${sportValue}:${subSportValue}`];
    return ActivityTypesHelper.resolveActivityType(subSportActivity || FIT_DEFAULT_ACTIVITIES[sportValue]);
  }
}
