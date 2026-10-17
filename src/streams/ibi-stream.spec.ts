import { IBIStream } from './ibi-stream';
import { EventImporterJSON } from '../events/adapters/importers/json/importer.json';

describe('IBI stream timing', () => {
  it('preserves legacy cumulative timing and JSON shape', () => {
    const stream = new IBIStream([800, 900]);
    expect(stream.getStreamDataByDuration()).toEqual([
      { time: 800, value: 800 },
      { time: 1700, value: 900 }
    ]);
    expect(stream.toJSON()).toEqual({ type: 'IBI', data: [800, 900] });
  });
  it('retains explicit gaps and offsets through a JSON round trip', () => {
    const stream = new IBIStream([800, 900], [800, 5900]);
    const restored = EventImporterJSON.getStreamFromJSON(JSON.parse(JSON.stringify(stream.toJSON())));
    expect(restored.getStreamDataByDuration(100)).toEqual([
      { time: 900, value: 800 },
      { time: 6000, value: 900 }
    ]);
    expect(restored.getStreamDataByTime(new Date(100))).toEqual(restored.getStreamDataByDuration(100));
  });
  it('rejects invalid timing and invalidates it when replacing data', () => {
    expect(() => new IBIStream([800], [])).toThrow();
    expect(() => new IBIStream([800], [NaN])).toThrow();
    expect(() => new IBIStream([800, 900], [1700, 800])).toThrow();
    const times = [800, 5900],
      stream = new IBIStream([800, 900], times);
    times[0] = 999;
    expect(stream.getSampleTimes()).toEqual([800, 5900]);
    stream.setData([1000]);
    expect(stream.getSampleTimes()).toBeNull();
  });
});
