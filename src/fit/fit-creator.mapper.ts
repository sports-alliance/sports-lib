import { Creator } from '../creators/creator';
import { CreatorInterface } from '../creators/creator.interface';
import { isNumberOrString } from '../events/utilities/helpers';
import { GarminProfileMapper } from './garmin-profile.mapper';
import { ImporterFitAntPlusDeviceNames } from './device-names/importer.fit.ant-plus.device.names';
import { ImporterFitCorosDeviceNames } from './device-names/importer.fit.coros.device.names';
import { ImporterFitDevelopmentDeviceNames } from './device-names/importer.fit.development.device.names';
import { ImporterFitHammerheadDeviceNames } from './device-names/importer.fit.hammerhead.device.names';
import { ImporterFitLezyneDeviceNames } from './device-names/importer.fit.lezyne.device.names';
import { ImporterFitMagellanDeviceNames } from './device-names/importer.fit.magellan.device.names';
import { ImporterFitSarisDeviceNames } from './device-names/importer.fit.saris.device.names';
import { ImporterFitSrmDeviceNames } from './device-names/importer.fit.srm.device.names';
import { ImporterFitSuuntoDeviceNames } from './device-names/importer.fit.suunto.device.names';
import { ImporterFitWahooDeviceNames } from './device-names/importer.fit.wahoo.device.names';

export class FITCreatorMapper {
  static getCreatorFromFitDataObject(fitDataObject: any): CreatorInterface {
    const fileId = fitDataObject?.file_ids?.[0] || {};
    const fileCreator = fitDataObject?.file_creator || {};
    const creatorDeviceInfo = this.getCreatorDeviceInfo(fitDataObject);
    const creatorIdentityDeviceInfo = this.isCompatibleCreatorIdentity(fileId, creatorDeviceInfo)
      ? creatorDeviceInfo
      : null;
    const deviceInfo = creatorDeviceInfo || fitDataObject?.device_info || {};
    const manufacturer = fileId.manufacturer ?? creatorIdentityDeviceInfo?.manufacturer;
    const productId = fileId.product ?? creatorIdentityDeviceInfo?.product ?? null;
    let productName = fileId.product_name || creatorIdentityDeviceInfo?.product_name || null;
    let recognizedName = null;
    let creator: CreatorInterface;

    switch (manufacturer) {
      case 'antplus': {
        recognizedName = ImporterFitAntPlusDeviceNames[productId];
        creator = new Creator(this.formatDeviceName(manufacturer, productName, recognizedName, 'ANT+'), productId);
        break;
      }
      case 'suunto': {
        recognizedName = ImporterFitSuuntoDeviceNames[<number>productId];
        creator = new Creator(this.formatDeviceName(manufacturer, productName, recognizedName, 'Suunto'), productId);
        break;
      }
      case 'coros': {
        recognizedName = ImporterFitCorosDeviceNames[productId];
        creator = new Creator(this.formatDeviceName(manufacturer, productName, recognizedName, 'Coros'), productId);
        break;
      }
      case 'garmin': {
        recognizedName = GarminProfileMapper.getDeviceName(productId);
        creator = new Creator(this.formatDeviceName(manufacturer, productName, recognizedName, 'Garmin'), productId);
        break;
      }
      case 'wahoo_fitness': {
        recognizedName = ImporterFitWahooDeviceNames[productId];
        creator = new Creator(this.formatDeviceName(manufacturer, productName, recognizedName, 'Wahoo'), productId);
        break;
      }
      case 'hammerhead': {
        recognizedName = ImporterFitHammerheadDeviceNames[productId];
        creator = new Creator(
          this.formatDeviceName(manufacturer, productName, recognizedName, 'Hammerhead'),
          productId
        );
        break;
      }
      case 'lezyne': {
        recognizedName = ImporterFitLezyneDeviceNames[productId];
        creator = new Creator(this.formatDeviceName(manufacturer, productName, recognizedName, 'Lezyne'), productId);
        break;
      }
      case 'magellan': {
        recognizedName = ImporterFitMagellanDeviceNames[productId];
        creator = new Creator(this.formatDeviceName(manufacturer, productName, recognizedName, 'Magellan'), productId);
        break;
      }
      case 'saris': {
        recognizedName = ImporterFitSarisDeviceNames[productId];
        creator = new Creator(this.formatDeviceName(manufacturer, productName, recognizedName, 'Saris'), productId);
        break;
      }
      case 'srm': {
        recognizedName = ImporterFitSrmDeviceNames[productId];
        creator = new Creator(this.formatDeviceName(manufacturer, productName, recognizedName, 'SRM'), productId);
        break;
      }
      case 'zwift': {
        recognizedName = 'Zwift';
        creator = new Creator(recognizedName);
        break;
      }
      case 'virtualtraining': {
        recognizedName = 'Rouvy';
        creator = new Creator(recognizedName);
        break;
      }
      case 'the_sufferfest': {
        recognizedName = `Wahoo SYSTM`;
        creator = new Creator(recognizedName, productId);
        break;
      }
      case 'stryd': {
        recognizedName = `Stryd`;
        creator = new Creator(
          recognizedName,
          productId,
          fileCreator.software_version,
          fileCreator.hardware_version,
          fileId.serial_number
        );
        break;
      }
      case 'development': {
        recognizedName = ImporterFitDevelopmentDeviceNames[productId];
        creator = new Creator(this.formatDeviceName(manufacturer, productName, recognizedName, null, true), productId);
        creator.isRecognized = typeof recognizedName === 'string' || recognizedName === null;
        break;
      }
      default: {
        const manufacturerName =
          typeof manufacturer === 'number' ? GarminProfileMapper.getManufacturerName(manufacturer) : manufacturer;
        if (manufacturerName === 'garmin') {
          recognizedName = GarminProfileMapper.getDeviceName(productId);
        }
        productName = fileId.product_name || creatorIdentityDeviceInfo?.product_name || null;
        creator = new Creator(
          this.formatDeviceName(
            manufacturerName,
            productName,
            recognizedName,
            manufacturerName === 'garmin' ? 'Garmin' : null
          ),
          productId
        );
      }
    }

    creator.manufacturer = manufacturer;
    creator.isRecognized = creator.isRecognized || !!recognizedName;

    if (isNumberOrString(fileCreator.hardware_version)) {
      creator.hwInfo = String(fileCreator.hardware_version);
    } else if (isNumberOrString(creatorDeviceInfo?.hardware_version)) {
      creator.hwInfo = String(creatorDeviceInfo.hardware_version);
    }
    if (isNumberOrString(fileCreator.software_version)) {
      creator.swInfo = String(fileCreator.software_version);
    } else if (isNumberOrString(deviceInfo.software_version)) {
      creator.swInfo = String(deviceInfo.software_version);
    }
    if (isNumberOrString(fileId.serial_number)) {
      creator.serialNumber = fileId.serial_number;
    } else if (isNumberOrString(creatorIdentityDeviceInfo?.serial_number)) {
      creator.serialNumber = String(creatorIdentityDeviceInfo.serial_number);
    }

    if (Number.isFinite(creator.name) || creator.name.match(/^\d+$/)) {
      creator.name = `Unknown`;
    }

    return creator;
  }

