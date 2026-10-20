import * as Metrics from './metrics';
import * as Root from './index';

describe('metrics entry', () => {
  it('re-exports the same canonical implementations as the root', () => {
    for (const name of Object.keys(Metrics)) {
      expect((Metrics as Record<string, unknown>)[name]).toBe((Root as Record<string, unknown>)[name]);
    }
    expect(Metrics.DataStore).toBe(Root.DataStore);
    expect(Metrics.DynamicDataLoader).toBe(Root.DynamicDataLoader);
    expect(Metrics.ActivityUtilities).toBe(Root.ActivityUtilities);
  });

  it('excludes file importers, exporters and the import/export facade', () => {
    expect(Object.keys(Metrics).filter(name => /Importer|Exporter|^SportsLib$/.test(name))).toEqual([]);
  });

  it('retains metric conversion, zero readings and stream gaps', () => {
    const stream = new Metrics.Stream(Metrics.DataSpeed.type, [0, null, 2]);
    const converted = Metrics.ActivityUtilities.createUnitStreamsFromStreams(
      [stream],
      Metrics.ActivityTypes.Running,
      [Metrics.DataSpeedKilometersPerHour.type],
      { includeDerivedTypes: false, includeUnitVariants: true }
    );
    expect(converted.find(value => value.type === Metrics.DataSpeedKilometersPerHour.type)?.getData()).toEqual([
      0,
      null,
      7.2
    ]);
    expect(stream.getData()).toEqual([0, null, 2]);
    expect(new Metrics.DataDistance(1000).toJSON()).toEqual(new Root.DataDistance(1000).toJSON());
  });
});
