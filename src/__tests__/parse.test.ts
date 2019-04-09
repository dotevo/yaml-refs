import ref from '../index';
import MainDocument from '../loader';
import * as fs from 'fs';
import * as YAML from 'yaml';

describe('Parse', () => {
  fs.readdirSync('src/__tests__/res/parse').forEach(file => {
      if(/^(test-[a-z0-9_]*\.yml)$/.test(file) == false) return;

      test(file, () => {
        let loader = new MainDocument({'merge': true, customTags:[ref]});
        let doc = loader.getDocument('src/__tests__/res/parse/' + file);
        let json = JSON.parse(fs.readFileSync(('src/__tests__/res/parse/' + file).replace('.yml', '.json'), 'utf8'));
        expect(doc.contents.toJSON()).toEqual(json);
      });

    });
  });

)};
