import { CreatorInterface } from './creator.interface';
import { Creator } from './creator';

describe('Creator', () => {
  let creator: CreatorInterface;

  beforeEach(() => {
    creator = new Creator('name');
  });

  it('should export correctly to JSON', () => {
    creator.hwInfo = 'HWInfo';
    creator.swInfo = 'SWInfo';
    creator.serialNumber = 'SerialNumber';
    expect(creator.toJSON()).toEqual({
      name: 'name',
      serialNumber: 'SerialNumber',
      swInfo: 'SWInfo',
      hwInfo: 'HWInfo',
      devices: []
    });
  });
});
