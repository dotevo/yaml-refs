import ref from '../index';
import MainDocument from '../loader';
import * as fs from 'fs';
//import * as path from 'path';
import * as YAML from 'yaml';

describe('include file test (2st res)', () => {
  let loader: MainDocument;
  let doc: Document;
  let json: JSON;
  beforeEach(() => {
    loader = new MainDocument({'merge': true, customTags:[ref]});
    doc = loader.getDocument('src/__tests__/res/2/test.yml');
    json = JSON.parse(fs.readFileSync('src/__tests__/res/2/test.json', 'utf8'));
  });

  test('open', () => {
    expect(doc.contents.toJSON()).toEqual(json);
  });

  test('check ref value', () => {
    const i = doc.getIn(['b']);
    expect(i.toJSON()).toEqual(JSON.parse('{"a": 1, "b": 2, "c":3}'));
  });

  test('change in source', () => {
    let j = loader.getDocument('src/__tests__/res/2/include.yml').getIn(['object']);
    j.items[0].value = 'x';
    expect(j.toJSON()).toEqual(JSON.parse('{"a": "x", "b": 2, "c":3}'));
    const i = doc.getIn(['b']);
    expect(i.toJSON()).toEqual(JSON.parse('{"a": "x", "b": 2, "c":3}'));
  });

  test('change in reference', () => {
    let j = doc.getIn(['b']);
    j.items[0].value = 'y';
    expect(j.toJSON()).toEqual(JSON.parse('{"a": "y", "b": 2, "c":3}'));
    const i = loader.getDocument('src/__tests__/res/2/include.yml').getIn(['object']);
    expect(i.toJSON()).toEqual(JSON.parse('{"a": "y", "b": 2, "c":3}'));
  });
)};
