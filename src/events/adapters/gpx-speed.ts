const GPX = 'http://www.topografix.com/GPX/1/1';
const TRACK_POINT_V1 = 'http://www.garmin.com/xmlschemas/TrackPointExtension/v1';
const TRACK_POINT_V2 = 'http://www.garmin.com/xmlschemas/TrackPointExtension/v2';

function children(node: Element, name: string, namespace: string): Element[] {
  return Array.from(node.childNodes)
    .filter((child): child is Element => child.nodeType === 1)
    .filter(child => child.localName === name && child.namespaceURI === namespace);
}

/** V1 never specified speed. These exporter conventions are corroborated by native FIT or our exporter. */
export function createGPXRecordedSpeedReader(root: Element): (point: Element) => number | null {
  const creator = root.getAttribute('creator') || '';
  const knownLegacy =
    /^Amazfit(?: |$)/.test(creator) ||
    creator === 'Zepp App' ||
    creator === 'Intervals.icu' ||
    children(root, 'metadata', GPX).some(metadata =>
      children(metadata, 'link', GPX).some(link => link.getAttribute('href') === 'https://quantified-self.io/')
    );

  return point => {
    if (
      root.localName !== 'gpx' ||
      root.namespaceURI !== GPX ||
      point.localName !== 'trkpt' ||
      point.namespaceURI !== GPX
    ) {
      return null;
    }
    const extensions = children(point, 'extensions', GPX);
    if (extensions.length !== 1) return null;
    const blocks = [
      ...children(extensions[0], 'TrackPointExtension', TRACK_POINT_V1),
      ...children(extensions[0], 'TrackPointExtension', TRACK_POINT_V2)
    ];
    if (blocks.length !== 1 || (blocks[0].namespaceURI === TRACK_POINT_V1 && !knownLegacy)) return null;
    const values = children(blocks[0], 'speed', blocks[0].namespaceURI!);
    if (values.length !== 1) return null;
    const field = values[0];
    if (
      Array.from(field.childNodes).some(node => node.nodeType === 1) ||
      Array.from(field.attributes).some(attr => attr.namespaceURI !== 'http://www.w3.org/2000/xmlns/')
    ) {
      return null;
    }
    const text = field.textContent?.trim() || '';
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(text)) return null;
    const speed = Number(text);
    return Number.isFinite(speed) && speed >= 0 ? speed : null;
  };
}

/** The builder uses truthiness for speed and emits extension fields out of XSD sequence. */
export function setGPXPointSpeed(point: any, speed: number | null | undefined): void {
  const key = 'gpxtpx:TrackPointExtension';
  const fields = { ...point.extensions?.[key] };
  if (typeof speed === 'number' && Number.isFinite(speed) && speed >= 0) {
    fields['gpxtpx:speed'] = speed;
  }
  if (Object.keys(fields).length) {
    point.extensions[key] = Object.fromEntries(
      ['atemp', 'wtemp', 'depth', 'hr', 'cad', 'speed', 'course', 'bearing', 'Extensions']
        .map(name => `gpxtpx:${name}`)
        .filter(name => Object.prototype.hasOwnProperty.call(fields, name))
        .map(name => [name, fields[name]])
    );
  }
}

export function useGPXTrackPointV2(builder: any): void {
  builder.data.attributes['xmlns:gpxtpx'] = TRACK_POINT_V2;
  builder.schemaLocation = builder.schemaLocation.map((uri: string) =>
    uri.replace(TRACK_POINT_V1, TRACK_POINT_V2).replace('TrackPointExtensionv1.xsd', 'TrackPointExtensionv2.xsd')
  );
}
