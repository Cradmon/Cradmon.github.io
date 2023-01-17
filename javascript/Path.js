export class Path {
	#str;
	#array = [];
	#stem = null;
	#extension = null;
	#isAbsolute = 0;
	#isBranch = 0;

	set str(pathString) {
		this.#str = pathString;
		this.#stem = null;
		this.#extension = null;

		this.#isAbsolute = pathString.startsWith('/') ? 1 : 0;
		this.#isBranch = pathString.endsWith('/') ? 1 : 0;

		if (pathString === '/') {
			this.#array = [];
		} else {
			this.#array = pathString.substring(this.#isAbsolute, pathString.length - this.#isBranch).split('/');
		}
	}
	get str() { return this.#str; }
	setArray(pathArray, isAbsolute, isBranch) {
		this.#array = pathArray;
		this.#stem = null;
		this.#extension = null;
		this.#isAbsolute = isAbsolute;
		this.#isBranch = isBranch;

		this.#str = this.#isAbsolute ? '/' : '';
		this.#str += pathArray.join('/');
		this.#str += (this.#str !== '/' && this.#isBranch) ? '/' : '';
	}

	get length() { return this.#array.length; }
	get isAbsolute() { return this.#isAbsolute; }
	get isBranch() { return this.#isBranch; }

	at(index) { return this.#array.at(index); }
	get tail() { return this.#array.at(-1); }
	get stem() {
		if (this.#stem === null) {
			if (this.#isBranch) { return null; }
			let tail = this.#array.at(-1);
			let pos = tail.lastIndexOf('.');
			this.#stem = (pos === -1) ? tail : tail.substring(0, pos + 1);
		}
		return this.#stem;
	}
	get extension() {
		if (this.#extension === null) {
			if (this.#isBranch) { return null; }
			let tail = this.#array.at(-1);
			let pos = tail.lastIndexOf('.');
			this.#extension = (pos === -1) ? null : tail.substring(pos + 1);
		}
		return this.#extension;
	}

	createModifiedPath(modifyArray) {
		let pathString = this.#isAbsolute ? "/" : "";

		let j = 0;
		for (let i = 0; i < this.#array.length; ++i) {
			if (j < modifyArray.length && this.#array[i] == modifyArray[j][0]) {
				pathString += modifyArray[j][1];
				++j;
			} else {
				pathString += this.#array[i];
			}
			pathString += "/";
		}

		if (j != modifyArray.length) { return null; }

		if (!this.#isBranch) {
			pathString = pathString.substring(0, pathString.length - 1);
		}

		return new Path(pathString);
	}

	constructor(pathItem, isAbsolute = 0, isBranch = 0) {
		if (Array.isArray(pathItem)) {
			this.setArray(pathItem, isAbsolute, isBranch);
		} else {
			this.str = pathItem;
		}
	}
}
