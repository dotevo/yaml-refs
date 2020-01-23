import Collection from 'yaml/dist/schema/Collection';
import { Pair } from 'yaml/types';

export class Ref extends Collection {
	private mFilePath: string = '';
	private mObjPath: string = '';
	private mDoc: Document;
	public items: Pair[];

	constructor(doc: Document) {
		super();
		this.mDoc = doc;
		Object.defineProperty(this, 'items', {
			configurable: true,
			enumerable: true,
			get: function() {
				let w = this.getRefObject().items;
				if (w == null) return [];
				return w;
			},
		});
	}

	getRefObject(): Node | null {
		// Local file
		let doc = this.mDoc;
		// External file
		if (this.mFilePath != '') {
			// @ts-ignore
			if (this.mDoc.options.loader == null) return [];
			// @ts-ignore
			doc = this.mDoc.options.loader.getDocument(this.mFilePath, this.mDoc);
			if (doc == null) return null;
		}
		// @ts-ignore
		return doc.getIn(this.mObjPath.split('/'));
	}

	getIn(path, keepScalar) {
		const obj = this.getRefObject();
		if (obj instanceof Collection) {
			let col: Collection = obj;
			return col.getIn(path, keepScalar);
		} else {
			return 'a';
		}
	}

	protected parsePath(path: string): void {
		// Find the first #
		let i = path.indexOf('#');
		// Wrong ref. Skip
		if (i < 0) {
			return;
		}
		this.mFilePath = path.substring(0, i);
		this.mObjPath = path.substring(i + 1);
	}

	toJSON(_, ctx, Type) {
		const obj = this.getRefObject();
		// @ts-ignore
		if (obj.toJSON == null) return obj;
		// @ts-ignore
		return obj.toJSON(_, ctx, Type);
	}

	toString(ctx, onComment) {
		return '"' + this.mFilePath + '#' + this.mObjPath + '"';
	}
}
