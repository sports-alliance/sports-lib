export interface StreamFilterInterface {
  filterData(data: (number | null)[]): (number | null)[];
}
