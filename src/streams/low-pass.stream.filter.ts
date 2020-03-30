import { StreamFilterInterface } from './stream.filter.interface';
import { LowPassFilter } from '../events/utilities/grade-calculator/low-pass-filter';

export class LowPassStreamFilter implements StreamFilterInterface {
  lowPassFilter = new LowPassFilter(0.2);

  filterData(data: (number | null)[]): (number | null)[] {
    return this.lowPassFilter.smoothArray(data)
  }
}
