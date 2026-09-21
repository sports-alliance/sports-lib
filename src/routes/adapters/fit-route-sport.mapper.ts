import { getFitSportId, getFitSubSportId } from 'fit-file-parser/profile';
import { ActivityTypes, ActivityTypesHelper } from '../../activities/activity.types';

export interface FITRouteSport {
  sport: number;
  subSport?: number;
}

function requireFitId(name: string, resolver: (value: string) => number | null): number {
  const id = resolver(name);
  if (id === null) {
    throw new Error(`Unknown FIT profile name: ${name}`);
  }
  return id;
}

const fitSport = (name: string): number => requireFitId(name, getFitSportId);
const fitSubSport = (name: string): number => requireFitId(name, getFitSubSportId);

const ACTIVITY_MAPPINGS: Record<string, FITRouteSport> = {
  unknownsport: { sport: fitSport('generic') },
  other: { sport: fitSport('generic') },
  generic: { sport: fitSport('generic') },
  hiit: { sport: fitSport('hiit') },
  transition: { sport: fitSport('transition') },
  fitnessequipment: { sport: fitSport('fitnessequipment') },
  multisport: { sport: fitSport('multisport') },
  treadmill: { sport: fitSport('running'), subSport: fitSubSport('treadmill') },
  virtualrunning: { sport: fitSport('running'), subSport: fitSubSport('virtualactivity') },
  running: { sport: fitSport('running') },
  trailrunning: { sport: fitSport('running'), subSport: fitSubSport('trail') },
  indoorrunning: { sport: fitSport('running'), subSport: fitSubSport('indoorrunning') },
  cycling: { sport: fitSport('cycling') },
  indoorcycling: { sport: fitSport('cycling'), subSport: fitSubSport('indoorcycling') },
  virtualcycling: { sport: fitSport('cycling'), subSport: fitSubSport('virtualactivity') },
  ebiking: { sport: fitSport('ebiking') },
  mountainbiking: { sport: fitSport('cycling'), subSport: fitSubSport('mountain') },
  enduromtb: { sport: fitSport('cycling'), subSport: fitSubSport('mountain') },
  downhillcycling: { sport: fitSport('cycling'), subSport: fitSubSport('downhill') },
  motorcycling: { sport: fitSport('motorcycling') },
  boating: { sport: fitSport('boating') },
  driving: { sport: fitSport('driving') },
  circuittraining: { sport: fitSport('fitnessequipment'), subSport: fitSubSport('exercise') },
  swimming: { sport: fitSport('swimming'), subSport: fitSubSport('lapswimming') },
  openwaterswimming: { sport: fitSport('swimming'), subSport: fitSubSport('openwater') },
  basketball: { sport: fitSport('basketball') },
  soccer: { sport: fitSport('soccer') },
  americanfootball: { sport: fitSport('americanfootball') },
  skating: { sport: fitSport('inlineskating') },
  aerobics: { sport: fitSport('fitnessequipment'), subSport: fitSubSport('exercise') },
  yoga: { sport: fitSport('fitnessequipment'), subSport: fitSubSport('yoga') },
  pilates: { sport: fitSport('fitnessequipment'), subSport: fitSubSport('pilates') },
  trekking: { sport: fitSport('hiking') },
  walking: { sport: fitSport('walking') },
  sailing: { sport: fitSport('sailing') },
  kayaking: { sport: fitSport('kayaking') },
  canoeing: { sport: fitSport('paddling') },
  rafting: { sport: fitSport('rafting') },
  rowing: { sport: fitSport('rowing') },
  indoorrowing: { sport: fitSport('rowing'), subSport: fitSubSport('indoorrowing') },
  climbing: { sport: fitSport('rockclimbing') },
  alpineskiing: { sport: fitSport('alpineskiing') },
  crosscountryskiing: { sport: fitSport('crosscountryskiing') },
  nordicskiing: { sport: fitSport('crosscountryskiing') },
  backcountryskiing: { sport: fitSport('crosscountryskiing'), subSport: fitSubSport('backcountry') },
  skitouring: { sport: fitSport('crosscountryskiing') },
  telemarkskiing: { sport: fitSport('alpineskiing') },
  rollerskiing: { sport: fitSport('crosscountryskiing') },
  snowboarding: { sport: fitSport('snowboarding') },
  weighttraining: { sport: fitSport('fitnessequipment'), subSport: fitSubSport('strengthtraining') },
  icehockey: { sport: fitSport('hockey') },
  volleyball: { sport: fitSport('volleyball') },
  football: { sport: fitSport('americanfootball') },
  softball: { sport: fitSport('baseball') },
  baseball: { sport: fitSport('baseball') },
  tennis: { sport: fitSport('tennis') },
  boxing: { sport: fitSport('boxing') },
  floorball: { sport: fitSport('hockey') },
  scubadiving: { sport: fitSport('diving') },
  freediving: { sport: fitSport('diving') },
  diving: { sport: fitSport('diving') },
  snorkeling: { sport: fitSport('snorkeling') },
  golf: { sport: fitSport('golf') },
  hanggliding: { sport: fitSport('hanggliding') },
  horsebackriding: { sport: fitSport('horsebackriding') },
  iceskating: { sport: fitSport('iceskating') },
  mountaineering: { sport: fitSport('mountaineering') },
  cricket: { sport: fitSport('cricket') },
  rugby: { sport: fitSport('rugby') },
  snowshoeing: { sport: fitSport('snowshoeing') },
  windsurfing: { sport: fitSport('windsurfing') },
  paddling: { sport: fitSport('paddling') },
  flying: { sport: fitSport('flying') },
  kitesurfing: { sport: fitSport('kitesurfing') },
  tactical: { sport: fitSport('tactical') },
  jumpmaster: { sport: fitSport('jumpmaster') },
  floorclimbing: { sport: fitSport('floorclimbing') },
  hiking: { sport: fitSport('hiking') },
  fishing: { sport: fitSport('fishing') },
  hunting: { sport: fitSport('hunting') },
  inlineskating: { sport: fitSport('inlineskating') },
  rockclimbing: { sport: fitSport('rockclimbing') },
  indoorclimbing: { sport: fitSport('rockclimbing') },
  bouldering: { sport: fitSport('rockclimbing') },
  skydiving: { sport: fitSport('skydiving') },
  snowmobiling: { sport: fitSport('snowmobiling') },
  standuppaddling: { sport: fitSport('standuppaddleboarding') },
  surfing: { sport: fitSport('surfing') },
  wakeboarding: { sport: fitSport('wakeboarding') },
  waterskiing: { sport: fitSport('waterskiing') },
  flexibilitytraining: { sport: fitSport('fitnessequipment'), subSport: fitSubSport('flexibilitytraining') },
  strengthtraining: { sport: fitSport('fitnessequipment'), subSport: fitSubSport('strengthtraining') },
  training: { sport: fitSport('training') },
  cardiotraining: { sport: fitSport('fitnessequipment'), subSport: fitSubSport('cardiotraining') },
  ellipticaltrainer: { sport: fitSport('fitnessequipment') },
  workout: { sport: fitSport('training') }
};

