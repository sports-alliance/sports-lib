import { findChildNode, findChildNodeValue, findTrackPointExtensionValue } from './utils.tcx';

const tcxNamespace = 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2';

const children = (parent: Element, name: string): Element[] =>
  Array.from(parent.childNodes).filter(
    (node): node is Element => node.nodeType === 1 && (node as Element).localName === name
  );

// Count foreign-namespace lookalikes too: a conflicting candidate must not make
// a malformed container appear unambiguous.
const uniqueChild = (parent: Element, name: string): Element | null => {
  const matches = children(parent, name);
  return matches.length === 1 && matches[0].namespaceURI === tcxNamespace ? matches[0] : null;
};

const numericText = (element: Element | null): number | null => {
  if (!element || Array.from(element.childNodes).some(node => node.nodeType === 1)) return null;
  const text = element.textContent?.trim() || '';
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(text)) return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
};

/** COROS's direct Extensions/Speed layout records km/h, unlike standard TPX
 * speed in m/s. Match the activity-owned exporter identity, never the magnitude
 * of its speed samples or the identity of another activity in the file. */
export const hasCorosDirectSpeed = (activity: Element): boolean => {
  if (activity.namespaceURI !== tcxNamespace) return false;
  const creator = uniqueChild(activity, 'Creator');
  const name = creator && uniqueChild(creator, 'Name');
  return (
    !!name &&
    !Array.from(name.childNodes).some(node => node.nodeType === 1) &&
    name.textContent?.trim() === 'COROS Wearables'
  );
};

export const findTCXSpeed = (point: Element, corosDirectSpeed = false): number | null => {
  const standard = findTrackPointExtensionValue(point.childNodes, 'Speed');
  if (standard !== null || !corosDirectSpeed || point.namespaceURI !== tcxNamespace) return standard;
  const extensions = uniqueChild(point, 'Extensions');
  // A TPX, including an empty or invalid one, retains existing precedence.
  if (!extensions || children(extensions, 'TPX').length) return null;
  const value = numericText(uniqueChild(extensions, 'Speed'));
  return value !== null && value >= 0 ? value / 3.6 : null;
};

/** Some TCX exporters put metre-valued altitude inside Position. An existing
 * standard field retains precedence, even when it is empty or malformed. */
export const findTCXAltitude = (point: Element): number | null => {
  if (findChildNode(point.childNodes, 'AltitudeMeters')) {
    return findChildNodeValue(point.childNodes, 'AltitudeMeters');
  }
  if (point.namespaceURI !== tcxNamespace) return null;
  const position = uniqueChild(point, 'Position');
  return position ? numericText(uniqueChild(position, 'AltitudeMeters')) : null;
};
