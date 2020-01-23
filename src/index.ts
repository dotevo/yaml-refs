export * from './Ref';
export * from './RefMap';
export * from './RefScalar';

import parseMap from 'yaml/dist/schema/parseMap';
import { Ref } from './Ref';
import { RefMap } from './RefMap';
import { RefScalar } from './RefScalar';

const ref = {
	identify: (value) => value.constructor === Ref,
	nodeClass: Ref,
	tag: '!ref',
	resolve: function(doc, cst) {
		// Simple ref without extending
		if (cst.strValue != null) {
			return new RefScalar(doc, cst);
		}
		return new RefMap(doc, parseMap(doc, cst));
	},
};

export default ref;