/**
 * A FIT sport can have several SportsLib aliases. Keep the import side
 * deterministic by selecting one canonical activity rather than relying on
 * insertion order in ACTIVITY_MAPPINGS.
 */
const FIT_DEFAULT_ACTIVITIES: Record<number, string> = {
  [fitSport('generic')]: 'generic',
  [fitSport('hiit')]: 'hiit',
  [fitSport('transition')]: 'transition',
  [fitSport('fitnessequipment')]: 'fitnessequipment',
  [fitSport('multisport')]: 'multisport',
  [fitSport('running')]: 'running',
  [fitSport('cycling')]: 'cycling',
  [fitSport('ebiking')]: 'ebiking',
  [fitSport('motorcycling')]: 'motorcycling',
  [fitSport('boating')]: 'boating',
  [fitSport('driving')]: 'driving',
  [fitSport('swimming')]: 'swimming',
  [fitSport('basketball')]: 'basketball',
  [fitSport('soccer')]: 'soccer',
  [fitSport('americanfootball')]: 'americanfootball',
  [fitSport('tennis')]: 'tennis',
  [fitSport('training')]: 'training',
  [fitSport('walking')]: 'walking',
  [fitSport('crosscountryskiing')]: 'crosscountryskiing',
  [fitSport('alpineskiing')]: 'alpineskiing',
  [fitSport('snowboarding')]: 'snowboarding',
  [fitSport('rowing')]: 'rowing',
  [fitSport('mountaineering')]: 'mountaineering',
  [fitSport('hiking')]: 'hiking',
  [fitSport('paddling')]: 'paddling',
  [fitSport('flying')]: 'flying',
  [fitSport('golf')]: 'golf',
  [fitSport('hanggliding')]: 'hanggliding',
  [fitSport('horsebackriding')]: 'horsebackriding',
  [fitSport('hunting')]: 'hunting',
  [fitSport('fishing')]: 'fishing',
  [fitSport('inlineskating')]: 'inlineskating',
  [fitSport('rockclimbing')]: 'rockclimbing',
  [fitSport('sailing')]: 'sailing',
  [fitSport('iceskating')]: 'iceskating',
  [fitSport('skydiving')]: 'skydiving',
  [fitSport('snowshoeing')]: 'snowshoeing',
  [fitSport('snowmobiling')]: 'snowmobiling',
  [fitSport('standuppaddleboarding')]: 'standuppaddling',
  [fitSport('surfing')]: 'surfing',
  [fitSport('wakeboarding')]: 'wakeboarding',
  [fitSport('waterskiing')]: 'waterskiing',
  [fitSport('kayaking')]: 'kayaking',
  [fitSport('rafting')]: 'rafting',
  [fitSport('windsurfing')]: 'windsurfing',
  [fitSport('kitesurfing')]: 'kitesurfing',
  [fitSport('tactical')]: 'tactical',
  [fitSport('jumpmaster')]: 'jumpmaster',
  [fitSport('boxing')]: 'boxing',
  [fitSport('floorclimbing')]: 'floorclimbing',
  [fitSport('baseball')]: 'baseball',
  [fitSport('diving')]: 'diving',
  [fitSport('cricket')]: 'cricket',
  [fitSport('rugby')]: 'rugby',
  [fitSport('hockey')]: 'icehockey',
  [fitSport('volleyball')]: 'volleyball',
  [fitSport('snorkeling')]: 'snorkeling'
};

