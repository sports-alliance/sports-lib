import { FITCreatorMapper } from './fit-creator.mapper';

describe('FITCreatorMapper Garmin product coverage', () => {
  it.each([
    ['garmin', 4565, 'Garmin Forerunner 970'],
    [1, 4565, 'Garmin Forerunner 970'],
    ['garmin', 4570, 'Garmin Forerunner 570 Large'],
    [1, 4570, 'Garmin Forerunner 570 Large'],
    ['garmin', 4574, 'Garmin Forerunner 570 Small'],
    [1, 4574, 'Garmin Forerunner 570 Small']
  ])('resolves manufacturer %s and product %i as %s', (manufacturer, productId, name) => {
    const creator = FITCreatorMapper.getCreatorFromFitDataObject({
      file_ids: [{ manufacturer, product: productId }]
    });

    expect(creator).toMatchObject({ manufacturer, productId, name, isRecognized: true });
    expect(creator.toJSON()).toMatchObject({ manufacturer, productId, name });
  });

  it('does not apply Garmin product names to another manufacturer', () => {
    const creator = FITCreatorMapper.getCreatorFromFitDataObject({
      file_ids: [{ manufacturer: 'coros', product: 4565, product_name: 'Synthetic watch' }]
    });

    expect(creator.name).toBe('Coros Synthetic watch');
    expect(creator.productId).toBe(4565);
  });
});
