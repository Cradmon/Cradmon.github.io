const svgNS = 'http://www.w3.org/2000/svg'

export class InitBtn {
	domNode = null;

	constructor(btnNode = null) {
		if (btnNode == null) {
			this.domNode = document.createElement('button');
		} else {
			this.domNode = btnNode;
		}

		let pNode = document.createElement('p');
		pNode.appendChild(new Text('Test No.1'));
		this.domNode.appendChild(pNode);
	}
}

export class Window {
	domNode = null;
	fileBrowserLists = [];

	constructor(windowNode = null, title) {
		if (windowNode == null) {
			this.domNode = document.createElement('div');
		} else {
			this.domNode = windowNode;
		}

		let titleDiv = document.createElement('div');
		this.domNode.appendChild(titleDiv);
		let pNode = document.createElement('p');
		pNode.innerHTML = title;
		titleDiv.appendChild(pNode);

		let firstList = new FileBrowserList();
		this.domNode.appendChild(firstList.domNode);
		this.fileBrowserLists.push(firstList);

		this.fileBrowserLists[0].addFolder('rst');
		this.fileBrowserLists[0].addFolder('nnn');
	}
}

export class FileBrowserList {
	domNode = document.createElement('div');
	fileBrowserItems = [];

	addFolder(name) {
		let folderItem = new FolderItem(name);
		this.fileBrowserItems.push(folderItem);
		this.domNode.appendChild(folderItem.domNode);
	}

	constructor() {
		this.domNode.classList.add('FileBrowserList');
	}
}

class FileBrowserItem {
	domNode = document.createElement('div');
	svgNode = document.createElementNS(svgNS, 'svg');
	nameNode = document.createElement('p');

	set name(inputName) {
		this.nameNode.childNodes[0].data = inputName;
	}

	constructor(name) {
		this.domNode.append(this.svgNode);
		this.nameNode.appendChild(new Text(name));
		this.domNode.append(this.nameNode);

		this.domNode.classList.add('fileBrowserItem');
	}
};

export class FolderItem extends FileBrowserItem {
	constructor(inputText = 'untitled') {
		super(inputText);
		this.domNode.classList.add('folderItem');

		let path = document.createElementNS(svgNS, 'path');
		this.svgNode.append(path);
		path = document.createElementNS(svgNS, 'path');
		this.svgNode.append(path);
	}
};

export class FileItem extends FileBrowserItem {
	constructor(inputText = 'untitled') {
		super(inputText);
		this.domNode.classList.add('fileItem');

		let path = document.createElementNS(svgNS, 'path');
		this.svgNode.append(path);
	}
};
