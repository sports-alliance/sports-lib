import {EventImporterSuuntoJSON} from './importer.suunto.json';
import {Event} from '../../../event';
import {ImporterSuuntoDeviceNames} from './importer.suunto.device.names';
import {EventInterface} from '../../../event.interface';
import {ActivityTypes} from '../../../../activities/activity.types';

const suuntoJSON = require('../../../../../samples/suunto/suunto.json');
const suuntoMultiSportJSON = require('../../../../../samples/suunto/multisport.json');


describe('EventImporterSuuntoJSON', () => {

  let event: EventInterface;
  let multiSportEvent: EventInterface;

  beforeEach(() => {
    event = EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(suuntoJSON));
    multiSportEvent = EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(suuntoMultiSportJSON));
  });

  it('should import correctly a suunto multisport json activity', () => {
    expect(multiSportEvent instanceof Event).toBe(true);
  });

  it('should import correctly a suunto json activity', () => {
    expect(event instanceof Event).toBe(true);
  });

  it('should get the device name correctly', () => {
    expect(event.getFirstActivity().creator.name).toBe(ImporterSuuntoDeviceNames.Amsterdam);
  });

  it('should get the activity type correctly', () => {
    expect(event.getFirstActivity().type).toBe(ActivityTypes['Trail Running']);
  });
});
