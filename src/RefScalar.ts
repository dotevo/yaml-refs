import { Ref } from './Ref';

export class RefScalar extends Ref {
	constructor(doc: Document, cst: any) {
		super(doc);
		const path = cst.strValue;
		// Defined as scalar
		if (path != null) {
			this.parsePath(path);
		}
	}
}
