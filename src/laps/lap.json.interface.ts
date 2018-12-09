export interface LapJSONInterface {
  id: string,
  startDate: string,
  endDate: string,
  type: string,
  stats: { className: string, value: number }[],
}
