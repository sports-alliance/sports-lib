export const findChildNode = (
  fromNodeList: NodeListOf<ChildNode>,
  childNodeName: string | RegExp
): ChildNode | null => {
  const childNodeFound = Array.from(fromNodeList).find((childNode: ChildNode) => {
    return childNode.nodeName === childNodeName || childNode.nodeName.match(childNodeName) !== null;
  });
  return childNodeFound ? childNodeFound : null;
};

export const findChildNodeValue = (
  fromNodeList: NodeListOf<ChildNode>,
  childNodeName: string | RegExp
): number | null => {
  const predicate = (childNode: ChildNode) =>
    childNode.nodeName === childNodeName || childNode.nodeName.match(childNodeName) !== null;
  let value = Array.from(fromNodeList).find(predicate)?.firstChild?.nodeValue;
  value = value !== undefined ? value : null;
  if (value === null) {
    return null;
  }
  return Number(value);
};

// Fetch activity track point extensions according https://www8.garmin.com/xmlschemas/ActivityExtensionv2.xsd schema
export const findTrackPointExtensionValue = (
  childNodes: NodeListOf<ChildNode>,
  extensionName: string
): number | null => {
  return findExtensionValue(childNodes, extensionName, 'TPX');
};

// Fetch activity lap extensions according https://www8.garmin.com/xmlschemas/ActivityExtensionv2.xsd schema
export const findLapExtensionValue = (childNodes: NodeListOf<ChildNode>, extensionName: string): number | null => {
  return findExtensionValue(childNodes, extensionName, 'LX');
};

const activityExtensionNamespace = 'http://www.garmin.com/xmlschemas/ActivityExtension/v2';
const trainingCenterNamespace = 'http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2';

/** Some exports omit Extensions around a directly owned, namespaced TPX Speed.
 * Keep this compatibility path limited to the observed speed layout; accepting
 * other fields here would also require changing their recorded-sensor evidence.
 */
const findUnwrappedSpeed = (childNodes: NodeListOf<ChildNode>): number | null => {
  const containers = Array.from(childNodes).filter(
    (node): node is Element =>
      node.nodeType === 1 &&
      (node as Element).localName === 'TPX' &&
      (node as Element).namespaceURI === activityExtensionNamespace
  );
  if (containers.length !== 1) return null;

  const values = Array.from(containers[0].childNodes).filter(
    (node): node is Element =>
      node.nodeType === 1 &&
      (node as Element).localName === 'Speed' &&
      [activityExtensionNamespace, trainingCenterNamespace, ''].includes((node as Element).namespaceURI || '')
  );
  if (values.length !== 1 || Array.from(values[0].childNodes).some(node => node.nodeType === 1)) return null;

  const text = values[0].textContent?.trim() || '';
  // An empty XML field is missing, not recorded zero. Accept decimal/exponent
  // notation, but never non-finite, negative, hex or unit-suffixed values.
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(text)) return null;
  const value = Number(text);
  return Number.isFinite(value) && value >= 0 ? value : null;
};

export const findExtensionValue = (
  childNodes: NodeListOf<ChildNode>,
  extensionName: string,
  namespace: string
): number | null => {
  const trackPointsChild: ChildNode | null = findChildNode(childNodes, 'Extensions');
  if (!trackPointsChild) {
    return namespace === 'TPX' && extensionName === 'Speed' ? findUnwrappedSpeed(childNodes) : null;
  }
  const tpxChildNode = findChildNode(trackPointsChild.childNodes, new RegExp(`${namespace}$`, 'gi'));
  if (tpxChildNode) {
    const value = findChildNodeValue(tpxChildNode.childNodes, new RegExp(extensionName + '$'));
    return value !== null ? Number(value) : null;
  }
  return null;
};
