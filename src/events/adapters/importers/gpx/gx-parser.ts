// Keep this namespace-qualified key internal to GPX parsing. A direct `hr` from
// another extension namespace does not necessarily describe heart rate.
export const CLUETRUST_HEART_RATE = '{http://www.cluetrust.com/XML/GPXDATA/1/0}hr';

export class GXParser {
  constructor(xml: string, domParser: any = null) {
    domParser = domParser || DOMParser;
    const parser = new domParser();
    const root = parser.parseFromString(xml, 'text/xml');

    return this.parseChild(root.documentElement);
  }

  private parseChild(elm: any): any {
    const attrs: any = {};
    const attributes: any[] = elm.attributes;

    for (let i = 0; i < attributes.length; i++) {
      const attr: any = attributes[i];
      if (attr && attr.value) {
        attrs[attr.name] = attr.value;
      }
    }

    if (elm.childNodes) {
      const children = elm.childNodes;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const name = child.localName;
        if (!name) {
          continue;
        }

        if (!attrs[name]) {
          attrs[name] = [];
        }
        const value = this.parseChild(child);
        attrs[name].push(value);
        if (name === 'hr' && child.namespaceURI === 'http://www.cluetrust.com/XML/GPXDATA/1/0') {
          if (!attrs[CLUETRUST_HEART_RATE]) {
            attrs[CLUETRUST_HEART_RATE] = [];
          }
          const hasElementChildren = Array.from(child.childNodes as ArrayLike<any>)
            .some((node: any) => !!node.localName);
          // An inline namespace declaration is metadata, not the sample value.
          attrs[CLUETRUST_HEART_RATE].push(hasElementChildren ? value : child.textContent);
        }
      }
    }

    if (Object.keys(attrs).length === 0) {
      return elm.textContent;
    }
    return attrs;
  }
}
