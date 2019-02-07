import {EventInterface} from "../../../event.interface";
import {EventImporterSuuntoJSON} from "./importer.suunto.json";

const parser = require('fast-xml-parser');

export class EventImporterSuuntoSML {

  static getFromXML(contents: string, name = 'New Event'): Promise<EventInterface> {
    const json = parser.parse(contents).sml;

    //  A few mods here to convert it to compatible json suunto string
    json.DeviceLog.Samples = json.DeviceLog.Samples.Sample;

    // Filter out the old activity type
    json.DeviceLog.Samples = json.DeviceLog.Samples.filter((sample: any) => {
      return !(sample.Events && sample.Events.Activity);
    });

    // Convert the events
    json.DeviceLog.Samples.filter((sample: any) => !!sample.Events).forEach((sample: any) => {
      sample.Events = [sample.Events];
    });

    // Inject start and end sample with event
    json.DeviceLog.Samples.unshift({
      Events: [
        {
          Activity: {ActivityType: json.DeviceLog.Header.ActivityType,}
        }
      ],
      TimeISO8601: (new Date(json.DeviceLog.Header.DateTime)).toISOString()
    });

    // Add the end time
    json.DeviceLog.Header.TimeISO8601 = (new Date(((new Date(json.DeviceLog.Header.DateTime)).getTime() + json.DeviceLog.Header.Duration * 1000))).toISOString();

    // Add the time on the samples
    json.DeviceLog.Samples.filter((sample: any) => !!sample.UTC).forEach((sample: any) => {
      sample.TimeISO8601 = (new Date(sample.UTC)).toISOString()
    });

    // Convert the RR
    if (json.DeviceLog['R-R']) {
      json.DeviceLog['R-R'].Data = json.DeviceLog['R-R'].Data.split(" ").map((dataString: string) => Number(dataString))
    }

    json.DeviceLog.Header.Altitude = json.DeviceLog.Header.Altitude ? [json.DeviceLog.Header.Altitude] : null;
    json.DeviceLog.Header.HR = json.DeviceLog.Header.HR ? [json.DeviceLog.Header.HR] : null;
    json.DeviceLog.Header.Cadence = json.DeviceLog.Header.Cadence ? [json.DeviceLog.Header.Cadence] : null;
    json.DeviceLog.Header.Speed = json.DeviceLog.Header.Speed ? [json.DeviceLog.Header.Speed] : null;
    json.DeviceLog.Header.Power = json.DeviceLog.Header.Power ? [json.DeviceLog.Header.Power] : null;
    json.DeviceLog.Header.Temperature = json.DeviceLog.Header.Temperature ? [json.DeviceLog.Header.Temperature] : null;
    json.DeviceLog.Windows = [];

    // debugger;
    return EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(json));
  }


  static getFromJSONString(jsonString: string): Promise<EventInterface> {
    const json = JSON.parse(jsonString);

    const samples = json.Samples.filter((sample: any) => !!JSON.parse(sample.Attributes)['suunto/sml'].Sample).map((sample: any) => {
      return Object.assign({TimeISO8601: sample.TimeISO8601}, JSON.parse(sample.Attributes)['suunto/sml'].Sample);
    });

    const rr = {
      Data: json.Samples.filter((sample: any) => !!JSON.parse(sample.Attributes)['suunto/sml']['R-R']).map((sample: any) => {
        return JSON.parse(sample.Attributes)['suunto/sml']['R-R'];
      }).reduce((accu: [], rrSample: any) => {
        return accu.concat(rrSample.Data.split(",").map((dataString: string) => Number(dataString)))
      }, [])
    };

    const suuntoJSON = {
      DeviceLog: {
        Header: {},
        Device: {
          Name: 'Suunto unknown',
          Info: {
            HW: 0,
            SW: 0,
            SerialNumber: 0
          }
        },
        Windows: [],
        Samples: samples,
        ['R-R']: rr,
      }
    };
    debugger;
    return EventImporterSuuntoJSON.getFromJSONString(JSON.stringify(suuntoJSON));
  }
}

