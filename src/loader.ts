import * as YAML from 'yaml';
import * as path from 'path';
import * as fs from 'fs';

export default class MainDocument {
	// FIXME: Remove any
	private mDocuments: { [p: string]: Document | any } = {};
	private mOpts: any;

	constructor(opts: any) {
		opts.loader = this;
		this.mOpts = opts;
	}

	// FIXME: Remove any
	getDocument(p: string, context: Document | null | any = null): Document {
		let file_path = path.resolve(p);
		if (context != null) {
			file_path = path.resolve(path.parse(context.options.path).dir, p);
		}
		// Load the document
		if (this.mDocuments[file_path] == null) {
			let opts = { ...this.mOpts };
			opts.path = file_path;
			this.mDocuments[file_path] = YAML.parseDocument(fs.readFileSync(file_path, 'utf8'), opts);
		}
		return this.mDocuments[file_path];
	}
}
