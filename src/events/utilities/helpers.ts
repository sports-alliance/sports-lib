export function isNumberOrString(property: any) {
  return (typeof property === 'number' || typeof property === 'string');
}

export function isNumber(property: any) {
  return (typeof property === 'number');
}

/**
 * Converts speed from m/s to pace as of seconds
 * @param {number} number
 * @return {number}
 */
export function convertSpeedToPace(number: number): number {
  return number === 0 ? number : (1000 / number);
}


export function convertSpeedToSpeedInKilometersPerHour(number: number): number {
  return number * 3.6;
}

export function convertSpeedToSpeedInMilesPerHour(number: number): number {
  return number * 2.237;
}

export function convertSpeedToSpeedInFeetPerSecond(number: number): number {
  return number * 3.28084;
}

export function convertSpeedToSpeedInMetersPerMinute(number: number): number {
  return number * 60;
}

export function convertSpeedToSpeedInFeetPerMinute(number: number): number {
  return number * 196.85;
}

export function convertSpeedToSpeedInFeetPerHour(number: number): number {
  return number * 11811.024;
}

export function convertSpeedToSpeedInMetersPerHour(number: number): number {
  return number * 3600;
}

export function convertPaceToPaceInMinutesPerMile(number: number): number {
  return number * 1.60934;
}

export function getSize(obj: any): string {
  var bytes = 0;

  function sizeOf(obj: any) {
    if (obj !== null && obj !== undefined) {
      switch (typeof obj) {
        case 'number':
          bytes += 8;
          break;
        case 'string':
          bytes += obj.length * 2;
          break;
        case 'boolean':
          bytes += 4;
          break;
        case 'object':
          var objClass = Object.prototype.toString.call(obj).slice(8, -1);
          if (objClass === 'Object' || objClass === 'Array') {
            for (var key in obj) {
              if (!obj.hasOwnProperty(key)) continue;
              sizeOf(obj[key]);
            }
          } else bytes += obj.toString().length * 2;
          break;
      }
    }
    return bytes;
  }

  function formatByteSize(bytes: number): string {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + " KiB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + " MiB";
    else return (bytes / 1073741824).toFixed(3) + " GiB";
  }

  return formatByteSize(sizeOf(obj));
}
