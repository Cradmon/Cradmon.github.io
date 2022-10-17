import * as PathFunctions from './PathFunctions.js'
export * as PathFunctions from './PathFunctions.js'

class HierarchyNode {
	#parentNode = null;
	#isBranch;
	name;
	data = [];

	set parentNode(newParentNode) {
		if (this.#parentNode) {
			for (let i = 0; i < this.#parentNode.data.length; ++i) {
				if (this.#parentNode.data[i] == this) {
					this.#parentNode.data.splice(i, 1);
					break;
				}
			}
		}

		if (newParentNode != null) {
			newParentNode.data.push(this);
		}

		this.#parentNode = newParentNode;
	}

	get parentNode() { return this.#parentNode; }
	get isBranch() { return this.#isBranch; }

	constructor(inputParentNode, inputName, inputIsBranch = true) {
		this.parentNode = inputParentNode;
		this.#isBranch = inputIsBranch;
		this.name = inputName;
	}
};

export class Hierarchy {
	#root;

	get root() { return this.#root; }

	generatePathString(node) {
		let ret = node.name;
		if (ret.isBranch) {
			ret += '/';
		}
		while (node.parentNode != null) {
			ret = node.parentNode.name + '/' + ret;
			node = node.parentNode;
		}
		ret = '/' + ret;
		return ret;
	}

	#getChildNode(node, childNodeName) {
		for (let i = 0; i < node.data.length; ++i) {
			if (node.data[i].name == childNodeName) {
				return node.data[i];
			}
		}
		return null;
	}

	getNode(pathString, startNode = this.#root) {
		if (pathString.startsWith('/')) {
			if (pathString == '/' ||
				pathString == '/' + this.#root.name + '/'
			) {
				return this.#root;
			}
			let path = PathFunctions.stringToArray(pathString);
			if (path.array.length < 2) { return null; }

			let ret = this.#root;
			for (let i = 1; i < path.array.length; ++i) {
				ret = this.#getChildNode(ret, path.array[i]);
				if (ret == null) { return null; }
			}
			return ret;
		} else {
			let path = PathFunctions.stringToArray(pathString);
			let ret = startNode;
			for (let i = 0; i < path.array.length; ++i) {
				if (path.array[i] == '..') {
					ret = ret.parentNode;
				} else if (path.array[i] == '.') {
					continue;
				} else {
					ret = this.#getChildNode(ret, path.array[i]);
				}
				if (ret == null) { return null; }
			}
			return ret;
		}
	}

	setNodeDataFromArray(pathDataArray) {
		for (let i = 0; i < pathDataArray.length; ++i) {
			this.getNode(pathDataArray[i][0]).data = pathDataArray[i][1];
		}
	}

	#createChildWithDescendants(parentNode, namesArray) {
		let node = new HierarchyNode(parentNode, namesArray[0]);
		for (let i = 1; i < namesArray.length; ++i) {
			if (Array.isArray(namesArray[i])) {
				let nextNode = this.#createChildWithDescendants(node, namesArray[i]);
			} else {
				let nextNode = new HierarchyNode(node, namesArray[i], false);
			}
		}
		return node;
	}

	createNodes(parentNode, ...nodeArgs) {
		let ret = [];
		for (let i = 0; i < nodeArgs.length; ++i) {
			if (Array.isArray(nodeArgs[i])) {
				ret.push(this.#createChildWithDescendants(parentNode, nodeArgs[i]));
			} else {
				ret.push(new HierarchyNode(parentNode, name, false));
			}
		}
		if (ret.length == 1) {
			return ret[0];
		} else {
			return ret;
		}
	}

	constructor(namesArray, pathDataArray) {
		this.#root = this.createNodes(null, namesArray);
		this.setNodeDataFromArray(pathDataArray);
	}
};
