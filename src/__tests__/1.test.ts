import ref from '../index';
import * as fs from 'fs';
//import * as path from 'path';
import * as YAML from 'yaml';

describe('one file test (1st res)', () => {
  let doc: Document;
  let json: JSON;
  let str: string;
  beforeEach(() => {
    str = fs.readFileSync('src/__tests__/res/1/test.yml', 'utf8');
    doc = YAML.parseDocument(str, {'merge': true, customTags:[ref]});
    json = JSON.parse(fs.readFileSync('src/__tests__/res/1/test.json', 'utf8'));
  });

  test('open', () => {
    expect(doc.contents.toJSON()).toEqual(json);
  });

  test('stringify', () => {
    expect(String(doc)).toEqual(str);
  });

  test('check ref value', () => {
    const i = doc.getIn(['b']);
    expect(i.toJSON()).toEqual(JSON.parse('{"aaa": "val"}'));
  });

  test('change in source', () => {
    let j = doc.getIn(['a','aa']);
    j.items[0].value = 'val2';
    expect(j.toJSON()).toEqual(JSON.parse('{"aaa": "val2"}'));
    const i = doc.getIn(['b']);
    expect(i.toJSON()).toEqual(JSON.parse('{"aaa": "val2"}'));
  });

  test('change in reference', () => {
    let j = doc.getIn(['b']);
    j.items[0].value = 'val2';
    expect(j.toJSON()).toEqual(JSON.parse('{"aaa": "val2"}'));
    const i = doc.getIn(['a','aa']);
    expect(i.toJSON()).toEqual(JSON.parse('{"aaa": "val2"}'));
  });
)};
