import * as path from 'path';
import * as YAML from 'yaml';

import { YAMLMap, Scalar, Pair } from 'yaml/types'
import { stringifyString } from 'yaml/util'

import Collection from 'yaml/dist/schema/Collection'
import parseMap from 'yaml/dist/schema/parseMap'
import {resolveComments} from 'yaml/dist/schema/parseUtils'

class Ref extends Collection {
  private mFilePath: string = "";
  private mObjPath: string = "";
  private mDoc: Document;
  public items: Pair[];

  constructor(doc: Document) {
    super();
    this.mDoc = doc;
    Object.defineProperty(this, "items", {
      configurable: true,
      enumerable: true,
      get: function() {
        let w = this.getRefObject().items;
        if(w == null)return [];
        return w
      },
    });
  }

  getRefObject(): Node|null {
    // Local file
    let doc = this.mDoc;
    // External file
    if (this.mFilePath != "") {
      // @ts-ignore
      if (this.mDoc.options.loader == null) return [];
      // @ts-ignore
      doc = this.mDoc.options.loader.getDocument(this.mFilePath, this.mDoc);
      if (doc == null) return null;
    }
    // @ts-ignore
    return doc.getIn(this.mObjPath.split('/'))
  }

  getIn(path, keepScalar) {
    const obj = this.getRefObject();
    if (obj instanceof Collection) {
      let col: Collection = obj;
      return col.getIn(path, keepScalar);
    } else {
      return 'a';
    }
  }

  protected parsePath(path: string): void {
    // Find the first #
    let i = path.indexOf('#');
    // Wrong ref. Skip
    if (i < 0) {
      return;
    }
    this.mFilePath = path.substring(0, i)
    this.mObjPath = path.substring(i + 1);
  }

  toJSON(_, ctx, Type) {
    const obj = this.getRefObject();
    // @ts-ignore
    if (obj.toJSON == null) return obj;
    // @ts-ignore
    return obj.toJSON(_, ctx, Type);
  }

  toString(ctx, onComment) {
    return '"' + this.mFilePath + '#' + this.mObjPath + '"';
  }
};

class RefScalar extends Ref{
  constructor(doc: Document, cst: any) {
    super(doc);
    const path = cst.strValue;
    // Defined as scalar
    if (path != null) {
      this.parsePath(path);
    }
  }
};

class RefMap extends Ref{
  private mSource: YAMLMap;
  private mParams = {};

  constructor(doc: Document, map: YAMLMap) {
    super(doc);
    this.mSource = map;

    for (let i = 0; i < map.items.length; ++i) {
      if(map.items[i].key.value.startsWith('^ref')) {
        this.mParams[map.items[i].key.value] = map.items[i].value.value;
      }
    }

    if (this.mParams['^ref']) {
      this.parsePath(this.mParams['^ref']);
    }

    Object.defineProperty(this, "items", {
      configurable: true,
      enumerable: true,
      get: function() {
        let arr = [];
        let w = this.getRefObject().items;
        for(let i =0;i<this.mSource.items.length;i++) {
          if(this.mSource.items[i].key.value.startsWith('^ref')) continue;
          arr.push(this.mSource.items[i])
        }
        for(let i =0;i<w.length;i++) {
          let exist = false;
          for(let j=0;j<arr.length;j++) {
            if(arr[j].key.value == w[i].key.value) {
              exist = true;
              break;
            }
          }
          if(!exist)
          arr.push(w[i])
        }
        return arr
      },
    });
  }

  getIn(path, keepScalar) {
    let obj = this.mSource.getIn(path, keepScalar);
    if(obj == null) {
      return super.getIn(path, keepScalar);
    }
    return obj;
  }

  toJSON(_, ctx, Type) {
    const map = Type ? new Type() : ctx && ctx.mapAsMap ? new Map() : {}
    if (ctx && ctx.onCreate) ctx.onCreate(map)
    for (const item of this.items) {
      item.addToJSMap(ctx, map)
    }
    for (const item of this.mSource.items) {
      if(item.key.value.startsWith('^ref')) continue;
      item.addToJSMap(ctx, map)
    }
    return map
  }

  toString(ctx, onComment) {
    return this.mSource.toString(ctx, onComment);
  }
};

const ref = {
  identify: value => value.constructor === Ref,
  nodeClass: Ref,
  tag: '!ref',
  resolve: function(doc, cst) {
    // Simple ref without extending
    if(cst.strValue != null) {
      return new RefScalar(doc, cst);
    }
    return new RefMap(doc, parseMap(doc, cst));
  }
}

export default ref;
