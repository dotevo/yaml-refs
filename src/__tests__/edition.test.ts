import ref from '../index';
import MainDocument from '../loader';
import * as fs from 'fs';

describe('include file test (2st res)', () => {
	let loader: MainDocument;
	let doc: Document;
	let json: JSON;
	beforeEach(() => {
		loader = new MainDocument({ merge: true, customTags: [ref] });
		doc = loader.getDocument('src/__tests__/res/edition/test.yml');
		json = JSON.parse(fs.readFileSync('src/__tests__/res/edition/test.json', 'utf8'));
	});

	test('open', () => {
		expect(doc.contents.toJSON()).toEqual(json);
	});

	test('edit parent should modify children', () => {
		// Get parent
		const i = doc.getIn(['parent']);
		i.set('color', 'yellow');
		expect(doc.getIn(['child']).toJSON()).toEqual(
			JSON.parse('{"animal": "cat", "color": "yellow", "uniqueParent": 1, "uniqueChild": 2}'),
		);
	});

	test('edit child should modify parent if value comes from parent', () => {
		// Get parent
		const i = doc.getIn(['child']);
		i.set('color', 'yellow');
		expect(doc.getIn(['parent']).toJSON()).toEqual(
			JSON.parse('{"animal": "dog", "color": "yellow", "uniqueParent": 1}'),
		);
		expect(doc.getIn(['child']).getSource('color')).toEqual(doc.getIn(['parent']));
	});

	test('edit child should not modify parent if it is own value', () => {
		// Get parent
		const i = doc.getIn(['child']);
		i.set('animal', 'bird');
		expect(doc.getIn(['parent']).toJSON()).toEqual(
			JSON.parse('{"animal": "dog", "color": "black", "uniqueParent": 1}'),
		);
		expect(doc.getIn(['child']).toJSON()).toEqual(
			JSON.parse('{"animal": "bird", "color": "black", "uniqueParent": 1, "uniqueChild": 2}'),
		);
	});

	test('edit unique value in child', () => {
		// Get parent
		const i = doc.getIn(['child']);
		i.getSource('color');
		i.set('uniqueChild', 5);
		expect(doc.getIn(['parent']).toJSON()).toEqual(
			JSON.parse('{"animal": "dog", "color": "black", "uniqueParent": 1}'),
		);
		expect(doc.getIn(['child']).toJSON()).toEqual(
			JSON.parse('{"animal": "cat", "color": "black", "uniqueChild": 5, "uniqueParent": 1}'),
		);
	});

	test('edit child should not modify parent if wants to create new value', () => {
		// Get parent
		const i = doc.getIn(['child']);
		i.set('color', 'red', true);
		expect(doc.getIn(['parent']).toJSON()).toEqual(
			JSON.parse('{"animal": "dog", "color": "black", "uniqueParent": 1}'),
		);
		expect(doc.getIn(['child']).toJSON()).toEqual(
			JSON.parse('{"animal": "cat", "color": "red", "uniqueParent": 1, "uniqueChild": 2}'),
		);
		expect(doc.getIn(['child']).getSource('animal')).toEqual(doc.getIn(['child']));
	});
});
