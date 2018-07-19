import {Activity} from '../../../activities/activity';
import {Creator} from '../../../creators/creator';
import {ActivityTypes} from '../../../activities/activity.types';
import {EventExporterTCX} from './exporter.tcx';
import {Event} from '../../event';


describe('EventExporterTCX', () => {

  const event = new Event('Test', new Date(0), new Date(200));

  beforeEach(() => {
  });

  it('should export to TCX without crashing on a simple event', async () => {
    const activity = new Activity(new Date(0), new Date(100), ActivityTypes.Running, new Creator('Test'));
    event.addActivity(activity);
    const eventAsString = await EventExporterTCX.getAsString(event);
    expect(eventAsString).toBeTruthy();
  });
});
