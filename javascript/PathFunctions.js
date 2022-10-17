export function getTail(pathString) {
	return pathString.substring(
		pathString.lastIndexOf('/') + 1
	)
}

export function getTailArray(pathString) {
	let tail = getTail(pathString);
	return tail.split('.');
}

export function getTailName(pathString) {
	return getTailArray(pathString)[0];
}

export function getTailExtension(pathString) {
	let tailArray = getTailArray(pathString);
	if (tailArray.length > 1) {
		return tailArray().at(-1);
	} else {
		return null;
	}
}

export function arrayToString(pathArray, isAbsolute, isBranch) {
	let ret = pathArray.join('/');

	if (isAbsolute == 1) {
		ret = '/' + ret;
	}
	if (isBranch == 1) {
		ret += '/';
	}
	return ret;
}

export function stringToArray(pathString) {
	let ret = {
		array: [],
		isAbsolute: 0,
		isBranch: 0,
	};
	if (pathString == '/') {
		ret.isAbsolute = 1;
		return ret;
	}
	if (pathString.startsWith('/')) {
		ret.isAbsolute = 1;
	}
	if (pathString.endsWith('/')) {
		ret.isBranch = 1;
	}

	ret.array = pathString.substring(ret.isAbsolute, pathString.length - ret.isBranch).split('/');
	return ret;
}

export function getModifiedPath(pathString, modifyArray) {
	let path = stringToArray(pathString);
	
	let j = 0;
	for (let i = 0; i < modifyArray.length; ++i) {
		while (j < path.array.length) {
			if (path.array[j] == modifyArray[i][0]) {
				path.array[j] = modifyArray[i][1];
				break;
			}
			++j;
		}
		++j;
	}

	if (j > path.array.length) {
		return null;
	}

	return arrayToString(path.array, path.isAbsolute, path.isBranch);
}
