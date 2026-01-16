import { GarminManufacturers, GarminProducts, GarminSports, GarminSubSports } from './importer.fit.garmin.profile.data';

export class GarminProfileMapper {

  /**
   * Translates a Garmin Product ID to a readable device name
   */
  public static getDeviceName(productId: number | string): string | null {
    if (productId === null || productId === undefined) {
      return null;
    }
    const id = typeof productId === 'string' ? parseInt(productId, 10) : productId;
    const name = GarminProducts[id];
    return name ? this.formatDeviceName(name) : null;
  }

  /**
   * Translates a Manufacturer ID to a readable name
   */
  public static getManufacturerName(manufacturerId: number | string): string | null {
    if (manufacturerId === null || manufacturerId === undefined) {
      return null;
    }
    const id = typeof manufacturerId === 'string' ? parseInt(manufacturerId, 10) : manufacturerId;
    return GarminManufacturers[id] || null;
  }

  /**
   * Translates a Sport ID to a readable name
   */
  public static getSportName(sportId: number | string): string | null {
    if (sportId === null || sportId === undefined) {
      return null;
    }
    const id = typeof sportId === 'string' ? parseInt(sportId, 10) : sportId;
    return GarminSports[id] || null;
  }

  /**
   * Translates a Sub-Sport ID to a readable name
   */
  public static getSubSportName(subSportId: number | string): string | null {
    if (subSportId === null || subSportId === undefined) {
      return null;
    }
    const id = typeof subSportId === 'string' ? parseInt(subSportId, 10) : subSportId;
    return GarminSubSports[id] || null;
  }

  /**
   * Formats internal Garmin names into pretty names (e.g. fr945 -> Forerunner 945)
   */
  private static formatDeviceName(name: string): string {
    if (!name) return 'Unknown';

    // First expand known abbreviations and add spaces
    let formatted = name
      .replace(/^fr(\d+)/i, 'Forerunner $1')
      .replace(/^fenix(\d+)/i, 'Fenix $1')
      .replace(/^edge(\d+)/i, 'Edge $1')
      .replace(/^vivoactive/i, 'VivoActive')
      .replace(/^vivosmart/i, 'VivoSmart')
      .replace(/^vivofit/i, 'VivoFit')
      .replace(/^vivomove/i, 'VivoMove')
      .replace(/^vivosport/i, 'VivoSport')
      .replace(/^approach([A-Z\d])/i, 'Approach $1')
      .replace(/^marq([A-Z])/i, 'Marq $1')
      .replace(/^hrm/i, 'HRM ')
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/([a-z])([A-Z0-9])/g, '$1 $2') // Add spaces between camelCase
      .replace(/([0-9])([a-zA-Z])/g, '$1 $2'); // Add spaces between numbers and letters

    // Capitalize and clean up special terms
    formatted = formatted
      .split(' ')
      .map(word => {
        const lower = word.toLowerCase();
        if (lower === 'apac') return 'APAC';
        if (lower === 'xt') return 'XT';
        if (lower === 'lte') return 'LTE';
        if (lower === 'hr') return 'HR';
        if (lower === 'gps') return 'GPS';
        if (lower === 'ii') return 'II';
        if (lower === 'iii') return 'III';
        if (lower === 'm' && name.toLowerCase().includes('645m')) return 'Music'; // Special case for Fr645m
        if (lower === 'jpn') return 'Japan';
        if (lower === 'chn') return 'China';
        if (lower === 'twn') return 'Taiwan';
        if (lower === 'kor') return 'Korea';
        if (lower === 'rus') return 'Russia';
        if (lower === 'sea') return 'SEA';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ')
      .replace(/Vivo Active/g, 'VivoActive')
      .trim();

    return formatted;
  }
}
