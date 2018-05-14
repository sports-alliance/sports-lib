import {Activity} from '../../../activities/activity';
import {Creator} from '../../../creators/creator';
import {ActivityTypes} from '../../../activities/activity.types';
import {EventExporterTCX} from './exporter.tcx';
import {Event} from '../../event';


describe('EventExporterTCX', () => {

  const event = new Event('Test');
  const eventExporter = new EventExporterTCX();

  beforeEach(() => {
  });

  it('should export to TCX without crashing on a simple event', () => {
    const activity = new Activity(new Date(0), new Date(100), ActivityTypes.Running, new Creator('Test'));
    event.addActivity(activity);
    eventExporter.getAsString(event);
  });
});
