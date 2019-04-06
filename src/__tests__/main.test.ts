import ref from '../index';
import * as fs from 'fs';
//import * as path from 'path';
import * as YAML from 'yaml';

describe('1st dir', () => {
  let doc: Document;
  let json: JSON;
  beforeEach(() => {
    doc = YAML.parseDocument(fs.readFileSync('src/__tests__/res/1/test.yml', 'utf8'),{'merge': true, customTags:[ref]});
    json = JSON.parse(fs.readFileSync('src/__tests__/res/1/test.json', 'utf8'));
  })

  test('open', () => {
    expect(doc.contents.toJSON()).toEqual(json);
  });

  test('check ref value', () => {
    const i = doc.getIn(['b']);
    expect(i.toJSON()).toEqual(JSON.parse('{"aaa": "val"}'));
  });

  test('change source', () => {
    let j = doc.getIn(['a','aa']);
    j.items[0].value = 'val2';
    const i = doc.getIn(['b']);
    expect(i.toJSON()).toEqual(JSON.parse('{"aaa": "val2"}'));
  });
)};
