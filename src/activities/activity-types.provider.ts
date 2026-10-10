import type { ActivityTypes } from './activity.types';

/** Provider context for activity/profile aliases with different meanings across sources. */
export type ActivityTypeSource = 'garmin' | 'polar' | 'strava';

interface ProviderActivityTypeMapping {
  source: ActivityTypeSource;
  names: readonly string[];
  type: ActivityTypes;
  fitSport: string;
  fitSubSport: string;
  additionalFitContexts?: readonly { sport: string; subSport: string }[];
}

const normalize = (value: string): string => value.toLowerCase().replace(/[\s_-]/g, '');

// These broad names require their provider's explicit profile or API identifier.
const sourceSpecificNames = new Set(
  [
    'Ski',
    'Skiing',
    'Agility',
    'Aquatics',
    'Core',
    'Esports',
    'Jazz',
    'Latin',
    'Modern',
    'Show',
    'Street',
    'Enduro',
    'Road racing',
    'Riding',
    'Gravel',
    'Ultimate',
    'Roller skating'
  ].map(normalize)
);

// Polar FIT parents follow its AccessLink appendix. An unlisted profile exports GENERIC.
// Other providers list compatible broad parents, not assumed device export codes.
// Keep this independent of FIT numeric enums: decoding remains owned by fit-file-parser.
const mappings: readonly ProviderActivityTypeMapping[] = [
  {
    source: 'garmin',
    names: ['Trail Run'],
    type: 'Trail Running' as ActivityTypes,
    fitSport: 'running',
    fitSubSport: 'trail'
  },
  {
    source: 'garmin',
    names: ['Mixed Session'],
    type: 'Multisport' as ActivityTypes,
    fitSport: 'multisport',
    fitSubSport: 'generic'
  },
  {
    source: 'garmin',
    names: ['Expedition'],
    type: 'Expedition' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'garmin',
    names: ['Backcountry Snowboard'],
    type: 'Backcountry Snowboarding' as ActivityTypes,
    fitSport: 'snowboarding',
    fitSubSport: 'backcountry'
  },
  {
    source: 'garmin',
    names: ['Ski'],
    type: 'Alpine Skiing' as ActivityTypes,
    fitSport: 'alpine_skiing',
    fitSubSport: 'generic'
  },
  {
    source: 'garmin',
    names: ['Snowmobile'],
    type: 'Snowmobiling' as ActivityTypes,
    fitSport: 'snowmobiling',
    fitSubSport: 'generic'
  },
  { source: 'garmin', names: ['Sail'], type: 'Sailing' as ActivityTypes, fitSport: 'sailing', fitSubSport: 'generic' },
  {
    source: 'garmin',
    names: ['Snorkel'],
    type: 'Snorkeling' as ActivityTypes,
    fitSport: 'diving',
    fitSubSport: 'generic'
  },
  {
    source: 'garmin',
    names: ['SUP'],
    type: 'Stand Up Paddling' as ActivityTypes,
    fitSport: 'stand_up_paddleboarding',
    fitSubSport: 'generic'
  },
  {
    source: 'garmin',
    names: ['Soccer/Football'],
    type: 'Soccer' as ActivityTypes,
    fitSport: 'soccer',
    fitSubSport: 'generic'
  },
  {
    source: 'garmin',
    names: ['Motorcycle'],
    type: 'Motorcycling' as ActivityTypes,
    fitSport: 'motorcycling',
    fitSubSport: 'generic'
  },
  {
    source: 'garmin',
    names: ['Breathwork', 'Ex. respiration'],
    type: 'Breathwork' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'breathing',
    additionalFitContexts: [{ sport: 'training', subSport: 'breathing' }]
  },
  {
    source: 'garmin',
    names: ['Track Me'],
    type: 'Generic' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['Australian football'],
    type: 'Australian Football' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['Korfball'],
    type: 'Korfball' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['Netball'],
    type: 'Netball' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['AGILITY', 'Dog agility'],
    type: 'Dog Agility' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['AQUATICS', 'Aqua fitness'],
    type: 'Aqua Fitness' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['BALLET_DANCING', 'Ballet'],
    type: 'Ballet Dancing' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['BALLROOM_DANCING', 'Ballroom'],
    type: 'Ballroom Dancing' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['BEACH_TENNIS', 'Beach tennis'],
    type: 'Beach Tennis' as ActivityTypes,
    fitSport: 'tennis',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['BEACH_VOLLEYBALL', 'Beach volley'],
    type: 'Beach Volleyball' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['BIATHLON', 'Biathlon'],
    type: 'Biathlon' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['BODY_AND_MIND', 'Body&Mind'],
    type: 'Mind-Body Training' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['BOOTCAMP', 'Bootcamp'],
    type: 'Bootcamp' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['CALISTHENICS', 'Calisthenics'],
    type: 'Calisthenics' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['CORE', 'Core'],
    type: 'Core Training' as ActivityTypes,
    fitSport: 'training',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['CROSS_COUNTRY_RUNNING', 'Cross-country running'],
    type: 'Crosscountry Running' as ActivityTypes,
    fitSport: 'running',
    fitSubSport: 'backcountry'
  },
  {
    source: 'polar',
    names: ['CROSS-COUNTRY_SKIING', 'Skiing'],
    type: 'Crosscountry Skiing' as ActivityTypes,
    fitSport: 'cross_country_skiing',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['CROSS_TRAINER', 'Cross-trainer'],
    type: 'Crosstrainer' as ActivityTypes,
    fitSport: 'training',
    fitSubSport: 'indoor_running'
  },
  {
    source: 'polar',
    names: ['STRETCHING', 'Stretching'],
    type: 'Stretching' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'flexibility_training'
  },
  {
    source: 'polar',
    names: ['CURLING', 'Curling'],
    type: 'Curling' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['DUATHLON_CYCLING', 'Cycling', '(Duathlon) Cycling'],
    type: 'Cycling' as ActivityTypes,
    fitSport: 'cycling',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['DUATHLON_RUNNING', 'Running', '(Duathlon) Running'],
    type: 'Running' as ActivityTypes,
    fitSport: 'running',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['E_BIKE', 'Electric biking'],
    type: 'E-Biking' as ActivityTypes,
    fitSport: 'e_biking',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['ESPORTS', 'Esports'],
    type: 'Video Gaming' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['FINNISH_BASEBALL', 'Finnish baseball'],
    type: 'Finnish Baseball' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['FITNESS_BOXING', 'Fitness boxing'],
    type: 'Fitness Boxing' as ActivityTypes,
    fitSport: 'boxing',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['FITNESS_DANCING', 'Fitness dancing'],
    type: 'Fitness Dancing' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['FITNESS_MARTIAL_ARTS', 'Fitness martial arts'],
    type: 'Fitness Martial Arts' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['FITNESS_RACING', 'Fitness Racing'],
    type: 'Fitness Racing' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['FITNESS_STEP', 'Step workout'],
    type: 'Step Training' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['FREE_MULTISPORT', 'Multisport'],
    type: 'Multisport' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['FUNCTIONAL_TRAINING', 'Functional training'],
    type: 'Functional Training' as ActivityTypes,
    fitSport: 'training',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['FUTSAL', 'Futsal'],
    type: 'Futsal' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['GRAVEL', 'Gravel cycling'],
    type: 'Gravel Cycling' as ActivityTypes,
    fitSport: 'cycling',
    fitSubSport: 'gravel_cycling'
  },
  {
    source: 'polar',
    names: ['GROUP_EXERCISE', 'Group exercise'],
    type: 'Indoor Training' as ActivityTypes,
    fitSport: 'training',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['GYMNASTICK', 'Gymnastics'],
    type: 'Gymnastics' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['HIIT', 'High-intensity interval training'],
    type: 'HIIT' as ActivityTypes,
    fitSport: 'training',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['JAZZ_DANCING', 'Jazz'],
    type: 'Jazz Dancing' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['JOGGING', 'Jogging'],
    type: 'Running' as ActivityTypes,
    fitSport: 'running',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['JUDO_MARTIAL_ARTS', 'Judo'],
    type: 'Judo' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['JUMP_ROPE', 'Rope skipping'],
    type: 'Jump Rope' as ActivityTypes,
    fitSport: 'jump_rope',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['KICKBIKE', 'Kickbiking'],
    type: 'Kickbiking' as ActivityTypes,
    fitSport: 'cycling',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['KICKBOXING_MARTIAL_ARTS', 'Kickboxing'],
    type: 'Kickboxing' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['LATIN_DANCING', 'Latin'],
    type: 'Latin Dancing' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['LES_MILLS_BARRE', 'LES MILLS BARRE'],
    type: 'LES MILLS BARRE' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['LES_MILLS_BODYATTACK', 'LES MILLS BODYATTACK'],
    type: 'LES MILLS BODYATTACK' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['LES_MILLS_BODYBALANCE', 'LES MILLS BODYBALANCE'],
    type: 'LES MILLS BODYBALANCE' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['LES_MILLS_BODYCOMBAT', 'LES MILLS BODYCOMBAT'],
    type: 'LES MILLS BODYCOMBAT' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['LES_MILLS_BODYJAM', 'LES MILLS BODYJAM'],
    type: 'LES MILLS BODYJAM' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['LES_MILLS_BODYPUMP', 'LES MILLS BODYPUMP'],
    type: 'LES MILLS BODYPUMP' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['LES_MILLS_BODYSTEP', 'LES MILLS BODYSTEP'],
    type: 'LES MILLS BODYSTEP' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['LES_MILLS_CXWORKS', 'LES MILLS CXWORX', 'LES MILLS CORE'],
    type: 'LES MILLS CORE' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['LES_MILLS_GRIT_ATHLETIC', 'LES MILLS GRIT Athletic'],
    type: 'LES MILLS GRIT Athletic' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['LES_MILLS_GRIT_CARDIO', 'LES MILLS GRIT Cardio'],
    type: 'LES MILLS GRIT Cardio' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['LES_MILLS_GRIT_STRENGTH', 'LES MILLS GRIT Strength'],
    type: 'LES MILLS GRIT Strength' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['LES_MILLS_RPM', 'LES MILLS RPM'],
    type: 'LES MILLS RPM' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['LES_MILLS_SHBAM', "LES MILLS SH'BAM"],
    type: "LES MILLS SH'BAM" as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['LES_MILLS_SPRINT', 'LES MILLS SPRINT'],
    type: 'LES MILLS SPRINT' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['LES_MILLS_TONE', 'LES MILLS TONE'],
    type: 'LES MILLS TONE' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['LES_MILLS_TRIP', 'LES MILLS TRIP', 'LES MILLS THE TRIP'],
    type: 'LES MILLS THE TRIP' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['MOBILITY_DYNAMIC', 'Mobility (dynamic)'],
    type: 'Dynamic Mobility' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'flexibility_training'
  },
  {
    source: 'polar',
    names: ['MOBILITY_STATIC', 'Mobility (static)'],
    type: 'Static Mobility' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'flexibility_training'
  },
  {
    source: 'polar',
    names: ['MODERN_DANCING', 'Modern'],
    type: 'Modern Dancing' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['MOTORSPORTS_CAR_RACING', 'Car racing'],
    type: 'Car Racing' as ActivityTypes,
    fitSport: 'driving',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['MOTORSPORTS_ENDURO', 'Enduro'],
    type: 'Motorcycle Enduro' as ActivityTypes,
    fitSport: 'motorcycling',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['MOTORSPORTS_HARD_ENDURO', 'Hard Enduro'],
    type: 'Hard Enduro' as ActivityTypes,
    fitSport: 'motorcycling',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['MOTORSPORTS_MOTOCROSS', 'Motocorss'],
    type: 'Motocross' as ActivityTypes,
    fitSport: 'motorcycling',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['MOTORSPORTS_ROADRACING', 'Road racing'],
    type: 'Car Racing' as ActivityTypes,
    fitSport: 'driving',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['MOTORSPORTS_SNOCROSS', 'Snocross'],
    type: 'Snocross' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['OBSTACLE_COURSE_RACING', 'Obstacle course racing'],
    type: 'Obstacle Racing' as ActivityTypes,
    fitSport: 'running',
    fitSubSport: 'obstacle'
  },
  {
    source: 'polar',
    names: ['OFFROADDUATHLON', 'Off-road duathlon'],
    type: 'Offroad Duathlon' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['OFFROADDUATHLON_CYCLING', 'Mountain biking', '(Off-road duathlon) Mountain biking'],
    type: 'Mountain Biking' as ActivityTypes,
    fitSport: 'cycling',
    fitSubSport: 'backcountry'
  },
  {
    source: 'polar',
    names: ['OFFROADDUATHLON_RUNNING', 'Trail running', '(Off-road duathlon) Trail running'],
    type: 'Trail Running' as ActivityTypes,
    fitSport: 'running',
    fitSubSport: 'backcountry'
  },
  {
    source: 'polar',
    names: ['OFFROADTRIATHLON', 'Off-road triathlon'],
    type: 'Offroad Triathlon' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['OFFROADTRIATHLON_CYCLING', 'Mountain biking', '(Off-road triathlon) Mountain biking'],
    type: 'Mountain Biking' as ActivityTypes,
    fitSport: 'cycling',
    fitSubSport: 'backcountry'
  },
  {
    source: 'polar',
    names: ['OFFROADTRIATHLON_RUNNING', 'Trail running', '(Off-road triathlon) Trail running'],
    type: 'Trail Running' as ActivityTypes,
    fitSport: 'running',
    fitSubSport: 'backcountry'
  },
  {
    source: 'polar',
    names: ['OFFROADTRIATHLON_SWIMMING', 'Open water swimming', '(Off-road triathlon) Open water swimming'],
    type: 'Open Water Swimming' as ActivityTypes,
    fitSport: 'swimming',
    fitSubSport: 'backcountry'
  },
  {
    source: 'polar',
    names: ['ORIENTEERING_MTB', 'Mountain bike orienteering'],
    type: 'Mountain Bike Orienteering' as ActivityTypes,
    fitSport: 'cycling',
    fitSubSport: 'backcountry'
  },
  {
    source: 'polar',
    names: ['ORIENTEERING_SKI', 'Ski orienteering'],
    type: 'Ski Orienteering' as ActivityTypes,
    fitSport: 'cross_country_skiing',
    fitSubSport: 'backcountry'
  },
  {
    source: 'polar',
    names: ['OTHER_INDOOR', 'Other indoor'],
    type: 'Indoor Training' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['OTHER_OUTDOOR', 'Other outdoor'],
    type: 'Other' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['PADEL', 'Padel racing'],
    type: 'Padel' as ActivityTypes,
    fitSport: 'racket',
    fitSubSport: 'padel'
  },
  {
    source: 'polar',
    names: ['PARASPORTS_HAND_CYCLING', 'Handcycling'],
    type: 'Hand Cycle' as ActivityTypes,
    fitSport: 'cycling',
    fitSubSport: 'hand_cycling'
  },
  {
    source: 'polar',
    names: ['PARASPORTS_SLED_HOCKEY', 'Sled hockey'],
    type: 'Sled Hockey' as ActivityTypes,
    fitSport: 'hockey',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['PARASPORTS_WATER_SKIING', 'Adaptive water skiing'],
    type: 'Adaptive Water Skiing' as ActivityTypes,
    fitSport: 'water_skiing',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['PARASPORTS_WHEELCHAIR', 'Wheelchair racing'],
    type: 'Wheelchair Racing' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['PARASPORTS_WHEELCHAIR_BASKETBALL', 'Wheelchair basketball'],
    type: 'Wheelchair Basketball' as ActivityTypes,
    fitSport: 'basketball',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['PARASPORTS_WHEELCHAIR_TENNIS', 'Wheelchair tennis'],
    type: 'Wheelchair Tennis' as ActivityTypes,
    fitSport: 'tennis',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['POOL_SWIMMING', 'Pool swimming'],
    type: 'Swimming' as ActivityTypes,
    fitSport: 'swimming',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['RIDING', 'Riding'],
    type: 'Horseback Riding' as ActivityTypes,
    fitSport: 'horseback_riding',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['RINGETTE', 'Ringette'],
    type: 'Ringette' as ActivityTypes,
    fitSport: 'ice_skating',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['ROAD_BIKING', 'Road cycling'],
    type: 'Road Cycling' as ActivityTypes,
    fitSport: 'cycling',
    fitSubSport: 'road'
  },
  {
    source: 'polar',
    names: ['ROAD_RUNNING', 'Road running'],
    type: 'Road Running' as ActivityTypes,
    fitSport: 'running',
    fitSubSport: 'street'
  },
  {
    source: 'polar',
    names: ['ROLLER_BLADING', 'Roller skating'],
    type: 'Inline Skating' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['ROLLER_SKIING_CLASSIC', 'Classic roller skiing'],
    type: 'Classic Roller Skiing' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['ROLLER_SKIING_FREESTYLE', 'Freestyle roller skiing'],
    type: 'Skate Roller Skiing' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['SHOW_DANCING', 'Show'],
    type: 'Show Dancing' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['SHOOTING_SPORT_INDOOR', 'Shooting (indoor)', 'Shooting sport (indoor)'],
    type: 'Indoor Shooting' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['SHOOTING_SPORT_OUTDOOR', 'Shooting (outdoor)', 'Shooting sport (outdoor)'],
    type: 'Shooting' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['SKATEBOARDING', 'Skateboarding'],
    type: 'Skateboarding' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['SKIERG', 'Ski machine'],
    type: 'Indoor Skiing' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['SNOWSHOE_TREKKING', 'Snowshoe trekking'],
    type: 'Snowshoeing' as ActivityTypes,
    fitSport: 'snowshoeing',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['SPINNING', 'Spinning'],
    type: 'Indoor Cycling' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'indoor_cycling'
  },
  {
    source: 'polar',
    names: ['SUP'],
    type: 'Stand Up Paddling' as ActivityTypes,
    fitSport: 'stand_up_paddleboarding',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['STAIR_WORKOUT', 'Stair workout'],
    type: 'Floor Climbing' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['STREET_DANCING', 'Street'],
    type: 'Street Dancing' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['TAEKWONDO_MARTIAL_ARTS', 'Taekwondo'],
    type: 'Taekwondo' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['TRACK_AND_FIELD_RUNNING', 'Track&field running'],
    type: 'Track Running' as ActivityTypes,
    fitSport: 'running',
    fitSubSport: 'track'
  },
  {
    source: 'polar',
    names: ['TREADMILL_RUNNING', 'Treadmill running'],
    type: 'Treadmill' as ActivityTypes,
    fitSport: 'running',
    fitSubSport: 'treadmill'
  },
  {
    source: 'polar',
    names: ['TRIATHLON_CYCLING', 'Cycling', '(Triathlon) Cycling'],
    type: 'Cycling' as ActivityTypes,
    fitSport: 'cycling',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['TRIATHLON_RUNNING', 'Running', '(Triathlon) Running'],
    type: 'Running' as ActivityTypes,
    fitSport: 'running',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['TRIATHLON_SWIMMING', 'Open water swimming', '(Triathlon) Open water swimming'],
    type: 'Open Water Swimming' as ActivityTypes,
    fitSport: 'swimming',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['TROTTING', 'Trotting'],
    type: 'Trotting' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['ULTIMATE', 'Ultimate'],
    type: 'Ultimate Disc' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['ULTRARUNNING_RUNNING', 'Ultra running'],
    type: 'Ultra Running' as ActivityTypes,
    fitSport: 'running',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['VERTICALSPORTS_WALLCLIMBING', 'Climbing (indoor)'],
    type: 'Indoor Climbing' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['VERTICALSPORTS_OUTCLIMBING', 'Climbing (outdoor)'],
    type: 'Rock Climbing' as ActivityTypes,
    fitSport: 'rock_climbing',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['WATER_EXERCISE', 'Water sports'],
    type: 'Water Sport' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['WATER_RUNNING', 'Water running'],
    type: 'Water Running' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['WATERSPORTS_CANOEING', 'Canoeing'],
    type: 'Canoeing' as ActivityTypes,
    fitSport: 'kayaking',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['WATERSPORTS_KAYAKING', 'Kayaking'],
    type: 'Kayaking' as ActivityTypes,
    fitSport: 'kayaking',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['WATERSPORTS_KITESURFING', 'Kitesurfing'],
    type: 'Kitesurfing' as ActivityTypes,
    fitSport: 'kitesurfing',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['WATERSPORTS_SAILING', 'Sailing'],
    type: 'Sailing' as ActivityTypes,
    fitSport: 'sailing',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['WATERSPORTS_SURFING', 'Surfing'],
    type: 'Surfing' as ActivityTypes,
    fitSport: 'surfing',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['WATERSPORTS_WAKEBOARDING', 'Wakeboarding'],
    type: 'Wakeboarding' as ActivityTypes,
    fitSport: 'wakeboarding',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['WATERSPORTS_WATERSKI', 'Water skiing'],
    type: 'Water Skiing' as ActivityTypes,
    fitSport: 'water_skiing',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['WATERSPORTS_WINDSURFING', 'Windsurfing'],
    type: 'Windsurfing' as ActivityTypes,
    fitSport: 'windsurfing',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['XC_SKIING_CLASSIC', 'Classic XC skiing'],
    type: 'Classic Crosscountry Skiing' as ActivityTypes,
    fitSport: 'cross_country_skiing',
    fitSubSport: 'generic'
  },
  {
    source: 'polar',
    names: ['XC_SKIING_FREESTYLE', 'Freestyle XC skiing'],
    type: 'Skate Skiing' as ActivityTypes,
    fitSport: 'cross_country_skiing',
    fitSubSport: 'generic'
  },
  {
    source: 'strava',
    names: ['HighIntensityIntervalTraining'],
    type: 'HIIT' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'strava',
    names: ['MountainBikeRide'],
    type: 'Mountain Biking' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'strava',
    names: ['PhysicalTherapy'],
    type: 'Physical Therapy' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  { source: 'strava', names: ['Sail'], type: 'Sailing' as ActivityTypes, fitSport: 'sailing', fitSubSport: 'generic' },
  {
    source: 'strava',
    names: ['Skateboard'],
    type: 'Skateboarding' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'strava',
    names: ['TrailRun'],
    type: 'Trail Running' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  },
  {
    source: 'strava',
    names: ['VirtualRow'],
    type: 'Virtual Rowing' as ActivityTypes,
    fitSport: 'generic',
    fitSubSport: 'generic'
  }
];

const bySource = new Map<ActivityTypeSource, Map<string, ProviderActivityTypeMapping[]>>();
const commonAliases = new Map<string, ActivityTypes>();
for (const mapping of mappings) {
  const sourceMap = bySource.get(mapping.source) ?? new Map<string, ProviderActivityTypeMapping[]>();
  bySource.set(mapping.source, sourceMap);
  for (const name of mapping.names) {
    const key = normalize(name);
    const nameMappings = sourceMap.get(key) ?? [];
    nameMappings.push(mapping);
    sourceMap.set(key, nameMappings);
    if (!sourceSpecificNames.has(key)) commonAliases.set(key, mapping.type);
  }
}

/** Uses recorded manufacturer identity, rather than a device name or activity title. */
export function getActivityTypeSourceFromManufacturer(value: unknown): ActivityTypeSource | undefined {
  if (typeof value !== 'string') return undefined;
  switch (normalize(value.trim())) {
    case 'garmin':
    case 'garminfr405antfs':
      return 'garmin';
    case 'polar':
    case 'polarelectro':
      return 'polar';
    case 'strava':
      return 'strava';
    default:
      return undefined;
  }
}

export function resolveProviderActivityType(value: string, source?: ActivityTypeSource): ActivityTypes | null {
  return source ? (bySource.get(source)?.get(normalize(value))?.[0]?.type ?? null) : null;
}

export function resolveCommonActivityTypeAlias(value: string): ActivityTypes | null {
  return commonAliases.get(normalize(value)) ?? null;
}

/** Checks whether a recognized provider profile can refine this broad FIT parent. */
export function isCompatibleProviderFITParent(
  value: string,
  source: ActivityTypeSource | undefined,
  sport: string | null
): boolean {
  if (!source) return false;
  const parent = normalize(sport ?? '');
  return !!bySource
    .get(source)
    ?.get(normalize(value))
    ?.some(
      mapping =>
        parent === normalize(mapping.fitSport) ||
        mapping.additionalFitContexts?.some(context => parent === normalize(context.sport))
    );
}

/** Refines a recognized profile only for compatible FIT context or an unspecified generic pair. */
export function resolveProviderFITProfile(
  value: unknown,
  source: ActivityTypeSource | undefined,
  sport: string | null,
  subSport: string | null
): ActivityTypes | null {
  if (typeof value !== 'string' || !source) return null;
  const nameMappings = bySource.get(source)?.get(normalize(value.trim()));
  if (!nameMappings) return null;
  const parent = normalize(sport ?? '');
  const child = normalize(subSport ?? 'generic');
  const mapping = nameMappings.find(
    candidate =>
      (parent === 'generic' && child === 'generic') ||
      (parent === normalize(candidate.fitSport) && child === normalize(candidate.fitSubSport)) ||
      candidate.additionalFitContexts?.some(
        context => parent === normalize(context.sport) && child === normalize(context.subSport)
      )
  );
  return mapping?.type ?? null;
}
