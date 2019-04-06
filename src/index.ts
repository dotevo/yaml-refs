import * as fs from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';
import {YAMLMap} from 'yaml/types'

import { stringifyString } from 'yaml/util'

class Ref extends YAMLMap{
  private mPath: string;
  private mDoc: Document;
  constructor(doc: Document, path: string) {
    super();
    this.mPath = path;
    this.mDoc = doc;
  }
  toJSON(_, ctx) {
    return this.mDoc.getIn(this.mPath.split('/')).toJSON();
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
