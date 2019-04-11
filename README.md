## About
PROJECT IS IN VERY EARLY STAGE!

This project is extending https://www.npmjs.com/package/yaml

## Example

```
import * as YAML from 'yaml';
import {Pair} from 'yaml/types'
import ref from 'lib-yaml-refs'

const str = `
a:
  b:
    c:
      10
b: !ref "#a/b"
`;

const doc = YAML.parseDocument(str, {'merge': true, customTags:[ref]})
console.log(doc.toJSON()); // { a: { b: { c: 10 } }, b: { c: 10 } }
console.log(doc.getIn(['b']).toJSON()); // { c: 10 }
doc.addIn(['b'], new Pair("d", 20));
console.log(doc.getIn(['b']).toJSON()); // { c: 10, d: 20 }
console.log(doc.toJSON()); // { a: { b: { c: 10, d: 20 } }, b: { c: 10, d: 20 } }
```
