import * as path from 'path';
import * as YAML from 'yaml';
import {YAMLMap} from 'yaml/types'

import { stringifyString } from 'yaml/util'

class Ref extends YAMLMap{
  private mFilePath: string = "";
  private mObjPath: string = "";
  private mDoc: Document;
  private a: any;
  constructor(doc: Document, path: string) {
    super();
    this.parsePath(path);
    this.mDoc = doc;

    Object.defineProperty(this, "items", {
      configurable: true,
      enumerable: true,
      get: function () {
        // Local file
        let doc = this.mDoc;
        // External file
        if (this.mFilePath != "") {
          if (this.mDoc.options.loader == null) return [];
          doc = this.mDoc.options.loader.getDocument(this.mFilePath, this.mDoc);
          if (doc == null) return [];
        }
        let obj = doc.getIn(this.mObjPath.split('/'))
        if (obj == null) return [];
        return obj.items;
      },
    });
  }

  parsePath(path: string): void {
    // Find the first #
    let i = path.indexOf('#');

    // Wrong ref. Skip
    if (i < 0){
      return;
    }

    this.mFilePath = path.substring(0, i)
    this.mObjPath = path.substring(i + 1);
  }

  toJSON(_, ctx) {
    return super.toJSON();
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
