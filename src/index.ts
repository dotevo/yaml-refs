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
    const f = path.split('#');
    // Local obj
    if(f.length == 1) {
      this.mObjPath = f[0];
    } else if(f.length == 2) {
      this.mFilePath = f[0];
      this.mObjPath = f[1];
    }
  }

  toJSON(_, ctx) {
    return super.toJSON();
  }

  toString(ctx, onComment) {
    return this.mPath;
  }
};

const ref = {
  identify: value => value.constructor === Ref,
  default: true,
  nodeClass: Ref,
  tag: '!ref',
  resolve: function(doc, cst) {
    return new Ref(doc, cst.strValue);
  },
  stringify(item, ctx, onComment, onChompKeep) {
    return stringifyString({ value: item.toString() }, ctx, onComment, onChompKeep)
  }
}

export default ref;
