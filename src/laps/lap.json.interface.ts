export interface LapJSONInterface {
  startDate: string,
  endDate: string,
  type: string,
  stats: { className: string, value: number }[],
}
