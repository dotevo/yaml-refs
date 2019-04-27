import * as path from 'path';
import * as YAML from 'yaml';
import { Scalar } from 'yaml/types'
import * as N from 'yaml/dist/schema/Collection'
const Collection = N.default;

import { stringifyString } from 'yaml/util'

class Ref extends Collection {
  private mFilePath: string = "";
  private mObjPath: string = "";
  private mDoc: Document;

  constructor(doc: Document, path: string) {
    super();
    this.parsePath(path);
    this.mDoc = doc;
    Object.defineProperty(this, "items", {
      configurable: true,
      enumerable: true,
      get: function() {
        return this.getRefObject().items;
      },
    });
  }

  getRefObject(): Node {
    // Local file
    let doc = this.mDoc;
    // External file
    if (this.mFilePath != "") {
      if (this.mDoc.options.loader == null) return [];
      doc = this.mDoc.options.loader.getDocument(this.mFilePath, this.mDoc);
      if (doc == null) return [];
    }
    return doc.getIn(this.mObjPath.split('/'))
  }

  getIn(path, keepScalar) {
    const obj = this.getRefObject();
    if (obj instanceof Collection) {
      return obj.getIn(path, keepScalar);
    } else {
      return 'a';
    }
  }

  parsePath(path: string): void {
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
    if (obj.toJSON == null) return obj;
    return obj.toJSON(_, ctx, Type);
  }

  toString(ctx, onComment) {
    return '"' + this.mFilePath + '#' + this.mObjPath + '"';
  }
};

const ref = {
  identify: value => value.constructor === Ref,
  nodeClass: Ref,
  tag: '!ref',
  resolve: function(doc, cst) {
    return new Ref(doc, cst.strValue);
  }
}

export default ref;
