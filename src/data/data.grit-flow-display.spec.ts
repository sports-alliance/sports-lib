import { DataAvgFlow } from './data.avg-flow';
import { DataAvgGrit } from './data.avg-grit';
import { DataFlow } from './data.flow';
import { DataGrit } from './data.grit';
import { DataTotalFlow } from './data.total-flow';
import { DataTotalGrit } from './data.total-grit';

describe('Grit and Flow display formatting', () => {
  it('should format related display values with 2 decimals', () => {
    expect(new DataGrit(7.1).getDisplayValue()).toBe('7.10');
    expect(new DataFlow(3).getDisplayValue()).toBe('3.00');
    expect(new DataAvgGrit(4.567).getDisplayValue()).toBe('4.57');
    expect(new DataAvgFlow(6.123).getDisplayValue()).toBe('6.12');
    expect(new DataTotalGrit(38.4).getDisplayValue()).toBe('38.40');
    expect(new DataTotalFlow(11.236).getDisplayValue()).toBe('11.24');
  });
});
