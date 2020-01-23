import { Pair, YAMLMap, Scalar } from 'yaml/types';
import { Ref } from './Ref';

export class RefMap extends Ref {
	private mSource: YAMLMap;
	private mParams = {};

	constructor(doc: Document, map: YAMLMap) {
		super(doc);
		this.mSource = map;

		for (let i = 0; i < map.items.length; ++i) {
			if (map.items[i].key.value.startsWith('^ref')) {
				this.mParams[map.items[i].key.value] = map.items[i].value.value;
			}
		}

		if (this.mParams['^ref']) {
			this.parsePath(this.mParams['^ref']);
		}

		Object.defineProperty(this, 'items', {
			configurable: true,
			enumerable: true,
			get: function() {
				let arr = [];
				let w = this.getRefObject().items;
				for (let i = 0; i < this.mSource.items.length; i++) {
					if (this.mSource.items[i].key.value && this.mSource.items[i].key.value.startsWith('^ref')) continue;
					arr.push(this.mSource.items[i]);
				}
				for (let i = 0; i < w.length; i++) {
					let exist = false;
					for (let j = 0; j < arr.length; j++) {
						if (arr[j].key.value == w[i].key.value) {
							exist = true;
							if (arr[j].value.type === 'MAP' && this.mParams['^ref-type'] === 'recursive') {
								arr[j].value.items.push(
									new Pair(new Scalar('^ref'), new Scalar(this.mParams['^ref'] + '/' + arr[j].key.value)),
								);
								arr[j].value = new RefMap(doc, arr[j].value);
							}
							break;
						}
					}
					if (!exist) arr.push(w[i]);
				}
				return arr;
			},
		});
	}

	getIn(path, keepScalar) {
		let obj = this.mSource.getIn(path, keepScalar);
		if (obj == null) {
			return super.getIn(path, keepScalar);
		}
		return obj;
	}

	getSource(name) {
		if (this.mSource) {
			if (this.mSource.has(name)) {
				return this;
			}
		}
		return this.getRefObject();
	}

	set(name, value, create = false) {
		if (this.mSource) {
			if (this.mSource.has(name)) {
				return this.mSource.set(name, value);
			} else if (create) {
				return this.mSource.items.push(new Pair(name, value));
			}
		}

		this.mSource.set(name, value);
	}

	toJSON(_, ctx, Type) {
		const map = Type ? new Type() : ctx && ctx.mapAsMap ? new Map() : {};
		if (ctx && ctx.onCreate) ctx.onCreate(map);
		for (const item of this.items) {
			item.addToJSMap(ctx, map);
		}
		for (const item of this.mSource.items) {
			if (item.key.value && item.key.value.startsWith('^ref')) continue;
			item.addToJSMap(ctx, map);
		}
		return map;
	}

	toString(ctx, onComment) {
		return this.mSource.toString(ctx, onComment);
	}
}
