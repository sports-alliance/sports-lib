export interface SwimLengthJSONInterface {
  index: number;
  lapIndex: number | null;
  startDate: number;
  endDate: number;
  type: string;
  stroke: string | null;
  strokes: number | null;
  elapsedTime: number | null;
  timerTime: number | null;
  distance: number | null;
  poolLength: number | null;
  avgSpeed: number | null;
  avgCadence: number | null;
  avgHeartRate: number | null;
  maxHeartRate: number | null;
  swolf: number | null;
  calories: number | null;
}
