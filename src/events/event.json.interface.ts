export interface EventJSONInterface {
  name: string,
  startDate: string,
  endDate: string,
  stats: {className: string, value: number}[],
}