const FIT_SUB_SPORT_ACTIVITIES: Record<string, string> = {
  [`${fitSport('running')}:${fitSubSport('treadmill')}`]: 'treadmill',
  [`${fitSport('running')}:${fitSubSport('trail')}`]: 'trailrunning',
  [`${fitSport('running')}:${fitSubSport('indoorrunning')}`]: 'indoorrunning',
  [`${fitSport('running')}:${fitSubSport('virtualactivity')}`]: 'virtualrunning',
  [`${fitSport('cycling')}:${fitSubSport('indoorcycling')}`]: 'indoorcycling',
  [`${fitSport('cycling')}:${fitSubSport('mountain')}`]: 'mountainbiking',
  [`${fitSport('cycling')}:${fitSubSport('downhill')}`]: 'downhillcycling',
  [`${fitSport('cycling')}:${fitSubSport('virtualactivity')}`]: 'virtualcycling',
  [`${fitSport('fitnessequipment')}:${fitSubSport('flexibilitytraining')}`]: 'flexibilitytraining',
  [`${fitSport('fitnessequipment')}:${fitSubSport('strengthtraining')}`]: 'weighttraining',
  [`${fitSport('fitnessequipment')}:${fitSubSport('exercise')}`]: 'circuittraining',
  [`${fitSport('fitnessequipment')}:${fitSubSport('cardiotraining')}`]: 'cardiotraining',
  [`${fitSport('fitnessequipment')}:${fitSubSport('yoga')}`]: 'yoga',
  [`${fitSport('fitnessequipment')}:${fitSubSport('pilates')}`]: 'pilates',
  [`${fitSport('swimming')}:${fitSubSport('lapswimming')}`]: 'swimming',
  [`${fitSport('swimming')}:${fitSubSport('openwater')}`]: 'openwaterswimming',
  [`${fitSport('rowing')}:${fitSubSport('indoorrowing')}`]: 'indoorrowing',
  [`${fitSport('crosscountryskiing')}:${fitSubSport('backcountry')}`]: 'backcountryskiing'
};

function normalize(value: unknown): string {
  return String(value || '')
    .toLowerCase()
    .replace(/[\s_-]/g, '');
}

function getFitEnumValue(value: unknown, resolver: (name: string) => number | null): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value;
  }
  const parsed = Number(value);
  if (typeof value === 'string' && value.trim() && Number.isInteger(parsed)) {
    return parsed;
  }
  return resolver(String(value));
}

export class FITRouteSportMapper {
  static toFIT(activityType: unknown): FITRouteSport {
    const resolved = ActivityTypesHelper.resolveActivityType(activityType);
    return ACTIVITY_MAPPINGS[normalize(resolved || activityType)] || { sport: fitSport('generic') };
  }

  static fromFIT(sport: unknown, subSport?: unknown): ActivityTypes | null {
    const sportValue = getFitEnumValue(sport, getFitSportId);
    const subSportValue = getFitEnumValue(subSport, getFitSubSportId);
    if (sportValue === null) {
      return null;
    }

    const subSportActivity = subSportValue === null ? null : FIT_SUB_SPORT_ACTIVITIES[`${sportValue}:${subSportValue}`];
    return ActivityTypesHelper.resolveActivityType(subSportActivity || FIT_DEFAULT_ACTIVITIES[sportValue]);
  }
}