  static isCreatorDeviceInfo(deviceInfo: any): boolean {
    return (
      !!deviceInfo &&
      (deviceInfo.device_index === 'creator' || deviceInfo.device_index === 0 || deviceInfo.source_type === 'local')
    );
  }

  private static getCreatorDeviceInfo(fitDataObject: any): any | null {
    const deviceInfos = Array.isArray(fitDataObject?.device_infos) ? fitDataObject.device_infos : [];
    const creatorDeviceInfo = deviceInfos.find((deviceInfo: any) => this.isCreatorDeviceInfo(deviceInfo));
    if (creatorDeviceInfo) {
      return creatorDeviceInfo;
    }

    const legacyDeviceInfo = fitDataObject?.device_info;
    return this.isCreatorDeviceInfo(legacyDeviceInfo) ? legacyDeviceInfo : null;
  }

  private static isCompatibleCreatorIdentity(fileId: any, creatorDeviceInfo: any): boolean {
    if (!creatorDeviceInfo) {
      return false;
    }

    const fileManufacturer = this.normalizeManufacturer(fileId?.manufacturer);
    const deviceManufacturer = this.normalizeManufacturer(creatorDeviceInfo.manufacturer);
    return fileManufacturer === null || deviceManufacturer === null || fileManufacturer === deviceManufacturer;
  }

  private static normalizeManufacturer(manufacturer: any): string | null {
    if (!isNumberOrString(manufacturer)) {
      return null;
    }

    const manufacturerString = String(manufacturer);
    const manufacturerName = /^\d+$/.test(manufacturerString)
      ? GarminProfileMapper.getManufacturerName(manufacturerString)
      : manufacturerString;
    return String(manufacturerName || manufacturerString).toLowerCase();
  }

  private static formatDeviceName(
    manufacturer: string | number | null,
    productName: string | null,
    recognizedName: string | null,
    recognizedBrand: string | null,
    isDevelopment = false
  ): string {
    const manufacturerString = isNumberOrString(manufacturer) ? String(manufacturer) : null;

    if (recognizedBrand && recognizedName) {
      return `${this.toStartCase(recognizedBrand)} ${recognizedName}`;
    }
    if (recognizedBrand && !recognizedName && productName) {
      if (productName.match(new RegExp(`${recognizedBrand}`, 'gi'))) {
        productName = productName.replace(new RegExp(`${recognizedBrand}`, 'gi'), '').trim();
      }
      return `${this.toStartCase(recognizedBrand)} ${productName}`;
    }
    if (recognizedBrand && !recognizedName && !productName) {
      return `${this.toStartCase(recognizedBrand)}`;
    }
    if (manufacturerString && !recognizedBrand && !recognizedName && !productName && !isDevelopment) {
      return `${this.toStartCase(manufacturerString.replace(new RegExp('[-_]', 'gi'), ' ').trim())}`;
    }
    if (!recognizedBrand && recognizedName) {
      return `${recognizedName}`;
    }
    return 'Unknown';
  }

  private static toStartCase(str: string): string {
    return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
}
