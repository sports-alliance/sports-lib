import {EventImporterSuuntoJSON} from './importer.suunto.json';
import {Event} from '../../../event';
import {ImporterSuuntoDeviceNames} from './importer.suunto.device.names';
import {ActivityTypes} from '../../../../activities/activity.types';

const suuntoJSON = require('../../../../../samples/suunto/suunto.json');
const suuntoMultiSportJSON = require('../../../../../samples/suunto/multisport.json');

describe('EventImporterSuuntoJSON', () => {

  it('should import correctly a suunto multisport json activity', async () => {
    const event = await EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(suuntoMultiSportJSON));
    expect(event instanceof Event).toBe(true);
  });

  it('should import correctly a suunto json activity', async () => {
    const event = await EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(suuntoJSON));
    expect(event instanceof Event).toBe(true);
  });

  it('should get the device name correctly', async () => {
    const event =  await EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(suuntoJSON));
    expect(event.getFirstActivity().creator.name).toBe(ImporterSuuntoDeviceNames.Amsterdam);
  });

  it('should get the activity type correctly', async () => {
    const event = await EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(suuntoJSON));
    expect(event.getFirstActivity().type).toBe(ActivityTypes['Trail Running']);
  });
});
