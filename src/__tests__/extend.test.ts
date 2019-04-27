import ref from '../index';
import * as fs from 'fs';
//import * as path from 'path';
import * as YAML from 'yaml';

describe('Reading', () => {
  let doc: Document;
  let str: String;
  let json: JSON;
  beforeEach(() => {
    str = fs.readFileSync('src/__tests__/res/extend/extend.yml', 'utf8');
    doc = YAML.parseDocument(str, {'merge': true, customTags:[ref]});
    json = JSON.parse(fs.readFileSync('src/__tests__/res/extend/extend.json', 'utf8'));
  });

  test('open', () => {
    expect(doc.contents.toJSON()).toEqual(json);
  });

  test('stringify', () => {
    expect(String(doc)).toEqual(str);
  });
});
